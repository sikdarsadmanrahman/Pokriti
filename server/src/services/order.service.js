import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Counter from '../models/Counter.js';
import ApiError from '../utils/ApiError.js';
import { effectivePrice } from '../utils/pricing.js';
import { normalizeBDPhone } from '../utils/phone.js';
import { reserveStock, restoreStock } from './inventory.service.js';
import { MOBILE_BANKING, ORDER_TRANSITIONS, SHIPPING_RATES } from '../config/constants.js';

/** ORD-YYMMDD-0001 (Dhaka date, atomic per-day counter). */
async function generateOrderId() {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: '2-digit', month: '2-digit', day: '2-digit' })
    .format(new Date())
    .replace(/-/g, '');
  const counter = await Counter.findOneAndUpdate({ _id: `order-${day}` }, { $inc: { seq: 1 } }, { upsert: true, new: true });
  return `ORD-${day}-${String(counter.seq).padStart(4, '0')}`;
}

/**
 * Places an order:
 *  1. re-prices every line from the DB (never trusts the client)
 *  2. atomically reserves stock
 *  3. upserts the customer by phone
 *  4. creates the order (rolls stock back if anything fails)
 */
export async function placeOrder({ customer: c, shipping, items, payment, note }) {
  const blocked = await Customer.findOne({ phone: c.phone, isBlocked: true }).select('_id').lean();
  if (blocked) throw new ApiError(403, 'We are unable to process orders from this number. Please contact support.');

  // Merge duplicate cart lines (same product + variant)
  const merged = new Map();
  for (const it of items) {
    const key = `${it.productId}:${it.variantId}`;
    merged.set(key, { ...it, quantity: (merged.get(key)?.quantity || 0) + it.quantity });
  }
  const wanted = [...merged.values()];

  // One query for all products
  const products = await Product.find({ _id: { $in: [...new Set(wanted.map((w) => w.productId))] }, status: 'active' })
    .select('name images variants saleStartsAt saleEndsAt')
    .lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const now = new Date();
  const lines = wanted.map((w) => {
    const p = byId.get(w.productId);
    const v = p?.variants.find((x) => String(x._id) === w.variantId && x.isActive);
    if (!p || !v) throw new ApiError(400, 'One or more items in your cart are no longer available. Please refresh your cart.');
    if (v.stock < 1) throw new ApiError(409, `"${p.name} (${v.label})" is out of stock.`);
    if (v.stock < w.quantity) throw new ApiError(409, `Only ${v.stock} left of "${p.name} (${v.label})".`);
    const unitPrice = effectivePrice(p, v, now);
    return {
      product: p._id,
      variantId: v._id,
      name: p.name,
      image: p.images?.[0]?.url,
      variantLabel: v.label,
      unitPrice,
      quantity: w.quantity,
      lineTotal: unitPrice * w.quantity,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  // Zone is a customer choice between two fixed rates; admins can see the address and follow up if it looks wrong.
  const shippingCost = SHIPPING_RATES[shipping.zone];
  const total = subtotal + shippingCost;

  await reserveStock(lines); // throws (and self-rolls-back) on failure

  try {
    const customer = await Customer.findOneAndUpdate(
      { phone: c.phone },
      { $set: { name: c.name, ...(c.email ? { email: c.email } : {}) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Remember the address (max 5 most recent) unless we already have it.
    await Customer.updateOne(
      { _id: customer._id, 'addresses.fullAddress': { $ne: shipping.fullAddress } },
      {
        $push: {
          addresses: {
            $each: [{ fullAddress: shipping.fullAddress, district: shipping.district, area: shipping.area, shippingZone: shipping.zone }],
            $slice: -5,
          },
        },
      }
    );

    const isMobile = MOBILE_BANKING.includes(payment.method);
    const order = await Order.create({
      orderId: await generateOrderId(),
      customer: customer._id,
      customerSnapshot: { name: c.name, phone: c.phone, email: c.email || undefined },
      shipping,
      items: lines,
      subtotal,
      shippingCost,
      total,
      payment: {
        method: payment.method,
        ...(isMobile && {
          senderNumber: normalizeBDPhone(payment.senderNumber),
          trxId: payment.trxId.toUpperCase(),
        }),
        status: isMobile ? 'pending_verification' : 'unpaid',
      },
      status: 'Pending',
      statusHistory: [{ status: 'Pending', note: 'Order placed' }],
      note,
    });

    // Non-critical bookkeeping: don't fail the order if this hiccups.
    Customer.updateOne({ _id: customer._id }, { $inc: { orderCount: 1 }, $set: { lastOrderAt: new Date() } }).catch((e) =>
      console.error('customer counter update failed:', e)
    );

    return order;
  } catch (err) {
    await restoreStock(lines);
    if (err?.code === 11000 && err.keyPattern?.['payment.trxId']) {
      throw new ApiError(409, 'This Transaction ID has already been used. Please check your TrxID.');
    }
    throw err;
  }
}

/**
 * Moves an order along the pipeline (forward-only, see ORDER_TRANSITIONS).
 * The write is compare-and-set on the current status, so double-clicks / two admins can't
 * apply a transition (or restock a cancelled order) twice.
 */
export async function changeOrderStatus({ id, status, note, adminId }) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Order not found');

  if (!ORDER_TRANSITIONS[order.status].includes(status)) {
    throw new ApiError(400, `Cannot move an order from "${order.status}" to "${status}"`);
  }

  const set = { status };
  // Cash is collected by the courier on delivery.
  if (status === 'Delivered' && order.payment.method === 'cod') set['payment.status'] = 'paid';

  const updated = await Order.findOneAndUpdate(
    { _id: id, status: order.status },
    { $set: set, $push: { statusHistory: { status, note, changedBy: adminId, changedAt: new Date() } } },
    { new: true }
  );
  if (!updated) throw new ApiError(409, 'This order was just updated by someone else. Refresh and try again.');

  if (status === 'Cancelled') await restoreStock(updated.items);
  if (status === 'Delivered') await Customer.updateOne({ _id: updated.customer }, { $inc: { totalSpent: updated.total } });

  return updated;
}

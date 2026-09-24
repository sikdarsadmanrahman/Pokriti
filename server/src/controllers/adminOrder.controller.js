import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/strings.js';
import { normalizeBDPhone } from '../utils/phone.js';
import { changeOrderStatus } from '../services/order.service.js';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../config/constants.js';

/**
 * GET /api/admin/orders?status=Pending&paymentStatus=pending_verification&paymentMethod=bkash
 *                      &orderId=ORD-260920-0001&phone=017&from=2026-09-01&to=2026-09-20&page=1&limit=20
 */
export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const { status, paymentStatus, paymentMethod, orderId, phone, from, to } = req.query;

  const filter = {};
  if (ORDER_STATUS.includes(status)) filter.status = status;
  if (PAYMENT_STATUS.includes(paymentStatus)) filter['payment.status'] = paymentStatus;
  if (PAYMENT_METHODS.includes(paymentMethod)) filter['payment.method'] = paymentMethod;
  if (orderId) filter.orderId = String(orderId).trim().toUpperCase();
  // Anchored prefix regex can still use the phone index.
  if (phone) filter['customerSnapshot.phone'] = new RegExp('^' + escapeRegex(normalizeBDPhone(String(phone))));

  const range = {};
  if (from && !Number.isNaN(Date.parse(from))) range.$gte = new Date(from);
  if (to && !Number.isNaN(Date.parse(to))) range.$lte = new Date(to);
  if (Object.keys(range).length) filter.createdAt = range;

  const [data, total] = await Promise.all([
    Order.find(filter).select('-statusHistory').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, data, pagination: paginationMeta({ page, limit, total }) });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'name phone email orderCount isBlocked').lean();
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: order });
});

/** PATCH /api/admin/orders/:id/status  { status, note? } */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await changeOrderStatus({
    id: req.params.id,
    status: req.body.status,
    note: req.body.note,
    adminId: req.admin._id,
  });
  res.json({ success: true, data: order });
});

/** PATCH /api/admin/orders/:id/payment  { status }  - verify a bKash/Nagad/Rocket TrxID, or mark it failed. */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
  const set = { 'payment.status': req.body.status };
  if (req.body.status === 'paid') {
    set['payment.verifiedAt'] = new Date();
    set['payment.verifiedBy'] = req.admin._id;
  }
  const order = await Order.findByIdAndUpdate(req.params.id, { $set: set }, { new: true }).lean();
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: order });
});

// ---------------- invoices / shipping slips ----------------
function buildInvoice(o) {
  return {
    invoiceNo: o.orderId,
    date: o.createdAt,
    brand: {
      name: process.env.BRAND_NAME || 'Gram Rosh',
      address: process.env.BRAND_ADDRESS || '',
      phone: process.env.SUPPORT_PHONE || '',
    },
    customer: o.customerSnapshot,
    shipping: o.shipping,
    items: o.items.map((i) => ({
      name: i.name,
      variantLabel: i.variantLabel,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
    })),
    subtotal: o.subtotal,
    shippingCost: o.shippingCost,
    discount: o.discount,
    total: o.total,
    payment: { method: o.payment.method, status: o.payment.status, trxId: o.payment.trxId },
    // What the courier must collect at the door (for parcel slips).
    codAmount: o.payment.method === 'cod' && o.payment.status !== 'paid' ? o.total : 0,
    note: o.note,
    status: o.status,
  };
}

/** GET /api/admin/orders/:id/invoice -> JSON the frontend renders in a print-optimised layout. */
export const getInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, data: buildInvoice(order) });
});

/** GET /api/admin/orders/invoices?ids=a,b,c (max 50) -> batch-print shipping slips. */
export const getInvoicesBatch = asyncHandler(async (req, res) => {
  const ids = String(req.query.ids || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 50);
  if (!ids.length) throw new ApiError(400, 'Provide ?ids=<orderMongoId>,<orderMongoId>');
  const orders = await Order.find({ _id: { $in: ids } }).sort({ createdAt: 1 }).lean();
  res.json({ success: true, data: orders.map(buildInvoice) });
});

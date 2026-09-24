import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { normalizeBDPhone } from '../utils/phone.js';
import { placeOrder } from '../services/order.service.js';

/** POST /api/orders  (public checkout) */
export const createOrder = asyncHandler(async (req, res) => {
  const order = await placeOrder(req.body);
  res.status(201).json({
    success: true,
    data: {
      orderId: order.orderId,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      payment: { method: order.payment.method, status: order.payment.status },
      createdAt: order.createdAt,
    },
  });
});

/** POST /api/orders/track  { orderId, phone }  - phone must match, so order IDs can't be enumerated. */
export const trackOrder = asyncHandler(async (req, res) => {
  const orderId = req.body.orderId.toUpperCase();
  const phone = normalizeBDPhone(req.body.phone);

  const order = await Order.findOne({ orderId, 'customerSnapshot.phone': phone })
    .select('orderId status statusHistory items subtotal shippingCost total payment.method payment.status shipping.zone createdAt')
    .lean();
  if (!order) throw new ApiError(404, 'No order found for that Order ID and phone number');

  order.statusHistory = order.statusHistory.map(({ status, changedAt }) => ({ status, changedAt })); // hide admin ids/notes
  res.json({ success: true, data: order });
});

import Customer from '../models/Customer.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { escapeRegex } from '../utils/strings.js';
import { normalizeBDPhone } from '../utils/phone.js';

const SORTS = { recent: { createdAt: -1 }, lastOrder: { lastOrderAt: -1 }, spent: { totalSpent: -1 } };

/** GET /api/admin/customers?phone=017&q=rahim&sort=spent&page=1&limit=20 */
export const listCustomers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const { phone, q, sort } = req.query;

  const filter = {};
  if (phone) filter.phone = new RegExp('^' + escapeRegex(normalizeBDPhone(String(phone)))); // uses phone index
  if (q) filter.name = new RegExp(escapeRegex(String(q)), 'i');

  const [data, total] = await Promise.all([
    Customer.find(filter).sort(SORTS[sort] || SORTS.recent).skip(skip).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta({ page, limit, total }) });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id).lean();
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, data: customer });
});

/** GET /api/admin/customers/:id/orders -> paginated order history */
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10, maxLimit: 50 });
  const filter = { customer: req.params.id };
  const [data, total] = await Promise.all([
    Order.find(filter)
      .select('orderId items total status payment createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, data, pagination: paginationMeta({ page, limit, total }) });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true }).lean();
  if (!customer) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, data: customer });
});

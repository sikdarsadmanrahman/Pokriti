import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** GET /api/admin/dashboard -> everything the admin home screen needs in one round-trip. */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const todayKey = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date()); // YYYY-MM-DD

  const [statusAgg, dailySales, stockAgg, customerCount] = await Promise.all([
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Dhaka' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          activeProducts: { $sum: 1 },
          outOfStock: { $sum: { $cond: [{ $lte: ['$totalStock', 0] }, 1, 0] } },
          lowStock: {
            $sum: {
              $cond: [{ $and: [{ $gt: ['$totalStock', 0] }, { $lte: ['$totalStock', '$lowStockThreshold'] }] }, 1, 0],
            },
          },
        },
      },
    ]),
    Customer.estimatedDocumentCount(),
  ]);

  const ordersByStatus = Object.fromEntries(statusAgg.map((s) => [s._id, s.count]));
  const today = dailySales.find((d) => d._id === todayKey) || { orders: 0, revenue: 0 };
  const stock = stockAgg[0] || { activeProducts: 0, outOfStock: 0, lowStock: 0 };

  res.json({
    success: true,
    data: {
      today: { orders: today.orders, revenue: today.revenue },
      last30Days: {
        orders: dailySales.reduce((s, d) => s + d.orders, 0),
        revenue: dailySales.reduce((s, d) => s + d.revenue, 0),
        daily: dailySales.map((d) => ({ date: d._id, orders: d.orders, revenue: d.revenue })),
      },
      ordersByStatus,
      stock: { activeProducts: stock.activeProducts, outOfStock: stock.outOfStock, lowStock: stock.lowStock },
      customers: customerCount,
    },
  });
});

import { AlertTriangle, DollarSign, PackageX, ShoppingBag, Users } from 'lucide-react';
import { useGetDashboardQuery } from '../../api/adminApi.js';
import StatCard from '../../components/admin/StatCard.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { formatBDT } from '../../utils/format.js';

export default function AdminDashboardPage() {
  const { data, isLoading } = useGetDashboardQuery(undefined, { pollingInterval: 60_000 });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-stone-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Today's Revenue" value={formatBDT(data?.today?.revenue || 0)} sub={`${data?.today?.orders || 0} orders`} />
        <StatCard icon={ShoppingBag} label="30-Day Orders" value={data?.last30Days?.orders || 0} sub={formatBDT(data?.last30Days?.revenue || 0)} tone="honey" />
        <StatCard icon={PackageX} label="Out of Stock" value={data?.stock?.outOfStock || 0} sub={`${data?.stock?.lowStock || 0} low stock`} tone="red" />
        <StatCard icon={Users} label="Customers" value={data?.customers || 0} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-stone-900">Orders by Status</h2>
          <div className="space-y-2">
            {Object.entries(data?.ordersByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-stone-600">{status}</span>
                <span className="font-semibold text-stone-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-stone-900">
            <AlertTriangle size={18} className="text-honey-600" /> Stock Alerts
          </h2>
          <p className="text-sm text-stone-600">
            <span className="font-bold text-red-600">{data?.stock?.outOfStock || 0}</span> product(s) are completely out of stock, and{' '}
            <span className="font-bold text-honey-600">{data?.stock?.lowStock || 0}</span> are running low. Check the Products page to restock.
          </p>
        </div>
      </div>

      {data?.last30Days?.daily?.length > 0 && (
        <div className="card mt-6 overflow-x-auto p-5">
          <h2 className="mb-4 font-semibold text-stone-900">Last 30 Days — Daily Revenue</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-stone-500">
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Orders</th>
                <th className="py-2 font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.last30Days.daily.slice(-10).reverse().map((d) => (
                <tr key={d.date} className="border-b border-stone-50">
                  <td className="py-2 pr-4 text-stone-700">{d.date}</td>
                  <td className="py-2 pr-4 text-stone-700">{d.orders}</td>
                  <td className="py-2 font-medium text-stone-900">{formatBDT(d.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

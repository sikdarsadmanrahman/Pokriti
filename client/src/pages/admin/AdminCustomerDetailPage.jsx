import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useAdminGetCustomerQuery, useAdminGetCustomerOrdersQuery } from '../../api/adminApi.js';
import Spinner from '../../components/common/Spinner.jsx';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge.jsx';
import { formatBDT } from '../../utils/format.js';

export default function AdminCustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: customer, isLoading } = useAdminGetCustomerQuery(id);
  const { data: orders } = useAdminGetCustomerOrdersQuery({ id, limit: 20 });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!customer) return <p className="text-stone-500">Customer not found.</p>;

  return (
    <div>
      <button onClick={() => navigate('/admin/customers')} className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-brand-700">
        <ChevronLeft size={16} /> Back to Customers
      </button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="mb-3 font-semibold text-stone-900">{customer.name}</h2>
          <p className="text-sm text-stone-600">{customer.phone}</p>
          {customer.email && <p className="text-sm text-stone-600">{customer.email}</p>}
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-brand-50 p-3"><p className="text-xs text-brand-600">Orders</p><p className="font-bold text-brand-800">{customer.orderCount}</p></div>
            <div className="rounded-xl bg-honey-50 p-3"><p className="text-xs text-honey-700">Total Spent</p><p className="font-bold text-honey-800">{formatBDT(customer.totalSpent)}</p></div>
          </div>
          {customer.addresses?.length > 0 && (
            <div className="mt-4 border-t border-stone-100 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase text-stone-400">Saved Addresses</p>
              {customer.addresses.map((a, i) => (
                <p key={i} className="mb-1 text-sm text-stone-600">{a.fullAddress}</p>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-semibold text-stone-900">Order History</h2>
          <div className="divide-y divide-stone-50">
            {orders?.length ? orders.map((o) => (
              <Link key={o._id} to={`/admin/orders/${o._id}`} className="flex items-center justify-between py-3 hover:bg-stone-50">
                <div>
                  <p className="font-mono text-sm font-medium text-stone-900">{o.orderId}</p>
                  <p className="text-xs text-stone-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{formatBDT(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </div>
              </Link>
            )) : <p className="py-6 text-center text-sm text-stone-400">No orders yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

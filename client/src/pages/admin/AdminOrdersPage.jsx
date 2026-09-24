import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { useAdminGetOrdersQuery } from '../../api/adminApi.js';
import OrderStatusBadge from '../../components/admin/OrderStatusBadge.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatBDT } from '../../utils/format.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';

const STATUSES = ['', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [phone, setPhone] = useState('');
  const debouncedPhone = useDebouncedValue(phone, 300);
  const [page, setPage] = useState(1);

  const { data, isFetching } = useAdminGetOrdersQuery({
    status: status || undefined, phone: debouncedPhone || undefined, page, limit: 20,
  });
  const orders = data?.items;
  const meta = data?.pagination;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-stone-900">Orders</h1>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={phone} onChange={(e) => { setPhone(e.target.value); setPage(1); }} placeholder="Search by phone…" className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
        </select>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !orders?.length ? (
        <EmptyState title="No orders found" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs uppercase text-stone-400">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-stone-50 last:border-0">
                    <td className="p-3 font-mono font-medium text-stone-900">{o.orderId}</td>
                    <td className="p-3 text-stone-600">
                      {o.customerSnapshot.name}<br /><span className="text-xs text-stone-400">{o.customerSnapshot.phone}</span>
                    </td>
                    <td className="p-3 font-medium text-stone-900">{formatBDT(o.total)}</td>
                    <td className="p-3 text-stone-600">
                      <span className="uppercase">{o.payment.method}</span>
                      {o.payment.method !== 'cod' && (
                        <span className={`ml-1 badge ${o.payment.status === 'paid' ? 'bg-brand-100 text-brand-700' : 'bg-honey-100 text-honey-700'}`}>
                          {o.payment.status.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                    <td className="p-3 text-xs text-stone-400">{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Link to={`/admin/orders/${o._id}`} className="rounded-lg p-2 text-stone-500 hover:bg-brand-50 hover:text-brand-700"><Eye size={16} /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-outline disabled:opacity-40">Prev</button>
              <span className="text-stone-500">Page {meta.page} of {meta.totalPages}</span>
              <button disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-outline disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

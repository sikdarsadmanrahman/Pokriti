import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { useAdminGetCustomersQuery } from '../../api/adminApi.js';
import Spinner from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatBDT } from '../../utils/format.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';

export default function AdminCustomersPage() {
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  const { data, isFetching } = useAdminGetCustomersQuery({ q: q || undefined, page, limit: 20 });
  const customers = data?.items;
  const meta = data?.pagination;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-stone-900">Customers</h1>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name…" className="input pl-9" />
      </div>

      {isFetching ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !customers?.length ? (
        <EmptyState title="No customers found" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-100 text-xs uppercase text-stone-400">
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Total Spent</th>
                  <th className="p-3">Last Order</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c._id} className="border-b border-stone-50 last:border-0">
                    <td className="p-3 font-medium text-stone-900">
                      {c.name} {c.isBlocked && <span className="badge bg-red-100 text-red-700">Blocked</span>}
                    </td>
                    <td className="p-3 text-stone-600">{c.phone}</td>
                    <td className="p-3 text-stone-600">{c.orderCount}</td>
                    <td className="p-3 font-medium text-stone-900">{formatBDT(c.totalSpent)}</td>
                    <td className="p-3 text-xs text-stone-400">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : '—'}</td>
                    <td className="p-3">
                      <Link to={`/admin/customers/${c._id}`} className="rounded-lg p-2 text-stone-500 hover:bg-brand-50 hover:text-brand-700"><Eye size={16} /></Link>
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

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Archive, ArchiveRestore, Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useAdminGetCategoriesQuery } from '../../api/adminApi.js';
import { useAdminGetProductsQuery, useDeleteProductMutation, useUpdateProductStatusMutation } from '../../api/adminApi.js';
import { useToast } from '../../components/common/ToastContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import { formatBDT } from '../../utils/format.js';
import useDebouncedValue from '../../hooks/useDebouncedValue.js';

export default function AdminProductsPage() {
  const [status, setStatus] = useState('active');
  const [stock, setStock] = useState('');
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search, 300);
  const { data: categories } = useAdminGetCategoriesQuery();
  const { data: products, isFetching } = useAdminGetProductsQuery({ status, stock: stock || undefined, q: q || undefined, limit: 50 });
  const [updateStatus] = useUpdateProductStatusMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const toast = useToast();

  const categoryName = (id) => categories?.find((c) => c._id === id)?.name || products?.find((p) => p.category?._id === id)?.category?.name;

  const toggleArchive = async (p) => {
    try {
      await updateStatus({ id: p._id, status: p.status === 'active' ? 'archived' : 'active' }).unwrap();
      toast?.success(p.status === 'active' ? 'Product archived' : 'Product restored');
    } catch (err) {
      toast?.error(err?.message);
    }
  };

  const doDelete = async (p) => {
    if (!confirm(`Permanently delete "${p.name}"? Consider archiving instead.`)) return;
    try {
      await deleteProduct(p._id).unwrap();
      toast?.success('Product deleted');
    } catch (err) {
      toast?.error(err?.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-stone-900">Products</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus size={16} /> Add Product
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="input pl-9" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto">
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select value={stock} onChange={(e) => setStock(e.target.value)} className="input w-auto">
          <option value="">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : !products?.length ? (
        <EmptyState title="No products found" description="Try adjusting your filters, or add your first product." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-xs uppercase text-stone-400">
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-stone-50 last:border-0">
                  <td className="flex items-center gap-3 p-3">
                    <img src={p.images?.[0]?.url} alt="" className="h-10 w-10 rounded-lg bg-stone-100 object-cover" />
                    <span className="font-medium text-stone-900">{p.name}</span>
                    {p.isCombo && <span className="badge bg-honey-100 text-honey-700">Combo</span>}
                  </td>
                  <td className="p-3 text-stone-600">{p.category?.name || categoryName(p.category)}</td>
                  <td className="p-3 text-stone-600">{formatBDT(p.variants?.[0]?.currentPrice ?? p.variants?.[0]?.price ?? 0)}+</td>
                  <td className="p-3">
                    {p.isOutOfStock ? (
                      <span className="badge bg-red-100 text-red-700">Out of stock</span>
                    ) : p.isLowStock ? (
                      <span className="badge bg-honey-100 text-honey-700">{p.totalStock} left</span>
                    ) : (
                      <span className="text-stone-700">{p.totalStock}</span>
                    )}
                  </td>
                  <td className="p-3 capitalize text-stone-600">{p.status}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/admin/products/${p._id}`} className="rounded-lg p-2 text-stone-500 hover:bg-brand-50 hover:text-brand-700" aria-label="Edit">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => toggleArchive(p)} className="rounded-lg p-2 text-stone-500 hover:bg-honey-50 hover:text-honey-700" aria-label="Archive">
                        {p.status === 'active' ? <Archive size={16} /> : <ArchiveRestore size={16} />}
                      </button>
                      <button onClick={() => doDelete(p)} className="rounded-lg p-2 text-stone-500 hover:bg-red-50 hover:text-red-600" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

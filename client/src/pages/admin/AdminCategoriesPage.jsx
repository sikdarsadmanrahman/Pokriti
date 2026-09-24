import { useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import {
  useAdminGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
} from '../../api/adminApi.js';
import { useToast } from '../../components/common/ToastContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';

const EMPTY = { name: '', description: '', isActive: true, sortOrder: 0 };

export default function AdminCategoriesPage() {
  const { data: categories, isFetching } = useAdminGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const toast = useToast();

  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = editing
  const [form, setForm] = useState(EMPTY);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setForm(EMPTY); setEditing({}); };
  const openEdit = (c) => { setForm({ name: c.name, description: c.description || '', isActive: c.isActive, sortOrder: c.sortOrder || 0 }); setEditing(c); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing?._id) {
        await updateCategory({ id: editing._id, ...form }).unwrap();
        toast?.success('Category updated');
      } else {
        await createCategory(form).unwrap();
        toast?.success('Category created');
      }
      setEditing(null);
    } catch (err) {
      toast?.error(err?.message);
    }
  };

  const doDelete = async (c) => {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await deleteCategory(c._id).unwrap();
      toast?.success('Category deleted');
    } catch (err) {
      toast?.error(err?.message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-stone-900">Categories</h1>
        <button onClick={openNew} className="btn-primary"><Plus size={16} /> Add Category</button>
      </div>

      {isFetching ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <div className="card divide-y divide-stone-50">
          {categories?.map((c) => (
            <div key={c._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-stone-900">{c.name}</p>
                <p className="text-xs text-stone-500">{c.description}</p>
              </div>
              <div className="flex items-center gap-3">
                {!c.isActive && <span className="badge bg-stone-100 text-stone-500">Inactive</span>}
                <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-stone-500 hover:bg-brand-50 hover:text-brand-700"><Edit size={16} /></button>
                <button onClick={() => doDelete(c)} className="rounded-lg p-2 text-stone-500 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900">{editing?._id ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setEditing(null)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} required className="input" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={2} className="input" />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-stone-700">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} /> Active
                </label>
                <div>
                  <label className="label mb-0">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} className="input w-24" />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

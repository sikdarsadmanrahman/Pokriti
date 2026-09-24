import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import {
  useAdminGetCategoriesQuery, useAdminGetProductQuery, useCreateProductMutation, useUpdateProductMutation,
} from '../../api/adminApi.js';
import { useToast } from '../../components/common/ToastContext.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import ImageUploader from '../../components/admin/ImageUploader.jsx';
import VariantEditor from '../../components/admin/VariantEditor.jsx';

const EMPTY = {
  name: '', shortDescription: '', description: '', category: '',
  images: [], variants: [{ label: '', price: '', salePrice: '', stock: 0 }],
  lowStockThreshold: 5, isFeatured: false, isCombo: false, origin: '', tags: '',
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const { data: categories } = useAdminGetCategoriesQuery();
  const { data: existing, isLoading } = useAdminGetProductQuery(id, { skip: !isEdit });
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();

  const [form, setForm] = useState(EMPTY);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    if (!existing) return;
    setForm({
      name: existing.name,
      shortDescription: existing.shortDescription || '',
      description: existing.description || '',
      category: existing.category?._id || existing.category || '',
      images: existing.images || [],
      variants: existing.variants.map((v) => ({ _id: v._id, label: v.label, price: v.price, salePrice: v.salePrice ?? '', stock: v.stock })),
      lowStockThreshold: existing.lowStockThreshold ?? 5,
      isFeatured: existing.isFeatured || false,
      isCombo: existing.isCombo || false,
      origin: existing.origin || '',
      tags: (existing.tags || []).join(', '),
    });
  }, [existing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      shortDescription: form.shortDescription || undefined,
      description: form.description || undefined,
      category: form.category,
      images: form.images.map(({ url, publicId, alt }) => ({ url, publicId, alt })),
      variants: form.variants.map((v) => ({
        ...(v._id && { _id: v._id }),
        label: v.label,
        price: Number(v.price),
        salePrice: v.salePrice === '' ? null : Number(v.salePrice),
        stock: Number(v.stock) || 0,
      })),
      lowStockThreshold: Number(form.lowStockThreshold) || 5,
      isFeatured: form.isFeatured,
      isCombo: form.isCombo,
      origin: form.origin || undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
    };

    try {
      if (isEdit) {
        await updateProduct({ id, ...payload }).unwrap();
        toast?.success('Product updated');
      } else {
        await createProduct(payload).unwrap();
        toast?.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast?.error(err?.message || 'Could not save product');
    }
  };

  if (isEdit && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div>
      <button onClick={() => navigate('/admin/products')} className="mb-4 flex items-center gap-1 text-sm text-stone-500 hover:text-brand-700">
        <ChevronLeft size={16} /> Back to Products
      </button>
      <h1 className="mb-6 font-display text-2xl font-bold text-stone-900">{isEdit ? 'Edit Product' : 'Add Product'}</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        <section className="card space-y-4 p-5">
          <div>
            <label className="label">Product Name</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required className="input" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} required className="input">
                <option value="">Select category</option>
                {categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Low Stock Threshold</label>
              <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => set('lowStockThreshold', e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label">Short Description</label>
            <input value={form.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} maxLength={200} className="input" />
          </div>
          <div>
            <label className="label">Full Description</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4} className="input" />
          </div>
          <div>
            <label className="label">Sourcing / Origin Story</label>
            <textarea value={form.origin} onChange={(e) => set('origin', e.target.value)} rows={2} className="input" />
          </div>
          <div>
            <label className="label">Tags (comma-separated)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="raw, natural, gift" className="input" />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input type="checkbox" checked={form.isCombo} onChange={(e) => set('isCombo', e.target.checked)} /> Combo / Bundle
            </label>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold text-stone-900">Images</h2>
          <ImageUploader images={form.images} onChange={(imgs) => set('images', imgs)} />
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-semibold text-stone-900">Variants (Weight / Size Options)</h2>
          <VariantEditor variants={form.variants} onChange={(v) => set('variants', v)} />
        </section>

        <button type="submit" disabled={creating || updating} className="btn-primary">
          {creating || updating ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}

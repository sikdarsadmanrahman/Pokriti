import { Plus, Trash2 } from 'lucide-react';

/** Editable list of weight/size variants (label, price, sale price, stock). */
export default function VariantEditor({ variants, onChange }) {
  const update = (i, patch) => onChange(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  const remove = (i) => onChange(variants.filter((_, idx) => idx !== i));
  const add = () => onChange([...variants, { label: '', price: '', salePrice: '', stock: 0 }]);

  return (
    <div className="space-y-3">
      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 rounded-xl border border-stone-200 p-3 sm:grid-cols-5 sm:items-end">
          <div>
            <label className="label">Label</label>
            <input value={v.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="500g" className="input" />
          </div>
          <div>
            <label className="label">Price (৳)</label>
            <input type="number" min="0" value={v.price} onChange={(e) => update(i, { price: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Sale Price (৳)</label>
            <input type="number" min="0" value={v.salePrice ?? ''} onChange={(e) => update(i, { salePrice: e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" min="0" value={v.stock} onChange={(e) => update(i, { stock: e.target.value })} className="input" />
          </div>
          <button type="button" onClick={() => remove(i)} disabled={variants.length <= 1} className="btn-outline h-10 text-red-600 disabled:opacity-30">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn-outline">
        <Plus size={16} /> Add Variant
      </button>
    </div>
  );
}

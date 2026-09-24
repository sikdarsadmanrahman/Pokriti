import { formatBDT } from '../../utils/format.js';

export default function ShippingZoneSelect({ rates, value, onChange }) {
  const zones = [
    { id: 'inside_dhaka', label: 'Inside Dhaka' },
    { id: 'outside_dhaka', label: 'Outside Dhaka' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {zones.map((z) => (
        <button
          key={z.id}
          type="button"
          onClick={() => onChange(z.id)}
          className={`rounded-xl border-2 p-3 text-left transition ${value === z.id ? 'border-brand-600 bg-brand-50' : 'border-stone-200 hover:border-brand-300'}`}
        >
          <p className="text-sm font-semibold text-stone-900">{z.label}</p>
          <p className="text-sm text-brand-700">{formatBDT(rates?.[z.id] ?? (z.id === 'inside_dhaka' ? 60 : 120))}</p>
        </button>
      ))}
    </div>
  );
}

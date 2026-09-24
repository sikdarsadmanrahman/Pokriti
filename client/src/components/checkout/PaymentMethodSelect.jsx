export default function PaymentMethodSelect({ methods, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {methods?.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`rounded-xl border-2 p-3 text-center text-sm font-semibold transition ${
            value === m.id ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-stone-200 text-stone-600 hover:border-brand-300'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

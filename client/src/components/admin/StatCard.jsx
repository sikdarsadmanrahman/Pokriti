export default function StatCard({ label, value, sub, icon: Icon, tone = 'brand' }) {
  const tones = { brand: 'bg-brand-50 text-brand-700', honey: 'bg-honey-50 text-honey-700', red: 'bg-red-50 text-red-700' };
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="font-display text-xl font-bold text-stone-900">{value}</p>
        {sub && <p className="text-xs text-stone-400">{sub}</p>}
      </div>
    </div>
  );
}

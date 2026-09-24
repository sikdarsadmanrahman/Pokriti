export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 px-6 py-16 text-center">
      {Icon && <Icon size={40} className="mb-3 text-stone-300" />}
      <p className="font-display text-lg font-semibold text-stone-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

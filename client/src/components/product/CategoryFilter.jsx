export default function CategoryFilter({ categories, active, onSelect }) {
  return (
    <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect('')}
        className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
          !active ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 text-stone-600 hover:border-brand-300'
        }`}
      >
        All
      </button>
      {categories?.map((c) => (
        <button
          key={c._id}
          onClick={() => onSelect(c.slug)}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
            active === c.slug ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 text-stone-600 hover:border-brand-300'
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}

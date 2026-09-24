import { Link } from 'react-router-dom';

export default function CategoryTile({ category }) {
  return (
    <Link to={`/shop?category=${category.slug}`} className="card group flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-2xl">
        {category.image?.url ? (
          <img src={category.image.url} alt={category.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          '🌿'
        )}
      </div>
      <span className="text-sm font-semibold text-stone-800 group-hover:text-brand-700">{category.name}</span>
    </Link>
  );
}

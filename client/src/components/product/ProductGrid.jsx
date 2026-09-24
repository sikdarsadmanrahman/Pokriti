import ProductCard from './ProductCard.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { PackageSearch } from 'lucide-react';

/** Renders a grid of product cards, or a skeleton grid while loading, or an empty state. Zero client-side re-fetch logic lives here. */
export default function ProductGrid({ products, isLoading, emptyTitle = 'No products found', emptyDescription }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card aspect-[3/4] animate-pulse bg-stone-100" />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return <EmptyState icon={PackageSearch} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}

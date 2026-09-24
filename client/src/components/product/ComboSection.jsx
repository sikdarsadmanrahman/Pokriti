import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { useGetProductsQuery } from '../../api/publicApi.js';
import ProductGrid from './ProductGrid.jsx';

/** Highlighted rail for combo/bundle deals on the homepage. */
export default function ComboSection() {
  const { data: products, isLoading } = useGetProductsQuery({ combo: 'true', limit: 4, sort: 'popular' });
  if (!isLoading && !products?.length) return null;

  return (
    <section className="bg-gradient-to-br from-honey-50 to-brand-50 py-12">
      <div className="container-x">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="badge bg-honey-500 text-honey-950">
              <Gift size={14} /> Bundle & Save
            </span>
            <h2 className="mt-2 text-2xl font-bold text-stone-900">Combo Offers</h2>
          </div>
          <Link to="/shop?combo=true" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
            View all combos →
          </Link>
        </div>
        <ProductGrid products={products} isLoading={isLoading} />
      </div>
    </section>
  );
}

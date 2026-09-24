import { Link } from 'react-router-dom';
import { BadgeCheck, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { useGetCategoriesQuery, useGetProductsQuery } from '../api/publicApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import ComboSection from '../components/product/ComboSection.jsx';
import CategoryTile from '../components/common/CategoryTile.jsx';

const TRUST_POINTS = [
  { icon: ShieldCheck, title: 'Lab Tested', desc: 'Every batch checked for purity before it reaches you.' },
  { icon: Leaf, title: '100% Organic', desc: 'Sourced directly from trusted farms and producers.' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Dhaka-wide and nationwide shipping, fresh on arrival.' },
  { icon: BadgeCheck, title: 'BSTI Certified', desc: 'Meets national food-safety standards.' },
];

export default function HomePage() {
  const { data: categories } = useGetCategoriesQuery();
  const { data: featured, isLoading } = useGetProductsQuery({ featured: 'true', limit: 8 });

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-honey-50">
        <div className="container-x grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <span className="badge bg-brand-100 text-brand-700">🌿 Pure & Organic Since Farm to Table</span>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-stone-900 sm:text-5xl">
              Honey, Ghee & Organic Essentials — <span className="text-brand-600">Straight From the Source</span>
            </h1>
            <p className="mt-4 max-w-lg text-stone-600">
              Hand-picked, lab-tested, and delivered fresh across Bangladesh. No additives, no shortcuts — just real food.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary">Shop Now</Link>
              <Link to="/trust" className="btn-secondary">See Our Certifications</Link>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md">
            <div className="absolute inset-0 rounded-full bg-brand-200/40 blur-3xl" />
            <img
              src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=800&auto=format&fit=crop"
              alt="Organic honey and food products"
              className="relative h-full w-full rounded-3xl object-cover shadow-xl"
            />
          </div>
        </div>
      </section>

      {categories?.length > 0 && (
        <section className="container-x py-12">
          <h2 className="mb-6 text-2xl font-bold text-stone-900">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <CategoryTile key={c._id} category={c} />
            ))}
          </div>
        </section>
      )}

      <ComboSection />

      <section className="container-x py-12">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-stone-900">Featured Products</h2>
          <Link to="/shop" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
            View all →
          </Link>
        </div>
        <ProductGrid products={featured} isLoading={isLoading} emptyDescription="Check back soon for featured picks." />
      </section>

      <section className="border-t border-stone-100 bg-white py-12">
        <div className="container-x grid grid-cols-2 gap-6 sm:grid-cols-4">
          {TRUST_POINTS.map((t) => (
            <div key={t.title} className="text-center">
              <t.icon className="mx-auto mb-2 text-brand-600" size={28} />
              <p className="text-sm font-semibold text-stone-900">{t.title}</p>
              <p className="mt-1 text-xs text-stone-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

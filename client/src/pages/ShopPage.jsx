import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetCategoriesQuery, useGetProductsQuery } from '../api/publicApi.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import CategoryFilter from '../components/product/CategoryFilter.jsx';
import SearchBar from '../components/product/SearchBar.jsx';
import useDebouncedValue from '../hooks/useDebouncedValue.js';

const PAGE_SIZE = 12;

export default function ShopPage() {
  const [params, setParams] = useSearchParams();
  const { data: categories } = useGetCategoriesQuery();

  const category = params.get('category') || '';
  const combo = params.get('combo') || '';
  const [search, setSearch] = useState(params.get('q') || '');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [category, combo, debouncedSearch]);

  const { data: products, isFetching } = useGetProductsQuery({
    category: category || undefined,
    combo: combo || undefined,
    q: debouncedSearch || undefined,
    page,
    limit: PAGE_SIZE,
  });

  // Accumulate pages locally ("Load More" rather than a paged control); resets whenever filters or page 1 data change.
  const [accumulated, setAccumulated] = useState([]);
  useEffect(() => {
    if (!products) return;
    setAccumulated((prev) => (page === 1 ? products : [...prev, ...products]));
  }, [products, page]);

  const setCategory = (slug) => setParams((p) => { slug ? p.set('category', slug) : p.delete('category'); return p; }, { replace: true });

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 font-display text-3xl font-bold text-stone-900">
        {combo === 'true' ? 'Combo & Bundle Offers' : category ? categories?.find((c) => c.slug === category)?.name || 'Shop' : 'Shop All Products'}
      </h1>

      <div className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name, e.g. Sundarban Honey…" />
      </div>

      <div className="mb-6">
        <CategoryFilter categories={categories} active={category} onSelect={setCategory} />
      </div>

      <ProductGrid
        products={accumulated}
        isLoading={isFetching && page === 1}
        emptyTitle="No matching products"
        emptyDescription="Try a different search term or category."
      />

      {(products?.length ?? 0) >= PAGE_SIZE && (
        <div className="mt-8 flex justify-center">
          <button onClick={() => setPage((p) => p + 1)} disabled={isFetching} className="btn-outline">
            {isFetching ? 'Loading…' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

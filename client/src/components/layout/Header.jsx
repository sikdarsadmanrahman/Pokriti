import { useState } from 'react';
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Menu, Phone, Search, ShoppingCart, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCartCount, toggleCart } from '../../app/cartSlice.js';
import { useGetCategoriesQuery, useGetConfigQuery } from '../../api/publicApi.js';

const NAV_LINKS = [
  { to: '/shop', label: 'Shop' },
  { to: '/shop?combo=true', label: 'Combos & Bundles' },
  { to: '/trust', label: 'Quality & Trust' },
];

export default function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cartCount = useSelector(selectCartCount);
  const { data: categories } = useGetCategoriesQuery();
  const { data: config } = useGetConfigQuery();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState(params.get('q') || '');

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/shop?q=${encodeURIComponent(q.trim())}` : '/shop');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
      {config?.support?.phone && (
        <div className="hidden bg-brand-800 text-white sm:block">
          <div className="container-x flex h-8 items-center justify-end gap-4 text-xs">
            <a href={`tel:${config.support.phone}`} className="flex items-center gap-1 hover:underline">
              <Phone size={12} /> {config.support.phone}
            </a>
            <span className="opacity-80">Free-flowing goodness, delivered fresh 🌿</span>
          </div>
        </div>
      )}

      <div className="container-x flex h-16 items-center gap-4">
        <button className="md:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-brand-800">
          <Leaf className="text-brand-600" size={26} />
          {config?.brandName || 'Gram Rosh'}
        </Link>

        <nav className="ml-6 hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.label} to={l.to} className={({ isActive }) => `text-sm font-medium ${isActive ? 'text-brand-700' : 'text-stone-600 hover:text-brand-700'}`}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden max-w-xs flex-1 items-center sm:flex">
          <div className="relative w-full">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search honey, ghee, nuts…"
              className="input pl-9"
              aria-label="Search products"
            />
          </div>
        </form>

        <button onClick={() => navigate('/shop')} className="sm:hidden" aria-label="Search">
          <Search size={22} />
        </button>

        <button onClick={() => dispatch(toggleCart())} className="relative ml-2" aria-label="Open cart">
          <ShoppingCart size={24} className="text-stone-700" />
          {cartCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-honey-500 text-[11px] font-bold text-honey-900">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 pb-4 pt-2 md:hidden">
          <form onSubmit={submitSearch} className="relative mb-3">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input pl-9" />
          </form>
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-2 text-sm font-medium text-stone-700 hover:bg-brand-50">
                {l.label}
              </Link>
            ))}
            {categories?.length > 0 && <div className="mt-2 border-t border-stone-100 pt-2 text-xs font-semibold uppercase text-stone-400">Categories</div>}
            {categories?.map((c) => (
              <Link key={c._id} to={`/shop?category=${c.slug}`} onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-1.5 text-sm text-stone-600 hover:bg-brand-50">
                {c.name}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {categories?.length > 0 && (
        <div className="hidden border-t border-stone-100 bg-brand-50/50 md:block">
          <div className="container-x flex h-10 items-center gap-5 overflow-x-auto text-sm">
            {categories.map((c) => (
              <Link key={c._id} to={`/shop?category=${c.slug}`} className="whitespace-nowrap text-stone-600 hover:text-brand-700">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

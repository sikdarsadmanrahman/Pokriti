import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = 'Search products…' }) {
  return (
    <div className="relative">
      <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input pl-10 pr-9" />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600" aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

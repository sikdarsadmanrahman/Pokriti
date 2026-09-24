import { Link } from 'react-router-dom';
import { Leaf, Mail, MapPin, Phone } from 'lucide-react';
import { useGetConfigQuery } from '../../api/publicApi.js';

export default function Footer() {
  const { data: config } = useGetConfigQuery();
  return (
    <footer className="mt-16 border-t border-stone-200 bg-white">
      <div className="container-x grid grid-cols-1 gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-bold text-brand-800">
            <Leaf className="text-brand-600" size={22} /> {config?.brandName || 'Gram Rosh'}
          </div>
          <p className="mt-3 text-sm text-stone-500">Pure, natural food — sourced responsibly and lab-tested for purity, delivered straight to your door.</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-stone-800">Shop</p>
          <ul className="space-y-2 text-sm text-stone-500">
            <li><Link to="/shop" className="hover:text-brand-700">All Products</Link></li>
            <li><Link to="/shop?combo=true" className="hover:text-brand-700">Combo Packs</Link></li>
            <li><Link to="/trust" className="hover:text-brand-700">Quality & Trust</Link></li>
            <li><Link to="/track-order" className="hover:text-brand-700">Track My Order</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-stone-800">Delivery & Payment</p>
          <ul className="space-y-2 text-sm text-stone-500">
            <li>Inside Dhaka — ৳60</li>
            <li>Outside Dhaka — ৳120</li>
            <li>Cash on Delivery</li>
            <li>bKash · Nagad · Rocket</li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-stone-800">Contact</p>
          <ul className="space-y-2 text-sm text-stone-500">
            {config?.support?.phone && <li className="flex items-center gap-2"><Phone size={14} /> {config.support.phone}</li>}
            <li className="flex items-center gap-2"><Mail size={14} /> support@example.com</li>
            <li className="flex items-center gap-2"><MapPin size={14} /> Dhaka, Bangladesh</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-stone-100 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} {config?.brandName || 'Gram Rosh'}. All rights reserved.
      </div>
    </footer>
  );
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LayoutDashboard, LogOut, Menu, Package, ShoppingBag, Tag, Users, X } from 'lucide-react';
import { useState } from 'react';
import { logout, selectAdmin } from '../../app/authSlice.js';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
];

export default function AdminLayout() {
  const admin = useSelector(selectAdmin);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const doLogout = () => {
    dispatch(logout());
    navigate('/admin/login');
  };

  const SidebarContent = (
    <>
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 font-display font-bold text-white">
          {admin?.name?.[0] || 'A'}
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900">{admin?.name || 'Admin'}</p>
          <p className="text-xs capitalize text-stone-400">{admin?.role || 'admin'}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-brand-600 text-white' : 'text-stone-600 hover:bg-brand-50'
              }`
            }
          >
            <n.icon size={18} /> {n.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={doLogout} className="mt-4 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
        <LogOut size={18} /> Log out
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <span className="font-display font-bold text-brand-800">Admin Panel</span>
        <button onClick={() => setMobileOpen((o) => !o)}>{mobileOpen ? <X size={22} /> : <Menu size={22} />}</button>
      </div>

      {mobileOpen && (
        <div className="border-b border-stone-200 bg-white p-4 lg:hidden">
          <div className="flex flex-col">{SidebarContent}</div>
        </div>
      )}

      <div className="mx-auto flex max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-stone-200 bg-white p-4 lg:flex">
          {SidebarContent}
        </aside>
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout() {
  const { role } = useAuth();

  const menus =
    role === 'owner'
      ? [{ label: 'Produk', path: '/produk' }]
      : role === 'cashier'
        ? [{ label: 'Kasir', path: '/kasir' }]
        : [];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="w-64 border-r border-slate-200 bg-white p-6">
        <h1 className="text-xl font-bold text-slate-900">KasirKita</h1>

        <nav className="mt-8 space-y-2">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `block rounded-lg px-4 py-3 text-sm font-medium ${
                  isActive ? 'bg-blue-100 text-blue-400' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {menu.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className='min-w-0 flex-1 p-6'>
        <Outlet />
      </main>
    </div>
  );
}

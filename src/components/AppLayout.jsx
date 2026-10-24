import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout() {
  const { role } = useAuth();

  const menus =
    role === 'owner'
      ? [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Kategori', path: '/kategori' },
          { label: 'Produk', path: '/produk'},
        ]
      : role === 'cashier'
        ? [{ label: 'Kasir', path: '/kasir' }]
        : [];

  return (
   <div className="flex min-h-screen bg-[#F6F5F1]">
  <aside className="w-64 shrink-0 bg-[#1F2B24] p-6">
    <h1 className="text-xl font-bold text-white">
      KasirKita
    </h1>

    <nav className="mt-8 space-y-2">
      {menus.map((menu) => (
        <NavLink
          key={menu.path}
          to={menu.path}
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[#30483B] text-white"
                : "text-[#B8C3BB] hover:bg-[#30483B] hover:text-white"
            }`
          }
        >
          {menu.label}
        </NavLink>
      ))}
    </nav>
  </aside>

  <main className="min-w-0 flex-1 p-6">
    <Outlet />
  </main>
</div>
  );
}

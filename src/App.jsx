import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { user, role, loading } = useAuth();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('Logout gagal: ' + error.massage);
    }
  }

  if (loading) {
    return <p>Memeriksa sesi login...</p>;
  }

  const homePath = role === 'owner' ? '/produk' : role === 'cashier' ? '/kasir' : null;

  return (
    <Routes>
      <Route
        path="/login"
        element={user && homePath ? <Navigate to={homePath} replace /> : <Login />}
      />

      <Route path="/" element={<Navigate to={user && homePath ? homePath : '/login'} replace />} />

      <Route element={<ProtectedRoute allowedRole="owner" />}>
        <Route
          path="/produk"
          element={
            <main className="p-6">
              <h1 className="text-2xl font-bold">Halaman Produk — Owner</h1>
              <p>{user?.email}</p>
              <button
                onClick={handleLogout}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Logout
              </button>
            </main>
          }
        />
      </Route>

      <Route element={<ProtectedRoute allowedRole="cashier" />}>
        <Route
          path="/kasir"
          element={
            <main className="p-6">
              <h1 className="text-2xl font-bold">Halaman Kasir</h1>
              <p>{user?.email}</p>
              <button
                onClick={handleLogout}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
              >
                Logout
              </button>
            </main>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={user && homePath ? homePath : '/login'} replace />} />
    </Routes>
  );
}

export default App;

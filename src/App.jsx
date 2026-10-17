import Login from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { supabase } from './lib/supabase';

function App() {
  const { user, loading } = useAuth();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert('Logout gagal: ' + error.massage);
    }
  }

  if (loading) {
    return <p>Memeriksa sesi login...</p>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <main>
      <h1>Selamat datang di KasirKita</h1>
      <p>Login berhasil: {user.email}</p>
      <button onClick={handleLogout}>
        Logout
      </button>
    </main>
  );
}

export default App;

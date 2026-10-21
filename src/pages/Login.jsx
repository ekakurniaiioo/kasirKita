import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email atau password salah.'
          : err.message || 'Login gagal. Silahkan coba lagi.',
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main>
      <form onSubmit={handleLogin} className="">
        <div>
          <h1 className="text-2xl font-bold text-stone-700">KasirKita</h1>
          <p className="mt-1 text-sm text-stone-700">Masuk untuk mengelola toko kamu.</p>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@gmail.com"
            autoComplete="email"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-stone-600"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukan password"
            autoComplete="current_password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-stone-600"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <button
        type='submit'
        disabled={loading}
        className='w-full rounded-lg bg-gray-200 px-4 py-2 font-medium text-wwhite hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60'>
            {loading ? 'Sedang masuk...' : 'Masuk'}
            </button>
      </form>
    </main>
  );
}

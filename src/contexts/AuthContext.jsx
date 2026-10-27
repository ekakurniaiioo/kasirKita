import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function updateAuth(newSession) {
      setLoading(true);
      setSession(newSession);
      setRole(null);
      setStoreId(null);

      if (!newSession?.user) {
        if (active) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role, store_id')
        .eq('id', newSession.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.log('Gagal mengambil role:', error.message);
      }

      setRole(data?.role ?? null);
      setStoreId(data?.store_id ?? null);
      setLoading(false);
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setTimeout(() => {
        if (active) updateAuth(newSession);
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        role,
        storeId,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

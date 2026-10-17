import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function updateAuth(newSession) {
      setLoading(true);
      setSession(newSession);
      setRole(null);

      if (!newSession?.user) {
        if (active) setLoading(false);
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', newSession.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.log('Gagal mengambil role:', error.massage);
      }

      setRole(data?.role ?? null);
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
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

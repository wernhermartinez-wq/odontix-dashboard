import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export type AuthRole = 'admin' | 'clinic' | null;

interface AuthState {
  user: User | null;
  role: AuthRole;
  clienteId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const role: AuthRole = (user?.user_metadata?.role as AuthRole) ?? null;
  const clienteId: string | null = user?.user_metadata?.cliente_id ?? null;

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, role, clienteId, loading, signOut };
}

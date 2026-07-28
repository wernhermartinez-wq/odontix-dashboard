import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { clearNexaroToken } from '@/lib/nexaro';
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

  // SEGURIDAD: leer role desde app_metadata (solo editable server-side via service role key)
  // NO usar user_metadata — cualquier usuario autenticado puede editarlo con supabase.auth.updateUser()
  // Para asignar roles: usar Supabase Dashboard → Authentication → Users → editar app_metadata
  // o llamar a supabase.auth.admin.updateUserById() desde un backend con service role key
  const role: AuthRole = (user?.app_metadata?.role as AuthRole) ?? null;
  const clienteId: string | null = user?.app_metadata?.cliente_id ?? null;

  const signOut = async () => {
    await supabase.auth.signOut();
    clearNexaroToken();
  };

  return { user, role, clienteId, loading, signOut };
}

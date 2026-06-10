import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type Plan = 'basic' | 'professional' | 'premium' | null;

export function usePlan(clienteId: string | null): { plan: Plan; loading: boolean } {
  const [plan, setPlan] = useState<Plan>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clienteId) {
      setLoading(false);
      return;
    }

    supabase
      .from('odontix_config')
      .select('plan')
      .eq('cliente_id', clienteId)
      .single()
      .then(({ data }) => {
        setPlan((data?.plan as Plan) ?? null);
        setLoading(false);
      });
  }, [clienteId]);

  return { plan, loading };
}

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ClienteRow {
  id: string;
  nombre: string;
  activo: boolean;
  tipo_negocio: string | null;
  plan: string | null;
}

// Precio de catálogo por plan (mismos valores que AdminPipelinePage/BasicPlanPage).
// No hay tabla de costes/ingresos reales en el esquema actual de Agentix —
// "Costes" y "Margen" no se muestran para no fabricar cifras sin fuente de datos.
const PRECIO_PLAN: Record<string, number> = { basic: 109, professional: 189, premium: 279 };

const BG   = '#F0F4F8';
const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
const TEXT       = '#1A202C';
const TEXT_MUTED = '#4A5568';
const TEXT_DIM   = '#718096';

export default function AdminOverviewPage() {
  const [clinicas, setClinicas] = useState<ClienteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: clientes } = await supabase.from('clientes').select('id, nombre, activo, tipo_negocio').order('nombre');
      const { data: configs } = await supabase.from('odontix_config').select('cliente_id, plan');

      const planPorCliente: Record<string, string> = {};
      (configs || []).forEach((c: any) => { planPorCliente[c.cliente_id] = c.plan; });

      setClinicas((clientes || []).map((c: any) => ({ ...c, plan: planPorCliente[c.id] ?? null })));
      setLoading(false);
    })();
  }, []);

  const activas = clinicas.filter(c => c.activo);
  const ingresosMensuales = activas.reduce((s, c) => s + (c.plan ? PRECIO_PLAN[c.plan] ?? 0 : 0), 0);

  const kpis = [
    { label: 'Clínicas activas', value: activas.length,           color: '#1A9DB5', bg: 'rgba(26,157,181,0.08)' },
    { label: 'Ingresos / mes',   value: `${ingresosMensuales}€`,   color: '#38A169', bg: 'rgba(56,161,105,0.08)' },
    { label: 'Total clínicas',   value: clinicas.length,           color: '#718096', bg: 'rgba(113,128,150,0.08)' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto" style={{ background: BG, minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: TEXT, fontFamily: 'Manrope, system-ui, sans-serif' }}>Visión global</h1>
        <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>Métricas de todas las clínicas activas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} style={{ ...CARD, padding: '1.25rem' }}>
            <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background: k.bg }}>
              <div className="w-2 h-2 rounded-full" style={{ background: k.color }} />
            </div>
            <p className="text-xs font-medium mb-1" style={{ color: TEXT_MUTED }}>{k.label}</p>
            <p className="text-2xl font-bold" style={{ color: TEXT, fontFamily: 'Manrope, sans-serif' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: TEXT_MUTED }}>Cargando...</div>
      ) : (
        <div style={{ ...CARD, overflow: 'hidden' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid #EDF2F7' }}>
            <h2 className="text-sm font-semibold" style={{ color: TEXT }}>Clínicas</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#F7FAFC' }}>
                {['Clínica', 'Estado', 'Plan', 'Precio / mes'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${i > 1 ? 'text-right' : 'text-left'}`}
                    style={{ color: TEXT_DIM }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clinicas.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid #EDF2F7' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F7FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: TEXT }}>{c.nombre}</p>
                    <p className="text-xs mt-0.5" style={{ color: TEXT_DIM }}>{c.tipo_negocio || '—'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={c.activo
                        ? { background: 'rgba(56,161,105,0.1)', color: '#276749' }
                        : { background: 'rgba(214,158,46,0.1)', color: '#975A16' }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ background: c.activo ? '#38A169' : '#D69E2E' }} />
                      {c.activo ? 'activo' : 'inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right" style={{ color: TEXT_MUTED }}>{c.plan ?? 'sin plan'}</td>
                  <td className="px-5 py-3.5 text-right font-semibold" style={{ color: TEXT }}>
                    {c.plan ? `${PRECIO_PLAN[c.plan] ?? 0}€` : '—'}
                  </td>
                </tr>
              ))}
              {clinicas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm" style={{ color: TEXT_DIM }}>Sin clínicas registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

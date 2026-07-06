import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ResumenRow {
  cliente: string; automatizacion: string; estado: string;
  progreso_porcentaje: number; precio_mensual: number;
  coste_mensual: number; margen_mensual: number; pago_implementacion: number;
}

const BG = '#0d1018';
const CARD = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem' };
const TEXT = 'rgba(240,240,245,0.95)';
const TEXT_MUTED = 'rgba(240,240,245,0.5)';
const TEXT_DIM = 'rgba(240,240,245,0.3)';

export default function AdminOverviewPage() {
  const [data, setData] = useState<ResumenRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('agentix_dashboard_resumen').select('*').then(({ data }) => {
      setData(data || []);
      setLoading(false);
    });
  }, []);

  const totalIngresos = data.reduce((s, r) => s + (r.precio_mensual || 0), 0);
  const totalCostes = data.reduce((s, r) => s + (r.coste_mensual || 0), 0);
  const totalMargen = data.reduce((s, r) => s + (r.margen_mensual || 0), 0);

  const kpis = [
    { label: 'Clínicas activas', value: data.length,         color: '#4F9EFF', glow: 'rgba(79,158,255,0.4)' },
    { label: 'Ingresos / mes',   value: `${totalIngresos}€`, color: '#00E878', glow: 'rgba(0,232,120,0.4)' },
    { label: 'Costes / mes',     value: `${totalCostes}€`,   color: '#FF3C5A', glow: 'rgba(255,60,90,0.4)' },
    { label: 'Margen / mes',     value: `${totalMargen}€`,   color: '#FFBB00', glow: 'rgba(255,187,0,0.4)' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto" style={{ background: BG, minHeight: '100vh' }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: TEXT, fontFamily: 'Manrope, system-ui, sans-serif' }}>Visión global</h1>
        <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>Métricas de todas las clínicas activas</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k) => (
          <div key={k.label} style={{ ...CARD, padding: '1.25rem' }}>
            <p className="text-xs font-medium mb-1" style={{ color: TEXT_MUTED }}>{k.label}</p>
            <p className="text-2xl font-bold" style={{ color: k.color, textShadow: `0 0 20px ${k.glow}` }}>{k.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-sm" style={{ color: TEXT_MUTED }}>Cargando...</div>
      ) : (
        <div style={{ ...CARD, overflow: 'hidden' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                {['Clínica','Estado','Precio','Margen'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${i > 1 ? 'text-right' : 'text-left'}`}
                    style={{ color: TEXT_DIM }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: TEXT }}>{row.cliente}</p>
                    <p className="text-xs" style={{ color: TEXT_MUTED }}>{row.automatizacion}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={row.estado === 'activo'
                        ? { background: 'rgba(0,232,120,0.12)', color: '#00E878' }
                        : { background: 'rgba(255,187,0,0.12)', color: '#FFBB00' }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: row.estado === 'activo' ? '#00E878' : '#FFBB00' }} />
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium" style={{ color: TEXT }}>{row.precio_mensual}€</td>
                  <td className="px-5 py-3.5 text-right font-medium" style={{ color: '#00E878' }}>{row.margen_mensual}€</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-sm" style={{ color: TEXT_DIM }}>Sin clínicas registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

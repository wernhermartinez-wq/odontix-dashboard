import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ResumenRow {
  cliente: string; automatizacion: string; estado: string;
  progreso_porcentaje: number; precio_mensual: number;
  coste_mensual: number; margen_mensual: number; pago_implementacion: number;
}

const BG   = '#F0F4F8';
const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '0.875rem', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' };
const TEXT       = '#1A202C';
const TEXT_MUTED = '#4A5568';
const TEXT_DIM   = '#718096';

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
  const totalCostes   = data.reduce((s, r) => s + (r.coste_mensual || 0), 0);
  const totalMargen   = data.reduce((s, r) => s + (r.margen_mensual || 0), 0);

  const kpis = [
    { label: 'Clínicas activas', value: data.length,          color: '#1A9DB5', bg: 'rgba(26,157,181,0.08)'  },
    { label: 'Ingresos / mes',   value: `${totalIngresos}€`,  color: '#38A169', bg: 'rgba(56,161,105,0.08)'  },
    { label: 'Costes / mes',     value: `${totalCostes}€`,    color: '#E53E3E', bg: 'rgba(229,62,62,0.08)'   },
    { label: 'Margen / mes',     value: `${totalMargen}€`,    color: '#D69E2E', bg: 'rgba(214,158,46,0.08)'  },
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
                {['Clínica','Estado','Precio / mes','Margen'].map((h, i) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide ${i > 1 ? 'text-right' : 'text-left'}`}
                    style={{ color: TEXT_DIM }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid #EDF2F7' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F7FAFC')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium" style={{ color: TEXT }}>{row.cliente}</p>
                    <p className="text-xs mt-0.5" style={{ color: TEXT_DIM }}>{row.automatizacion}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                      style={row.estado === 'activo'
                        ? { background: 'rgba(56,161,105,0.1)', color: '#276749' }
                        : { background: 'rgba(214,158,46,0.1)', color: '#975A16' }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ background: row.estado === 'activo' ? '#38A169' : '#D69E2E' }} />
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold" style={{ color: TEXT }}>{row.precio_mensual}€</td>
                  <td className="px-5 py-3.5 text-right font-semibold" style={{ color: '#38A169' }}>{row.margen_mensual}€</td>
                </tr>
              ))}
              {data.length === 0 && (
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

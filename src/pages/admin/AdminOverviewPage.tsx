import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ResumenRow {
  cliente: string;
  automatizacion: string;
  estado: string;
  progreso_porcentaje: number;
  precio_mensual: number;
  coste_mensual: number;
  margen_mensual: number;
  pago_implementacion: number;
}

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
  const totalClinicas = data.length;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Visión global</h1>
        <p className="text-gray-500 text-sm mt-1">Métricas de todas las clínicas activas</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Clínicas activas', value: totalClinicas, color: 'bg-blue-50 text-blue-600' },
          { label: 'Ingresos / mes', value: `${totalIngresos}€`, color: 'bg-green-50 text-green-600' },
          { label: 'Costes / mes', value: `${totalCostes}€`, color: 'bg-red-50 text-red-600' },
          { label: 'Margen / mes', value: `${totalMargen}€`, color: 'bg-purple-50 text-purple-600' },
        ].map((k) => (
          <div key={k.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-gray-500 text-xs font-medium mb-1">{k.label}</p>
            <p className={`text-2xl font-bold ${k.color.split(' ')[1]}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Clínica</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{row.cliente}</p>
                    <p className="text-gray-400 text-xs">{row.automatizacion}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      row.estado === 'activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${row.estado === 'activo' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      {row.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-900">{row.precio_mensual}€</td>
                  <td className="px-5 py-3.5 text-right font-medium text-green-600">{row.margen_mensual}€</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">Sin clínicas registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

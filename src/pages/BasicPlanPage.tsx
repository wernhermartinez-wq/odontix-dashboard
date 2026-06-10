import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Plan } from '@/hooks/usePlan';

interface BotStats {
  totalCitas: number;
  citasEsteMes: number;
  citasHoy: number;
  confirmacionesEnviadas: number;
}

interface BasicPlanPageProps {
  clinicName?: string;
  plan: Plan;
  clienteId?: string | null;
  onSignOut: () => void;
  viewingAs?: { id: string; nombre: string } | null;
}

export default function BasicPlanPage({ clinicName, plan, clienteId, onSignOut, viewingAs }: BasicPlanPageProps) {
  const isBasic = plan === 'basic';
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const effectiveClienteId = viewingAs?.id ?? clienteId;

  useEffect(() => {
    if (!effectiveClienteId) return;
    loadStats();
  }, [effectiveClienteId]);

  async function loadStats() {
    setLoadingStats(true);
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      const [totalRes, mesRes, hoyRes, confirmRes] = await Promise.all([
        supabase.from('citas').select('id', { count: 'exact', head: true }).eq('cliente_id', effectiveClienteId),
        supabase.from('citas').select('id', { count: 'exact', head: true }).eq('cliente_id', effectiveClienteId).gte('fecha', startOfMonth),
        supabase.from('citas').select('id', { count: 'exact', head: true }).eq('cliente_id', effectiveClienteId).eq('fecha', today),
        supabase.from('citas').select('id', { count: 'exact', head: true }).eq('cliente_id', effectiveClienteId).eq('confirmacion_enviada', true),
      ]);

      setStats({
        totalCitas: totalRes.count ?? 0,
        citasEsteMes: mesRes.count ?? 0,
        citasHoy: hoyRes.count ?? 0,
        confirmacionesEnviadas: confirmRes.count ?? 0,
      });
    } catch {
      setStats({ totalCitas: 0, citasEsteMes: 0, citasHoy: 0, confirmacionesEnviadas: 0 });
    }
    setLoadingStats(false);
  }

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 ${viewingAs ? 'pt-16' : ''}`}>
      {viewingAs && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-xs font-medium py-1.5 px-4 flex items-center justify-between">
          <span>Vista admin: <strong>{viewingAs.nombre}</strong><span className="ml-2 opacity-80">- Plan basic</span></span>
          <button onClick={onSignOut} className="underline hover:no-underline">Volver al admin</button>
        </div>
      )}

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-900">Odontix</span>
          </div>
          {clinicName && (
            <p className="text-gray-500 text-sm">Bienvenido, <span className="font-medium text-gray-700">{clinicName}</span></p>
          )}
        </div>

        {/* Bot status */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-700 font-semibold text-sm">Bot WhatsApp activo</span>
            </div>
            <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
              Plan Basic
            </span>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-5">
            Tu asistente virtual gestiona citas automaticamente por WhatsApp, sin que tengas que hacer nada.
          </p>

          {/* Stats grid */}
          {loadingStats ? (
            <div className="grid grid-cols-2 gap-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="bg-gray-50 rounded-xl p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-12 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-700">{stats.totalCitas.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-0.5">Citas registradas</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">{stats.citasEsteMes}</p>
                <p className="text-xs text-gray-500 mt-0.5">Citas este mes</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-orange-600">{stats.citasHoy}</p>
                <p className="text-xs text-gray-500 mt-0.5">Citas hoy</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-purple-600">{stats.confirmacionesEnviadas}</p>
                <p className="text-xs text-gray-500 mt-0.5">Confirmaciones enviadas</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-blue-700">--</p>
                <p className="text-xs text-gray-500 mt-0.5">Citas registradas</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-700">--</p>
                <p className="text-xs text-gray-500 mt-0.5">Citas este mes</p>
              </div>
            </div>
          )}
        </div>

        {/* What the bot does */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Lo que hace el bot por ti</p>
          <div className="space-y-2.5">
            {[
              { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "Responde pacientes 24/7 por WhatsApp" },
              { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Agenda citas en Google Calendar" },
              { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", label: "Envia recordatorios automaticos" },
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Confirma y cancela sin intervencion" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell */}
        {isBasic && (
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-sm">
            <p className="font-semibold text-sm mb-1">Ver el dashboard completo</p>
            <p className="text-blue-100 text-xs leading-relaxed mb-4">
              Agenda visual, historial de pacientes, estadisticas de rendimiento y seguimiento de ausencias.
            </p>
            <a
              href="mailto:wernher.martinez@gmail.com?subject=Actualizar a Professional"
              className="block text-center bg-white text-blue-700 font-semibold text-sm rounded-xl py-2.5 hover:bg-blue-50 transition-colors"
            >
              Actualizar a Professional - 149/mes
            </a>
          </div>
        )}

        <div className="text-center mt-5">
          <button onClick={onSignOut} className="text-gray-400 hover:text-gray-600 text-sm transition-colors">
            Cerrar sesion
          </button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Plan } from '@/hooks/usePlan';
import odontixLogo from '@/assets/odontixsinfondo.png';

interface BotStats { totalCitas: number; citasEsteMes: number; citasHoy: number; confirmacionesEnviadas: number; }
interface BasicPlanPageProps { clinicName?: string; plan: Plan; clienteId?: string | null; onSignOut: () => void; viewingAs?: { id: string; nombre: string } | null; }

const TEXT_MUTED = '#4A5568';
const TEXT_DIM = '#718096';
const CARD = { background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '1rem' };

export default function BasicPlanPage({ clinicName, plan, clienteId, onSignOut, viewingAs }: BasicPlanPageProps) {
  const isBasic = plan === 'basic';
  const [stats, setStats] = useState<BotStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const effectiveClienteId = viewingAs?.id ?? clienteId;

  useEffect(() => { if (effectiveClienteId) loadStats(); }, [effectiveClienteId]);

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
      setStats({ totalCitas: totalRes.count ?? 0, citasEsteMes: mesRes.count ?? 0, citasHoy: hoyRes.count ?? 0, confirmacionesEnviadas: confirmRes.count ?? 0 });
    } catch { setStats({ totalCitas: 0, citasEsteMes: 0, citasHoy: 0, confirmacionesEnviadas: 0 }); }
    setLoadingStats(false);
  }

  const statItems = stats ? [
    { value: stats.totalCitas, label: 'Citas registradas', neon: '#1a9db5', glow: 'rgba(26,157,181,0.3)' },
    { value: stats.citasEsteMes, label: 'Citas este mes', neon: '#38A169', glow: 'rgba(56,161,105,0.3)' },
    { value: stats.citasHoy, label: 'Citas hoy', neon: '#FFBB00', glow: 'rgba(255,187,0,0.3)' },
    { value: stats.confirmacionesEnviadas, label: 'Confirmaciones enviadas', neon: '#3dc0d8', glow: 'rgba(61,192,216,0.3)' },
  ] : null;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden ${viewingAs ? 'pt-16' : ''}`} style={{ background: 'linear-gradient(155deg, #071a1f 0%, #0a2530 60%, #0d3040 100%)' }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(19,122,140,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(19,122,140,0.07) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
      }} />
      {/* Círculo decorativo */}
      <div className="absolute pointer-events-none" style={{
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(19,122,140,0.1) 0%, transparent 70%)',
        top: '-15%', left: '-20%',
      }} />
      {viewingAs && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500 text-white text-xs font-medium py-1.5 px-4 flex items-center justify-between">
          <span>Vista admin: <strong>{viewingAs.nombre}</strong><span className="ml-2 opacity-80">– Plan basic</span></span>
          <button onClick={onSignOut} className="underline hover:no-underline">Volver al admin</button>
        </div>
      )}

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <img src={odontixLogo} alt="Odontix" style={{ height: 56, width: 'auto', margin: '0 auto 12px' }} />
          {clinicName && <p className="text-sm" style={{ color: TEXT_MUTED }}>Bienvenido, <span style={{ color: '#ffffff', fontWeight: 600 }}>{clinicName}</span></p>}
        </div>

        {/* Bot status card */}
        <div style={{ ...CARD, padding: '1.5rem', marginBottom: '1rem' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#38A169', boxShadow: '0 0 8px #38A169' }} />
              <span className="font-semibold text-sm" style={{ color: '#38A169' }}>Bot WhatsApp activo</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide" style={{ background: 'rgba(19,122,140,0.2)', border: '1px solid rgba(19,122,140,0.4)', color: '#1a9db5' }}>Plan Basic</span>
          </div>

          <p className="text-sm leading-relaxed mb-5" style={{ color: TEXT_MUTED }}>
            Tu asistente virtual gestiona citas automaticamente por WhatsApp, sin que tengas que hacer nada.
          </p>

          {loadingStats ? (
            <div className="grid grid-cols-2 gap-3">
              {[0,1,2,3].map(i => (
                <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: '#FFFFFF' }}>
                  <div className="h-6 rounded w-12 mb-1" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  <div className="h-3 rounded w-24" style={{ background: '#F7FAFC' }} />
                </div>
              ))}
            </div>
          ) : statItems ? (
            <div className="grid grid-cols-2 gap-3">
              {statItems.map((s, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                  <p className="text-2xl font-bold" style={{ color: s.neon, textShadow: `0 0 16px ${s.glow}` }}>{s.value.toLocaleString()}</p>
                  <p className="text-xs mt-0.5" style={{ color: TEXT_DIM }}>{s.label}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {['--','--'].map((v, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: '#ffffff' }}>
                  <p className="text-2xl font-bold" style={{ color: '#1a9db5' }}>{v}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* What bot does */}
        <div style={{ ...CARD, padding: '1.25rem', marginBottom: '1rem' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'rgba(26,157,181,0.6)' }}>Lo que hace el bot por ti</p>
          <div className="space-y-2.5">
            {[
              { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", label: "Responde pacientes 24/7 por WhatsApp" },
              { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "Agenda citas en Google Calendar" },
              { icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", label: "Envía recordatorios automáticos" },
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", label: "Confirma y cancela sin intervención" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(26,157,181,0.08)' }}>
                  <svg className="w-3.5 h-3.5" style={{ color: '#1a9db5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <p className="text-sm" style={{ color: TEXT_MUTED }}>{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upsell */}
        {isBasic && (
          <div className="rounded-2xl p-5 text-white" style={{ background: 'linear-gradient(135deg, rgba(19,122,140,0.25) 0%, rgba(42,85,200,0.4) 100%)', border: '1px solid rgba(26,157,181,0.3)', boxShadow: '0 0 30px rgba(0,0,0,0.06)' }}>
            <p className="font-semibold text-sm mb-1" style={{ fontFamily: 'Manrope, system-ui, sans-serif' }}>Ver el dashboard completo</p>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Agenda visual, historial de pacientes, estadísticas de rendimiento y seguimiento de ausencias.
            </p>
            <a href="mailto:wernher.martinez@gmail.com?subject=Actualizar a Professional"
              className="block text-center font-semibold text-sm rounded-xl py-2.5 transition-all"
              style={{ background: '#1a9db5', color: '#F0F4F8', boxShadow: '0 4px 16px rgba(19,122,140,0.2)' }}>
              Actualizar a Professional — 189€/mes
            </a>
          </div>
        )}

        <div className="text-center mt-5">
          <button onClick={onSignOut} className="text-sm transition-colors" style={{ color: TEXT_DIM }}
            onMouseEnter={e => (e.currentTarget.style.color = TEXT_MUTED)}
            onMouseLeave={e => (e.currentTarget.style.color = TEXT_DIM)}>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

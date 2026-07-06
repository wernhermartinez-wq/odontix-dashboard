import { getTodayAppointments, getWeeklyData, appointments, patients, absences } from "@/data/mockData";
import type { Appointment } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

const statusColors: Record<string, { bg: string; color: string }> = {
  attended: { bg: 'rgba(56,161,105,0.12)', color: '#38A169' },
  absent:   { bg: 'rgba(229,62,62,0.12)',  color: '#E53E3E' },
  scheduled:{ bg: 'rgba(19,122,140,0.08)', color: '#1a9db5' },
  cancelled:{ bg: 'rgba(0,0,0,0.05)', color: '#718096' },
};

const statusLabels: Record<string, string> = {
  attended: "Atendido",
  absent: "Ausente",
  scheduled: "Pendiente",
  cancelled: "Cancelado",
};

const treatmentColors: Record<string, string> = {
  Limpieza: "#1a9db5",
  Ortodoncia: "#3dc0d8",
  Endodoncia: "#E53E3E",
  Extracción: "#FF8C00",
  Blanqueamiento: "#FFD600",
  Implante: "#00E5FF",
  Control: "#38A169",
  Radiografía: "#94A3B8",
  Obturación: "#FF6EB4",
  Periodoncia: "#00E5C4",
};

const CARD = { background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '0.875rem' };
const TEXT_MUTED = '#5c5c6b';
const TEXT_DIM = '#9a9aaa';

function KPICard({ label, value, sub, neon, icon }: {
  label: string; value: number | string; sub?: string;
  neon: { glow: string; bg: string; color: string };
  icon: React.ReactNode;
}) {
  return (
    <div style={{ ...CARD, padding: '1.25rem' }} className="flex items-center gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: neon.bg, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: TEXT_MUTED }}>{label}</p>
        <p className="text-2xl font-bold leading-tight" style={{ color: "#1a1a1f" }}>{value}</p>
        {sub && <p className="text-xs" style={{ color: TEXT_DIM }}>{sub}</p>}
      </div>
    </div>
  );
}

function WeeklyBar({ data }: { data: ReturnType<typeof getWeeklyData> }) {
  const max = Math.max(...data.map((d) => d.total), 1);
  return (
    <div style={{ ...CARD, padding: '1.25rem' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "#1a1a1f" }}>Citas esta semana</h3>
        <div className="flex items-center gap-4 text-xs" style={{ color: TEXT_MUTED }}>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#1a9db5' }} />Atendidas</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: '#E53E3E' }} />Ausentes</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ background: 'rgba(0,0,0,0.09)' }} />Pendientes</span>
        </div>
      </div>
      <div className="flex items-end gap-3 h-36">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex flex-col-reverse gap-px" style={{ height: '112px' }}>
              <div className="w-full rounded-b" style={{ height: `${(d.attended / max) * 112}px`, background: '#1a9db5' }} />
              <div className="w-full" style={{ height: `${(d.absent / max) * 112}px`, background: '#E53E3E' }} />
              <div className="w-full rounded-t" style={{ height: `${(d.scheduled / max) * 112}px`, background: 'rgba(0,0,0,0.08)' }} />
            </div>
            <span className="text-[11px]" style={{ color: TEXT_DIM }}>{d.day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppointmentRow({ appt }: { appt: Appointment }) {
  const sc = statusColors[appt.status];
  return (
    <div className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: treatmentColors[appt.treatment] ?? '#94A3B8' }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "#1a1a1f" }}>{appt.patientName}</p>
        <p className="text-xs truncate" style={{ color: TEXT_MUTED }}>{appt.time} · {appt.treatment} · {appt.room}</p>
      </div>
      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color }}>
        {statusLabels[appt.status]}
      </span>
    </div>
  );
}

interface DashboardPageProps {
  clienteId?: string | null;
  plan?: Plan;
}

export default function DashboardPage({ clienteId: _clienteId, plan }: DashboardPageProps = {}) {
  const today = getTodayAppointments();
  const attended = today.filter((a) => a.status === 'attended').length;
  const absent = today.filter((a) => a.status === 'absent').length;
  const pending = today.filter((a) => a.status === 'scheduled').length;
  const weekly = getWeeklyData();

  const upcoming = appointments
    .filter((a) => a.date > new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 8);

  const totalPatients = patients.length;
  const recentAbsences = absences.filter((a) => a.date >= new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1A202C', fontFamily: 'Manrope, system-ui, sans-serif' }}>Dashboard</h1>
          <p className="text-sm" style={{ color: TEXT_MUTED }}>
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {plan === 'premium' && (
            <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(128,90,213,0.1)', color: '#3dc0d8', border: '1px solid rgba(61,192,216,0.3)' }}>
              <span>★</span> Premium
            </span>
          )}
          {plan === 'professional' && (
            <span className="text-xs font-semibold px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(19,122,140,0.08)', color: '#1a9db5', border: '1px solid rgba(26,157,181,0.25)' }}>
              Professional
            </span>
          )}
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: 'rgba(56,161,105,0.1)', border: '1px solid rgba(56,161,105,0.25)', color: '#38A169' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#38A169' }} />
            WhatsApp activo
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Citas hoy" value={today.length} sub={`${attended} completadas`}
          neon={{ bg: 'rgba(19,122,140,0.08)', glow: 'rgba(26,157,181,0.3)', color: '#1a9db5' }}
          icon={<svg className="w-5 h-5" style={{ color: '#1a9db5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>}
        />
        <KPICard label="Atendidos" value={attended} sub={`${today.length > 0 ? Math.round((attended / today.length) * 100) : 0}% asistencia`}
          neon={{ bg: 'rgba(56,161,105,0.12)', glow: 'rgba(56,161,105,0.3)', color: '#38A169' }}
          icon={<svg className="w-5 h-5" style={{ color: '#38A169' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KPICard label="Ausentes" value={absent} sub={`${recentAbsences} en 7 días`}
          neon={{ bg: 'rgba(229,62,62,0.12)', glow: 'rgba(229,62,62,0.3)', color: '#E53E3E' }}
          icon={<svg className="w-5 h-5" style={{ color: '#E53E3E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KPICard label="Pendientes" value={pending} sub={`${totalPatients} pacientes total`}
          neon={{ bg: 'rgba(255,187,0,0.12)', glow: 'rgba(255,187,0,0.3)', color: '#D69E2E' }}
          icon={<svg className="w-5 h-5" style={{ color: '#D69E2E' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
      </div>

      {/* Premium AI */}
      {plan === 'premium' && (
        <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '0.875rem', padding: '1.25rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(167,139,250,0.2)', boxShadow: '0 0 12px rgba(61,192,216,0.3)' }}>
              <svg className="w-4 h-4" style={{ color: '#3dc0d8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "#1a1a1f" }}>Insights IA del día</p>
              <p className="text-xs" style={{ color: TEXT_MUTED }}>Análisis automático basado en tu clínica</p>
            </div>
            <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider" style={{ background: 'rgba(128,90,213,0.1)', color: '#3dc0d8' }}>Premium IA</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {[
              { title: 'Patrón de cancelaciones', desc: 'Los jueves tienen 34% más ausencias. Refuerza recordatorios el miércoles.', color: 'rgba(255,187,0,0.08)', border: 'rgba(255,187,0,0.2)', neon: '#FFBB00', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', badge: 'Atención' },
              { title: 'Bot rinde al 94%', desc: 'Tu asistente supera el promedio del sector (78%). Excelente rendimiento.', color: 'rgba(56,161,105,0.06)', border: 'rgba(56,161,105,0.2)', neon: '#38A169', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', badge: 'Excelente' },
              { title: '3 pacientes en riesgo', desc: 'Carlos R., Ana T. y Maria L. no confirmaron. Recordatorio urgente recomendado.', color: 'rgba(229,62,62,0.06)', border: 'rgba(229,62,62,0.2)', neon: '#E53E3E', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', badge: 'Acción' },
            ].map((insight, i) => (
              <div key={i} style={{ background: insight.color, border: `1px solid ${insight.border}`, borderRadius: '0.75rem', padding: '1rem' }}>
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: insight.neon }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={insight.icon} />
                  </svg>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold" style={{ color: "#1a1a1f" }}>{insight.title}</p>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${insight.neon}22`, color: insight.neon }}>{insight.badge}</span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: TEXT_MUTED }}>{insight.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2"><WeeklyBar data={weekly} /></div>

        {/* WhatsApp stats */}
        <div style={{ ...CARD, padding: '1.25rem' }}>
          <h3 className="font-semibold text-sm mb-4" style={{ color: "#1a1a1f" }}>Automatización WhatsApp</h3>
          <div className="space-y-3">
            {[
              { label: 'Confirmaciones enviadas', value: today.filter(a => a.confirmedByWhatsApp).length, total: today.length, color: '#1a9db5' },
              { label: 'Recordatorios activos', value: upcoming.filter(a => a.confirmedByWhatsApp).length, total: upcoming.length, color: '#3dc0d8' },
              { label: 'Ausencias notificadas', value: absences.filter(a => a.whatsappSent).length, total: absences.length, color: '#FF8C00' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: TEXT_MUTED }}>{item.label}</span>
                  <span className="font-medium" style={{ color: "#1a1a1f" }}>{item.value}/{item.total}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#f0f2f5' }}>
                  <div className="h-full rounded-full" style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`, background: item.color }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            <p className="text-xs mb-2" style={{ color: TEXT_MUTED }}>Estado del bot</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-white">+549 11 4000-0000</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(56,161,105,0.1)', color: '#38A169' }}>Conectado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Citas hoy + próximas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div style={{ ...CARD, padding: '1.25rem' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: "#1a1a1f" }}>Citas de hoy</h3>
            <span className="text-xs" style={{ color: TEXT_DIM }}>{today.length} total</span>
          </div>
          {today.slice(0, 8).map((appt) => <AppointmentRow key={appt.id} appt={appt} />)}
          {today.length === 0 && <p className="text-sm text-center py-4" style={{ color: TEXT_MUTED }}>No hay citas hoy</p>}
        </div>

        <div style={{ ...CARD, padding: '1.25rem' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: "#1a1a1f" }}>Próximas citas</h3>
            <span className="text-xs" style={{ color: TEXT_DIM }}>{upcoming.length} agendadas</span>
          </div>
          {upcoming.slice(0, 8).map((appt) => (
            <div key={appt.id} className="flex items-center gap-3 py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <div className="flex-shrink-0 text-center w-8">
                <p className="text-[10px] uppercase" style={{ color: TEXT_DIM }}>{new Date(appt.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' })}</p>
                <p className="text-sm font-bold" style={{ color: "#1a1a1f" }}>{appt.date.slice(8)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#1a1a1f" }}>{appt.patientName}</p>
                <p className="text-xs truncate" style={{ color: TEXT_MUTED }}>{appt.time} · {appt.treatment}</p>
              </div>
              {appt.confirmedByWhatsApp && (
                <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#38A169' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

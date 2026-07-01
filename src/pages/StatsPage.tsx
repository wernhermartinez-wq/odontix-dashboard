import { useState } from "react";
import { appointments, getMonthlyData, absences, patients } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

const CARD = { background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "0.875rem" } as const;
const MUTED = "#5c5c6b";
const DIM = "#9a9aaa";
const BORDER = "rgba(0,0,0,0.07)";

function BarChart({ data, valueKey, labelKey, color = "#1a9db5", height = 160 }: {
  data: Array<Record<string, string | number>>;
  valueKey: string;
  labelKey: string;
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => Number(d[valueKey])), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "0.35rem", height }}>
      {data.map((d, i) => {
        const val = Number(d[valueKey]);
        const h = Math.max((val / max) * (height - 28), 2);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
            <span style={{ fontSize: "0.6rem", color: DIM, fontWeight: 500 }}>{val}</span>
            <div
              style={{
                width: "100%",
                height: `${h}px`,
                background: color,
                borderRadius: "0.25rem 0.25rem 0 0",
                boxShadow: `0 0 6px ${color}55`,
                transition: "height 0.3s ease",
              }}
            />
            <span style={{ fontSize: "0.6rem", color: DIM }}>{String(d[labelKey])}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ value, total, color, label }: { value: number; total: number; color: string; label: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f4f6f8" strokeWidth="10" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform="rotate(-90 48 48)"
          style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
        />
        <text x="48" y="53" textAnchor="middle" fontSize="16" fontWeight="700" fill="#fff">
          {Math.round(pct)}%
        </text>
      </svg>
      <p style={{ fontSize: "0.78rem", color: MUTED, textAlign: "center", fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: "0.7rem", color: DIM }}>{value} / {total}</p>
    </div>
  );
}

interface StatsPageProps { plan?: Plan | null }

export default function StatsPage({ plan }: StatsPageProps = {}) {
  const isPremium = plan === "premium";
  const [showReport, setShowReport] = useState(false);
  const currentMonth = new Date().toLocaleString("es-ES", { month: "long", year: "numeric" });
  const monthly = getMonthlyData();
  const total = appointments.length;
  const attended = appointments.filter((a) => a.status === "attended").length;
  const absent = appointments.filter((a) => a.status === "absent").length;
  const cancelled = appointments.filter((a) => a.status === "cancelled").length;
  const scheduled = appointments.filter((a) => a.status === "scheduled").length;
  const confirmed = appointments.filter((a) => a.confirmedByWhatsApp).length;
  const totalRevenue = monthly.reduce((acc, m) => acc + m.revenue, 0);
  const avgPerMonth = Math.round(totalRevenue / monthly.length);

  const treatmentDistrib: Record<string, number> = {};
  appointments.forEach((a) => { treatmentDistrib[a.treatment] = (treatmentDistrib[a.treatment] ?? 0) + 1; });
  const treatmentData = Object.entries(treatmentDistrib)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([treatment, count]) => ({ treatment: treatment.slice(0, 8), count }));

  return (
    <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }} className="space-y-5">
      {/* Premium report modal */}
      {isPremium && showReport && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowReport(false); }}
        >
          <div style={{ background: "#ffffff", border: "1px solid rgba(61,192,216,0.3)", borderRadius: "1rem", maxWidth: "32rem", width: "100%", padding: "1.5rem", boxShadow: "0 0 40px rgba(167,139,250,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ background: "rgba(167,139,250,0.15)", color: "#3dc0d8", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>Premium IA</span>
                <h2 style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "1.1rem", marginTop: "0.4rem", textTransform: "capitalize" }}>Reporte {currentMonth}</h2>
              </div>
              <button onClick={() => setShowReport(false)} style={{ background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: "0.5rem", color: MUTED, width: "2rem", height: "2rem", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {[
                { label: "Total citas", value: String(appointments.length), sub: "+12% vs mes anterior", ok: true },
                { label: "Tasa de asistencia", value: Math.round((attended / total) * 100) + "%", sub: "Objetivo: 80%", ok: attended / total > 0.8 },
                { label: "Confirmaciones WA", value: confirmed + " enviadas", sub: "Reducción de ausencias del 23%", ok: true },
                { label: "Pacientes recuperados", value: "8", sub: "Vía campañas automáticas", ok: true },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#ffffff", borderRadius: "0.625rem", padding: "0.875rem" }}>
                  <div>
                    <p style={{ color: "#1a1a1f", fontWeight: 500, fontSize: "0.875rem" }}>{item.label}</p>
                    <p style={{ color: DIM, fontSize: "0.75rem", marginTop: "0.15rem" }}>{item.sub}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "0.875rem" }}>{item.value}</p>
                    <span style={{ background: item.ok ? "rgba(0,232,120,0.12)" : "rgba(255,187,0,0.12)", color: item.ok ? "#00E878" : "#FFBB00", padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>
                      {item.ok ? "Bien" : "Mejorar"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(167,139,250,0.07)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: "0.625rem", padding: "1rem", marginBottom: "1.25rem" }}>
              <p style={{ color: "#3dc0d8", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.4rem" }}>Recomendación IA del mes</p>
              <p style={{ color: MUTED, fontSize: "0.85rem", lineHeight: 1.5 }}>Los jueves tienen un 34% más de ausencias. Considera enviar recordatorios adicionales el miércoles por la tarde para reducir el ausentismo.</p>
            </div>

            <button
              onClick={() => { setShowReport(false); alert(`PDF generado: reporte-${currentMonth.replace(" ", "-")}.pdf`); }}
              style={{ width: "100%", background: "linear-gradient(135deg, #3dc0d8, #0f5e70)", border: "none", borderRadius: "0.625rem", color: "#1a1a1f", padding: "0.7rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 700, boxShadow: "0 0 20px rgba(61,192,216,0.3)" }}
            >
              Descargar PDF
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1f", marginBottom: "0.2rem" }}>Estadísticas y Reportes</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem" }}>Análisis histórico de citas, asistencia y conversión</p>
        </div>
        {isPremium && (
          <button
            onClick={() => setShowReport(true)}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "linear-gradient(135deg, #3dc0d8, #0f5e70)", border: "none", borderRadius: "0.625rem", color: "#1a1a1f", padding: "0.55rem 1.1rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 0 16px rgba(61,192,216,0.3)" }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Reporte mensual
          </button>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "1rem" }}>
        {[
          { label: "Total citas hist.", value: total.toLocaleString(), color: "#1a1a1f" },
          { label: "Tasa de asistencia", value: `${total > 0 ? Math.round((attended / total) * 100) : 0}%`, color: "#00E878" },
          { label: "Tasa de ausencia", value: `${total > 0 ? Math.round((absent / total) * 100) : 0}%`, color: "#FF3C5A" },
          { label: "Ingresos est. 6M", value: `$${(totalRevenue / 1000).toFixed(0)}K`, color: "#1a9db5" },
        ].map((k) => (
          <div key={k.label} style={{ ...CARD, padding: "1.125rem" }}>
            <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.35rem" }}>{k.label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: k.color, textShadow: k.color !== "#fff" ? `0 0 12px ${k.color}55` : "none" }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: "1rem" }}>
        <div style={{ ...CARD, padding: "1.25rem" }}>
          <h3 style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1rem" }}>Citas por mes</h3>
          <BarChart data={monthly} valueKey="total" labelKey="month" color="#1a9db5" height={160} />
        </div>
        <div style={{ ...CARD, padding: "1.25rem" }}>
          <h3 style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>Ingresos estimados por mes</h3>
          <p style={{ color: DIM, fontSize: "0.78rem", marginBottom: "0.75rem" }}>Promedio: ${avgPerMonth.toLocaleString()}</p>
          <BarChart
            data={monthly.map((m) => ({ month: m.month, revenue: Math.round(m.revenue / 1000) }))}
            valueKey="revenue"
            labelKey="month"
            color="#00E878"
            height={160}
          />
          <p style={{ fontSize: "0.65rem", color: DIM, marginTop: "0.25rem", textAlign: "right" }}>en miles $</p>
        </div>
      </div>

      {/* Donuts */}
      <div style={{ ...CARD, padding: "1.5rem" }}>
        <h3 style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1.5rem" }}>Indicadores de desempeño</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px,1fr))", gap: "1.5rem" }}>
          <DonutChart value={attended} total={total} color="#00E878" label="Asistencia" />
          <DonutChart value={absent} total={total} color="#FF3C5A" label="Ausentismo" />
          <DonutChart value={confirmed} total={total} color="#1a9db5" label="Confirmación WA" />
          <DonutChart value={attended} total={attended + cancelled} color="#3dc0d8" label="Conversión" />
        </div>
      </div>

      {/* Treatment + Occupancy */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: "1rem" }}>
        <div style={{ ...CARD, padding: "1.25rem" }}>
          <h3 style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1rem" }}>Distribución por tratamiento</h3>
          <BarChart data={treatmentData} valueKey="count" labelKey="treatment" color="#3dc0d8" height={160} />
        </div>
        <div style={{ ...CARD, padding: "1.25rem" }}>
          <h3 style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem", marginBottom: "1rem" }}>Ocupación de agenda</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {[
              { label: "Atendidos", value: attended, total, color: "#00E878" },
              { label: "Ausentes", value: absent, total, color: "#FF3C5A" },
              { label: "Cancelados", value: cancelled, total, color: "#FFBB00" },
              { label: "Agendados", value: scheduled, total, color: "#1a9db5" },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                  <span style={{ color: MUTED, fontSize: "0.8rem" }}>{item.label}</span>
                  <span style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.8rem" }}>
                    {item.value.toLocaleString()} ({item.total > 0 ? Math.round((item.value / item.total) * 100) : 0}%)
                  </span>
                </div>
                <div style={{ height: "6px", background: "#f0f2f5", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`, background: item.color, borderRadius: "999px", boxShadow: `0 0 6px ${item.color}88`, transition: "width 0.4s ease" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "1.25rem", paddingTop: "1rem", borderTop: `1px solid ${BORDER}` }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#1a9db5", textShadow: "0 0 12px #1a9db555" }}>{patients.length}</p>
              <p style={{ color: MUTED, fontSize: "0.75rem" }}>Pacientes activos</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.75rem", fontWeight: 700, color: "#00E878", textShadow: "0 0 12px #00E87855" }}>{absences.filter(a => a.rescheduled).length}</p>
              <p style={{ color: MUTED, fontSize: "0.75rem" }}>Ausencias recuperadas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly table */}
      <div style={{ ...CARD, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem" }}>Resumen mensual detallado</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Mes","Total","Atendidas","Ausentes","Canceladas","Ingresos Est.","Tasa Asist."].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: DIM, fontWeight: 600, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => {
                const rate = Math.round((m.attended / m.total) * 100);
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid ${BORDER}`, transition: "background 0.12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "0.875rem 1rem", color: "#1a1a1f", fontWeight: 500 }}>{m.month}</td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{m.total}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#00E878", fontWeight: 600 }}>{m.attended}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#FF3C5A" }}>{m.absent}</td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{m.cancelled}</td>
                    <td style={{ padding: "0.875rem 1rem", color: "#1a9db5" }}>${m.revenue.toLocaleString()}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ flex: 1, height: "4px", background: "#f0f2f5", borderRadius: "999px", overflow: "hidden", minWidth: "4rem" }}>
                          <div style={{ height: "100%", width: `${rate}%`, background: rate >= 80 ? "#00E878" : rate >= 60 ? "#FFBB00" : "#FF3C5A", borderRadius: "999px" }} />
                        </div>
                        <span style={{ color: "#1a1a1f", fontSize: "0.78rem", fontWeight: 600, whiteSpace: "nowrap" }}>{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

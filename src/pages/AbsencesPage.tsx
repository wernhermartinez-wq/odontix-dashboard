import { useState } from "react";
import { absences } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

const CARD = { background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "0.875rem" } as const;
const MUTED = "#5c5c6b";
const DIM = "#9a9aaa";
const BORDER = "rgba(0,0,0,0.07)";

interface AbsencesPageProps { plan?: Plan | null }

export default function AbsencesPage({ plan }: AbsencesPageProps = {}) {
  const [filter, setFilter] = useState<"all" | "pending" | "rescheduled">("all");

  const filtered = absences.filter((a) => {
    if (filter === "pending") return !a.rescheduled;
    if (filter === "rescheduled") return a.rescheduled;
    return true;
  });

  const total = absences.length;
  const rescheduled = absences.filter((a) => a.rescheduled).length;
  const pending = total - rescheduled;
  const recoveryRate = total > 0 ? Math.round((rescheduled / total) * 100) : 0;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }} className="space-y-5">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1f", marginBottom: "0.2rem" }}>Ausencias</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>Seguimiento de pacientes que no asistieron</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "1rem" }}>
        {[
          { label: "Total ausencias", value: total, color: "#E53E3E", icon: "⚠" },
          { label: "Reagendadas", value: rescheduled, color: "#38A169", icon: "✓" },
          { label: "Pendientes", value: pending, color: "#FFBB00", icon: "⏳" },
          { label: "Tasa recuperación", value: `${recoveryRate}%`, color: "#3dc0d8", icon: "📈" },
        ].map((k) => (
          <div key={k.label} style={{ ...CARD, padding: "1.125rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "1rem" }}>{k.icon}</span>
              <p style={{ color: MUTED, fontSize: "0.75rem" }}>{k.label}</p>
            </div>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: k.color, textShadow: `0 0 12px ${k.color}55` }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Recovery bar */}
      <div style={{ ...CARD, padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <p style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem" }}>Tasa de recuperación</p>
          <p style={{ color: "#3dc0d8", fontWeight: 700, fontSize: "0.9rem" }}>{recoveryRate}%</p>
        </div>
        <div style={{ height: "8px", background: "#f0f2f5", borderRadius: "999px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${recoveryRate}%`, background: "linear-gradient(90deg, #3dc0d8, #1a9db5)", borderRadius: "999px", boxShadow: "0 0 8px rgba(167,139,250,0.5)", transition: "width 0.5s ease" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
          <p style={{ color: DIM, fontSize: "0.75rem" }}>{rescheduled} reagendadas</p>
          <p style={{ color: DIM, fontSize: "0.75rem" }}>{pending} pendientes</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {([["all", "Todas"], ["pending", "Pendientes"], ["rescheduled", "Reagendadas"]] as const).map(([v, label]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: 600,
              border: "1px solid rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.15s",
              background: filter === v ? "rgba(26,157,181,0.18)" : "#f9fafb",
              color: filter === v ? "#1a9db5" : MUTED,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...CARD, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Paciente", "Fecha", "Tratamiento", "Doctor", "Razón", "Estado", "Reagendado"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: DIM, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: MUTED }}>No hay ausencias en este filtro</td>
                </tr>
              ) : filtered.map((a, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: `1px solid ${BORDER}`, transition: "background 0.12s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.875rem 1rem", color: "#1a1a1f", fontWeight: 500, whiteSpace: "nowrap" }}>{a.patientName}</td>
                  <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{a.date}</td>
                  <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{a.treatment}</td>
                  <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{a.professionalName}</td>
                  <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{("—")}</td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    {a.whatsappSent ? (
                      <span style={{ background: "rgba(19,122,140,0.08)", color: "#1a9db5", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>Contactado</span>
                    ) : (
                      <span style={{ background: "rgba(255,187,0,0.12)", color: "#FFBB00", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>Sin contactar</span>
                    )}
                  </td>
                  <td style={{ padding: "0.875rem 1rem" }}>
                    {a.rescheduled ? (
                      <span style={{ background: "rgba(56,161,105,0.12)", color: "#38A169", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>✓ Sí</span>
                    ) : (
                      <span style={{ background: "rgba(229,62,62,0.12)", color: "#E53E3E", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "0.75rem 1rem", borderTop: `1px solid ${BORDER}` }}>
          <p style={{ color: DIM, fontSize: "0.78rem" }}>{filtered.length} registros</p>
        </div>
      </div>
    </div>
  );
}

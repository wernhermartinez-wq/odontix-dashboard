import { useState } from "react";
import { appointments } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

const CARD = { background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "0.875rem" } as const;
const MUTED = "#5c5c6b";
const DIM = "#9a9aaa";
const BORDER = "rgba(0,0,0,0.07)";

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  scheduled:  { bg: "rgba(19,122,140,0.08)",  color: "#1a9db5",  label: "Agendada" },
  attended:   { bg: "rgba(56,161,105,0.12)",   color: "#38A169",  label: "Atendida" },
  absent:     { bg: "rgba(229,62,62,0.12)",   color: "#E53E3E",  label: "Ausente" },
  cancelled:  { bg: "rgba(255,187,0,0.12)",   color: "#FFBB00",  label: "Cancelada" },
};

interface AgendaPageProps { plan?: Plan | null }

export default function AgendaPage({ plan }: AgendaPageProps = {}) {
  const [view, setView] = useState<"list" | "calendar">("list");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const filtered = appointments.filter((a) => {
    const matchSearch = a.patientName.toLowerCase().includes(search.toLowerCase()) ||
      a.treatment.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || a.status === filterStatus;
    const matchDate = !filterDate || a.date === filterDate;
    return matchSearch && matchStatus && matchDate;
  });

  const today = new Date().toISOString().split("T")[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const upcomingAppts = appointments.filter((a) => a.date > today && a.status === "scheduled");

  // Calendar helpers
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const monthName = new Date(calYear, calMonth).toLocaleString("es-ES", { month: "long", year: "numeric" });
  const apptsByDate: Record<string, typeof appointments> = {};
  appointments.forEach((a) => { apptsByDate[a.date] = [...(apptsByDate[a.date] || []), a]; });

  return (
    <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }} className="space-y-5">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1f", marginBottom: "0.2rem" }}>Agenda</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem" }}>Gestión de citas y calendario</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["list","calendar"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                fontWeight: 600,
                border: "1px solid rgba(0,0,0,0.08)",
                cursor: "pointer",
                transition: "all 0.15s",
                background: view === v ? "rgba(26,157,181,0.18)" : "#f9fafb",
                color: view === v ? "#1a9db5" : MUTED,
              }}
            >
              {v === "list" ? "Lista" : "Calendario"}
            </button>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: "1rem" }}>
        {[
          { label: "Hoy", value: todayAppts.length, color: "#1a9db5" },
          { label: "Próximas", value: upcomingAppts.length, color: "#38A169" },
          { label: "Total", value: appointments.length, color: "#3dc0d8" },
          { label: "Pendientes", value: appointments.filter(a => a.status === "scheduled").length, color: "#FFBB00" },
        ].map((s) => (
          <div key={s.label} style={{ ...CARD, padding: "1rem" }}>
            <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.25rem" }}>{s.label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, textShadow: `0 0 12px ${s.color}55` }}>{s.value}</p>
          </div>
        ))}
      </div>

      {view === "list" ? (
        <>
          {/* Filters */}
          <div style={{ ...CARD, padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar paciente o tratamiento…"
              style={{
                flex: "1 1 200px",
                background: "#f4f6f8",
                border: `1px solid ${BORDER}`,
                borderRadius: "0.5rem",
                color: "#1a1a1f",
                padding: "0.45rem 0.75rem",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                background: "#f4f6f8",
                border: `1px solid ${BORDER}`,
                borderRadius: "0.5rem",
                color: filterStatus === "all" ? MUTED : "#fff",
                padding: "0.45rem 0.75rem",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all" style={{ background: "#f4f6f8" }}>Todos los estados</option>
              <option value="scheduled" style={{ background: "#f4f6f8" }}>Agendada</option>
              <option value="attended" style={{ background: "#f4f6f8" }}>Atendida</option>
              <option value="absent" style={{ background: "#f4f6f8" }}>Ausente</option>
              <option value="cancelled" style={{ background: "#f4f6f8" }}>Cancelada</option>
            </select>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{
                background: "#f4f6f8",
                border: `1px solid ${BORDER}`,
                borderRadius: "0.5rem",
                color: filterDate ? "#fff" : MUTED,
                padding: "0.45rem 0.75rem",
                fontSize: "0.85rem",
                outline: "none",
                colorScheme: "dark",
              }}
            />
            {(search || filterStatus !== "all" || filterDate) && (
              <button
                onClick={() => { setSearch(""); setFilterStatus("all"); setFilterDate(""); }}
                style={{
                  background: "rgba(229,62,62,0.1)",
                  border: "1px solid rgba(229,62,62,0.2)",
                  borderRadius: "0.5rem",
                  color: "#E53E3E",
                  padding: "0.45rem 0.75rem",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ ...CARD, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                    {["Paciente", "Fecha", "Hora", "Tratamiento", "Doctor", "Estado", "WA"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: DIM, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: MUTED }}>
                        No se encontraron citas
                      </td>
                    </tr>
                  ) : filtered.map((a, i) => {
                    const s = STATUS_STYLE[a.status] ?? STATUS_STYLE.scheduled;
                    return (
                      <tr
                        key={i}
                        style={{ borderBottom: `1px solid ${BORDER}`, transition: "background 0.12s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "0.875rem 1rem", color: "#1a1a1f", fontWeight: 500, whiteSpace: "nowrap" }}>{a.patientName}</td>
                        <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{a.date}</td>
                        <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{a.time}</td>
                        <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{a.treatment}</td>
                        <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{a.professionalName}</td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          <span style={{ background: s.bg, color: s.color, padding: "0.2rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {s.label}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem 1rem" }}>
                          {a.confirmedByWhatsApp ? (
                            <span style={{ color: "#38A169", fontSize: "0.75rem", fontWeight: 600 }}>✓ Sí</span>
                          ) : (
                            <span style={{ color: DIM, fontSize: "0.75rem" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "0.75rem 1rem", borderTop: `1px solid ${BORDER}` }}>
              <p style={{ color: DIM, fontSize: "0.78rem" }}>{filtered.length} citas encontradas</p>
            </div>
          </div>
        </>
      ) : (
        /* Calendar view */
        <div style={{ ...CARD, padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <button
              onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
              style={{ background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: "0.5rem", color: MUTED, padding: "0.4rem 0.75rem", cursor: "pointer" }}
            >‹</button>
            <h3 style={{ color: "#1a1a1f", fontWeight: 600, textTransform: "capitalize" }}>{monthName}</h3>
            <button
              onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
              style={{ background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: "0.5rem", color: MUTED, padding: "0.4rem 0.75rem", cursor: "pointer" }}
            >›</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem", marginBottom: "0.5rem" }}>
            {["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"].map((d) => (
              <div key={d} style={{ textAlign: "center", color: DIM, fontSize: "0.72rem", fontWeight: 600, padding: "0.25rem" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.25rem" }}>
            {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
              <div key={`e${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayAppts = apptsByDate[dateStr] || [];
              const isToday = dateStr === today;
              return (
                <div
                  key={day}
                  style={{
                    background: isToday ? "rgba(19,122,140,0.08)" : dayAppts.length > 0 ? "#f9fafb" : "transparent",
                    border: isToday ? "1px solid rgba(26,157,181,0.4)" : `1px solid ${BORDER}`,
                    borderRadius: "0.5rem",
                    padding: "0.35rem",
                    minHeight: "3.5rem",
                  }}
                >
                  <p style={{ fontSize: "0.75rem", fontWeight: isToday ? 700 : 400, color: isToday ? "#1a9db5" : MUTED, marginBottom: "0.2rem" }}>{day}</p>
                  {dayAppts.slice(0, 2).map((a, j) => {
                    const s = STATUS_STYLE[a.status];
                    return (
                      <div key={j} style={{ background: s.bg, borderRadius: "0.25rem", padding: "0.1rem 0.3rem", marginBottom: "0.15rem" }}>
                        <p style={{ fontSize: "0.6rem", color: s.color, fontWeight: 600, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                          {a.time} {a.patientName.split(" ")[0]}
                        </p>
                      </div>
                    );
                  })}
                  {dayAppts.length > 2 && (
                    <p style={{ fontSize: "0.6rem", color: DIM }}>+{dayAppts.length - 2} más</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

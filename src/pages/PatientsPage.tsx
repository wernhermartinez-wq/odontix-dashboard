import { useState } from "react";
import { patients } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

const CARD = { background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "0.875rem" } as const;
const MUTED = "#5c5c6b";
const DIM = "#9a9aaa";
const BORDER = "rgba(0,0,0,0.07)";
const INPUT_STYLE = {
  background: "#f4f6f8",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: "0.5rem",
  color: "#1a1a1f",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
  width: "100%",
} as const;

interface PatientsPageProps { plan?: Plan | null }

export default function PatientsPage({ plan }: PatientsPageProps = {}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof patients)[0] | null>(null);

  const filtered = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.phone.includes(search) ||
    p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const avatarColors = ["#1a9db5", "#38A169", "#3dc0d8", "#FFBB00", "#E53E3E"];
  const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }} className="space-y-5">
      {/* Patient detail modal */}
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div style={{ background: "#ffffff", border: "1px solid rgba(26,157,181,0.25)", borderRadius: "1rem", maxWidth: "32rem", width: "100%", padding: "1.5rem", boxShadow: "0 0 40px rgba(26,157,181,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "1.1rem" }}>Ficha del Paciente</h2>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: "0.5rem", color: MUTED, width: "2rem", height: "2rem", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}
              >×</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: `rgba(${avatarColor(selected.name) === "#1a9db5" ? "26,157,181" : avatarColor(selected.name) === "#38A169" ? "56,161,105" : avatarColor(selected.name) === "#3dc0d8" ? "167,139,250" : avatarColor(selected.name) === "#FFBB00" ? "255,187,0" : "229,62,62"},0.2)`, border: `2px solid ${avatarColor(selected.name)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: avatarColor(selected.name), fontSize: "1rem" }}>
                {initials(selected.name)}
              </div>
              <div>
                <p style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "1.1rem" }}>{selected.name}</p>
                <p style={{ color: MUTED, fontSize: "0.875rem" }}>{selected.phone}</p>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { label: "Email", value: selected.email || "—" },
                { label: "Fecha de nacimiento", value: selected.birthDate || "—" },
                { label: "Última visita", value: selected.lastVisit || "—" },
                { label: "Próxima cita", value: selected.nextAppointment || "—" },
              ].map((f) => (
                <div key={f.label} style={{ background: "#ffffff", borderRadius: "0.5rem", padding: "0.75rem" }}>
                  <p style={{ color: DIM, fontSize: "0.7rem", marginBottom: "0.2rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>{f.label}</p>
                  <p style={{ color: "#1a1a1f", fontSize: "0.875rem", fontWeight: 500 }}>{f.value}</p>
                </div>
              ))}
            </div>

            {selected.notes && (
              <div style={{ background: "rgba(26,157,181,0.06)", border: "1px solid rgba(26,157,181,0.15)", borderRadius: "0.5rem", padding: "0.875rem", marginBottom: "1.25rem" }}>
                <p style={{ color: "#1a9db5", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.35rem" }}>Notas</p>
                <p style={{ color: MUTED, fontSize: "0.875rem" }}>{selected.notes}</p>
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              style={{ width: "100%", background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: "0.625rem", color: MUTED, padding: "0.6rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600 }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1f", marginBottom: "0.2rem" }}>Pacientes</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem" }}>{patients.length} pacientes registrados</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ ...CARD, padding: "1rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email…"
          style={{ ...INPUT_STYLE, maxWidth: "28rem" }}
        />
      </div>

      {/* Table */}
      <div style={{ ...CARD, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Paciente", "Teléfono", "Email", "Última visita", "Próxima cita", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: DIM, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem", color: MUTED }}>
                    No se encontraron pacientes
                  </td>
                </tr>
              ) : filtered.map((p, i) => {
                const color = avatarColor(p.name);
                return (
                  <tr
                    key={i}
                    style={{ borderBottom: `1px solid ${BORDER}`, transition: "background 0.12s", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    onClick={() => setSelected(p)}
                  >
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", background: `${color}22`, border: `1.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color, flexShrink: 0 }}>
                          {initials(p.name)}
                        </div>
                        <span style={{ color: "#1a1a1f", fontWeight: 500, whiteSpace: "nowrap" }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{p.phone}</td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{p.email || "—"}</td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{p.lastVisit || "—"}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      {p.nextAppointment ? (
                        <span style={{ background: "rgba(26,157,181,0.1)", color: "#1a9db5", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          {p.nextAppointment}
                        </span>
                      ) : (
                        <span style={{ color: DIM, fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelected(p); }}
                        style={{ background: "rgba(26,157,181,0.1)", border: "1px solid rgba(26,157,181,0.2)", borderRadius: "0.4rem", color: "#1a9db5", padding: "0.25rem 0.6rem", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "0.75rem 1rem", borderTop: `1px solid ${BORDER}` }}>
          <p style={{ color: DIM, fontSize: "0.78rem" }}>{filtered.length} de {patients.length} pacientes</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { patients, appointments } from "@/data/mockData";
import type { Plan } from "@/hooks/usePlan";

const CARD = { background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", borderRadius: "0.875rem" } as const;
const MUTED = "#5c5c6b";
const DIM = "#9a9aaa";
const BORDER = "rgba(0,0,0,0.07)";

const FOLLOW_UP_TYPES = ["post-tratamiento", "ausencia", "control", "cumpleaños", "reactivación"] as const;
type FollowUpType = (typeof FOLLOW_UP_TYPES)[number];

const TYPE_STYLE: Record<FollowUpType, { bg: string; color: string }> = {
  "post-tratamiento": { bg: "rgba(19,122,140,0.08)",  color: "#1a9db5" },
  "ausencia":         { bg: "rgba(255,60,90,0.12)",   color: "#FF3C5A" },
  "control":          { bg: "rgba(0,232,120,0.12)",   color: "#00E878" },
  "cumpleaños":       { bg: "rgba(255,187,0,0.12)",   color: "#FFBB00" },
  "reactivación":     { bg: "rgba(61,192,216,0.12)", color: "#3dc0d8" },
};

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  alta:  { bg: "rgba(255,60,90,0.12)",  color: "#FF3C5A" },
  media: { bg: "rgba(255,187,0,0.12)",  color: "#FFBB00" },
  baja:  { bg: "rgba(0,232,120,0.12)",  color: "#00E878" },
};

interface FollowUp {
  patientName: string;
  phone: string;
  type: FollowUpType;
  daysAgo: number;
  priority: "alta" | "media" | "baja";
  sent: boolean;
}

function generateFollowUps(): FollowUp[] {
  const result: FollowUp[] = [];
  const absentAppts = appointments.filter((a) => a.status === "absent").slice(0, 8);
  absentAppts.forEach((a) => {
    const p = patients.find((pt) => pt.name === a.patientName);
    result.push({ patientName: a.patientName, phone: p?.phone || "—", type: "ausencia", daysAgo: Math.floor(Math.random() * 14) + 1, priority: "alta", sent: Math.random() > 0.5 });
  });
  const attendedAppts = appointments.filter((a) => a.status === "attended").slice(0, 6);
  attendedAppts.forEach((a) => {
    const p = patients.find((pt) => pt.name === a.patientName);
    result.push({ patientName: a.patientName, phone: p?.phone || "—", type: "post-tratamiento", daysAgo: Math.floor(Math.random() * 7) + 1, priority: "media", sent: Math.random() > 0.4 });
  });
  patients.slice(0, 5).forEach((p) => {
    result.push({ patientName: p.name, phone: p.phone, type: "reactivación", daysAgo: Math.floor(Math.random() * 30) + 15, priority: "baja", sent: false });
  });
  return result;
}

const followUps = generateFollowUps();

interface FollowUpsPageProps { plan?: Plan | null }

export default function FollowUpsPage({ plan }: FollowUpsPageProps = {}) {
  const isPremium = plan === "premium";
  const [filterType, setFilterType] = useState<"all" | FollowUpType>("all");
  const [filterSent, setFilterSent] = useState<"all" | "sent" | "pending">("all");
  const [campaignSent, setCampaignSent] = useState(false);

  const filtered = followUps.filter((f) => {
    const matchType = filterType === "all" || f.type === filterType;
    const matchSent = filterSent === "all" || (filterSent === "sent" && f.sent) || (filterSent === "pending" && !f.sent);
    return matchType && matchSent;
  });

  const totalPending = followUps.filter((f) => !f.sent).length;
  const totalSent = followUps.filter((f) => f.sent).length;
  const highPriority = followUps.filter((f) => f.priority === "alta" && !f.sent).length;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }} className="space-y-5">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1f", marginBottom: "0.2rem" }}>Seguimientos</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>Gestión de mensajes de seguimiento y campañas WhatsApp</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: "1rem" }}>
        {[
          { label: "Pendientes", value: totalPending, color: "#FFBB00" },
          { label: "Enviados", value: totalSent, color: "#00E878" },
          { label: "Alta prioridad", value: highPriority, color: "#FF3C5A" },
          { label: "Total", value: followUps.length, color: "#1a9db5" },
        ].map((k) => (
          <div key={k.label} style={{ ...CARD, padding: "1.125rem" }}>
            <p style={{ color: MUTED, fontSize: "0.75rem", marginBottom: "0.35rem" }}>{k.label}</p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: k.color, textShadow: `0 0 12px ${k.color}55` }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Premium AI Campaign */}
      {isPremium && (
        <div style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(79,158,255,0.08))", border: "1px solid rgba(167,139,250,0.25)", borderRadius: "0.875rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <span style={{ background: "rgba(167,139,250,0.2)", color: "#3dc0d8", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Premium IA</span>
              </div>
              <h3 style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "1rem", marginBottom: "0.35rem" }}>Campaña de reactivación automática</h3>
              <p style={{ color: MUTED, fontSize: "0.875rem", maxWidth: "36rem" }}>
                Nuestro sistema IA identificó {highPriority} pacientes con alta prioridad que no han respondido. Puedes enviar una campaña personalizada de WhatsApp con un solo clic.
              </p>
            </div>
            <button
              onClick={() => { setCampaignSent(true); setTimeout(() => setCampaignSent(false), 4000); }}
              disabled={campaignSent}
              style={{
                background: campaignSent ? "rgba(0,232,120,0.15)" : "linear-gradient(135deg, #3dc0d8, #0f5e70)",
                border: campaignSent ? "1px solid rgba(0,232,120,0.3)" : "none",
                borderRadius: "0.625rem",
                color: campaignSent ? "#00E878" : "#fff",
                padding: "0.6rem 1.25rem",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: campaignSent ? "default" : "pointer",
                boxShadow: campaignSent ? "none" : "0 0 20px rgba(61,192,216,0.3)",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {campaignSent ? "✓ Campaña enviada" : `Lanzar campaña (${highPriority})`}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ ...CARD, padding: "1rem", display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {(["all", ...FOLLOW_UP_TYPES] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "1px solid rgba(0,0,0,0.08)",
                cursor: "pointer",
                background: filterType === t ? "rgba(79,158,255,0.18)" : "#f9fafb",
                color: filterType === t ? "#1a9db5" : MUTED,
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {t === "all" ? "Todos" : t}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.4rem" }}>
          {([["all","Todos"],["pending","Pendientes"],["sent","Enviados"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setFilterSent(v)}
              style={{
                padding: "0.3rem 0.75rem",
                borderRadius: "0.5rem",
                fontSize: "0.78rem",
                fontWeight: 600,
                border: "1px solid rgba(0,0,0,0.08)",
                cursor: "pointer",
                background: filterSent === v ? "rgba(0,232,120,0.15)" : "#f9fafb",
                color: filterSent === v ? "#00E878" : MUTED,
                transition: "all 0.15s",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Follow-up cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px,1fr))", gap: "1rem" }}>
        {filtered.map((f, i) => {
          const ts = TYPE_STYLE[f.type];
          const ps = PRIORITY_STYLE[f.priority];
          return (
            <div key={i} style={{ ...CARD, padding: "1.125rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div>
                  <p style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>{f.patientName}</p>
                  <p style={{ color: MUTED, fontSize: "0.8rem" }}>{f.phone}</p>
                </div>
                <span style={{ background: ps.bg, color: ps.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                  {f.priority}
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.875rem", flexWrap: "wrap" }}>
                <span style={{ background: ts.bg, color: ts.color, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600 }}>
                  {f.type}
                </span>
                <span style={{ color: DIM, fontSize: "0.75rem", alignSelf: "center" }}>hace {f.daysAgo} días</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {f.sent ? (
                  <span style={{ background: "rgba(0,232,120,0.1)", color: "#00E878", padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                    ✓ Enviado
                  </span>
                ) : (
                  <span style={{ background: "rgba(255,187,0,0.1)", color: "#FFBB00", padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600 }}>
                    Pendiente
                  </span>
                )}
                {!f.sent && (
                  <button
                    style={{
                      background: "rgba(0,232,120,0.12)",
                      border: "1px solid rgba(0,232,120,0.2)",
                      borderRadius: "0.4rem",
                      color: "#00E878",
                      padding: "0.3rem 0.75rem",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    onClick={() => alert(`Enviando mensaje WA a ${f.patientName}…`)}
                  >
                    Enviar WA
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "3rem", color: MUTED }}>
            No hay seguimientos en este filtro
          </div>
        )}
      </div>
    </div>
  );
}

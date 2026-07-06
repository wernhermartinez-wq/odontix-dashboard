import { useState } from "react";
import { professionals } from "@/data/mockData";

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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ ...CARD, overflow: "hidden" }}>
      <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER}` }}>
        <h3 style={{ color: "#1a1a1f", fontWeight: 600, fontSize: "0.9rem" }}>{title}</h3>
      </div>
      <div style={{ padding: "1.25rem" }}>{children}</div>
    </div>
  );
}

function Toggle({ label, description, defaultOn = false }: { label: string; description?: string; defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.65rem 0", borderBottom: `1px solid ${BORDER}` }}>
      <div>
        <p style={{ color: "#1a1a1f", fontWeight: 500, fontSize: "0.875rem" }}>{label}</p>
        {description && <p style={{ color: DIM, fontSize: "0.75rem", marginTop: "0.1rem" }}>{description}</p>}
      </div>
      <button
        onClick={() => setOn(!on)}
        style={{
          position: "relative",
          height: "22px",
          width: "40px",
          borderRadius: "999px",
          flexShrink: 0,
          border: "none",
          cursor: "pointer",
          background: on ? "linear-gradient(135deg, #137a8c, #0f5e70)" : "rgba(0,0,0,0.08)",
          boxShadow: on ? "0 0 8px rgba(19,122,140,0.5)" : "none",
          transition: "all 0.2s",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: "2px",
            left: "2px",
            width: "16px",
            height: "16px",
            background: "#fff",
            borderRadius: "50%",
            boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
            transform: on ? "translateX(18px)" : "translateX(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [toasts, setToasts] = useState<string[]>([]);
  function showToast(msg: string) {
    setToasts((p) => [...p, msg]);
    setTimeout(() => setToasts((p) => p.slice(1)), 2500);
  }

  return (
    <div style={{ padding: "1.5rem", maxWidth: "48rem", margin: "0 auto" }} className="space-y-5">
      {/* Toasts */}
      <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 50, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {toasts.map((t, i) => (
          <div key={i} style={{ background: "#ffffff", border: "1px solid rgba(56,161,105,0.25)", color: "#1a1a1f", fontSize: "0.875rem", padding: "0.65rem 1rem", borderRadius: "0.625rem", boxShadow: "0 0 20px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <svg width="16" height="16" fill="none" stroke="#38A169" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            {t}
          </div>
        ))}
      </div>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1f", marginBottom: "0.2rem" }}>Configuracion</h1>
        <p style={{ color: MUTED, fontSize: "0.875rem" }}>Ajustes del sistema y automatizaciones</p>
      </div>

      {/* Clinic info */}
      <Section title="Informacion de la clinica">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: "1rem" }}>
          {[
            { label: "Nombre de la clinica", value: "Centro Dental Odontix" },
            { label: "Telefono principal", value: "+549 11 4000-0000" },
            { label: "Email de contacto", value: "info@odontix.com" },
            { label: "Direccion", value: "Av. Corrientes 1234, CABA" },
          ].map((f) => (
            <div key={f.label}>
              <label style={{ color: DIM, fontSize: "0.72rem", fontWeight: 600, display: "block", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>{f.label}</label>
              <input defaultValue={f.value} style={INPUT_STYLE} />
            </div>
          ))}
        </div>
        <button
          onClick={() => showToast("Datos de clinica guardados")}
          style={{ marginTop: "1rem", background: "linear-gradient(135deg, #137a8c, #0f5e70)", border: "none", borderRadius: "0.625rem", color: "#1a1a1f", padding: "0.55rem 1.1rem", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 0 16px rgba(19,122,140,0.25)" }}
        >
          Guardar cambios
        </button>
      </Section>

      {/* WhatsApp */}
      <Section title="Integracion WhatsApp">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", background: "rgba(56,161,105,0.08)", border: "1px solid rgba(56,161,105,0.2)", borderRadius: "0.625rem", marginBottom: "1rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#38A169", boxShadow: "0 0 8px #38A169" }} />
          <div style={{ flex: 1 }}>
            <p style={{ color: "#38A169", fontWeight: 600, fontSize: "0.875rem" }}>Bot activo</p>
            <p style={{ color: MUTED, fontSize: "0.75rem" }}>+549 11 4000-0000 - Conectado hace 2h</p>
          </div>
          <button style={{ color: "#E53E3E", fontSize: "0.75rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Desconectar</button>
        </div>
        <div>
          <Toggle label="Confirmacion automatica de citas" description="Envia WA 24h antes de cada cita" defaultOn />
          <Toggle label="Recordatorio 2 horas antes" description="Mensaje de recordatorio el dia de la cita" defaultOn />
          <Toggle label="Notificacion de ausencia" description="Mensaje automatico al registrar una ausencia" defaultOn />
          <Toggle label="Invitacion de seguimiento" description="WA automatico para controles y limpiezas" defaultOn />
          <Toggle label="Encuesta de satisfaccion post-consulta" description="Enviada 1h despues de la cita" />
        </div>
        <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: `1px solid ${BORDER}` }}>
          <label style={{ color: DIM, fontSize: "0.72rem", fontWeight: 600, display: "block", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Mensaje de bienvenida</label>
          <textarea
            defaultValue="Hola {nombre}! Te recordamos que tu cita en Odontix es el {fecha} a las {hora} con {profesional}. Confirmas tu asistencia? Responde SI o NO."
            rows={3}
            style={{ ...INPUT_STYLE, resize: "none" }}
          />
        </div>
        <button
          onClick={() => showToast("Configuracion de WhatsApp guardada")}
          style={{ marginTop: "0.75rem", background: "linear-gradient(135deg, #00C76A, #00925A)", border: "none", borderRadius: "0.625rem", color: "#1a1a1f", padding: "0.55rem 1.1rem", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 0 16px rgba(56,161,105,0.25)" }}
        >
          Guardar
        </button>
      </Section>

      {/* Professionals */}
      <Section title="Profesionales">
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {professionals.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: "0.625rem", border: `1px solid ${BORDER}`, transition: "border-color 0.15s" }}>
              <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a1a1f", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, backgroundColor: p.color }}>
                {p.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#1a1a1f", fontWeight: 500, fontSize: "0.875rem" }}>{p.name}</p>
                <p style={{ color: DIM, fontSize: "0.75rem" }}>{p.specialty}</p>
              </div>
              <button style={{ color: "#1a9db5", fontSize: "0.75rem", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>Editar</button>
            </div>
          ))}
        </div>
        <button
          onClick={() => showToast("Abriendo formulario de nuevo profesional...")}
          style={{ marginTop: "1rem", width: "100%", border: "1px dashed rgba(255,255,255,0.15)", background: "transparent", color: MUTED, fontSize: "0.875rem", padding: "0.65rem", borderRadius: "0.625rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Agregar profesional
        </button>
      </Section>

      {/* Schedule */}
      <Section title="Horarios de atencion">
        <div>
          {["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado"].map((day, i) => (
            <Toggle key={day} label={day} defaultOn={i < 5} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
          <div>
            <label style={{ color: DIM, fontSize: "0.72rem", fontWeight: 600, display: "block", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Apertura</label>
            <input type="time" defaultValue="08:00" style={{ ...INPUT_STYLE, colorScheme: "dark" }} />
          </div>
          <div>
            <label style={{ color: DIM, fontSize: "0.72rem", fontWeight: 600, display: "block", marginBottom: "0.3rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>Cierre</label>
            <input type="time" defaultValue="18:00" style={{ ...INPUT_STYLE, colorScheme: "dark" }} />
          </div>
        </div>
        <button
          onClick={() => showToast("Horarios guardados")}
          style={{ marginTop: "1rem", background: "linear-gradient(135deg, #137a8c, #0f5e70)", border: "none", borderRadius: "0.625rem", color: "#1a1a1f", padding: "0.55rem 1.1rem", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 0 16px rgba(19,122,140,0.25)" }}
        >
          Guardar horarios
        </button>
      </Section>

      {/* Danger zone */}
      <div style={{ background: "rgba(229,62,62,0.06)", border: "1px solid rgba(229,62,62,0.2)", borderRadius: "0.875rem", padding: "1.25rem" }}>
        <h3 style={{ color: "#E53E3E", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.75rem" }}>Zona de peligro</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <button style={{ color: "#FF8FA0", fontSize: "0.875rem", fontWeight: 500, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>Exportar todos los datos (CSV)</button>
          <button style={{ color: "#FF8FA0", fontSize: "0.875rem", fontWeight: 500, background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>Eliminar historial de ausencias</button>
        </div>
      </div>
    </div>
  );
}

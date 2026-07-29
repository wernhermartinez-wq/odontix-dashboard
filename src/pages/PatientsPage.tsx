import { useEffect, useState } from "react";
import { fetchAllPacientes, importPacientes, type ExistingPaciente } from "@/lib/pacientes";

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

interface PatientsPageProps { clienteId: string | null }

const CAMPOS_FORM: { key: "nombre" | "telefono" | "email" | "dni"; label: string; required: boolean }[] = [
  { key: "nombre", label: "Nombre *", required: true },
  { key: "telefono", label: "Teléfono *", required: true },
  { key: "email", label: "Email", required: false },
  { key: "dni", label: "DNI", required: false },
];

export default function PatientsPage({ clienteId }: PatientsPageProps) {
  const [search, setSearch] = useState("");
  const [pacientes, setPacientes] = useState<ExistingPaciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ExistingPaciente | null>(null);
  const [showNuevo, setShowNuevo] = useState(false);
  const [nuevoForm, setNuevoForm] = useState({ nombre: "", telefono: "", email: "", dni: "" });
  const [guardando, setGuardando] = useState(false);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);
  const [infoNuevo, setInfoNuevo] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId) {
      cargarPacientes();
    } else {
      setLoading(false);
      setErrorCarga("No hay una clínica asociada a tu cuenta.");
    }
  }, [clienteId]);

  async function cargarPacientes() {
    setLoading(true);
    try {
      const data = await fetchAllPacientes(clienteId as string);
      setErrorCarga(null);
      setPacientes([...data].sort((a, b) => (a.nombre ?? "").localeCompare(b.nombre ?? "")));
    } catch {
      setErrorCarga("No se pudieron cargar los pacientes.");
      setPacientes([]);
    }
    setLoading(false);
  }

  async function guardarNuevoPaciente() {
    if (!clienteId) return;
    setGuardando(true);
    setErrorNuevo(null);
    setInfoNuevo(null);
    try {
      const resultado = await importPacientes(clienteId, [nuevoForm]);
      if (resultado.omitidos.length > 0) {
        setErrorNuevo("No se pudo guardar: falta nombre o teléfono.");
        return;
      }
      await cargarPacientes();
      setNuevoForm({ nombre: "", telefono: "", email: "", dni: "" });
      setShowNuevo(false);
      if (resultado.actualizados > 0) {
        setInfoNuevo("Ya existía un paciente con ese nombre y teléfono: se actualizaron sus datos.");
      } else {
        setInfoNuevo("Paciente creado.");
      }
    } catch (e) {
      setErrorNuevo(e instanceof Error ? e.message : "No se pudo guardar el paciente.");
    } finally {
      setGuardando(false);
    }
  }

  const filtered = pacientes.filter((p) =>
    (p.nombre ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.telefono ?? "").includes(search) ||
    (p.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) => (name ?? "").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarColors = ["#1a9db5", "#38A169", "#3dc0d8", "#FFBB00", "#E53E3E"];
  const avatarColor = (name: string) => avatarColors[(name ?? "").charCodeAt(0) % avatarColors.length || 0];

  return (
    <div style={{ padding: "1.5rem", maxWidth: "80rem", margin: "0 auto" }} className="space-y-5">
      {selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
        >
          <div style={{ background: "#ffffff", border: "1px solid rgba(26,157,181,0.25)", borderRadius: "1rem", maxWidth: "32rem", width: "100%", padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "1.1rem" }}>Ficha del Paciente</h2>
              <button onClick={() => setSelected(null)} style={{ background: "#f4f6f8", border: `1px solid ${BORDER}`, borderRadius: "0.5rem", color: MUTED, width: "2rem", height: "2rem" }}>×</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", border: `2px solid ${avatarColor(selected.nombre)}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: avatarColor(selected.nombre) }}>
                {initials(selected.nombre)}
              </div>
              <div>
                <p style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "1.1rem" }}>{selected.nombre}</p>
                <p style={{ color: MUTED, fontSize: "0.875rem" }}>{selected.telefono}</p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              {[
                { label: "Email", value: selected.email || "—" },
                { label: "DNI", value: selected.dni || "—" },
                { label: "Cobertura", value: selected.cobertura || "—" },
                { label: "Fecha de nacimiento", value: selected.fecha_nacimiento || "—" },
              ].map((f) => (
                <div key={f.label} style={{ background: "#ffffff", borderRadius: "0.5rem", padding: "0.75rem" }}>
                  <p style={{ color: DIM, fontSize: "0.7rem", marginBottom: "0.2rem", textTransform: "uppercase" }}>{f.label}</p>
                  <p style={{ color: "#1a1a1f", fontSize: "0.875rem", fontWeight: 500 }}>{f.value}</p>
                </div>
              ))}
            </div>
            {selected.notas_medicas && (
              <div style={{ background: "rgba(26,157,181,0.06)", borderRadius: "0.5rem", padding: "0.875rem", marginBottom: "1.25rem" }}>
                <p style={{ color: "#1a9db5", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.35rem" }}>Notas</p>
                <p style={{ color: MUTED, fontSize: "0.875rem" }}>{selected.notas_medicas}</p>
              </div>
            )}
            <button onClick={() => setSelected(null)} style={{ width: "100%", background: "#f4f6f8", borderRadius: "0.625rem", color: MUTED, padding: "0.6rem" }}>Cerrar</button>
          </div>
        </div>
      )}

      {showNuevo && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "#ffffff", borderRadius: "1rem", maxWidth: "28rem", width: "100%", padding: "1.5rem" }}>
            <h2 style={{ color: "#1a1a1f", fontWeight: 700, fontSize: "1.1rem", marginBottom: "1rem" }}>Nuevo paciente</h2>
            {errorNuevo && (
              <div style={{ background: "rgba(229,62,62,0.08)", color: "#E53E3E", borderRadius: "0.5rem", padding: "0.625rem 0.75rem", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
                {errorNuevo}
              </div>
            )}
            <div className="space-y-3">
              {CAMPOS_FORM.map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: MUTED, marginBottom: "0.25rem" }}>{f.label}</label>
                  <input
                    value={nuevoForm[f.key]}
                    onChange={(e) => setNuevoForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                    style={INPUT_STYLE}
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowNuevo(false); setErrorNuevo(null); }} style={{ flex: 1, padding: "0.6rem", borderRadius: "0.625rem", border: `1px solid ${BORDER}`, color: MUTED }}>Cancelar</button>
              <button
                disabled={!nuevoForm.nombre.trim() || !nuevoForm.telefono.trim() || guardando}
                onClick={guardarNuevoPaciente}
                style={{ flex: 1, padding: "0.6rem", borderRadius: "0.625rem", background: "#1a9db5", color: "#fff" }}
                className="disabled:opacity-40"
              >
                {guardando ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1a1a1f", marginBottom: "0.2rem" }}>Pacientes</h1>
          <p style={{ color: MUTED, fontSize: "0.875rem" }}>{pacientes.length} pacientes registrados</p>
        </div>
        <button
          disabled={!clienteId}
          onClick={() => { setInfoNuevo(null); setShowNuevo(true); }}
          style={{ background: "#1a9db5", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}
          className="disabled:opacity-40"
        >
          + Nuevo paciente
        </button>
      </div>

      {infoNuevo && (
        <div style={{ background: "rgba(56,161,105,0.08)", color: "#38A169", borderRadius: "0.5rem", padding: "0.625rem 0.875rem", fontSize: "0.8rem" }}>
          {infoNuevo}
        </div>
      )}

      <div style={{ ...CARD, padding: "1rem" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email…"
          style={{ ...INPUT_STYLE, maxWidth: "28rem" }}
        />
      </div>

      <div style={{ ...CARD, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                {["Paciente", "Teléfono", "Email", "DNI", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1rem", color: DIM, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: MUTED }}>Cargando…</td></tr>
              ) : errorCarga ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: "#E53E3E" }}>{errorCarga}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "3rem", color: MUTED }}>No se encontraron pacientes</td></tr>
              ) : filtered.map((p) => {
                const color = avatarColor(p.nombre);
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${BORDER}`, cursor: "pointer" }} onClick={() => setSelected(p)}>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "2rem", height: "2rem", borderRadius: "50%", border: `1.5px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color }}>
                          {initials(p.nombre)}
                        </div>
                        <span style={{ color: "#1a1a1f", fontWeight: 500, whiteSpace: "nowrap" }}>{p.nombre}</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED, whiteSpace: "nowrap" }}>{p.telefono}</td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{p.email || "—"}</td>
                    <td style={{ padding: "0.875rem 1rem", color: MUTED }}>{p.dni || "—"}</td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <button onClick={(e) => { e.stopPropagation(); setSelected(p); }} style={{ background: "rgba(26,157,181,0.1)", borderRadius: "0.4rem", color: "#1a9db5", padding: "0.25rem 0.6rem", fontSize: "0.75rem", fontWeight: 600 }}>
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
          <p style={{ color: DIM, fontSize: "0.78rem" }}>{filtered.length} de {pacientes.length} pacientes</p>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { parseSpreadsheetFile } from "@/lib/fileParsing";
import { importPacientes, type PacienteRow } from "@/lib/pacientes";

interface CargaPacientesModalProps {
  clienteId: string;
  clinicaNombre: string;
  onClose: () => void;
}

const CAMPOS_ODONTIX: { key: keyof PacienteRow; label: string; obligatorio: boolean }[] = [
  { key: "nombre", label: "Nombre", obligatorio: true },
  { key: "telefono", label: "Teléfono", obligatorio: true },
  { key: "email", label: "Email", obligatorio: false },
  { key: "fecha_nacimiento", label: "Fecha de nacimiento", obligatorio: false },
  { key: "dni", label: "DNI", obligatorio: false },
  { key: "genero", label: "Género", obligatorio: false },
  { key: "cobertura", label: "Cobertura", obligatorio: false },
  { key: "direccion", label: "Dirección", obligatorio: false },
  { key: "notas_medicas", label: "Notas", obligatorio: false },
];

type Paso = "subir" | "mapear" | "previsualizar" | "resultado";

export default function CargaPacientesModal({ clienteId, clinicaNombre, onClose }: CargaPacientesModalProps) {
  const [paso, setPaso] = useState<Paso>("subir");
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [mapeo, setMapeo] = useState<Record<string, string>>({}); // columna del archivo -> campo Odontix
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState<{ nuevos: number; actualizados: number; omitidos: { fila: number; motivo: string }[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleFile(file: File) {
    setErrorMsg(null);
    try {
      const parsed = await parseSpreadsheetFile(file);
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setPaso("mapear");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "No se pudo leer el archivo.");
    }
  }

  function filasMapeadas(): Partial<PacienteRow>[] {
    return rows.map((row) => {
      const mapped: Partial<PacienteRow> = {};
      for (const [columnaArchivo, campoOdontix] of Object.entries(mapeo)) {
        if (campoOdontix) {
          (mapped as Record<string, string>)[campoOdontix] = row[columnaArchivo] ?? "";
        }
      }
      return mapped;
    });
  }

  const mapeoValido = Object.values(mapeo).includes("nombre") && Object.values(mapeo).includes("telefono");

  async function confirmarImportacion() {
    setProcesando(true);
    setErrorMsg(null);
    try {
      const resumen = await importPacientes(clienteId, filasMapeadas());
      setResultado(resumen);
      setPaso("resultado");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Error al importar.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div style={{ background: "#FFFFFF", borderRadius: "1rem", padding: "1.5rem", width: "100%", maxWidth: "40rem", maxHeight: "85vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "#1A202C" }}>Cargar pacientes — {clinicaNombre}</h2>
          <button onClick={onClose} style={{ color: "#718096" }}>✕</button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: "rgba(229,62,62,0.08)", color: "#E53E3E" }}>
            {errorMsg}
          </div>
        )}

        {paso === "subir" && (
          <div>
            <p className="text-sm mb-3" style={{ color: "#4A5568" }}>Subí un archivo Excel (.xlsx) o CSV con los pacientes de esta clínica.</p>
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        )}

        {paso === "mapear" && (
          <div>
            <p className="text-sm mb-3" style={{ color: "#4A5568" }}>Asigná cada columna del archivo a un campo de Odontix. Nombre y Teléfono son obligatorios.</p>
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h} className="flex items-center gap-3">
                  <span className="text-sm font-medium w-40 truncate" style={{ color: "#1A202C" }}>{h}</span>
                  <select
                    value={mapeo[h] ?? ""}
                    onChange={(e) => setMapeo((prev) => ({ ...prev, [h]: e.target.value }))}
                    className="flex-1 text-sm rounded-md border px-2 py-1.5"
                  >
                    <option value="">— Sin mapear —</option>
                    {CAMPOS_ODONTIX.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}{c.obligatorio ? " *" : ""}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setPaso("subir")} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#4A5568" }}>Atrás</button>
              <button
                disabled={!mapeoValido}
                onClick={() => setPaso("previsualizar")}
                className="text-sm px-4 py-2 rounded-lg text-white disabled:opacity-40"
                style={{ background: "#1A9DB5" }}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {paso === "previsualizar" && (
          <div>
            <p className="text-sm mb-3" style={{ color: "#4A5568" }}>Vista previa de las primeras filas ya mapeadas:</p>
            <div className="overflow-x-auto border rounded-lg mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: "#F7FAFC" }}>
                    {CAMPOS_ODONTIX.filter((c) => Object.values(mapeo).includes(c.key)).map((c) => (
                      <th key={c.key} className="text-left px-2 py-1.5">{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filasMapeadas().slice(0, 10).map((row, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #EDF2F7" }}>
                      {CAMPOS_ODONTIX.filter((c) => Object.values(mapeo).includes(c.key)).map((c) => (
                        <td key={c.key} className="px-2 py-1.5">{(row as Record<string, string>)[c.key] || "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs mb-4" style={{ color: "#718096" }}>{rows.length} filas en total en el archivo.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setPaso("mapear")} className="text-sm px-4 py-2 rounded-lg" style={{ color: "#4A5568" }}>Atrás</button>
              <button
                disabled={procesando}
                onClick={confirmarImportacion}
                className="text-sm px-4 py-2 rounded-lg text-white disabled:opacity-40"
                style={{ background: "#1A9DB5" }}
              >
                {procesando ? "Importando…" : "Confirmar e importar"}
              </button>
            </div>
          </div>
        )}

        {paso === "resultado" && resultado && (
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(56,161,105,0.08)" }}>
                <p className="text-2xl font-bold" style={{ color: "#38A169" }}>{resultado.nuevos}</p>
                <p className="text-xs" style={{ color: "#4A5568" }}>Nuevos</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(26,157,181,0.08)" }}>
                <p className="text-2xl font-bold" style={{ color: "#1A9DB5" }}>{resultado.actualizados}</p>
                <p className="text-xs" style={{ color: "#4A5568" }}>Actualizados</p>
              </div>
              <div className="p-3 rounded-lg text-center" style={{ background: "rgba(214,158,46,0.08)" }}>
                <p className="text-2xl font-bold" style={{ color: "#D69E2E" }}>{resultado.omitidos.length}</p>
                <p className="text-xs" style={{ color: "#4A5568" }}>Omitidos</p>
              </div>
            </div>
            {resultado.omitidos.length > 0 && (
              <div className="text-xs mb-4" style={{ color: "#718096" }}>
                {/* o.fila is a 0-based index into rows AFTER the header row was stripped by
                    parseSpreadsheetFile, so the true spreadsheet line is fila + 2: +1 to make it
                    1-based, +1 more to account for the header row occupying line 1. */}
                Filas omitidas: {resultado.omitidos.map((o) => `#${o.fila + 2} (${o.motivo})`).join(", ")}
              </div>
            )}
            <button onClick={onClose} className="w-full text-sm px-4 py-2 rounded-lg text-white" style={{ background: "#1A9DB5" }}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

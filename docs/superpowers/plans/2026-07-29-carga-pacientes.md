# Carga de Pacientes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que una clínica reciba pacientes de tres formas consistentes — carga masiva por Excel/CSV (admin), alta manual uno por uno (la clínica), y el flujo automático de WhatsApp ya existente — todas usando la misma regla de identidad y sin duplicar pacientes.

**Architecture:** Todo en el frontend, sin backend nuevo. Una función pura de reconciliación (`reconcilePacientes`) decide qué insertar/actualizar/omitir; una capa fina sobre el cliente Supabase existente (`@/lib/supabase`) ejecuta esas decisiones. La UI vive en dos lugares: un asistente de 4 pasos en `AdminClinicasPage` (carga masiva) y un modal simple en `PatientsPage` (alta manual), reusando la misma lógica de reconciliación.

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind + `@supabase/supabase-js`. Se agregan dos dependencias nuevas: `xlsx` (parseo de Excel/CSV en el navegador) y `vitest` (para probar la lógica de reconciliación — el proyecto no tiene test runner hoy; se agrega mínimo y solo para esta lógica pura, no se fuerza testing sobre el resto de la UI existente).

## Global Constraints

- Clave de duplicado: `telefono` + `nombre` combinados (no solo teléfono — un mismo número puede corresponder a más de un paciente, ej. una madre sacando turno para un hijo).
- Campos obligatorios: `nombre` y `telefono` únicamente. Resto opcional: `email`, `fecha_nacimiento`, `dni`, `genero`, `cobertura`, `direccion`, `notas_medicas`.
- Al encontrar coincidencia: actualizar rellenando solo los campos que el paciente existente tenga vacíos — nunca sobrescribir un dato ya presente.
- Filas sin `nombre` o sin `telefono`: se omiten, no bloquean el resto de la carga. Se reporta el número de fila y el motivo.
- Todo el aislamiento es por `cliente_id` — nunca reconciliar pacientes de una clínica contra los de otra.
- Sin backend nuevo: toda la lógica corre en el navegador contra Supabase directo, igual que el resto del dashboard.
- Fuera de alcance: lógica de "¿el turno es para vos o para otra persona?" en WhatsApp (vive en n8n, aparte); arreglar que `pacientes.cliente_id` esté en NULL en los datos actuales de n8n (problema de workflow, no de esta función); exportar pacientes, borrado masivo, o el campo `tags` (array) en la carga — no se mapea en este alcance.

Spec completo: `docs/superpowers/specs/2026-07-29-carga-pacientes-design.md`

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `src/lib/pacientes.ts` (nuevo) | Tipos + `reconcilePacientes` (pura, testeada) + `importPacientes` (ejecuta contra Supabase) |
| `src/lib/fileParsing.ts` (nuevo) | `parseSpreadsheetFile` — lee un `File` (.xlsx/.csv) y devuelve headers + filas crudas |
| `src/lib/pacientes.test.ts` (nuevo) | Tests de `reconcilePacientes` |
| `src/lib/fileParsing.test.ts` (nuevo) | Tests de `parseSpreadsheetFile` |
| `src/components/admin/CargaPacientesModal.tsx` (nuevo) | Asistente de 4 pasos, usa `parseSpreadsheetFile` + `importPacientes` |
| `src/pages/admin/AdminClinicasPage.tsx` (modificar) | Agrega botón "Cargar pacientes" por fila, abre el modal |
| `src/pages/PatientsPage.tsx` (modificar) | Pasa de mockData a pacientes reales por `cliente_id`; agrega modal "Nuevo paciente" (reusa `importPacientes`) |
| `src/App.tsx` (modificar) | Pasa `clienteId={activeClienteId}` a `<PatientsPage>` |
| `vitest.config.ts` (nuevo) | Config mínima de vitest |
| `package.json` (modificar) | Agrega `xlsx`, `vitest`, script `test` |

---

### Task 1: Setup — vitest y xlsx

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/smoke.test.ts` (temporal, se borra en el Step 5)

**Interfaces:**
- Produces: comando `npm test` funcional para el resto de las tareas.

- [ ] **Step 1: Instalar dependencias**

```bash
npm install xlsx
npm install -D vitest
```

- [ ] **Step 2: Crear config de vitest**

Crear `vitest.config.ts`:

```typescript
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 3: Agregar script de test**

En `package.json`, dentro de `"scripts"`, agregar:

```json
"test": "vitest run"
```

- [ ] **Step 4: Test de humo — verificar que vitest corre**

Crear `src/lib/smoke.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("vitest esta configurado", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Correr: `npm test`
Esperado: 1 test pasando (`smoke.test.ts`).

- [ ] **Step 5: Borrar el test de humo y commitear**

```bash
rm src/lib/smoke.test.ts
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: agregar vitest y xlsx"
```

---

### Task 2: Lógica pura de reconciliación (`reconcilePacientes`)

**Files:**
- Create: `src/lib/pacientes.ts`
- Test: `src/lib/pacientes.test.ts`

**Interfaces:**
- Produces:
  - `interface PacienteRow { nombre: string; telefono: string; email?: string; fecha_nacimiento?: string; dni?: string; genero?: string; cobertura?: string; direccion?: string; notas_medicas?: string; }`
  - `interface ExistingPaciente extends PacienteRow { id: string; }`
  - `interface ReconcileResult { toInsert: PacienteRow[]; toUpdate: { id: string; changes: Partial<PacienteRow> }[]; skipped: { fila: number; motivo: string }[]; }`
  - `function reconcilePacientes(existing: ExistingPaciente[], incoming: Partial<PacienteRow>[]): ReconcileResult`

- [ ] **Step 1: Escribir los tests (deben fallar — el módulo no existe todavía)**

Crear `src/lib/pacientes.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { reconcilePacientes, type ExistingPaciente } from "./pacientes";

describe("reconcilePacientes", () => {
  it("un paciente sin coincidencia va a toInsert", () => {
    const result = reconcilePacientes([], [{ nombre: "Ana Pérez", telefono: "1122334455" }]);
    expect(result.toInsert).toEqual([{ nombre: "Ana Pérez", telefono: "1122334455" }]);
    expect(result.toUpdate).toEqual([]);
    expect(result.skipped).toEqual([]);
  });

  it("coincidencia exacta (telefono+nombre) rellena solo los campos vacios", () => {
    const existing: ExistingPaciente[] = [
      { id: "p1", nombre: "Ana Pérez", telefono: "1122334455", email: undefined, dni: "30111222" },
    ];
    const result = reconcilePacientes(existing, [
      { nombre: "Ana Pérez", telefono: "1122334455", email: "ana@mail.com", dni: "99999999" },
    ]);
    expect(result.toInsert).toEqual([]);
    expect(result.toUpdate).toEqual([
      { id: "p1", changes: { email: "ana@mail.com" } },
    ]);
  });

  it("coincidencia exacta sin campos nuevos para completar no genera toUpdate", () => {
    const existing: ExistingPaciente[] = [
      { id: "p1", nombre: "Ana Pérez", telefono: "1122334455", email: "ana@mail.com" },
    ];
    const result = reconcilePacientes(existing, [
      { nombre: "Ana Pérez", telefono: "1122334455", email: "otro@mail.com" },
    ]);
    expect(result.toUpdate).toEqual([]);
  });

  it("mismo telefono con nombre distinto no se fusiona (madre e hijo)", () => {
    const existing: ExistingPaciente[] = [
      { id: "p1", nombre: "Marta Gomez", telefono: "1122334455" },
    ];
    const result = reconcilePacientes(existing, [
      { nombre: "Tomas Gomez", telefono: "1122334455" },
    ]);
    expect(result.toInsert).toEqual([{ nombre: "Tomas Gomez", telefono: "1122334455" }]);
    expect(result.toUpdate).toEqual([]);
  });

  it("fila sin nombre se omite con motivo", () => {
    const result = reconcilePacientes([], [{ nombre: "", telefono: "1122334455" }]);
    expect(result.toInsert).toEqual([]);
    expect(result.skipped).toEqual([{ fila: 0, motivo: "falta nombre" }]);
  });

  it("fila sin telefono se omite con motivo", () => {
    const result = reconcilePacientes([], [{ nombre: "Ana Pérez", telefono: "" }]);
    expect(result.skipped).toEqual([{ fila: 0, motivo: "falta teléfono" }]);
  });

  it("el numero de fila reportado en skipped corresponde al indice real en el array de entrada", () => {
    const result = reconcilePacientes([], [
      { nombre: "Ana Pérez", telefono: "1122334455" },
      { nombre: "", telefono: "1122334456" },
    ]);
    expect(result.skipped).toEqual([{ fila: 1, motivo: "falta nombre" }]);
  });
});
```

- [ ] **Step 2: Correr los tests, confirmar que fallan**

Correr: `npm test`
Esperado: FAIL — `Cannot find module './pacientes'`

- [ ] **Step 3: Implementar `reconcilePacientes`**

Crear `src/lib/pacientes.ts`:

```typescript
export interface PacienteRow {
  nombre: string;
  telefono: string;
  email?: string;
  fecha_nacimiento?: string;
  dni?: string;
  genero?: string;
  cobertura?: string;
  direccion?: string;
  notas_medicas?: string;
}

export interface ExistingPaciente extends PacienteRow {
  id: string;
}

export interface ReconcileResult {
  toInsert: PacienteRow[];
  toUpdate: { id: string; changes: Partial<PacienteRow> }[];
  skipped: { fila: number; motivo: string }[];
}

const OPTIONAL_FIELDS = [
  "email",
  "fecha_nacimiento",
  "dni",
  "genero",
  "cobertura",
  "direccion",
  "notas_medicas",
] as const;

function pickOptionalFields(row: Partial<PacienteRow>): Partial<PacienteRow> {
  const picked: Partial<PacienteRow> = {};
  for (const field of OPTIONAL_FIELDS) {
    const value = row[field]?.trim();
    if (value) picked[field] = value;
  }
  return picked;
}

export function reconcilePacientes(
  existing: ExistingPaciente[],
  incoming: Partial<PacienteRow>[]
): ReconcileResult {
  const result: ReconcileResult = { toInsert: [], toUpdate: [], skipped: [] };

  incoming.forEach((row, fila) => {
    const nombre = row.nombre?.trim();
    const telefono = row.telefono?.trim();

    if (!nombre) {
      result.skipped.push({ fila, motivo: "falta nombre" });
      return;
    }
    if (!telefono) {
      result.skipped.push({ fila, motivo: "falta teléfono" });
      return;
    }

    const match = existing.find(
      (e) => e.telefono.trim() === telefono && e.nombre.trim().toLowerCase() === nombre.toLowerCase()
    );

    if (!match) {
      result.toInsert.push({ nombre, telefono, ...pickOptionalFields(row) });
      return;
    }

    const changes: Partial<PacienteRow> = {};
    for (const field of OPTIONAL_FIELDS) {
      const incomingValue = row[field]?.trim();
      if (incomingValue && !match[field]) {
        changes[field] = incomingValue;
      }
    }
    if (Object.keys(changes).length > 0) {
      result.toUpdate.push({ id: match.id, changes });
    }
  });

  return result;
}
```

- [ ] **Step 4: Correr los tests, confirmar que pasan**

Correr: `npm test`
Esperado: 7 tests pasando en `pacientes.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/pacientes.ts src/lib/pacientes.test.ts
git commit -m "feat: logica pura de reconciliacion de pacientes (telefono+nombre)"
```

---

### Task 3: Parseo de archivos (`parseSpreadsheetFile`)

**Files:**
- Create: `src/lib/fileParsing.ts`
- Test: `src/lib/fileParsing.test.ts`

**Interfaces:**
- Consumes: librería `xlsx` (instalada en Task 1)
- Produces: `function parseSpreadsheetFile(file: File): Promise<{ headers: string[]; rows: Record<string, string>[] }>`

- [ ] **Step 1: Escribir el test (debe fallar)**

Crear `src/lib/fileParsing.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { parseSpreadsheetFile } from "./fileParsing";

function csvFile(content: string): File {
  return new File([content], "prueba.csv", { type: "text/csv" });
}

describe("parseSpreadsheetFile", () => {
  it("parsea un CSV simple con headers y filas", async () => {
    const file = csvFile("Nombre,Telefono,Email\nAna Pérez,1122334455,ana@mail.com\nLuis Gil,1155667788,");
    const { headers, rows } = await parseSpreadsheetFile(file);

    expect(headers).toEqual(["Nombre", "Telefono", "Email"]);
    expect(rows).toEqual([
      { Nombre: "Ana Pérez", Telefono: "1122334455", Email: "ana@mail.com" },
      { Nombre: "Luis Gil", Telefono: "1155667788", Email: "" },
    ]);
  });

  it("devuelve headers vacios y sin filas para un archivo vacio", async () => {
    const file = csvFile("");
    const { headers, rows } = await parseSpreadsheetFile(file);
    expect(headers).toEqual([]);
    expect(rows).toEqual([]);
  });
});
```

- [ ] **Step 2: Correr los tests, confirmar que fallan**

Correr: `npm test`
Esperado: FAIL — `Cannot find module './fileParsing'`

- [ ] **Step 3: Implementar `parseSpreadsheetFile`**

Crear `src/lib/fileParsing.ts`:

```typescript
import * as XLSX from "xlsx";

export async function parseSpreadsheetFile(
  file: File
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];

  const raw: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, raw: false });

  if (raw.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = raw[0];
  const rows = raw.slice(1).map((line) => {
    const row: Record<string, string> = {};
    headers.forEach((header, i) => {
      row[header] = (line[i] ?? "").toString();
    });
    return row;
  });

  return { headers, rows };
}
```

- [ ] **Step 4: Correr los tests, confirmar que pasan**

Correr: `npm test`
Esperado: 2 tests pasando en `fileParsing.test.ts` (y los 7 de `pacientes.test.ts` siguen pasando).

- [ ] **Step 5: Commit**

```bash
git add src/lib/fileParsing.ts src/lib/fileParsing.test.ts
git commit -m "feat: parseo de archivos xlsx/csv para carga de pacientes"
```

---

### Task 4: Función de importación contra Supabase (`importPacientes`)

**Files:**
- Modify: `src/lib/pacientes.ts` (agrega `importPacientes` al final del archivo)

**Interfaces:**
- Consumes: `reconcilePacientes` (Task 2), `supabase` desde `@/lib/supabase`
- Produces: `async function importPacientes(clienteId: string, incoming: Partial<PacienteRow>[]): Promise<{ nuevos: number; actualizados: number; omitidos: { fila: number; motivo: string }[] }>`

No hay test automatizado para esta función (toca la red real de Supabase) — se verifica manualmente en el Step 3 con una consulta REST directa, siguiendo el mismo método usado durante toda la sesión para verificar datos reales.

- [ ] **Step 1: Implementar `importPacientes`**

Agregar al final de `src/lib/pacientes.ts`:

```typescript
import { supabase } from "@/lib/supabase";

export async function importPacientes(
  clienteId: string,
  incoming: Partial<PacienteRow>[]
): Promise<{ nuevos: number; actualizados: number; omitidos: { fila: number; motivo: string }[] }> {
  const { data: existingData, error: fetchError } = await supabase
    .from("pacientes")
    .select("id, nombre, telefono, email, fecha_nacimiento, dni, genero, cobertura, direccion, notas_medicas")
    .eq("cliente_id", clienteId);

  if (fetchError) {
    throw new Error(`No se pudo leer pacientes existentes: ${fetchError.message}`);
  }

  const existing = (existingData ?? []) as ExistingPaciente[];
  const { toInsert, toUpdate, skipped } = reconcilePacientes(existing, incoming);

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase
      .from("pacientes")
      .insert(toInsert.map((p) => ({ ...p, cliente_id: clienteId })));
    if (insertError) {
      throw new Error(`Error insertando pacientes nuevos: ${insertError.message}`);
    }
  }

  for (const { id, changes } of toUpdate) {
    const { error: updateError } = await supabase.from("pacientes").update(changes).eq("id", id);
    if (updateError) {
      throw new Error(`Error actualizando paciente ${id}: ${updateError.message}`);
    }
  }

  return { nuevos: toInsert.length, actualizados: toUpdate.length, omitidos: skipped };
}
```

- [ ] **Step 2: Verificar tipos y build**

Correr: `npx tsc --noEmit -p tsconfig.app.json`
Esperado: sin errores.

- [ ] **Step 3: Verificación manual contra Supabase real**

Desde la consola del navegador en `localhost:5173` (con la app corriendo), o con un script Node puntual, invocar:

```javascript
import { importPacientes } from '@/lib/pacientes';
await importPacientes('b361d914-4083-45b5-bd80-adc9e27e4f26', [
  { nombre: 'Prueba Plan', telefono: '5550001111' },
]);
```

Confirmar con una consulta REST (mismo método usado en toda la sesión) que el paciente `Prueba Plan` aparece en `pacientes` con `cliente_id` correcto. Luego borrar esa fila de prueba manualmente (`DELETE ... WHERE nombre = 'Prueba Plan'`) para no dejar basura en la base real.

- [ ] **Step 4: Commit**

```bash
git add src/lib/pacientes.ts
git commit -m "feat: importPacientes ejecuta la reconciliacion contra Supabase"
```

---

### Task 5: Asistente de carga masiva en AdminClinicasPage

**Files:**
- Create: `src/components/admin/CargaPacientesModal.tsx`
- Modify: `src/pages/admin/AdminClinicasPage.tsx`

**Interfaces:**
- Consumes: `parseSpreadsheetFile` (Task 3), `importPacientes` (Task 4)
- Produces: componente `CargaPacientesModal` con props `{ clienteId: string; clinicaNombre: string; onClose: () => void }`

- [ ] **Step 1: Crear el componente del asistente**

Crear `src/components/admin/CargaPacientesModal.tsx`:

```tsx
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
                Filas omitidas: {resultado.omitidos.map((o) => `#${o.fila + 1} (${o.motivo})`).join(", ")}
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
```

- [ ] **Step 2: Verificar tipos**

Correr: `npx tsc --noEmit -p tsconfig.app.json`
Esperado: sin errores.

- [ ] **Step 3: Wire — agregar el botón en AdminClinicasPage**

En `src/pages/admin/AdminClinicasPage.tsx`, agregar el import y el estado junto a los demás `useState` existentes:

```typescript
import CargaPacientesModal from '@/components/admin/CargaPacientesModal';
```

```typescript
const [cargaPacientesFor, setCargaPacientesFor] = useState<{ id: string; nombre: string } | null>(null);
```

Agregar el botón junto al de "Ver como →" (dentro del `.map((c) => ...)` de la lista de clínicas, en la misma fila donde ya está el botón "Ver como →"):

```tsx
<button onClick={() => setCargaPacientesFor({ id: c.id, nombre: c.nombre })}
  className="text-sm font-medium whitespace-nowrap transition-colors"
  style={{ color: '#1A9DB5' }}>
  Cargar pacientes
</button>
```

Y al final del JSX del componente, junto al modal de "Nueva clínica" ya existente:

```tsx
{cargaPacientesFor && (
  <CargaPacientesModal
    clienteId={cargaPacientesFor.id}
    clinicaNombre={cargaPacientesFor.nombre}
    onClose={() => setCargaPacientesFor(null)}
  />
)}
```

- [ ] **Step 4: Verificar tipos y build completo**

Correr: `npx tsc --noEmit -p tsconfig.app.json && npx vite build --outDir /tmp/odontix-verify-carga --emptyOutDir`
Esperado: sin errores, build exitoso.

- [ ] **Step 5: Verificación manual en el navegador**

Con `npm run dev` corriendo: entrar como admin (o vía `DEV_BYPASS`), ir a Clínicas, click en "Cargar pacientes" de una clínica de prueba, subir un CSV chico de prueba (2-3 filas con Nombre/Telefono/Email), mapear columnas, previsualizar, confirmar, y verificar que el resumen muestra los números correctos. Confirmar con una consulta REST directa que los pacientes aparecieron en Supabase con el `cliente_id` correcto, y borrarlos después para no dejar basura de prueba.

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/CargaPacientesModal.tsx src/pages/admin/AdminClinicasPage.tsx
git commit -m "feat: asistente de carga masiva de pacientes en AdminClinicasPage"
```

---

### Task 6: PatientsPage con datos reales + alta manual

**Files:**
- Modify: `src/pages/PatientsPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `importPacientes` (Task 4), `supabase` desde `@/lib/supabase`
- Produces: `PatientsPage` acepta prop `clienteId: string | null` y lee pacientes reales en vez de `mockData`

- [ ] **Step 1: Pasar `clienteId` desde App.tsx**

En `src/App.tsx`, ubicar la línea (dentro de `renderPage`):

```typescript
case "patients":   return <PatientsPage />;
```

Reemplazar por:

```typescript
case "patients":   return <PatientsPage clienteId={activeClienteId} />;
```

- [ ] **Step 2: Reescribir PatientsPage para leer datos reales**

Reemplazar el contenido de `src/pages/PatientsPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { importPacientes, type ExistingPaciente } from "@/lib/pacientes";

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

  useEffect(() => { if (clienteId) cargarPacientes(); }, [clienteId]);

  async function cargarPacientes() {
    setLoading(true);
    const { data } = await supabase
      .from("pacientes")
      .select("id, nombre, telefono, email, fecha_nacimiento, dni, genero, cobertura, direccion, notas_medicas")
      .eq("cliente_id", clienteId)
      .order("nombre");
    setPacientes((data ?? []) as ExistingPaciente[]);
    setLoading(false);
  }

  async function guardarNuevoPaciente() {
    if (!clienteId) return;
    setGuardando(true);
    await importPacientes(clienteId, [nuevoForm]);
    await cargarPacientes();
    setNuevoForm({ nombre: "", telefono: "", email: "", dni: "" });
    setShowNuevo(false);
    setGuardando(false);
  }

  const filtered = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.telefono.includes(search) ||
    (p.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarColors = ["#1a9db5", "#38A169", "#3dc0d8", "#FFBB00", "#E53E3E"];
  const avatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

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
              <button onClick={() => setShowNuevo(false)} style={{ flex: 1, padding: "0.6rem", borderRadius: "0.625rem", border: `1px solid ${BORDER}`, color: MUTED }}>Cancelar</button>
              <button
                disabled={!nuevoForm.nombre || !nuevoForm.telefono || guardando}
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
        <button onClick={() => setShowNuevo(true)} style={{ background: "#1a9db5", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>
          + Nuevo paciente
        </button>
      </div>

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
```

- [ ] **Step 3: Verificar tipos y build completo**

Correr: `npx tsc --noEmit -p tsconfig.app.json && npx vite build --outDir /tmp/odontix-verify-patients --emptyOutDir`
Esperado: sin errores. Nota: `mockData.ts` deja de estar importado desde `PatientsPage.tsx`, pero sigue usándose desde otras páginas (Dashboard, Agenda, etc.) — no lo toques ni lo borres.

- [ ] **Step 4: Correr la suite de tests completa**

Correr: `npm test`
Esperado: los 9 tests de `pacientes.test.ts` + `fileParsing.test.ts` siguen pasando (esta tarea no les tocó nada).

- [ ] **Step 5: Verificación manual en el navegador**

Con `npm run dev`: entrar como una clínica con pacientes ya cargados (por ejemplo, tras probar la carga masiva de la Task 5), confirmar que la lista de `PatientsPage` los muestra de verdad. Probar "+ Nuevo paciente", cargar uno con nombre+teléfono, confirmar que aparece en la tabla sin recargar la página. Probar buscar por nombre/teléfono/email.

- [ ] **Step 6: Commit**

```bash
git add src/pages/PatientsPage.tsx src/App.tsx
git commit -m "feat: PatientsPage lee pacientes reales por cliente_id y permite alta manual"
```

---

## Self-Review (completado durante la escritura de este plan)

**1. Cobertura del spec:** carga masiva de 4 pasos (Task 5), alta manual (Task 6), clave de duplicado teléfono+nombre (Task 2), actualizar sin sobrescribir (Task 2), omitir filas inválidas con resumen (Task 2 + Task 5 paso "resultado"), todo client-side sin backend nuevo (todas las tareas usan `@/lib/supabase` directo) — todo cubierto. El punto "PatientsPage con datos reales" no estaba en el spec original pero se confirmó con el usuario como necesario y se agregó como Task 6.

**2. Placeholders:** ninguno — todo el código de cada step es real y completo.

**3. Consistencia de tipos:** `PacienteRow`/`ExistingPaciente`/`ReconcileResult` se definen una sola vez en Task 2 y se reusan sin cambios en Tasks 4, 5 y 6. `importPacientes` tiene la misma firma en Task 4 (donde se define) y en su uso desde Task 5 y Task 6.

---

Plan completo y guardado en `docs/superpowers/plans/2026-07-29-carga-pacientes.md`. Dos opciones de ejecución:

**1. Subagent-Driven (recomendado)** — despacho un subagente nuevo por tarea, reviso entre tareas, iteración rápida.

**2. Ejecución en esta sesión** — ejecuto las tareas acá mismo con checkpoints de revisión.

¿Cuál preferís?

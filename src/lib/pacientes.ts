import { supabase } from "@/lib/supabase";

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
  const mergedIncoming = new Set<number>(); // Track which rows have been merged

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

    // Skip this row if it was already merged into a previous row
    if (mergedIncoming.has(fila)) {
      return;
    }

    const match = existing.find(
      (e) => (e.telefono ?? "").trim() === telefono && (e.nombre ?? "").trim().toLowerCase() === nombre.toLowerCase()
    );

    if (!match) {
      // Merge all rows with the same telefono+nombre from incoming
      const mergedFields: Partial<PacienteRow> = { ...pickOptionalFields(row) };

      // Find all other rows with the same telefono+nombre
      for (let i = fila + 1; i < incoming.length; i++) {
        const otherRow = incoming[i];
        const otherNombre = otherRow.nombre?.trim();
        const otherTelefono = otherRow.telefono?.trim();

        if (otherNombre && otherTelefono &&
            otherTelefono === telefono &&
            otherNombre.toLowerCase() === nombre.toLowerCase()) {
          // Merge optional fields from this row (first non-empty wins)
          const otherFields = pickOptionalFields(otherRow);
          for (const field of OPTIONAL_FIELDS) {
            if (!mergedFields[field] && otherFields[field]) {
              mergedFields[field] = otherFields[field];
            }
          }
          mergedIncoming.add(i);
        }
      }

      result.toInsert.push({ nombre, telefono, ...mergedFields });
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

const PACIENTES_SELECT_FIELDS =
  "id, nombre, telefono, email, fecha_nacimiento, dni, genero, cobertura, direccion, notas_medicas";

/**
 * Fetches every paciente row for a cliente, paginating past Supabase's default
 * max-rows-per-request cap (1000) so clinics with more than 1000 patients
 * don't get silently truncated results (which caused duplicate inserts on
 * re-import).
 */
export async function fetchAllPacientes(clienteId: string): Promise<ExistingPaciente[]> {
  const PAGE_SIZE = 1000;
  const all: ExistingPaciente[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("pacientes")
      .select(PACIENTES_SELECT_FIELDS)
      .eq("cliente_id", clienteId)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`No se pudo leer pacientes existentes: ${error.message}`);
    all.push(...((data ?? []) as ExistingPaciente[]));
    if (!data || data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

export async function importPacientes(
  clienteId: string,
  incoming: Partial<PacienteRow>[]
): Promise<{ nuevos: number; actualizados: number; omitidos: { fila: number; motivo: string }[] }> {
  const existing = await fetchAllPacientes(clienteId);
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
    const { error: updateError } = await supabase
      .from("pacientes")
      .update(changes)
      .eq("id", id)
      .eq("cliente_id", clienteId);
    if (updateError) {
      throw new Error(`Error actualizando paciente ${id}: ${updateError.message}`);
    }
  }

  return { nuevos: toInsert.length, actualizados: toUpdate.length, omitidos: skipped };
}

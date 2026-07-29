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

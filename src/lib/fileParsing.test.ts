import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parseSpreadsheetFile } from "./fileParsing";

function csvFile(content: string): File {
  return new File([content], "prueba.csv", { type: "text/csv" });
}

function xlsxFile(rows: string[][]): File {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  const buffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new File([buffer], "prueba.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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

  it("parsea un archivo XLSX con headers y filas", async () => {
    const file = xlsxFile([
      ["Nombre", "Telefono", "Email"],
      ["Ana Pérez", "1122334455", "ana@mail.com"],
      ["Luis Gil", "1155667788", ""],
    ]);
    const { headers, rows } = await parseSpreadsheetFile(file);

    expect(headers).toEqual(["Nombre", "Telefono", "Email"]);
    expect(rows).toEqual([
      { Nombre: "Ana Pérez", Telefono: "1122334455", Email: "ana@mail.com" },
      { Nombre: "Luis Gil", Telefono: "1155667788", Email: "" },
    ]);
  });
});

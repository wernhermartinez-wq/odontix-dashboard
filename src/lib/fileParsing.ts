import * as XLSX from "xlsx";

export async function parseSpreadsheetFile(
  file: File
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const isCsv = file.type === "text/csv" || file.name.endsWith(".csv");

  let raw: string[][];

  if (isCsv) {
    // For CSV files, read as text to preserve UTF-8 encoding
    const text = await file.text();
    const workbook = XLSX.read(text, { type: "string" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    raw = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, raw: false });
  } else {
    // For XLSX files, read as array buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    raw = XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, raw: false });
  }

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

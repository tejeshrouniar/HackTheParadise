import { strToU8, zipSync } from "fflate";

type Ranking = {
  place: number;
  display_name: string;
  school_name: string | null;
  email?: string | null;
  phone_number?: string | null;
  cinder: number;
  harry: number;
  total: number;
};

export type LeaderboardExport = {
  current: Ranking[];
  archive: { ended_at: string; standings: Ranking[] }[];
};

type Cell = string | number;
const columns = ["Place", "Display name", "Affiliation", "Email", "Phone number", "The Last Light", "The Horcrux Code", "Total levels"];
const columnWidths = [9, 26, 35, 36, 20, 19, 22, 15];
const header = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const spreadsheet = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
const packageRelationships = "http://schemas.openxmlformats.org/package/2006/relationships";
const officeRelationships = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

function escapeText(value: string) {
  return value.replace(/[^\u0009\u000A\u000D\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]/gu, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function worksheet(rows: Cell[][], widths: number[]) {
  const columnWidths = widths.map((width, index) =>
    `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`).join("");
  const sheetRows = rows.map((row, index) => {
    const rowNumber = index + 1;
    const cells = row.map((value, column) => {
      const address = String.fromCharCode(65 + column) + rowNumber;
      // An inline string stays text even when a player name starts with "=".
      return typeof value === "number"
        ? `<c r="${address}"><v>${value}</v></c>`
        : `<c r="${address}" t="inlineStr"><is><t xml:space="preserve">${escapeText(value)}</t></is></c>`;
    }).join("");
    return `<row r="${rowNumber}">${cells}</row>`;
  }).join("");
  return `<worksheet xmlns="${spreadsheet}"><cols>${columnWidths}</cols><sheetData>${sheetRows}</sheetData></worksheet>`;
}

function rankingCells(row: Ranking): Cell[] {
  return [
    row.place, row.display_name, row.school_name ?? "", row.email ?? "", row.phone_number ?? "",
    row.cinder, row.harry, row.total,
  ];
}

export function createLeaderboardWorkbook(data: LeaderboardExport) {
  const files = {
    "[Content_Types].xml": `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
      <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
      <Default Extension="xml" ContentType="application/xml"/>
      <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
      <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
      <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    </Types>`,
    "_rels/.rels": `<Relationships xmlns="${packageRelationships}">
      <Relationship Id="rId1" Type="${officeRelationships}/officeDocument" Target="xl/workbook.xml"/>
    </Relationships>`,
    "xl/workbook.xml": `<workbook xmlns="${spreadsheet}" xmlns:r="${officeRelationships}"><sheets>
      <sheet name="Current rankings" sheetId="1" r:id="rId1"/>
      <sheet name="Archived rounds" sheetId="2" r:id="rId2"/>
    </sheets></workbook>`,
    "xl/_rels/workbook.xml.rels": `<Relationships xmlns="${packageRelationships}">
      <Relationship Id="rId1" Type="${officeRelationships}/worksheet" Target="worksheets/sheet1.xml"/>
      <Relationship Id="rId2" Type="${officeRelationships}/worksheet" Target="worksheets/sheet2.xml"/>
    </Relationships>`,
    "xl/worksheets/sheet1.xml": worksheet([columns, ...data.current.map(rankingCells)], columnWidths),
    "xl/worksheets/sheet2.xml": worksheet([
      ["Round ended (UTC)", ...columns],
      ...data.archive.flatMap(round => round.standings.map(row => [new Date(round.ended_at).toISOString(), ...rankingCells(row)])),
    ], [29, ...columnWidths]),
  };
  return zipSync(Object.fromEntries(Object.entries(files).map(([path, xml]) => [path, strToU8(header + xml)])));
}

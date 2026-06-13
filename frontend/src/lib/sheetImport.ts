const DEFAULT_SHEET_BUYER = { first: 'Max', last: 'Med Distributors' };

export type SheetPriceRow = {
  ndc?: string;
  productName: string;
  referenceCode?: string;
  buyerFirst: string;
  buyerLast: string;
  range1Price?: number;
  range2Price?: number;
  range1Label?: string;
  range2Label?: string;
  dingReduction?: number;
  damagedPrice?: number;
  specialNotes?: string;
};

export type ParsedPastePreview = {
  rows: SheetPriceRow[];
  format: 'buyer_price_sheet' | 'reference_price_sheet' | 'tier_price_sheet' | 'condition_matrix_sheet' | 'vendor_pricelist_sheet' | 'catalog_price_list_sheet' | 'ndc_table';
  columnsUsed: string[];
  columnsIgnored: string[];
};

function detectDelimiter(firstLine: string): '\t' | 'spaces' | ',' {
  const tabs = (firstLine.match(/\t/g) || []).length;
  if (tabs >= 2) return '\t';
  const commas = (firstLine.match(/,/g) || []).length;
  if (commas >= 3) return ',';
  return 'spaces';
}

function splitLine(line: string, delim: '\t' | 'spaces' | ','): string[] {
  if (delim === '\t') return line.split('\t');
  if (delim === ',') return line.split(',');
  return line.split(/\s{2,}|\t+/).map((c) => c.trim());
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (ch === '\r') i += 1;
    } else if (ch !== '\r') {
      cell += ch;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** Parse copy-paste from Google Sheets (tab-separated) or spaced columns. */
export function parsePastedTable(text: string): string[][] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];

  const delim = detectDelimiter(lines[0]);
  if (delim === ',') return parseCsvRows(trimmed);

  return lines
    .map((line) => splitLine(line, delim))
    .map((cells) => cells.map((c) => c.trim()))
    .filter((r) => r.some((c) => c !== ''));
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function parsePrice(value: string | undefined): number | undefined {
  if (value == null) return undefined;
  const v = value.trim();
  if (!v || /^n\/a$/i.test(v) || /^ask$/i.test(v) || /^na$/i.test(v) || /doesn'?t expire/i.test(v)) {
    return undefined;
  }
  if (/^\$\s*-+$/.test(v) || v === '-' || v === '$ -') return undefined;
  if (/\//.test(v) && !/^\$/.test(v)) return undefined;
  const normalized = v.replace(/(\d)\$/, '$1').replace(/[$,]/g, '').trim();
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : undefined;
}

function extractProductIdsFromCell(productName: string): { ndc?: string; referenceCode?: string } {
  const ndcTag = productName.match(/\(NDC\s+([\d-]+)\)/i);
  if (ndcTag) return { ndc: ndcTag[1].replace(/\s/g, '') };

  const refTag = productName.match(/\(REF[\s-]+([A-Z0-9-]+)\)/i);
  if (refTag) return { ndc: `REF ${refTag[1]}`.toUpperCase() };

  const codeTag = productName.match(/\(([A-Z]{2,3}-[A-Z]{2,4}-\d{3})\)/i);
  if (codeTag) return { referenceCode: codeTag[1].toUpperCase() };

  const fromText = extractNdcFromText(productName);
  if (!fromText) return {};
  if (/^\d{4,5}-\d{3,4}-\d{2}$/.test(fromText.replace(/\s/g, ''))) {
    return { ndc: fromText.replace(/\s/g, '') };
  }
  return { referenceCode: fromText };
}

function isExpirationTierLabel(cell: string) {
  const c = cell.trim();
  if (!c) return false;
  if (isDateLabel(c)) return true;
  if (/^mint\s+/i.test(c) && /\d{1,2}\/\d{2}/.test(c)) return true;
  if (/^\d{1,2}\/\d{2}(\+|\s*-\s*\d{1,2}\/\d{2})?\+?/.test(c)) return true;
  return false;
}

function detectBuyerFromPaste(text: string): { first: string; last: string } {
  const lower = text.toLowerCase();
  if (lower.includes('prestigemedicalsupply.net')) return { first: 'Ralphel', last: 'Walton' };
  if (lower.includes('pathmedicalsupply.com')) return { first: 'PATH', last: 'MEDICAL SUPPLY' };
  if (
    lower.includes('northeastmedicalexchange.com') ||
    lower.includes('northeastmedical.com') ||
    lower.includes('northeast medical price list') ||
    lower.includes('lsouza@') ||
    lower.includes('2 commerce drive')
  ) {
    return { first: 'Northeast', last: 'Medical Exchange' };
  }
  if (lower.includes('maxmeddistributors.com') || lower.includes('maxmed')) return DEFAULT_SHEET_BUYER;
  if (lower.includes('diabeticteststripguys@gmail.com')) return { first: 'Charles', last: 'Harris' };
  if (
    lower.includes('firstclassmedsupply.com') ||
    lower.includes('bcdeacon31@gmail.com') ||
    lower.includes('vendor pricelist')
  ) {
    return { first: 'Chris', last: 'Sampson' };
  }
  return DEFAULT_SHEET_BUYER;
}

function extractNdcFromText(text: string): string | undefined {
  const paren = text.match(/\(([A-Z0-9][A-Z0-9-]*\d)\)/i);
  if (paren) return paren[1];
  const ndc = text.match(/\b\d{4,5}-\d{3,4}-\d{2}\b/);
  if (ndc) return ndc[0];
  return undefined;
}

function parseDingAmount(value: string | undefined): number | undefined {
  if (!value?.trim()) return undefined;
  const v = value.trim();
  const offMatch = v.match(/(?:off|take)\s*-?\$?\s*(\d+(?:\.\d+)?)/i);
  if (offMatch) return Number.parseFloat(offMatch[1]);
  const minusDollar = v.match(/-\$(\d+(?:\.\d+)?)/);
  if (minusDollar) return Number.parseFloat(minusDollar[1]);
  if (/^\$/.test(v)) return parsePrice(v);
  return undefined;
}

function isDingRuleText(value: string) {
  return /dinged|dings are|take off|-\$/i.test(value);
}

function normalizeNdc(value: string) {
  return value.replace(/[^\d]/g, '');
}

function splitBuyerName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: '', last: '' };
  if (parts.length === 1) return { first: parts[0], last: '' };
  return { first: parts[0], last: parts.slice(1).join(' ') };
}

function buyerNameFromToken(token: string): { first: string; last: string } {
  const t = token.trim().toLowerCase();
  if (t.includes('maxmed')) return { first: 'Max', last: 'Med Distributors' };
  const split = splitBuyerName(token);
  if (split.first) return split;
  return { first: token.trim(), last: '' };
}

function isMonthMoLabel(cell: string) {
  const c = cell.trim().toLowerCase();
  if (!c) return false;
  if (c.includes('damaged')) return true;
  if (c.includes('less than') && c.includes('mo')) return true;
  return /\d+\s*mo\+?|\d+\s*-\s*\d+\s*mo/.test(c);
}

function isMonthTierLabel(cell: string) {
  const c = cell.trim().toLowerCase();
  return /\d+\+?\s*months?\b/.test(c) || /\d+\s*-\s*\d+\s*months?\b/.test(c);
}

function isDateLabel(cell: string) {
  return /\d{1,2}\/\d{4}/.test(cell);
}

function isTierPriceLabel(cell: string) {
  const c = cell.trim().toLowerCase();
  if (!c) return false;
  return isDateLabel(cell) || c.includes('short date') || isMonthTierLabel(cell);
}

function cellIsProductHeader(cell: string) {
  const c = cell.trim().toLowerCase();
  return c === 'product' || /\bproduct\b/.test(c);
}

function splitMergedBuyerProductCell(cell: string): { buyer?: string; isProductHeader: boolean } {
  const trimmed = cell.trim();
  if (!trimmed) return { isProductHeader: false };
  if (cellIsProductHeader(trimmed) && trimmed.toLowerCase() !== 'product') {
    const buyer = trimmed.replace(/\bproduct\b/gi, '').trim();
    return { buyer: buyer || undefined, isProductHeader: true };
  }
  return { isProductHeader: cellIsProductHeader(trimmed) };
}

function isHeaderRow(cells: string[]) {
  const lower = cells.map((c) => c.trim().toLowerCase());
  if (lower[0] === 'mint' && lower.includes('dinged') && lower.includes('damaged')) return false;
  return (
    cells.some((c) => cellIsProductHeader(c)) &&
    (lower.some((c) => c === 'mint') ||
      lower.some((c) => c.includes('ding')) ||
      cells.some((c) => isDateLabel(c)))
  );
}

function isPriceLike(cell: string) {
  const v = cell.trim();
  return v.startsWith('$') || /^n\/a$/i.test(v) || (/^\d/.test(v) && parsePrice(v) !== undefined);
}

function isLabelRow(cells: string[]) {
  const col0 = cells[0]?.trim();
  // Sub-header rows use an empty first column; product rows put the SKU in col 0.
  if (col0 && !isDateLabel(col0) && !/^minor damage/i.test(col0)) return false;

  const joined = cells.join(' ').toLowerCase();
  if (joined.includes('minor damage') || joined.includes('dinged teststrip')) return true;
  if (cells.filter(isDateLabel).length >= 2) return true;
  if (!col0 && cells.slice(1).some(isDateLabel)) return true;
  return false;
}

function rowHasProductPrice(cols: number[], row: string[]) {
  return cols.some((i) => parsePrice(row[i]) !== undefined);
}

type BuyerSheetLayout = {
  buyer: { first: string; last: string };
  productCol: number;
  mintCols: number[];
  dingCol: number;
  range1Label: string;
  range2Label: string;
  sectionDing?: number;
  sectionNote?: string;
};

function layoutFromHeaderRows(header: string[], subHeader?: string[]): BuyerSheetLayout | null {
  const lower = header.map((c) => c.trim().toLowerCase());
  const headerProductCol = header.findIndex((c) => cellIsProductHeader(c));
  if (headerProductCol < 0) return null;

  const headerMintCols: number[] = [];
  lower.forEach((c, i) => {
    if (c === 'mint' || c === 'expires') headerMintCols.push(i);
    else if (i > headerProductCol && isDateLabel(header[i] || '')) headerMintCols.push(i);
  });

  const headerDingCol = lower.findIndex((c) => c.includes('ding'));

  let buyer = { first: '', last: '' };
  const firstCell = header[0]?.trim();
  const mergedFirst = firstCell ? splitMergedBuyerProductCell(firstCell) : { isProductHeader: false };
  const mergedBuyerProduct = headerProductCol === 0 && mergedFirst.isProductHeader;
  const buyerNameInCol0 =
    Boolean(firstCell) && headerProductCol > 0 && !cellIsProductHeader(firstCell);
  const buyerInCol0 = mergedBuyerProduct || buyerNameInCol0;

  if (mergedFirst.buyer) {
    buyer = buyerNameFromToken(mergedFirst.buyer);
  } else if (buyerNameInCol0 && firstCell) {
    buyer = buyerNameFromToken(firstCell);
  }

  // When row 1 is "maxmed | PRODUCT | MINT...", data rows put the SKU in column A (not under PRODUCT).
  // When row 1 merges "maxmed PRODUCT" in col A, data columns already align — no shift.
  const productCol = buyerInCol0 ? 0 : headerProductCol;
  const colShift = buyerNameInCol0 ? 1 : 0;
  const mintCols = headerMintCols.map((i) => i - colShift).filter((i) => i > productCol);
  const dingCol = headerDingCol >= 0 ? headerDingCol - colShift : -1;

  const range1Label =
    subHeader && mintCols[0] != null
      ? subHeader[mintCols[0]]?.trim() || subHeader[headerMintCols[0]]?.trim() || ''
      : headerMintCols[0] != null
        ? header[headerMintCols[0]]?.trim() || ''
        : '';
  const range2Label =
    subHeader && mintCols[1] != null
      ? subHeader[mintCols[1]]?.trim() || subHeader[headerMintCols[1]]?.trim() || ''
      : headerMintCols[1] != null
        ? header[headerMintCols[1]]?.trim() || ''
        : '';

  let sectionDing: number | undefined;
  let sectionNote: string | undefined;
  if (subHeader) {
    const dingText =
      (dingCol >= 0 ? subHeader[dingCol]?.trim() : '') ||
      subHeader.find((c) => /ding/i.test(c))?.trim() ||
      '';
    if (dingText) {
      sectionDing = parseDingAmount(dingText);
      if (!sectionDing && dingText.length > 3) sectionNote = dingText;
    }
  }

  if (mintCols.length === 0) return null;

  return {
    buyer,
    productCol,
    mintCols,
    dingCol,
    range1Label,
    range2Label,
    sectionDing,
    sectionNote,
  };
}

function resolveDingDamageCols(lower: string[]) {
  let dingCol = lower.findIndex((c) => c.includes('ding'));
  let damageCol = lower.findIndex(
    (c) => c.includes('acceptable damage') || c.includes('damaged') || c === 'damage' || c.includes('damage')
  );
  if (damageCol >= 0 && dingCol < 0 && damageCol >= 2) dingCol = damageCol - 2;
  if (damageCol < 0 && dingCol >= 0) damageCol = dingCol + 1;
  return { dingCol, damageCol };
}

function isPartialDateHeaderRow(row: string[]) {
  const col0 = row[0]?.trim();
  if (col0) return false;
  return row.some((c) => isDateLabel(c));
}
function isReferenceHeaderRow(cells: string[]) {
  const lower = cells.map((c) => c.trim().toLowerCase());
  return (
    lower.some((c) => c === 'reference') &&
    (cells.some((c) => isDateLabel(c)) || lower.some((c) => c.includes('ding')))
  );
}

function isNoteOnlyRow(cells: string[]) {
  const col0 = cells[0]?.trim() || '';
  const col1 = cells[1]?.trim() || '';
  if (/^receivers do not expire/i.test(col0)) return true;
  if (/^please pay attention/i.test(col0)) return true;
  if (/^please ask/i.test(col0)) return true;
  if (/^pdms do not expire/i.test(col1)) return false;
  if (/reader'?s? don'?t expire/i.test(col1)) return false;
  // Northeast-style category headers: long col0 + expiration tier in col1
  if (col1 && isExpirationTierLabel(col1)) return false;
  if (/^ding reduction price$/i.test(col0)) return false;
  if (col0.length > 30 && !col1 && !cells.slice(1).some((c) => parsePrice(c) !== undefined)) return true;
  if (col0.length > 40 && !parsePrice(col1) && !cells.some((c) => isDateLabel(c))) {
    if (cells.slice(2).some((c) => parsePrice(c) !== undefined)) return false;
    return true;
  }
  return false;
}

function isTierHeaderRow(cells: string[]) {
  const col0 = cells[0]?.trim();
  if (!col0 || isPriceLike(col0)) return false;

  const lower = cells.map((c) => c.trim().toLowerCase());
  if (lower.some((c) => c === 'reference' || c === 'product' || c === 'mint')) return false;

  const tierCols = cells.map((c, i) => (i > 0 && isTierPriceLabel(c) ? i : -1)).filter((i) => i >= 0);
  if (tierCols.length === 0 || tierCols[0] > 1) return false;

  return (
    lower.some((c) => c.includes('ding') || c.includes('damaged') || c.includes('damage')) ||
    tierCols.length >= 2
  );
}

function extractBracketNdc(productCell: string): { productName: string; ndc?: string } {
  const bracket = productCell.match(/\[([\d][\d-]*\d)\]/);
  if (bracket) {
    return {
      productName: productCell.replace(/\s*\[[^\]]+\]\s*/, ' ').replace(/\s+/g, ' ').trim(),
      ndc: bracket[1],
    };
  }
  return { productName: productCell.trim() };
}

function extractPathProductReference(productName: string): string | undefined {
  const stk = productName.match(/\b(STK-[A-Z]+-\d+)\b/i);
  if (stk) return stk[1].toUpperCase();

  const g7Slash = productName.match(/\bG7\s+(\d{3})\/(\d{3})\b/i);
  if (g7Slash) return `STP-AT-${g7Slash[1]}`;

  const g7 = productName.match(/\bG7\s+(\d{3})\b/i);
  if (g7) {
    const code = g7[1];
    if (code === '030') return 'STE-AT-030';
    return `STP-AT-${code}`;
  }

  const g15 = productName.match(/\bG7\s+15\s+DAY\s+(\d{3})\b/i);
  if (g15) return `STP-FT-${g15[1]}`;

  const g6pack = productName.match(/\bG6\s+3\s+PACK\s+(OE|OR|OM)\b/i);
  if (g6pack) {
    const suffix = g6pack[1].toUpperCase();
    return suffix === 'OM' ? 'STS-OM-003' : `STS-${suffix}-003`;
  }

  const g6tx = productName.match(/\bG6\s+TRANSMITTER\s+(OE|OR|DME|KIT)\b/i);
  if (g6tx) {
    const kind = g6tx[1].toUpperCase();
    if (kind === 'OR') return 'STT-OR-001';
    if (kind === 'OE' || kind === 'KIT') return 'STT-OE-001';
  }

  const g6rx = productName.match(/\bG6\s+RECEIVER\s+(OE|FR|FK|DME)\b/i);
  if (g6rx) return '08627-0091-11';

  if (/\bLIBRE\s+3\s+READER\b/i.test(productName)) return '57599-0819-00';
  if (/\bLIBRE\s+3\s+PLUS\s+SENSOR\b/i.test(productName)) return '57599-0844-00';
  if (/\bLIBRE\s+3\s+SENSOR\b/i.test(productName)) return '57599-0818-00';
  if (/\bLIBRE\s+2\s+PLUS\s+SENSOR\b/i.test(productName)) return '57599-0835-00';
  if (/\bLIBRE\s+2\s+SENSOR\b/i.test(productName)) return '57599-0800-00';
  if (/\bLIBRE\s+14\s+DAY\s+SENSOR\b/i.test(productName)) return '57599-0001-01';

  if (/\bOMNIPOD\s+5\s+STARTER\s+KIT\b/i.test(productName)) return 'REF-SKT-H001-G-X9';
  if (/\bOMNIPOD\s+5\s*\(\s*5\s+PACK\s*\)\s*G6\s*\/\s*G7\b/i.test(productName)) return '08508-3000-21';
  if (/\bOMNIPOD\s+5\s*\(\s*5\s+PACK\s*\)\s*G6\s*\/\s*LIBRE\b/i.test(productName)) return '08508-3000-42';
  if (/\bOMNIPOD\s+5\s*\(\s*5\s+PACK\s*\)\s*DME\b/i.test(productName)) return '08508-3000-75';
  if (/\bOMNIPOD\s+DASH\s*\(\s*10\s+PACK\s*\)/i.test(productName)) return '08508-2000-10';
  if (/\bOMNIPOD\s+DASH\s*\(\s*5\s+PACK\s*\)/i.test(productName)) return '08508-2000-05';
  if (/\bOMNIPOD\s+\(\s*10\s+PACK\s*\)/i.test(productName)) return '08508-1120-05';
  if (/\bOMNIPOD\s+\(\s*5\s+PACK\s*\)/i.test(productName)) return '08508-1120-05';

  if (/\bFREESTYLE\s+LITE\s+100\b/i.test(productName)) return '99073-0708-27';
  if (/\bFREESTYLE\s+LITE\s+50\b/i.test(productName)) return '99073-0708-22';
  if (/\bFREESTYLE\s+100\b/i.test(productName) && !/LITE/i.test(productName)) return '99073-01-2101';
  if (/\bFREESTYLE\s+50\b/i.test(productName) && !/LITE/i.test(productName)) return '99073-01-2050';
  if (/\bCONTOUR\s+NEXT\s+100\b/i.test(productName)) return '0193-7312-21';
  if (/\bCONTOUR\s+NEXT\s+50\b/i.test(productName)) return '0193-7311-50';
  if (/\bCONTOUR\s+100\b/i.test(productName) && !/NEXT/i.test(productName)) return '0193-7090-21';
  if (/\bCONTOUR\s+50\b/i.test(productName) && !/NEXT/i.test(productName)) return '0193-7098-50';
  if (/\bACCU-CHEK\s+AVIVA\s+PLUS\s+100\b/i.test(productName)) return '65702-0408-10';
  if (/\bACCU-CHEK\s+AVIVA\s+PLUS\s+50\b/i.test(productName) && !/MAIL|NFR/i.test(productName)) {
    return '65702-0407-10';
  }
  if (/\bACCU-CHEK\s+GUIDE\s+100\b/i.test(productName)) return '65702-0712-10';
  if (/\bACCU-CHEK\s+GUIDE\s+50\b/i.test(productName)) return '65702-0711-10';

  return undefined;
}

function resolvePathProductIds(productName: string): { ndc?: string; referenceCode?: string } {
  const ref = extractPathProductReference(productName);
  if (!ref) return {};
  if (/^\d{4,5}-\d{3,4}-\d{2}$/.test(ref)) return { ndc: ref };
  return { referenceCode: ref };
}

function isTierSkipRow(row: string[], layout: TierSheetLayout | null) {
  if (isNoteOnlyRow(row)) return true;

  const col0 = row[0]?.trim() || '';
  const joined = row.join(' ').toLowerCase();

  if (/^shipping address/i.test(col0)) return true;
  if (/^suite\s+\d+/i.test(col0)) return true;
  if (/^\d+\s+w\s+/i.test(col0) && joined.includes('camino')) return true;
  if (/boca raton/i.test(joined)) return true;
  if (/purchasing email/i.test(joined)) return true;
  if (/^if pricing isn'?t listed/i.test(joined)) return true;
  if (/^when invoicing us/i.test(joined)) return true;
  if (/^hello and thank you/i.test(joined)) return true;
  if (/^if shipping please/i.test(joined)) return true;
  if (/^if delivering also/i.test(col0)) return true;
  if (/^things to remember/i.test(joined)) return true;
  if (/^expiration date references/i.test(joined)) return true;
  if (/^keep in mind expirations/i.test(joined)) return true;
  if (/^please check libre/i.test(joined)) return true;
  if (/freestylecheck\.com/i.test(joined)) return true;
  if (/^we do not buy any insulin/i.test(joined)) return true;

  if (!col0 && layout && !rowHasProductPrice(layout.priceCols, row)) {
    if (row.some((c) => (c?.trim().length || 0) > 35)) return true;
  }

  return false;
}

function detectTierPriceSheet(table: string[][]): boolean {
  for (let i = 0; i < Math.min(table.length, 40); i += 1) {
    if (isTierHeaderRow(table[i])) return true;
  }
  return false;
}

function detectReferencePriceSheet(table: string[][]): boolean {
  for (let i = 0; i < Math.min(table.length, 12); i += 1) {
    if (isReferenceHeaderRow(table[i])) return true;
  }
  return false;
}

function detectBuyerPriceSheet(table: string[][]): boolean {
  if (table.length < 2) return false;
  for (let i = 0; i < Math.min(table.length, 5); i += 1) {
    if (isHeaderRow(table[i])) return true;
  }
  const first = table[0].join(' ').toLowerCase();
  return first.includes('product') && first.includes('mint');
}

function isVendorPricelistHeaderRow(cells: string[]) {
  const lower = cells.map((c) => c.trim().toLowerCase());
  const tierCols = cells.map((c, i) => (i > 0 && isMonthMoLabel(c) ? i : -1)).filter((i) => i >= 0);
  const hasDing = lower.some((c) => c.includes('ding'));
  if (tierCols.length >= 2) return true;
  if (tierCols.length >= 1 && hasDing) return true;
  return false;
}

function detectVendorPricelistSheet(table: string[][]): boolean {
  for (let i = 0; i < table.length; i += 1) {
    if (isVendorPricelistHeaderRow(table[i])) return true;
  }
  return false;
}

type VendorSheetLayout = {
  productCol: number;
  priceCols: number[];
  damageCol: number;
  dingCol: number;
  range1Label: string;
  range2Label: string;
};

function layoutFromVendorHeader(header: string[]): VendorSheetLayout | null {
  const lower = header.map((c) => c.trim().toLowerCase());
  const priceCols: number[] = [];
  let damageCol = -1;
  let dingCol = -1;

  header.forEach((cell, i) => {
    if (i === 0) return;
    const l = lower[i] || '';
    if (/\bdings?\b/i.test(l)) {
      dingCol = i;
    } else if (l.includes('damaged')) {
      priceCols.push(i);
      damageCol = i;
    } else if (isMonthMoLabel(cell)) {
      priceCols.push(i);
    }
  });

  if (priceCols.length === 0) return null;

  return {
    productCol: 0,
    priceCols,
    damageCol,
    dingCol,
    range1Label: header[priceCols[0]]?.trim() || '',
    range2Label: header[priceCols[1]]?.trim() || '',
  };
}

function isVendorSectionRow(cells: string[]) {
  const col0 = cells[0]?.trim().toLowerCase() || '';
  if (!col0) return false;
  return (
    col0 === 'test strip brands' ||
    col0 === 'cgm supplies' ||
    col0 === 'meters' ||
    col0 === 'medtronic supplies' ||
    col0 === 'vendor pricelist'
  );
}

function isVendorSkipRow(cells: string[]) {
  const col0 = cells[0]?.trim() || '';
  const joined = cells.join(' ').toLowerCase();
  if (isNoteOnlyRow(cells)) return true;
  if (/^mint-/i.test(col0)) return true;
  if (/^dinged-/i.test(col0)) return true;
  if (/^damaged-/i.test(col0)) return true;
  if (/^contact #/i.test(joined)) return true;
  if (/^paypal email/i.test(joined)) return true;
  if (/^contact email/i.test(joined)) return true;
  if (/^payment options/i.test(joined)) return true;
  if (/^for prepayment/i.test(joined)) return true;
  if (/please include an invoice/i.test(joined)) return true;
  if (/best form of contact/i.test(joined)) return true;
  if (/new shipping address/i.test(joined)) return true;
  if (/we pricematch/i.test(joined)) return true;
  if (/these g7 1 pk 012 lot/i.test(joined)) return true;
  if (/for product expired to 5mo/i.test(joined)) return true;
  if (/^n\/a- not accepting/i.test(joined)) return true;
  if (col0.length <= 2 && !rowHasProductPrice([1, 2, 3], cells)) return true;
  return false;
}

function extractVendorProductIds(productName: string): { ndc?: string; referenceCode?: string } {
  const parenCode = extractNdcFromText(productName);
  if (parenCode) {
    if (/^\d{4,5}-\d{3,4}-\d{2}$/.test(parenCode)) return { ndc: parenCode };
    if (/^[A-Z]{2,3}-[A-Z]{2,3}-\d{3}$/i.test(parenCode)) return { referenceCode: parenCode.toUpperCase() };
    const ndcByRef: Record<string, string> = {
      '7312': '0193-7312-21',
      '7311': '0193-7311-50',
      '7308': '0193-7308-50',
      '7090G': '0193-7090-21',
      '7080G': '0193-7098-50',
    };
    const key = parenCode.toUpperCase();
    if (ndcByRef[key]) return { ndc: ndcByRef[key] };
    return { referenceCode: parenCode };
  }

  const pathIds = resolvePathProductIds(productName);
  if (pathIds.ndc || pathIds.referenceCode) return pathIds;

  const n = productName.toLowerCase();
  if (/aviva-\s*100/i.test(n)) return { ndc: '65702-0408-10' };
  if (/aviva-\s*50.*retail/i.test(n)) return { ndc: '65702-0407-10' };
  if (/aviva-\s*50.*mail/i.test(n)) return { ndc: '65702-0438-10' };
  if (/smartview-\s*100/i.test(n)) return { ndc: '65702-0493-10' };
  if (/smartview-\s*50/i.test(n)) return { ndc: '65702-0492-10' };
  if (/freestyle lite-\s*100/i.test(n)) return { ndc: '99073-0708-27' };
  if (/freestyle lite-\s*50/i.test(n)) return { ndc: '99073-0708-22' };
  if (/fs regular-\s*100/i.test(n)) return { ndc: '99073-01-2101' };
  if (/fs regular-\s*50/i.test(n)) return { ndc: '99073-01-2050' };
  if (/fs libre 3 sensor/i.test(n)) return { ndc: '57599-0818-00' };
  if (/fs libre 3 plus/i.test(n)) return { ndc: '57599-0844-00' };
  if (/fs libre 2 sensor/i.test(n)) return { ndc: '57599-0800-00' };
  if (/fs libre 14 day sensor/i.test(n)) return { ndc: '57599-0001-01' };
  if (/libre 3 reader/i.test(n)) return { ndc: '57599-0819-00' };
  if (/pod 5 pk \(purple/i.test(n)) return { ndc: '08508-3000-21' };
  if (/omnipod \(5 pack\)/i.test(n)) return { ndc: '08508-1120-05' };
  if (/omnipod \(10 pack\)/i.test(n)) return { ndc: '08508-1120-05' };
  if (/dash pod \(5 pack\)/i.test(n)) return { ndc: '08508-2000-05' };
  if (/dash pod \(10 pack\)/i.test(n)) return { ndc: '08508-2000-10' };
  if (/g7 1 pk \(stp-at-/i.test(n)) {
    const m = productName.match(/STP-AT-\d{3}/i);
    if (m) return { referenceCode: m[0].toUpperCase() };
  }
  if (/g7 1 pk \(ste-at-/i.test(n)) return { referenceCode: 'STE-AT-030' };
  if (/g7 1 pk 15 day \(012\)/i.test(n)) return { referenceCode: 'STP-FT-012' };
  if (/g7 1 pk 15 day \(013\)/i.test(n)) return { referenceCode: 'STP-FT-013' };
  if (/dexcom g6 3 pk sensors: \(sts-or-003\)/i.test(n)) return { referenceCode: 'STS-OR-003' };
  if (/dexcom g6 3 pk sensors: \(sts-oe-003\)/i.test(n)) return { referenceCode: 'STS-OE-003' };
  if (/dexcom g6 3 pk sensors: \(sts-om-003\)/i.test(n)) return { referenceCode: 'STS-OM-003' };

  return {};
}

function parseVendorPricelistSheet(
  table: string[][],
  buyer: { first: string; last: string } = DEFAULT_SHEET_BUYER
): ParsedPastePreview | { error: string } {
  const rows: SheetPriceRow[] = [];
  const columnsUsed = new Set<string>([
    'Product',
    'Expiration tier 1',
    'Expiration tier 2',
    'Damaged',
    'Ding',
  ]);
  const defaultBuyer = buyer;

  let layout: VendorSheetLayout | null = null;
  let i = 0;

  while (i < table.length) {
    const row = table[i];

    if (isVendorPricelistHeaderRow(row)) {
      layout = layoutFromVendorHeader(row);
      i += 1;
      continue;
    }

    if (isVendorSectionRow(row)) {
      i += 1;
      continue;
    }

    if (!layout || isVendorSkipRow(row)) {
      i += 1;
      continue;
    }

    const productName = row[layout.productCol]?.trim();
    if (!productName || isPriceLike(productName) || isVendorPricelistHeaderRow(row)) {
      i += 1;
      continue;
    }

    const mintCols = layout.damageCol >= 0
      ? layout.priceCols.filter((c) => c !== layout.damageCol)
      : layout.priceCols;

    const priceCheckCols = [...mintCols];
    if (layout.damageCol >= 0) priceCheckCols.push(layout.damageCol);
    if (!rowHasProductPrice(priceCheckCols, row)) {
      i += 1;
      continue;
    }

    const ids = extractVendorProductIds(productName);
    const range1Price = mintCols[0] != null ? parsePrice(row[mintCols[0]]) : undefined;
    const range2Price = mintCols[1] != null ? parsePrice(row[mintCols[1]]) : undefined;

    let dingReduction: number | undefined;
    let specialNotes: string | undefined;
    if (layout.dingCol >= 0) {
      const dingCell = row[layout.dingCol]?.trim();
      if (dingCell && !/^n\/a$/i.test(dingCell)) {
        if (/^-\$|^-\d|\bdings?\b/i.test(dingCell) || isDingRuleText(dingCell)) {
          const parsed = parseDingAmount(dingCell);
          if (parsed !== undefined) dingReduction = parsed;
          else if (dingCell.length > 3) specialNotes = dingCell;
        } else if (/^\$\d/.test(dingCell)) {
          const parsed = parseDingAmount(dingCell);
          if (parsed !== undefined) dingReduction = parsed;
        } else if (dingCell.length > 3) {
          specialNotes = dingCell;
        }
      }
    }

    const extraTiers: string[] = [];
    for (let pi = 2; pi < mintCols.length; pi += 1) {
      const price = parsePrice(row[mintCols[pi]]);
      if (price !== undefined) extraTiers.push(`Tier ${pi + 1}: $${price.toFixed(2)}`);
    }
    if (extraTiers.length > 0) {
      specialNotes = [specialNotes, ...extraTiers].filter(Boolean).join('; ');
    }

    const damagedPrice =
      layout.damageCol >= 0 ? parsePrice(row[layout.damageCol]) : undefined;

    if (range1Price === undefined && range2Price === undefined && damagedPrice === undefined) {
      i += 1;
      continue;
    }

    rows.push({
      productName,
      ndc: ids.ndc,
      referenceCode: ids.referenceCode,
      buyerFirst: defaultBuyer.first,
      buyerLast: defaultBuyer.last,
      range1Price,
      range2Price,
      range1Label: layout.range1Label || undefined,
      range2Label: layout.range2Label || undefined,
      dingReduction,
      damagedPrice,
      specialNotes,
    });

    i += 1;
  }

  if (rows.length === 0) {
    return {
      error:
        'No product price rows found in vendor pricelist. Include tier header rows (9mo+ / 7-8mo / 6mo / DINGS) and product lines.',
    };
  }

  return {
    rows,
    format: 'vendor_pricelist_sheet',
    columnsUsed: [...columnsUsed],
    columnsIgnored: [],
  };
}

function isCatalogPriceListHeaderRow(cells: string[]) {
  const lower = cells.map((c) => c.trim().toLowerCase());
  const hasPrices = cells.some((c) => parsePrice(c) !== undefined);
  if (hasPrices) return false;

  const hasDingReduction = lower.some((c) => c.includes('ding reduction'));
  const tierCount = cells.filter((c, i) => i > 0 && isExpirationTierLabel(c)).length;

  if (hasDingReduction && tierCount >= 1) return true;
  if (tierCount >= 2 && (cells[0]?.trim().length || 0) > 2) return true;
  return false;
}

function isCatalogProductRow(cells: string[]) {
  const col0 = cells[0]?.trim() || '';
  if (!col0) return false;
  if (/national drug code/i.test(col0)) return false;
  if (/\(NDC\s+[\d]/i.test(col0) || /\bREF[\s-]/i.test(col0) || /\bSTP-AT-/i.test(col0)) return true;
  if (/\bSTS-/i.test(col0) || /\bSTT-/i.test(col0) || /\bREF-SKT/i.test(col0)) return true;
  return rowHasProductPrice([1, 2, 3, 4], cells);
}

/** Merge category headers split across rows (common when copying from Google Sheets). */
function coalesceCatalogHeaderRows(
  table: string[][],
  startIdx: number
): { header: string[]; consumed: number } | null {
  const first = table[startIdx];
  if (!first || isCatalogSkipRow(first) || isCatalogProductRow(first)) return null;
  if (first.some((c) => parsePrice(c) !== undefined)) return null;

  if (isCatalogPriceListHeaderRow(first)) {
    return { header: first, consumed: 1 };
  }

  const category = first[0]?.trim() || '';
  if (category.length < 3) return null;

  const tiers: string[] = [];
  let ding = '';
  let consumed = 1;

  const col1 = first[1]?.trim() || '';
  if (col1 && isExpirationTierLabel(col1)) tiers.push(col1);

  for (let j = startIdx + 1; j < Math.min(startIdx + 5, table.length); j += 1) {
    const next = table[j];
    if (!next || isCatalogSkipRow(next) || isCatalogProductRow(next)) break;

    const n0 = next[0]?.trim() || '';
    const n1 = next[1]?.trim() || '';

    if (/ding reduction/i.test(n0) || /ding reduction/i.test(n1)) {
      ding = n0 || n1 || 'Ding reduction price';
      consumed += 1;
      break;
    }

    if (n0 && isExpirationTierLabel(n0) && !n1) {
      tiers.push(n0);
      consumed += 1;
      continue;
    }

    if (n1 && isExpirationTierLabel(n1)) {
      tiers.push(n1);
      consumed += 1;
      continue;
    }

    break;
  }

  if (tiers.length === 0) return null;

  const header = ding ? [category, ...tiers, ding] : [category, ...tiers];
  if (!isCatalogPriceListHeaderRow(header)) return null;

  return { header, consumed };
}

function detectCatalogPriceListSheet(table: string[][]): boolean {
  for (let i = 0; i < table.length; i += 1) {
    if (isCatalogPriceListHeaderRow(table[i])) return true;
  }
  return false;
}

type CatalogSheetLayout = {
  productCol: number;
  priceCols: number[];
  dingCol: number;
  notesCol: number;
  range1Label: string;
  range2Label: string;
};

function layoutFromCatalogHeader(header: string[]): CatalogSheetLayout | null {
  const lower = header.map((c) => c.trim().toLowerCase());
  const priceCols: number[] = [];
  let dingCol = lower.findIndex((c) => c.includes('ding reduction'));

  header.forEach((cell, i) => {
    if (i === 0) return;
    if (lower[i]?.includes('ding reduction')) return;
    if (isExpirationTierLabel(cell)) priceCols.push(i);
  });

  if (priceCols.length === 0) return null;
  if (dingCol < 0) dingCol = priceCols[priceCols.length - 1] + 1;

  return {
    productCol: 0,
    priceCols,
    dingCol,
    notesCol: dingCol + 1,
    range1Label: header[priceCols[0]]?.trim() || '',
    range2Label: header[priceCols[1]]?.trim() || '',
  };
}

function isCatalogSkipRow(cells: string[]) {
  const col0 = cells[0]?.trim() || '';
  const joined = cells.join(' ').toLowerCase();
  if (isNoteOnlyRow(cells)) return true;
  if (/northeast medical price list/i.test(joined)) return true;
  if (/^contact info/i.test(col0) || /^contact info/i.test(joined)) return true;
  if (/^our address/i.test(col0)) return true;
  if (/^important information/i.test(col0)) return true;
  if (/^payment options/i.test(joined)) return true;
  if (/^examples of box conditions/i.test(joined)) return true;
  if (/^how to tell which/i.test(col0)) return true;
  if (/^insulated mailers/i.test(col0)) return true;
  if (/^moisture resistant/i.test(col0)) return true;
  if (/^check to see if your omnipod/i.test(joined)) return true;
  if (/^most recent update/i.test(joined)) return true;
  if (/^mint$/i.test(col0) && cells[1]?.trim().toLowerCase() === 'dinged') return true;
  if (/^best payout/i.test(joined)) return true;
  if (/^questioning what to send insulin/i.test(joined)) return true;
  if (col0.startsWith('•') || col0.startsWith('*')) return true;
  return false;
}

function parseCatalogPriceListSheet(
  table: string[][],
  buyer: { first: string; last: string } = DEFAULT_SHEET_BUYER
): ParsedPastePreview | { error: string } {
  const rows: SheetPriceRow[] = [];
  const columnsUsed = new Set<string>([
    'Product',
    'Mint tier 1',
    'Mint tier 2',
    'Ding reduction',
    'Notes',
  ]);
  const defaultBuyer = buyer;

  let layout: CatalogSheetLayout | null = null;
  let i = 0;

  while (i < table.length) {
    const row = table[i];

    const coalesced = coalesceCatalogHeaderRows(table, i);
    if (coalesced) {
      layout = layoutFromCatalogHeader(coalesced.header);
      i += coalesced.consumed;
      continue;
    }

    if (isCatalogPriceListHeaderRow(row)) {
      layout = layoutFromCatalogHeader(row);
      i += 1;
      continue;
    }

    if (!layout || isCatalogSkipRow(row)) {
      i += 1;
      continue;
    }

    const productName = row[layout.productCol]?.trim();
    if (!productName || isCatalogPriceListHeaderRow(row) || isPriceLike(productName)) {
      i += 1;
      continue;
    }

    const priceCheckCols = [...layout.priceCols, layout.dingCol];
    if (!rowHasProductPrice(priceCheckCols, row)) {
      i += 1;
      continue;
    }

    const ids = extractProductIdsFromCell(productName);
    const range1Price = layout.priceCols[0] != null ? parsePrice(row[layout.priceCols[0]]) : undefined;
    const range2Price = layout.priceCols[1] != null ? parsePrice(row[layout.priceCols[1]]) : undefined;
    const dingReduction = layout.dingCol >= 0 ? parsePrice(row[layout.dingCol]) : undefined;

    let specialNotes: string | undefined;
    if (layout.notesCol >= 0) {
      const noteCell = row[layout.notesCol]?.trim();
      if (noteCell && !parsePrice(noteCell) && !/^n\/a$/i.test(noteCell)) {
        specialNotes = noteCell;
      }
    }

    const extraTiers: string[] = [];
    for (let pi = 2; pi < layout.priceCols.length; pi += 1) {
      const price = parsePrice(row[layout.priceCols[pi]]);
      if (price !== undefined) extraTiers.push(`Tier ${pi + 1}: $${price.toFixed(2)}`);
    }
    if (extraTiers.length > 0) {
      specialNotes = [specialNotes, ...extraTiers].filter(Boolean).join('; ');
    }

    if (range1Price === undefined && range2Price === undefined && dingReduction === undefined) {
      i += 1;
      continue;
    }

    rows.push({
      productName,
      ndc: ids.ndc,
      referenceCode: ids.referenceCode,
      buyerFirst: defaultBuyer.first,
      buyerLast: defaultBuyer.last,
      range1Price,
      range2Price,
      range1Label: layout.range1Label || undefined,
      range2Label: layout.range2Label || undefined,
      dingReduction,
      specialNotes,
    });

    i += 1;
  }

  if (rows.length === 0) {
    return {
      error:
        'No product price rows found in catalog price list. Include category headers (Mint 7/27+ / Ding reduction price) and product lines.',
    };
  }

  return {
    rows,
    format: 'catalog_price_list_sheet',
    columnsUsed: [...columnsUsed],
    columnsIgnored: [],
  };
}

function isConditionMatrixHeaderRow(cells: string[]) {
  const lower = cells.map((c) => c.trim().toLowerCase());
  const hasNdc = lower.some((c) => c.includes('ndc') && c.includes('nrc'));
  const hasCondition = lower.some((c) => c === 'condition');
  return hasNdc && hasCondition;
}

function detectConditionMatrixSheet(table: string[][]): boolean {
  for (let i = 0; i < table.length; i += 1) {
    if (isConditionMatrixHeaderRow(table[i])) return true;
  }
  return false;
}

type ConditionMatrixLayout = {
  sectionLabel: string;
  productCol: number;
  ndcCol: number;
  conditionCol: number;
  tierCols: number[];
  tierLabels: string[];
};

function layoutFromConditionMatrixHeader(header: string[]): ConditionMatrixLayout | null {
  const lower = header.map((c) => c.trim().toLowerCase());
  const ndcCol = lower.findIndex((c) => c.includes('ndc') && c.includes('nrc'));
  const conditionCol = lower.findIndex((c) => c === 'condition');
  if (ndcCol < 0 || conditionCol < 0) return null;

  const productCol = ndcCol > 0 ? ndcCol - 1 : 0;
  const tierCols: number[] = [];
  const tierLabels: string[] = [];
  for (let i = conditionCol + 1; i < header.length; i += 1) {
    const label = header[i]?.trim();
    if (label) {
      tierCols.push(i);
      tierLabels.push(label);
    }
  }
  if (tierCols.length === 0) return null;

  return {
    sectionLabel: header[productCol]?.trim() || header[0]?.trim() || '',
    productCol,
    ndcCol,
    conditionCol,
    tierCols,
    tierLabels,
  };
}

function isMatrixSkipRow(cells: string[]) {
  const joined = cells.join(' ').toLowerCase();
  if (joined.includes('click here to view')) return true;
  if (joined.includes('check dexcom serial')) return true;
  if (joined.includes('check omnipod lot')) return true;
  if (joined.includes('check freestyle serial')) return true;
  if (joined.includes('preferred dates')) return true;
  if (joined.includes('payment methods')) return true;
  if (joined.includes('purchasing contact')) return true;
  if (joined.includes('announcements')) return true;
  if (joined.includes('effective immediately')) return true;
  if (joined.includes('price sheet is intended')) return true;
  if (joined.includes('shipping address')) return true;
  if (joined.includes('remove all stickers')) return true;
  return isNoteOnlyRow(cells);
}

function isConditionValue(cell: string) {
  const c = cell.trim().toLowerCase();
  return c === 'mint' || c === 'ding' || c === 'damaged';
}

function isStandardNdcValue(value: string) {
  return /^\d{4,5}-\d{3,4}-\d{2}$/.test(value.replace(/\s/g, ''));
}

type PendingMatrixProduct = {
  productName: string;
  ndc?: string;
  referenceCode?: string;
  mintPrices: (number | undefined)[];
  dingPrices: (number | undefined)[];
  damagedPrices: (number | undefined)[];
  layout: ConditionMatrixLayout;
};

function resolveMatrixProductIds(productCell: string, ndcCell: string) {
  const skuFromName = extractNdcFromText(productCell);
  const cleanedNdc = ndcCell.replace(/\s/g, '');

  if (skuFromName && /[A-Za-z]/.test(skuFromName)) {
    return {
      ndc: isStandardNdcValue(cleanedNdc) ? cleanedNdc : undefined,
      referenceCode: skuFromName,
    };
  }
  if (isStandardNdcValue(cleanedNdc)) return { ndc: cleanedNdc, referenceCode: undefined };
  if (cleanedNdc) return { ndc: cleanedNdc, referenceCode: undefined };
  return { ndc: undefined, referenceCode: undefined };
}

function findConditionInRow(
  row: string[],
  layout: ConditionMatrixLayout
): { condition: string; shift: number } | null {
  for (let i = 0; i <= layout.conditionCol; i += 1) {
    const cell = row[i]?.trim().toLowerCase();
    if (isConditionValue(cell)) {
      return { condition: cell, shift: layout.conditionCol - i };
    }
  }
  return null;
}

function parseMatrixTierPrices(row: string[], layout: ConditionMatrixLayout, shift: number) {
  return layout.tierCols.map((col) => parsePrice(row[col - shift]));
}

function flushMatrixProduct(
  rows: SheetPriceRow[],
  pending: PendingMatrixProduct | null,
  buyer: { first: string; last: string }
): null {
  if (!pending) return null;

  const mint0 = pending.mintPrices[0];
  if (mint0 === undefined) return null;

  const ding0 = pending.dingPrices[0];
  let dingReduction: number | undefined;
  if (ding0 !== undefined) {
    dingReduction = Math.round((mint0 - ding0) * 100) / 100;
    if (dingReduction <= 0) dingReduction = undefined;
  }

  rows.push({
    productName: pending.productName,
    ndc: pending.ndc,
    referenceCode: pending.referenceCode,
    buyerFirst: buyer.first,
    buyerLast: buyer.last,
    range1Price: mint0,
    range2Price: pending.mintPrices[1],
    range1Label: pending.layout.tierLabels[0],
    range2Label: pending.layout.tierLabels[1],
    dingReduction,
    damagedPrice: pending.damagedPrices[0],
  });

  return null;
}

function parseConditionMatrixSheet(
  table: string[][],
  buyer: { first: string; last: string } = DEFAULT_SHEET_BUYER
): ParsedPastePreview | { error: string } {
  const rows: SheetPriceRow[] = [];
  const columnsUsed = new Set<string>([
    'Product',
    'NDC/NRC',
    'Condition',
    'Expiration tiers',
    'Ding',
    'Damaged',
  ]);

  let layout: ConditionMatrixLayout | null = null;
  let pending: PendingMatrixProduct | null = null;

  for (let i = 0; i < table.length; i += 1) {
    const row = table[i];

    if (isConditionMatrixHeaderRow(row)) {
      pending = flushMatrixProduct(rows, pending, buyer);
      layout = layoutFromConditionMatrixHeader(row);
      continue;
    }

    if (!layout || isMatrixSkipRow(row)) continue;

    const conditionInfo = findConditionInRow(row, layout);
    if (!conditionInfo) continue;
    const { condition, shift } = conditionInfo;

    if (condition === 'mint') {
      pending = flushMatrixProduct(rows, pending, buyer);

      const productCell = row[layout.productCol]?.trim() || '';
      const ndcCell = row[layout.ndcCol]?.trim() || '';
      const { ndc, referenceCode } = resolveMatrixProductIds(productCell, ndcCell);
      const productName = productCell || ndcCell;
      if (!productName) continue;

      const mintPrices = parseMatrixTierPrices(row, layout, shift);
      if (!mintPrices.some((p) => p !== undefined)) continue;

      pending = {
        productName: productCell || productName,
        ndc,
        referenceCode,
        mintPrices,
        dingPrices: layout.tierCols.map(() => undefined),
        damagedPrices: layout.tierCols.map(() => undefined),
        layout,
      };
    } else if (pending && condition === 'ding') {
      pending.dingPrices = parseMatrixTierPrices(row, layout, shift);
    } else if (pending && condition === 'damaged') {
      pending.damagedPrices = parseMatrixTierPrices(row, layout, shift);
      pending = flushMatrixProduct(rows, pending, buyer);
    }
  }

  flushMatrixProduct(rows, pending, buyer);

  if (rows.length === 0) {
    return {
      error:
        'No product price rows found in condition-matrix sheet. Include section headers (NDC/NRC | Condition | …) and Mint/Ding/Damaged rows.',
    };
  }

  return {
    rows,
    format: 'condition_matrix_sheet',
    columnsUsed: [...columnsUsed],
    columnsIgnored: [],
  };
}

type ReferenceSheetLayout = {
  sectionLabel: string;
  productCol: number;
  referenceCol: number;
  priceCols: number[];
  dingCol: number;
  damageCol: number;
  range1Label: string;
  range2Label: string;
  sectionDing?: number;
  sectionNote?: string;
};

function layoutFromReferenceHeader(header: string[]): ReferenceSheetLayout | null {
  const lower = header.map((c) => c.trim().toLowerCase());
  const referenceCol = lower.findIndex((c) => c === 'reference');
  if (referenceCol < 0) return null;

  const priceCols: number[] = [];
  header.forEach((cell, i) => {
    if (i > referenceCol && isDateLabel(cell)) priceCols.push(i);
  });

  const { dingCol, damageCol } = resolveDingDamageCols(lower);
  if (priceCols.length === 0) return null;

  return {
    sectionLabel: header[0]?.trim() || '',
    productCol: 0,
    referenceCol,
    priceCols,
    dingCol,
    damageCol,
    range1Label: header[priceCols[0]]?.trim() || '',
    range2Label: header[priceCols[1]]?.trim() || '',
  };
}

function parseReferencePriceSheet(
  table: string[][],
  buyer: { first: string; last: string } = DEFAULT_SHEET_BUYER
): ParsedPastePreview | { error: string } {
  const rows: SheetPriceRow[] = [];
  const columnsUsed = new Set<string>([
    'Product',
    'Reference',
    'Expiration tier 1',
    'Expiration tier 2',
    'Ding',
    'Acceptable Damage',
  ]);
  const defaultBuyer = buyer;

  let layout: ReferenceSheetLayout | null = null;
  let i = 0;

  while (i < table.length) {
    const row = table[i];

    if (isReferenceHeaderRow(row)) {
      layout = layoutFromReferenceHeader(row);
      i += 1;
      continue;
    }

    if (layout && isPartialDateHeaderRow(row)) {
      const dateIdx = row.findIndex((c) => isDateLabel(c));
      if (dateIdx >= 0) {
        layout.priceCols = [dateIdx];
        layout.range1Label = row[dateIdx]?.trim() || layout.range1Label;
        layout.range2Label = '';
      }
      i += 1;
      continue;
    }

    if (!layout) {
      i += 1;
      continue;
    }

    if (isNoteOnlyRow(row)) {
      i += 1;
      continue;
    }

    const productName = row[layout.productCol]?.trim();
    const referenceCode = row[layout.referenceCol]?.trim();
    if (!productName || !referenceCode || isPriceLike(productName)) {
      i += 1;
      continue;
    }

    if (!rowHasProductPrice(layout.priceCols, row)) {
      i += 1;
      continue;
    }

    const range1Price = layout.priceCols[0] != null ? parsePrice(row[layout.priceCols[0]]) : undefined;
    const range2Price = layout.priceCols[1] != null ? parsePrice(row[layout.priceCols[1]]) : undefined;

    let dingReduction = layout.sectionDing;
    let specialNotes = layout.sectionNote;
    if (layout.dingCol >= 0) {
      const dingCell = row[layout.dingCol]?.trim();
      if (dingCell && !/^n\/a$/i.test(dingCell)) {
        const parsed = parseDingAmount(dingCell);
        if (parsed !== undefined) {
          dingReduction = parsed;
          if (isDingRuleText(dingCell)) layout.sectionDing = parsed;
        } else specialNotes = dingCell;
      }
    }

    const extraTiers: string[] = [];
    for (let pi = 2; pi < layout.priceCols.length; pi += 1) {
      const price = parsePrice(row[layout.priceCols[pi]]);
      if (price !== undefined) extraTiers.push(`Tier ${pi + 1}: $${price.toFixed(2)}`);
    }
    if (extraTiers.length > 0) {
      specialNotes = [specialNotes, ...extraTiers].filter(Boolean).join('; ');
    }

    const damagedPrice =
      layout.damageCol >= 0 ? parsePrice(row[layout.damageCol]) : undefined;

    if (range1Price === undefined && range2Price === undefined) {
      i += 1;
      continue;
    }

    rows.push({
      productName,
      referenceCode,
      buyerFirst: defaultBuyer.first,
      buyerLast: defaultBuyer.last,
      range1Price,
      range2Price,
      range1Label: layout.range1Label || undefined,
      range2Label: layout.range2Label || undefined,
      dingReduction,
      damagedPrice,
      specialNotes,
    });

    i += 1;
  }

  if (rows.length === 0) {
    return {
      error:
        'No product price rows found. Include the header row (REFERENCE / expiration columns) and product lines.',
    };
  }

  return {
    rows,
    format: 'reference_price_sheet',
    columnsUsed: [...columnsUsed],
    columnsIgnored: [],
  };
}

type TierSheetLayout = {
  sectionLabel: string;
  productCol: number;
  priceCols: number[];
  dingCol: number;
  damageCol: number;
  range1Label: string;
  range2Label: string;
  sectionDing?: number;
  sectionNote?: string;
};

function layoutFromTierHeader(header: string[]): TierSheetLayout | null {
  const lower = header.map((c) => c.trim().toLowerCase());
  const priceCols: number[] = [];
  header.forEach((cell, i) => {
    if (i > 0 && isTierPriceLabel(cell)) priceCols.push(i);
  });

  // Vials-style headers: one date column then DING — data rows use that column for tier-2 price
  if (priceCols.length === 1) {
    const nextCol = priceCols[0] + 1;
    if (lower[nextCol]?.includes('ding')) priceCols.push(nextCol);
  }

  if (priceCols.length === 0) return null;

  let { dingCol, damageCol } = resolveDingDamageCols(lower);
  if (priceCols.includes(dingCol)) {
    dingCol = lower.findIndex((c, i) => i > priceCols[priceCols.length - 1] && c.includes('ding'));
  }

  const range2Header = priceCols[1] != null ? header[priceCols[1]]?.trim() || '' : '';
  const range2Label =
    range2Header && lower[priceCols[1]!]?.includes('ding') ? 'Short Dates' : range2Header;

  return {
    sectionLabel: header[0]?.trim() || '',
    productCol: 0,
    priceCols,
    dingCol,
    damageCol,
    range1Label: header[priceCols[0]]?.trim() || '',
    range2Label,
  };
}

function parseTierPriceSheet(
  table: string[][],
  buyer: { first: string; last: string } = DEFAULT_SHEET_BUYER
): ParsedPastePreview | { error: string } {
  const rows: SheetPriceRow[] = [];
  const columnsUsed = new Set<string>([
    'Product',
    'NRC/NDC',
    'Expiration tier 1',
    'Expiration tier 2',
    'Ding',
    'Damaged',
  ]);
  const defaultBuyer = buyer;

  let layout: TierSheetLayout | null = null;
  let i = 0;

  while (i < table.length) {
    const row = table[i];

    if (isTierHeaderRow(row)) {
      layout = layoutFromTierHeader(row);
      i += 1;
      continue;
    }

    if (!layout) {
      i += 1;
      continue;
    }

    if (isTierSkipRow(row, layout)) {
      i += 1;
      continue;
    }

    const rawProduct = row[layout.productCol]?.trim();
    if (!rawProduct || isPriceLike(rawProduct) || isTierHeaderRow(row)) {
      i += 1;
      continue;
    }

    if (!rowHasProductPrice(layout.priceCols, row)) {
      i += 1;
      continue;
    }

    const { productName, ndc: bracketNdc } = extractBracketNdc(rawProduct);
    const pathIds = resolvePathProductIds(productName);
    const ndc = pathIds.ndc || bracketNdc;
    const referenceCode = pathIds.referenceCode;
    const range1Price = layout.priceCols[0] != null ? parsePrice(row[layout.priceCols[0]]) : undefined;
    const range2Price = layout.priceCols[1] != null ? parsePrice(row[layout.priceCols[1]]) : undefined;

    let dingReduction = layout.sectionDing;
    let specialNotes = layout.sectionNote;
    if (layout.dingCol >= 0) {
      const dingCell = row[layout.dingCol]?.trim();
      if (dingCell && !/^n\/a$/i.test(dingCell)) {
        const parsed = parseDingAmount(dingCell);
        if (parsed !== undefined) {
          dingReduction = parsed;
          if (isDingRuleText(dingCell)) layout.sectionDing = parsed;
        } else specialNotes = dingCell;
      }
    }

    const extraTiers: string[] = [];
    for (let pi = 2; pi < layout.priceCols.length; pi += 1) {
      const price = parsePrice(row[layout.priceCols[pi]]);
      if (price !== undefined) extraTiers.push(`Tier ${pi + 1}: $${price.toFixed(2)}`);
    }
    if (extraTiers.length > 0) {
      specialNotes = [specialNotes, ...extraTiers].filter(Boolean).join('; ');
    }

    const damagedPrice = layout.damageCol >= 0 ? parsePrice(row[layout.damageCol]) : undefined;

    if (range1Price === undefined && range2Price === undefined) {
      i += 1;
      continue;
    }

    rows.push({
      productName,
      ndc,
      referenceCode,
      buyerFirst: defaultBuyer.first,
      buyerLast: defaultBuyer.last,
      range1Price,
      range2Price,
      range1Label: layout.range1Label || undefined,
      range2Label: layout.range2Label || undefined,
      dingReduction,
      damagedPrice,
      specialNotes,
    });

    i += 1;
  }

  if (rows.length === 0) {
    return {
      error:
        'No product price rows found. Include section header rows with expiration dates (e.g. OMNIPOD 5 G6 | 12/2026+ | …) and product lines.',
    };
  }

  return {
    rows,
    format: 'tier_price_sheet',
    columnsUsed: [...columnsUsed],
    columnsIgnored: [],
  };
}

function parseBuyerPriceSheet(table: string[][]): ParsedPastePreview | { error: string } {
  const rows: SheetPriceRow[] = [];
  const columnsUsed = new Set<string>(['Product', 'Buyer', 'Mint tier 1', 'Mint tier 2', 'Ding']);

  let layout: BuyerSheetLayout | null = null;
  let lastBuyer = { ...DEFAULT_SHEET_BUYER };
  let i = 0;

  while (i < table.length) {
    const row = table[i];

    if (isHeaderRow(row)) {
      const subHeader = i + 1 < table.length && isLabelRow(table[i + 1]) ? table[i + 1] : undefined;
      layout = layoutFromHeaderRows(row, subHeader);
      if (layout?.buyer.first) lastBuyer = layout.buyer;
      else if (layout) layout.buyer = { ...lastBuyer };
      i += subHeader ? 2 : 1;
      continue;
    }

    if (!layout) {
      i += 1;
      continue;
    }

    if (isLabelRow(row)) {
      i += 1;
      continue;
    }

    const productName = row[layout.productCol]?.trim();
    if (!productName || productName.toLowerCase() === 'product' || isPriceLike(productName)) {
      i += 1;
      continue;
    }

    if (!rowHasProductPrice(layout.mintCols, row)) {
      i += 1;
      continue;
    }

    const range1Price = layout.mintCols[0] != null ? parsePrice(row[layout.mintCols[0]]) : undefined;
    const range2Price = layout.mintCols[1] != null ? parsePrice(row[layout.mintCols[1]]) : undefined;

    let dingReduction = layout.sectionDing;
    let specialNotes = layout.sectionNote;
    if (layout.dingCol >= 0) {
      const dingCell = row[layout.dingCol]?.trim();
      if (dingCell && !/^n\/a$/i.test(dingCell)) {
        const parsed = parseDingAmount(dingCell);
        if (parsed !== undefined) {
          dingReduction = parsed;
          if (isDingRuleText(dingCell)) layout.sectionDing = parsed;
        } else specialNotes = dingCell;
      }
    }

    const extraTiers: string[] = [];
    for (let mi = 2; mi < layout.mintCols.length; mi += 1) {
      const price = parsePrice(row[layout.mintCols[mi]]);
      if (price !== undefined) extraTiers.push(`Tier ${mi + 1}: $${price.toFixed(2)}`);
    }
    if (extraTiers.length > 0) {
      specialNotes = [specialNotes, ...extraTiers].filter(Boolean).join('; ');
    }

    if (range1Price === undefined && range2Price === undefined) {
      i += 1;
      continue;
    }

    rows.push({
      productName,
      buyerFirst: layout.buyer.first || lastBuyer.first,
      buyerLast: layout.buyer.last || lastBuyer.last,
      range1Price,
      range2Price,
      range1Label: layout.range1Label || undefined,
      range2Label: layout.range2Label || undefined,
      dingReduction,
      specialNotes,
    });

    i += 1;
  }

  if (rows.length === 0) {
    return { error: 'No product price rows found. Include the header row (PRODUCT / MINT columns) and product lines.' };
  }

  return {
    rows,
    format: 'buyer_price_sheet',
    columnsUsed: [...columnsUsed],
    columnsIgnored: [],
  };
}

type ColumnKey = 'ndc' | 'productName' | 'buyerFirst' | 'buyerLast' | 'buyer_full' | 'range1Price' | 'range2Price' | 'dingReduction' | 'specialNotes';

const EXACT_HEADER_MAP: Record<string, ColumnKey> = {
  ndc: 'ndc',
  ndc_code: 'ndc',
  product_name: 'productName',
  product: 'productName',
  buyer_name: 'buyer_full',
  buyer: 'buyer_full',
  range1_price: 'range1Price',
  range2_price: 'range2Price',
  ding_reduction: 'dingReduction',
  ding: 'dingReduction',
  special_notes: 'specialNotes',
  notes: 'specialNotes',
};

function fuzzyMapHeader(raw: string): ColumnKey | null {
  const n = normalizeHeader(raw);
  if (EXACT_HEADER_MAP[n]) return EXACT_HEADER_MAP[n];
  if (n.includes('ndc')) return 'ndc';
  if (n.includes('buyer')) return 'buyer_full';
  if (n.includes('product')) return 'productName';
  if (n.includes('range1') || n.includes('mint')) return 'range1Price';
  if (n.includes('range2')) return 'range2Price';
  if (n.includes('ding')) return 'dingReduction';
  return null;
}

function parseNdcTable(table: string[][]): ParsedPastePreview | { error: string } {
  const rawHeaders = table[0];
  const headerKeys = rawHeaders.map(fuzzyMapHeader);
  const ndcIdx = headerKeys.findIndex((k) => k === 'ndc');

  if (ndcIdx < 0) {
    return { error: 'Could not find an NDC column. For buyer price sheets, include the PRODUCT / MINT header rows.' };
  }

  const colIndex: Partial<Record<ColumnKey, number>> = {};
  const columnsUsed = new Set<string>();
  const columnsIgnored: string[] = [];

  rawHeaders.forEach((raw, i) => {
    const key = headerKeys[i];
    if (key) {
      colIndex[key] = i;
      columnsUsed.add(raw.trim());
    } else if (raw.trim()) {
      columnsIgnored.push(raw.trim());
    }
  });

  if (!colIndex.buyer_full && colIndex.buyerFirst == null) {
    return { error: 'Could not find a buyer column (e.g. "buyer_name").' };
  }

  const rows: SheetPriceRow[] = [];
  for (const line of table.slice(1)) {
    const ndcRaw = line[ndcIdx]?.trim();
    if (!ndcRaw || !/\d/.test(ndcRaw)) continue;

    let buyerFirst = colIndex.buyerFirst != null ? line[colIndex.buyerFirst]?.trim() || '' : '';
    let buyerLast = colIndex.buyerLast != null ? line[colIndex.buyerLast]?.trim() || '' : '';
    if (!buyerFirst && colIndex.buyer_full != null) {
      const split = splitBuyerName(line[colIndex.buyer_full] || '');
      buyerFirst = split.first;
      buyerLast = split.last;
    }
    if (!buyerFirst) continue;

    rows.push({
      ndc: ndcRaw,
      productName: colIndex.productName != null ? line[colIndex.productName]?.trim() || ndcRaw : ndcRaw,
      buyerFirst,
      buyerLast,
      range1Price: colIndex.range1Price != null ? parsePrice(line[colIndex.range1Price]) : undefined,
      range2Price: colIndex.range2Price != null ? parsePrice(line[colIndex.range2Price]) : undefined,
      dingReduction: colIndex.dingReduction != null ? parseDingAmount(line[colIndex.dingReduction]) : undefined,
      specialNotes: colIndex.specialNotes != null ? line[colIndex.specialNotes]?.trim() : undefined,
    });
  }

  if (rows.length === 0) return { error: 'No usable price rows found in NDC table.' };

  return { rows, format: 'ndc_table', columnsUsed: [...columnsUsed], columnsIgnored };
}

function inferBuyerFromTableFormat(
  table: string[][],
  textBuyer: { first: string; last: string }
): { first: string; last: string } {
  if (textBuyer.first !== DEFAULT_SHEET_BUYER.first || textBuyer.last !== DEFAULT_SHEET_BUYER.last) {
    return textBuyer;
  }
  if (detectCatalogPriceListSheet(table)) {
    return { first: 'Northeast', last: 'Medical Exchange' };
  }
  if (detectVendorPricelistSheet(table)) {
    return { first: 'Chris', last: 'Sampson' };
  }
  return textBuyer;
}

/** Extract catalog-relevant fields from pasted spreadsheet data. */
export function parsePastedPriceData(text: string): ParsedPastePreview | { error: string } {
  const table = parsePastedTable(text);
  if (table.length < 2) {
    return { error: 'Paste at least a header row and one product row from your spreadsheet.' };
  }

  const buyer = inferBuyerFromTableFormat(table, detectBuyerFromPaste(text));

  if (detectConditionMatrixSheet(table)) {
    return parseConditionMatrixSheet(table, buyer);
  }

  if (detectReferencePriceSheet(table)) {
    return parseReferencePriceSheet(table, buyer);
  }

  if (detectTierPriceSheet(table)) {
    return parseTierPriceSheet(table, buyer);
  }

  if (detectCatalogPriceListSheet(table)) {
    return parseCatalogPriceListSheet(table, buyer);
  }

  if (detectVendorPricelistSheet(table)) {
    return parseVendorPricelistSheet(table, buyer);
  }

  if (detectBuyerPriceSheet(table)) {
    return parseBuyerPriceSheet(table);
  }

  return parseNdcTable(table);
}

function referenceTokens(referenceCode: string) {
  return referenceCode
    .replace(/[()]/g, ' ')
    .toUpperCase()
    .split(/[\s&\/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 || /^\d{3}$/.test(t) || /^[A-Z]$/.test(t));
}

function referenceMatchesToken(token: string, ndcCode: string) {
  const ndc = (ndcCode || '').toUpperCase();
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const ndcPattern = new RegExp(`(?:^|[\\s(-])${escaped}(?:$|[\\s)-])`);
  return ndcPattern.test(ndc);
}

function referenceMatchesCode(referenceCode: string, ndcCode: string) {
  const tokens = referenceTokens(referenceCode);
  if (tokens.length === 0) return false;
  return tokens.every((token) => referenceMatchesToken(token, ndcCode));
}

function findProductByReference(categories: any[], productName: string, referenceCode: string): any | null {
  const candidates: any[] = [];
  for (const cat of categories) {
    for (const sub of cat.subCategories || []) {
      for (const product of sub.products || []) {
        if (referenceMatchesCode(referenceCode, product.ndcCode || '')) {
          candidates.push(product);
        }
      }
    }
  }
  if (candidates.length === 0) return null;
  const byName = candidates.filter((p) => productNamesMatch(productName, p.name || ''));
  if (byName.length === 1) return byName[0];
  if (byName.length > 1) return byName[0];
  if (candidates.length === 1) return candidates[0];
  return null;
}

function normalizeProductKey(name: string) {
  return name
    .toLowerCase()
    .replace(/freetyle/g, 'freestyle')
    .replace(/freestlye/g, 'freestyle')
    .replace(/\bone touch delica lancet\b/g, 'delica')
    .replace(/\bfreestyle lancet\b/g, 'freestyle')
    .replace(/\baccu-?chek\b/g, '')
    .replace(/\bmicrolets\b/g, 'microlet')
    .replace(/trasnmitter/g, 'transmitter')
    .replace(/\bmo\b/g, 'mail order')
    .replace(/\bmail order\b/g, 'mo')
    .replace(/\bdme\b/g, 'dme')
    .replace(/\bretail\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function lancetNamesMatch(sheetName: string, catalogName: string) {
  const s = normalizeProductKey(sheetName);
  const c = normalizeProductKey(catalogName);
  if (s.includes('freestyle') && c.includes('freestyle')) return true;
  if (s.includes('delica') && c.includes('delica')) {
    const sg = extractGauge(s);
    const cg = extractGauge(c);
    if (sg && cg) return sg === cg;
    return true;
  }
  if (s.includes('fastclix') && c.includes('fastclix')) return true;
  if (s.includes('softclix') && c.includes('softclix')) return true;
  if (s.includes('microlet') && c.includes('microlet')) return true;
  return false;
}

function extractGauge(key: string) {
  const m = key.match(/\b(\d{2})g\b/);
  return m ? m[1] : null;
}

function insulinVialNamesMatch(sheetName: string, catalogName: string) {
  const s = normalizeProductKey(sheetName.replace(/\bvials\b/g, 'vial'));
  const c = normalizeProductKey(catalogName);

  if (s.includes('humulin') && c.includes('humulin')) {
    if (!c.includes('vial')) return false;
    if (s.includes('70 30') || s.includes('7030')) return c.includes('7030');
    if (/\bn\b/.test(s)) return c.includes(' n ');
    if (/\br\b/.test(s)) return c.includes(' r ');
  }

  if (s.includes('novolin') && c.includes('novolin')) return true;

  return false;
}

function productNamesMatch(sheetName: string, catalogName: string) {
  const s = normalizeProductKey(sheetName);
  const c = normalizeProductKey(catalogName);
  if (!s || !c) return false;

  const sheetIsReader = s.includes('reader') || s.includes('meter');
  const catalogIsReader = c.includes('reader') || c.includes('meter');
  if (sheetIsReader !== catalogIsReader) return false;

  if (s.includes('bd needle') || s.includes('bd needles')) {
    return c.includes('bd') && c.includes('needle');
  }

  if (lancetNamesMatch(sheetName, catalogName)) return true;

  if (insulinVialNamesMatch(sheetName, catalogName)) return true;

  const sNorm = normalizeProductKey(sheetName);
  const cNorm = normalizeProductKey(catalogName);
  if (/\bomnipod 5\b/.test(sNorm) && /\bomnipod 5\b/.test(cNorm)) {
    if (/g6.*g7|g7.*g6/.test(sNorm) && cNorm.includes('purple')) return true;
    if (/starter/.test(sNorm) && /starter/.test(cNorm)) return true;
  }
  if (/\blibre 3\b/.test(sNorm) && /\blibre 3\b/.test(cNorm) && !sheetIsReader && !catalogIsReader) {
    if (/plus/.test(sNorm) === /plus/.test(cNorm)) return true;
  }

  if (c.includes(s) || s.includes(c)) return true;

  const stop = new Set(['ct', '100', '50', '25', '10', '5', '1', 'g6', '6', 'pack', '14', 'day', 'nfr', 'lancet', 'needles', 'needle']);
  const sTokens = s.split(' ').filter((t) => t.length > 1 && !stop.has(t));
  if (sTokens.length === 0) return false;

  const matched = sTokens.filter((t) => c.includes(t)).length;
  return matched >= Math.max(2, Math.ceil(sTokens.length * 0.6));
}

function buyerMatchesFuzzy(
  sheetFirst: string,
  sheetLast: string,
  buyer: { firstName?: string; lastName?: string }
) {
  const a = `${sheetFirst}${sheetLast}`.replace(/[^a-z0-9]/gi, '').toLowerCase();
  const b = `${buyer.firstName || ''}${buyer.lastName || ''}`.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (!a || !b) return false;
  if (a === b || b.includes(a) || a.includes(b)) return true;
  if (a.includes('maxmed') && b.includes('maxmed')) return true;
  if (a.includes('northeast') && b.includes('northeast')) return true;
  const fullA = `${sheetFirst} ${sheetLast}`.trim().toLowerCase();
  const fullB = `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim().toLowerCase();
  return fullA === fullB;
}

function findProduct(categories: any[], row: SheetPriceRow): any | null {
  if (row.ndc) {
    const key = normalizeNdc(row.ndc);
    for (const cat of categories) {
      for (const sub of cat.subCategories || []) {
        for (const product of sub.products || []) {
          const productKey = normalizeNdc(product.ndcCode || '');
          if (productKey === key || productKey.includes(key) || key.includes(productKey)) return product;
        }
      }
    }
  }

  if (row.referenceCode) {
    return findProductByReference(categories, row.productName, row.referenceCode);
  }

  for (const cat of categories) {
    for (const sub of cat.subCategories || []) {
      for (const product of sub.products || []) {
        if (productNamesMatch(row.productName, product.name || '')) return product;
      }
    }
  }

  return null;
}

function ensureBuyerPrice(product: any, row: SheetPriceRow) {
  const existing = (product.buyerPrices || []).find((bp: any) =>
    buyerMatchesFuzzy(row.buyerFirst, row.buyerLast, bp.buyer || {})
  );
  if (existing) return existing;

  if (!product.buyerPrices) product.buyerPrices = [];
  const slug = `${row.buyerFirst}-${row.buyerLast}`.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  const created = {
    id: `bp-${product.id}-${slug}`,
    buyer: {
      firstName: row.buyerFirst,
      lastName: row.buyerLast,
      isPreferred: false,
    },
    expirationRange1Price: row.range1Price ?? 0,
    expirationRange1Label: row.range1Label || 'Range 1',
    expirationRange2Price: row.range2Price ?? null,
    expirationRange2Label: row.range2Label || 'Range 2',
    dingReductionPrice: row.dingReduction ?? null,
    damagedPrice: row.damagedPrice ?? null,
  };
  product.buyerPrices.push(created);
  return created;
}

/** Merge extracted rows into the in-browser category tree. */
export function applySheetPricesToCategories(categories: any[], rows: SheetPriceRow[]) {
  const next = JSON.parse(JSON.stringify(categories)) as any[];
  let updated = 0;
  let unmatched = 0;
  let buyerCreated = 0;

  for (const row of rows) {
    const matchedProduct = findProduct(next, row);

    if (!matchedProduct) {
      unmatched += 1;
      continue;
    }

    const hadBuyer = (matchedProduct.buyerPrices || []).some((bp: any) =>
      buyerMatchesFuzzy(row.buyerFirst, row.buyerLast, bp.buyer || {})
    );
    const buyerPrice = ensureBuyerPrice(matchedProduct, row);
    if (!hadBuyer) buyerCreated += 1;

    if (row.range1Price !== undefined) buyerPrice.expirationRange1Price = row.range1Price;
    if (row.range2Price !== undefined) buyerPrice.expirationRange2Price = row.range2Price;
    if (row.range1Label) buyerPrice.expirationRange1Label = row.range1Label;
    if (row.range2Label) buyerPrice.expirationRange2Label = row.range2Label;
    if (row.dingReduction !== undefined) buyerPrice.dingReductionPrice = row.dingReduction;
    if (row.damagedPrice !== undefined) buyerPrice.damagedPrice = row.damagedPrice;
    if (row.specialNotes) matchedProduct.specialNotes = row.specialNotes;
    updated += 1;
  }

  return { categories: next, updated, unmatched };
}

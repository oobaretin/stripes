import { useState } from 'react';
import { Check, ClipboardPaste, Sheet } from 'lucide-react';
import {
  applySheetPricesToCategories,
  parsePastedPriceData,
} from '../lib/sheetImport';
import { flattenProductsFromCategories } from '../lib/localData';
import { SEED_CATEGORIES } from '../lib/seedCategoriesData';

type ProductsSheetPanelProps = {
  categories: any[];
  onImportComplete: (nextCategories: any[], summary: string) => void;
  onError: (message: string) => void;
};

export default function ProductsSheetPanel({
  categories,
  onImportComplete,
  onError,
}: ProductsSheetPanelProps) {
  const [pasteText, setPasteText] = useState('');
  const [pending, setPending] = useState<{
    categories: any[];
    summary: string;
    rowCount: number;
    updateCount: number;
    skipped: number;
    columnsUsed: string[];
    columnsIgnored: string[];
  } | null>(null);

  const handleExtract = () => {
    setPending(null);
    const parsed = parsePastedPriceData(pasteText);
    if ('error' in parsed) {
      onError(parsed.error);
      return;
    }

    const buyerLabel =
      parsed.rows[0]?.buyerFirst && parsed.rows[0]?.buyerLast
        ? `${parsed.rows[0].buyerFirst} ${parsed.rows[0].buyerLast}`
        : 'Max Med Distributors';

    let merged = applySheetPricesToCategories(categories, parsed.rows);
    let usedSeedFallback = false;

    if (merged.updated === 0 && parsed.rows.length > 0) {
      const seedMerged = applySheetPricesToCategories(
        JSON.parse(JSON.stringify(SEED_CATEGORIES)),
        parsed.rows
      );
      if (seedMerged.updated > 0) {
        merged = seedMerged;
        usedSeedFallback = true;
      }
    }

    const catalogProductCount = flattenProductsFromCategories(categories).length;

    if (merged.updated === 0) {
      onError(
        `Parsed ${parsed.rows.length} row${parsed.rows.length === 1 ? '' : 's'} for ${buyerLabel} (${parsed.format}) but none matched your catalog (${catalogProductCount} products). Open the gear icon → Load default catalog, then import again.`
      );
      return;
    }

    const summary =
      `Extracted ${parsed.rows.length} row${parsed.rows.length === 1 ? '' : 's'} for ${buyerLabel} — ` +
      `${merged.updated} price update${merged.updated === 1 ? '' : 's'} ready` +
      (merged.unmatched > 0 ? ` (${merged.unmatched} skipped).` : '.') +
      (usedSeedFallback
        ? ' Your saved catalog had no matches — preview uses the default catalog (Apply will save it).'
        : '');

    setPending({
      categories: merged.categories,
      summary,
      rowCount: parsed.rows.length,
      updateCount: merged.updated,
      skipped: merged.unmatched,
      columnsUsed: parsed.columnsUsed,
      columnsIgnored: parsed.columnsIgnored,
    });
  };

  const handleApply = () => {
    if (!pending) return;
    onImportComplete(pending.categories, pending.summary);
    setPending(null);
    setPasteText('');
  };

  return (
    <div className="mb-6 card">
      <div className="card-body space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
            <Sheet className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-slate-900">Import from spreadsheet</h3>
            <p className="mt-1 text-sm text-slate-600">
              Paste a buyer price sheet (Max Med, Prestige Medical Supply, etc.). Include header rows — Striply detects
              the buyer from contact info when present and maps products to update that buyer&apos;s prices in your
              catalog.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="products-sheet-paste" className="label-field">
            Paste spreadsheet data
          </label>
          <textarea
            id="products-sheet-paste"
            value={pasteText}
            onChange={(e) => {
              setPasteText(e.target.value);
              setPending(null);
            }}
            rows={8}
            placeholder={`Paste from Google Sheets — include header rows.\n\nBuyer price sheet (MaxMed style):\nmaxmed\tPRODUCT\tMINT\tMINT\t...\n\t4/2027+\t3/2027-12/2026\t...\nAccu-Chek Aviva plus 100\t$60.00\t$50.00\t...`}
            className="input-field font-mono text-xs leading-relaxed"
          />
          <p className="mt-2 text-xs text-slate-500">
            Tip: copy the whole block from Google Sheets (headers + products). Formats include MaxMed PRODUCT/MINT
            sheets, REFERENCE/tier date columns, month-tier section sheets (PATH Medical), Prestige-style
            NDC/NRC + Condition matrices, First Class Med vendor pricelists (9mo+ / DINGS), and Northeast
            catalog price lists (Mint 7/27+ / Ding reduction). Buyer is inferred from email/domain when present.
          </p>
        </div>

        {pending && (
          <div className="rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-950">
            <p className="font-medium">Extracted — ready to apply</p>
            <p className="mt-1">
              {pending.rowCount} row{pending.rowCount === 1 ? '' : 's'} parsed → {pending.updateCount} catalog update
              {pending.updateCount === 1 ? '' : 's'}
              {pending.skipped > 0 ? ` (${pending.skipped} skipped — NDC or buyer not found)` : ''}.
            </p>
            <p className="mt-2 text-xs text-primary-800">
              Using: {pending.columnsUsed.join(', ')}
              {pending.columnsIgnored.length > 0
                ? `. Ignored: ${pending.columnsIgnored.slice(0, 6).join(', ')}${pending.columnsIgnored.length > 6 ? '…' : ''}`
                : ''}
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleExtract}
            disabled={!pasteText.trim()}
            className="btn-secondary disabled:opacity-50"
          >
            <ClipboardPaste className="mr-2 h-4 w-4" />
            Extract prices
          </button>
          {pending && (
            <button type="button" onClick={handleApply} className="btn-primary">
              <Check className="mr-2 h-4 w-4" />
              Apply to catalog
            </button>
          )}
          {pasteText && (
            <button
              type="button"
              onClick={() => {
                setPasteText('');
                setPending(null);
              }}
              className="btn-secondary"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

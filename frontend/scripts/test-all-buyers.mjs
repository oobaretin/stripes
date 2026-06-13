import { readFileSync } from 'fs';
import { parsePastedPriceData, applySheetPricesToCategories } from '../src/lib/sheetImport.ts';
import { SEED_CATEGORIES } from '../src/lib/seedCategoriesData.ts';

const cats = () => JSON.parse(JSON.stringify(SEED_CATEGORIES));

function test(name, text) {
  const parsed = parsePastedPriceData(text);
  if ('error' in parsed) {
    return { name, ok: false, error: parsed.error };
  }
  const merged = applySheetPricesToCategories(cats(), parsed.rows);
  const buyer = `${parsed.rows[0]?.buyerFirst || ''} ${parsed.rows[0]?.buyerLast || ''}`.trim();
  return {
    name,
    ok: parsed.rows.length > 0 && merged.updated > 0,
    format: parsed.format,
    buyer,
    parsed: parsed.rows.length,
    updated: merged.updated,
    unmatched: merged.unmatched,
  };
}

const samples = {
  'Northeast Medical Exchange': readFileSync('tmp-northeast-full.txt', 'utf8'),
  'Ralphel Walton (Prestige)': `prestigemedicalsupply.net\n${readFileSync('tmp-prestige-sample.txt', 'utf8')}`,
  'Max Med Distributors (PRODUCT/MINT)': `maxmed\tPRODUCT\tMINT\tMINT\tMINT\tExpires\tDING\t\tAcceptable Damage
\t4/2027+\t3/2027-12/2026\t11/2026\tMinor Damage ok\tFor dinged teststrips, we take -3$ off the mint price\t\tN/A
Accu-Chek Aviva plus 100\t$60.00\t$50.00\t$40.00\t$25.00\t\t\tN/A
Accu-Chek Guide 100\t$25.00\t$20.00\t$15.00\t$8.00\t\t\tN/A
One Touch Ultra 100\t$40.00\tN/A\t\t\t\t\tN/A`,
  'Max Med (REFERENCE/G6)': `G6\tREFERENCE\t12/2026+\t11/2026\t10/2026\t9/2026\tDing\tAcceptable Damage
DEXCOM SENSOR 3 PACK \tOE \t$250.00\t$240.00\t$200.00\t$150.00\tFor dinged Dexcom G6, we take off -10$ from mint price\t$150.00
DEXCOM SENSOR 3 PACK \tOR\t$240.00\t$220.00\t$200.00\t$150.00\t\t$150.00
DEXCOM TRASNMITTER KIT\tOE \t$125.00\tN/A\tN/A\tN/A\tFor dinged transmitters, we take off -10$ from mint price\t$50.00`,
  'PATH MEDICAL SUPPLY': `299 W CAMINO GARDENS BLVD\t\t\t\tPURCHASING EMAIL\t\tsheldon@pathmedicalsupply.com
DEXCOM\t7+ MONTHS\t6 MONTHS\t5 MONTHS\tWHEN INVOICING US
DEXCOM G6 3 PACK OE\t$220.00\t$220.00\t$210.00
DEXCOM G7 012/018\t$77.00\t$77.00\t$65.00
LIBRE\t3+ MONTHS\t2 MONTHS\t1 MONTH
LIBRE 3 SENSOR\t$60.00\t$35.00\task
OMNIPOD\t7+ MONTHS\t6 MONTHS\t5 MONTHS
OMNIPOD 5 (5 PACK) G6/G7\t$220.00\t$220.00\t$180.00
TEST STRIPS\t9+ MONTHS\t7-8 MONTHS\t6 MONTHS
FREESTYLE LITE 100\t$40.00\t$40.00\t$38.00`,
  'Chris Sampson (First Class Med)': `Contact Email:\tChris@firstclassmedsupply.com
Vendor Pricelist
Test Strip Brands
\t9mo+\t7-8mo\t6mo\tDamaged 6mo+\tDINGS for (6mo+)
OneTouch Ultra- 50 Ct.\tAsk\tN/A\tN/A\tN/A\t-$3
Contour Next (7312)- 100 Ct.\t$34\t$31\t$29\t$18\t-$3
Aviva- 100 Ct.\t$64\t$59\t$57\t$30\t-$3
FS Libre 3 Sensors\t$62\t$62\t$62\t$62\t$61
CGM Supplies
G7 1 Pk (STP-AT-012)\t$80\t$80\t$80\tAsk\t-$5`,
};

const results = Object.entries(samples).map(([name, text]) => test(name, text));
console.log(JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.ok);
process.exit(failed.length > 0 ? 1 : 0);

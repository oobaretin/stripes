import { useState } from 'react';
import { ChevronDown, ChevronRight, Truck } from 'lucide-react';
import {
  SHIPPING_PROFILES,
  SHIPPING_SUPPLY_CATALOG,
  SHIPPING_SUPPLY_GROUPS,
} from '../lib/shippingSuppliesData';
import ProductShippingGuide from './ProductShippingGuide';

export default function ShippingSuppliesPanel() {
  const [open, setOpen] = useState(true);
  const [profileTab, setProfileTab] = useState('test-strips');

  const catalogById = Object.fromEntries(SHIPPING_SUPPLY_CATALOG.map((s) => [s.id, s]));

  return (
    <section className="card mb-6">
      <div className="card-body">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-start gap-3 text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <Truck className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Shipping supplies guide</h3>
              {open ? (
                <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
              ) : (
                <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden />
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Uline-style insulated mailers, kits, and cold packs mapped to product types. Northeast Medical lists
              Insulated Mailers, Insulated Shipping Kits, and Moisture-Resistant Cold Packs for insulin — use the tier
              tabs for small, medium, and large outbound shipments.
            </p>
          </div>
        </button>

        {open && (
          <div className="mt-5 space-y-6 border-t border-slate-100 pt-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supply categories</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {SHIPPING_SUPPLY_GROUPS.map((group) => (
                  <div key={group.title} className="rounded-lg border border-slate-200 bg-slate-50/50 p-3">
                    <p className="text-xs font-semibold text-slate-800">{group.title}</p>
                    <ul className="mt-2 space-y-1.5">
                      {group.ids.map((id) => {
                        const item = catalogById[id];
                        if (!item) return null;
                        return (
                          <li key={id} className="text-xs text-slate-600">
                            <span className="font-medium text-slate-800">{item.name}</span>
                            <span className="text-slate-400"> · {item.purpose}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">By product type</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.values(SHIPPING_PROFILES).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setProfileTab(p.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      profileTab === p.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <ProductShippingGuide profileId={profileTab} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

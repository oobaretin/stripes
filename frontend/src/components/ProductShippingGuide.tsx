import { useState } from 'react';
import { Package, Snowflake, Shield, ThermometerSun } from 'lucide-react';
import { getShippingProfile, shippingBadgeClass } from '../lib/productShipping';
import { getShippingSupplies, type ShipQuantityTier } from '../lib/shippingSuppliesData';

type ProductShippingGuideProps = {
  profileId: string;
  compact?: boolean;
};

const TIER_ORDER: ShipQuantityTier[] = ['small', 'medium', 'large'];

const badgeIcon = (badge: string) => {
  if (badge === 'Cold chain') return Snowflake;
  if (badge === 'Protected') return Shield;
  return ThermometerSun;
};

export default function ProductShippingGuide({ profileId, compact = false }: ProductShippingGuideProps) {
  const profile = getShippingProfile(profileId);
  const [tier, setTier] = useState<ShipQuantityTier>('small');
  const plan = profile.tiers.find((t) => t.tier === tier) ?? profile.tiers[0];
  const supplies = getShippingSupplies(plan.supplyIds);
  const BadgeIcon = badgeIcon(profile.badge);

  if (compact) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ring-inset ${shippingBadgeClass(profile.badge)}`}
          >
            <BadgeIcon className="h-3 w-3" aria-hidden />
            {profile.badge}
          </span>
          <span className="text-xs font-medium text-slate-800">{profile.label}</span>
        </div>
        <p className="mt-2 text-xs text-slate-600">{plan.quantityHint}: {supplies.map((s) => s.name).join(', ')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
              <Package className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Outbound shipping — {profile.label}</p>
              <p className="mt-0.5 text-xs text-slate-600">{profile.summary}</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${shippingBadgeClass(profile.badge)}`}
          >
            <BadgeIcon className="h-3.5 w-3.5" aria-hidden />
            {profile.badge}
          </span>
        </div>
        {profile.buyerReference && (
          <p className="mt-2 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-900">{profile.buyerReference}</p>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-100 px-4 pt-3">
        {TIER_ORDER.map((t) => {
          const p = profile.tiers.find((x) => x.tier === t);
          if (!p) return null;
          const active = tier === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded-t-lg px-3 py-2 text-xs font-medium transition-colors ${
                active
                  ? 'border border-b-white border-slate-200 bg-white text-primary-800 -mb-px'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.label}
              <span className="mt-0.5 block text-[10px] font-normal text-slate-500">{p.quantityHint}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-3 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supplies (Uline-style)</p>
          <ul className="mt-2 space-y-2">
            {supplies.map((s) => (
              <li key={s.id} className="flex gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" aria-hidden />
                <div>
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="text-slate-500"> — {s.ulineCategory}</span>
                  <p className="text-xs text-slate-600">{s.purpose}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Packing steps</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-700">
            {plan.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/** Uline-style insulated shipping supplies referenced by buyer price sheets (e.g. Northeast Medical). */

export type ShipQuantityTier = 'small' | 'medium' | 'large';

export type ShippingSupplyItem = {
  id: string;
  name: string;
  ulineCategory: string;
  purpose: string;
};

export type ShippingTierPlan = {
  tier: ShipQuantityTier;
  label: string;
  quantityHint: string;
  supplyIds: string[];
  steps: string[];
};

export type ShippingProfile = {
  id: string;
  label: string;
  badge: 'Ambient' | 'Protected' | 'Cold chain';
  summary: string;
  buyerReference?: string;
  tiers: ShippingTierPlan[];
};

export const SHIPPING_SUPPLY_CATALOG: ShippingSupplyItem[] = [
  {
    id: 'bubble-mailers',
    name: 'Padded / Bubble Mailers',
    ulineCategory: 'Boxes & Mailers',
    purpose: 'Small ambient shipments (strips, lancets)',
  },
  {
    id: 'corrugated-box',
    name: 'Corrugated Shipping Box',
    ulineCategory: 'Boxes, Corrugated',
    purpose: 'Medium and large consolidated outbound boxes',
  },
  {
    id: 'void-fill',
    name: 'Bubble Wrap / Void Fill',
    ulineCategory: 'Packaging Supplies',
    purpose: 'Cushion CGM pods, meters, and vials in transit',
  },
  {
    id: 'insulated-mailers',
    name: 'Insulated Mailers',
    ulineCategory: 'Insulated Shipping Mailers and Liners',
    purpose: 'Lightweight insulated outbound mailers',
  },
  {
    id: 'cool-shield-mailers',
    name: 'Cool Shield Bubble Mailers',
    ulineCategory: 'Insulated Shipping Mailers and Liners',
    purpose: 'Reflective mailers for temperature-sensitive sensors',
  },
  {
    id: 'insulated-box-liners',
    name: 'Insulated Box Liners',
    ulineCategory: 'Insulated Shipping Mailers and Liners',
    purpose: 'Line corrugated boxes for stable temps',
  },
  {
    id: 'insulated-shipping-kits',
    name: 'Insulated Shipping Kits',
    ulineCategory: 'Insulated Shippers and Supplies',
    purpose: 'Pre-assembled foam container kits (Northeast recommended)',
  },
  {
    id: 'insulated-foam-containers',
    name: 'Insulated Foam Containers',
    ulineCategory: 'Insulated Shippers and Supplies',
    purpose: 'Reusable foam shippers for larger cold-chain loads',
  },
  {
    id: 'moisture-cold-packs',
    name: 'Moisture-Resistant Cold Packs',
    ulineCategory: 'Cold Packs',
    purpose: 'Gel packs that resist condensation (Northeast recommended)',
  },
  {
    id: 'single-use-cold-packs',
    name: 'Single-Use Cold Packs',
    ulineCategory: 'Cold Packs',
    purpose: 'One-way refrigerant for overnight insulin',
  },
  {
    id: 'cold-bricks',
    name: 'Cold Bricks',
    ulineCategory: 'Cold Packs',
    purpose: 'Rigid refrigerant blocks for extended cold hold',
  },
  {
    id: 'thermal-bags',
    name: 'Thermal Bags',
    ulineCategory: 'Insulated Shipping Mailers and Liners',
    purpose: 'Wrap vials or sensors inside an insulated kit',
  },
];

const catalogById = Object.fromEntries(SHIPPING_SUPPLY_CATALOG.map((s) => [s.id, s]));

export function getShippingSupplies(ids: string[]): ShippingSupplyItem[] {
  return ids.map((id) => catalogById[id]).filter(Boolean);
}

export const SHIPPING_PROFILES: Record<string, ShippingProfile> = {
  'test-strips': {
    id: 'test-strips',
    label: 'Test strips',
    badge: 'Ambient',
    summary: 'Keep boxes sealed with lot and expiration visible. No cold chain required.',
    tiers: [
      {
        tier: 'small',
        label: 'Small',
        quantityHint: '1–5 boxes',
        supplyIds: ['bubble-mailers', 'void-fill'],
        steps: [
          'Use a padded mailer sized to the strip cartons.',
          'Wrap cartons in bubble wrap; avoid crushing corners.',
          'Include invoice inside the mailer.',
        ],
      },
      {
        tier: 'medium',
        label: 'Medium',
        quantityHint: '6–20 boxes',
        supplyIds: ['corrugated-box', 'void-fill'],
        steps: [
          'Pack in a small–medium corrugated box with void fill between layers.',
          'Keep lot numbers and expiration dates facing up and readable.',
          'Tape all seams; double-box if cartons are dinged.',
        ],
      },
      {
        tier: 'large',
        label: 'Large',
        quantityHint: '21+ boxes',
        supplyIds: ['corrugated-box', 'void-fill'],
        steps: [
          'Use a large corrugated box or split into two medium shipments.',
          'Layer strips flat with padding between tiers; do not overload weight.',
          'Attach packing list on top before sealing.',
        ],
      },
    ],
  },
  lancets: {
    id: 'lancets',
    label: 'Lancets',
    badge: 'Ambient',
    summary: 'Must be mint condition when buyer requires it. Ambient mailer is sufficient.',
    tiers: [
      {
        tier: 'small',
        label: 'Small',
        quantityHint: '1–10 devices',
        supplyIds: ['bubble-mailers', 'void-fill'],
        steps: ['Pad lancet devices in a bubble mailer.', 'Include invoice.'],
      },
      {
        tier: 'medium',
        label: 'Medium',
        quantityHint: '11–30 devices',
        supplyIds: ['corrugated-box', 'void-fill'],
        steps: ['Pack in corrugated box with dividers or extra padding.', 'Prevent puncture from lancet caps.'],
      },
      {
        tier: 'large',
        label: 'Large',
        quantityHint: '31+ devices',
        supplyIds: ['corrugated-box', 'void-fill'],
        steps: ['Use a medium/large box with layered padding.', 'Split shipment if weight exceeds carrier limits.'],
      },
    ],
  },
  'cgm-devices': {
    id: 'cgm-devices',
    label: 'CGM & pumps',
    badge: 'Protected',
    summary: 'Protect sensors and pods from crush damage. Use insulated supplies in hot weather.',
    buyerReference: 'Northeast lists Insulated Mailers and Insulated Shipping Kits for cold-chain questions.',
    tiers: [
      {
        tier: 'small',
        label: 'Small',
        quantityHint: '1–3 sensors / pods',
        supplyIds: ['cool-shield-mailers', 'void-fill', 'insulated-mailers'],
        steps: [
          'Prefer Cool Shield or insulated mailer over plain bubble mailer.',
          'Wrap each sensor/pod individually before placing in mailer.',
          'Ship within buyer dating windows on the price list.',
        ],
      },
      {
        tier: 'medium',
        label: 'Medium',
        quantityHint: '4–12 sensors / pods',
        supplyIds: ['corrugated-box', 'insulated-box-liners', 'void-fill', 'insulated-shipping-kits'],
        steps: [
          'Line a corrugated box with an insulated liner or use a small insulated kit.',
          'Separate Omnipod/Libre/Dexcom SKUs with padding between layers.',
          'Include invoice and reference NDC/REF codes on the packing list.',
        ],
      },
      {
        tier: 'large',
        label: 'Large',
        quantityHint: '13+ sensors / pods',
        supplyIds: ['insulated-shipping-kits', 'insulated-foam-containers', 'void-fill'],
        steps: [
          'Use an insulated shipping kit or foam container for consolidated CGM shipments.',
          'Do not mix expired or short-dated stock with mint tiers.',
          'Consider splitting by product family to simplify buyer receiving.',
        ],
      },
    ],
  },
  insulin: {
    id: 'insulin',
    label: 'Insulin vials',
    badge: 'Cold chain',
    summary: 'Overnight only. Insulated container + ice packs required (buyer policy).',
    buyerReference:
      'Northeast: Insulated Mailers, Insulated Shipping Kits, Moisture-Resistant Cold Packs — overnight with ice.',
    tiers: [
      {
        tier: 'small',
        label: 'Small',
        quantityHint: '1–3 vials',
        supplyIds: ['insulated-mailers', 'moisture-cold-packs', 'thermal-bags', 'single-use-cold-packs'],
        steps: [
          'Double-bag vials in a thermal bag inside an insulated mailer.',
          'Add moisture-resistant cold packs (frozen, not leaking).',
          'Ship overnight; label perishable / keep refrigerated.',
        ],
      },
      {
        tier: 'medium',
        label: 'Medium',
        quantityHint: '4–10 vials',
        supplyIds: ['insulated-shipping-kits', 'moisture-cold-packs', 'cold-bricks', 'thermal-bags'],
        steps: [
          'Use an insulated shipping kit with foam lid.',
          'Line bottom with cold packs, thermal bag around vials, cold packs on top.',
          'Overnight service only; include ice-pack count on invoice.',
        ],
      },
      {
        tier: 'large',
        label: 'Large',
        quantityHint: '11+ vials',
        supplyIds: ['insulated-foam-containers', 'moisture-cold-packs', 'cold-bricks', 'thermal-bags'],
        steps: [
          'Use insulated foam container sized to vial count.',
          'Layer moisture-resistant cold packs above and below vials.',
          'Split into two kits if weight exceeds overnight limits.',
        ],
      },
    ],
  },
};

export const SHIPPING_SUPPLY_GROUPS = [
  {
    title: 'Insulated shippers & kits',
    ids: ['insulated-shipping-kits', 'insulated-foam-containers', 'insulated-mailers'],
  },
  {
    title: 'Cold packs',
    ids: ['moisture-cold-packs', 'single-use-cold-packs', 'cold-bricks'],
  },
  {
    title: 'Mailers & liners',
    ids: ['cool-shield-mailers', 'insulated-box-liners', 'thermal-bags', 'bubble-mailers'],
  },
  {
    title: 'Boxes & padding',
    ids: ['corrugated-box', 'void-fill'],
  },
] as const;

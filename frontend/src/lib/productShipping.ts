import { SHIPPING_PROFILES, type ShippingProfile } from './shippingSuppliesData';

/** Infer shipping profile from catalog category / product names. */
export function resolveShippingProfileId(
  categoryName: string,
  subCategoryName: string,
  productName: string
): string {
  const blob = `${categoryName} ${subCategoryName} ${productName}`.toLowerCase();

  if (blob.includes('insulin') || /\b(vial|humulin|novolin)\b/.test(blob)) {
    return 'insulin';
  }
  if (blob.includes('lancet') || blob.includes('delica') || blob.includes('microlet') || blob.includes('fastclix') || blob.includes('softclix')) {
    return 'lancets';
  }
  if (
    blob.includes('cgm') ||
    blob.includes('dexcom') ||
    blob.includes('libre') ||
    blob.includes('omnipod') ||
    blob.includes('insulet') ||
    blob.includes('freestyle libre') ||
    blob.includes('sensor') ||
    blob.includes('transmitter') ||
    blob.includes('receiver')
  ) {
    return 'cgm-devices';
  }
  return 'test-strips';
}

export function getShippingProfile(profileId: string): ShippingProfile {
  return SHIPPING_PROFILES[profileId] ?? SHIPPING_PROFILES['test-strips'];
}

export function shippingBadgeClass(badge: ShippingProfile['badge']) {
  switch (badge) {
    case 'Cold chain':
      return 'bg-sky-100 text-sky-900 ring-sky-200';
    case 'Protected':
      return 'bg-violet-100 text-violet-900 ring-violet-200';
    default:
      return 'bg-emerald-100 text-emerald-900 ring-emerald-200';
  }
}

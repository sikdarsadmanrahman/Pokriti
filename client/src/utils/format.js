export const formatBDT = (n) => `৳${Math.round(n).toLocaleString('en-BD')}`;

export function formatWeight(grams) {
  if (!grams) return '';
  return grams >= 1000 ? `${(grams / 1000).toString().replace(/\.0$/, '')}kg` : `${grams}g`;
}

/** ms -> {d,h,m,s}, floored at zero. Used by the flash-sale countdown. */
export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(total / 86400), h: Math.floor((total % 86400) / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
}

export const pad2 = (n) => String(n).padStart(2, '0');

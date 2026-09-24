const BD_MOBILE = /^01[3-9]\d{8}$/;

/** "+880 17-1234-5678" | "8801712345678" -> "01712345678" */
export function normalizeBDPhone(input = '') {
  let p = String(input).replace(/[\s\-()]/g, '');
  if (p.startsWith('+880')) p = '0' + p.slice(4);
  else if (p.startsWith('880')) p = '0' + p.slice(3);
  return p;
}

export const isValidBDPhone = (p) => BD_MOBILE.test(p);

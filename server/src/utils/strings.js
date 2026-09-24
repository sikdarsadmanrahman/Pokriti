import slugify from 'slugify';
import crypto from 'crypto';

export const escapeRegex = (s = '') => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Generates a URL slug that is unique within `Model` (appends a short hex suffix on collision). */
export async function uniqueSlug(Model, text, excludeId) {
  const base = slugify(text, { lower: true, strict: true }) || 'item';
  let slug = base;
  const clash = (s) => Model.exists(excludeId ? { slug: s, _id: { $ne: excludeId } } : { slug: s });
  while (await clash(slug)) slug = `${base}-${crypto.randomBytes(2).toString('hex')}`;
  return slug;
}

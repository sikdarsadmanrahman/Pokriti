import { z } from 'zod';

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');
export const imageInput = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  alt: z.string().max(120).optional(),
});

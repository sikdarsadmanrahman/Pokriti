import { z } from 'zod';
import { imageInput } from './common.js';

const base = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(300).optional(),
  image: imageInput.optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const createCategorySchema = base;
export const updateCategorySchema = base.partial();

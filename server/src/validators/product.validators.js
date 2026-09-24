import { z } from 'zod';
import { objectId, imageInput } from './common.js';

const variantInput = z
  .object({
    // Send _id for EXISTING variants so carts/orders keep pointing at the same variant.
    _id: objectId.optional(),
    label: z.string().trim().min(1).max(30),
    weightInGrams: z.number().nonnegative().optional(),
    sku: z.string().trim().max(40).optional(),
    price: z.number().positive(),
    salePrice: z.number().positive().nullable().optional(),
    stock: z.number().int().min(0),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.salePrice == null || v.salePrice < v.price, {
    message: 'salePrice must be lower than price',
    path: ['salePrice'],
  });

const productBase = z.object({
  name: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  category: objectId,
  images: z.array(imageInput).max(8),
  variants: z.array(variantInput).min(1).max(12),
  lowStockThreshold: z.number().int().min(0).optional(),
  status: z.enum(['active', 'archived']).optional(),
  isFeatured: z.boolean().optional(),
  isCombo: z.boolean().optional(),
  comboItems: z
    .array(
      z.object({
        product: objectId,
        variantLabel: z.string().trim().max(30).optional(),
        quantity: z.number().int().min(1).max(50).default(1),
      })
    )
    .max(15)
    .optional(),
  saleStartsAt: z.coerce.date().nullable().optional(),
  saleEndsAt: z.coerce.date().nullable().optional(),
  origin: z.string().trim().max(500).optional(),
  tags: z.array(z.string().trim().max(30)).max(15).optional(),
});

export const createProductSchema = productBase;
export const updateProductSchema = productBase.partial();

/** Set an absolute stock level OR apply a +/- delta to one variant. */
export const updateStockSchema = z
  .object({
    variantId: objectId,
    stock: z.number().int().min(0).optional(),
    delta: z.number().int().optional(),
  })
  .refine((d) => (d.stock === undefined) !== (d.delta === undefined), {
    message: 'Provide exactly one of "stock" or "delta"',
  });

export const updateProductStatusSchema = z.object({ status: z.enum(['active', 'archived']) });

export const deleteImageSchema = z.object({ publicId: z.string().min(1) });

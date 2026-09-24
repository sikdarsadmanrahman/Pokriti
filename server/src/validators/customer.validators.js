import { z } from 'zod';

export const updateCustomerSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional(),
  isBlocked: z.boolean().optional(),
});

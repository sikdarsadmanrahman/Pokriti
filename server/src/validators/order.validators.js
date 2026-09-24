import { z } from 'zod';
import { objectId } from './common.js';
import { isValidBDPhone, normalizeBDPhone } from '../utils/phone.js';
import {
  MOBILE_BANKING,
  ORDER_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  SHIPPING_ZONES,
} from '../config/constants.js';

const bdPhone = z
  .string()
  .transform(normalizeBDPhone)
  .refine(isValidBDPhone, 'Enter a valid Bangladeshi mobile number (01XXXXXXXXX)');

/**
 * NOTE: the client never sends prices or shipping cost. Only ids + quantities;
 * the server prices everything from the database.
 */
export const createOrderSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2).max(80),
      phone: bdPhone,
      email: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
    }),
    shipping: z.object({
      fullAddress: z.string().trim().min(10, 'Please enter your full address').max(300),
      district: z.string().trim().max(60).optional(),
      area: z.string().trim().max(60).optional(),
      zone: z.enum(SHIPPING_ZONES),
    }),
    items: z
      .array(
        z.object({
          productId: objectId,
          variantId: objectId,
          quantity: z.number().int().min(1).max(20),
        })
      )
      .min(1)
      .max(30),
    payment: z.object({
      method: z.enum(PAYMENT_METHODS),
      senderNumber: z.string().optional(),
      trxId: z.string().trim().optional(),
    }),
    note: z.string().trim().max(300).optional(),
  })
  .superRefine((data, ctx) => {
    if (!MOBILE_BANKING.includes(data.payment.method)) return;
    if (!isValidBDPhone(normalizeBDPhone(data.payment.senderNumber || ''))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['payment', 'senderNumber'], message: 'Enter the sender number you paid from' });
    }
    if (!/^[A-Za-z0-9]{6,20}$/.test(data.payment.trxId || '')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['payment', 'trxId'], message: 'Enter a valid Transaction ID (TrxID)' });
    }
  });

export const trackOrderSchema = z.object({
  orderId: z.string().trim().min(5).max(30),
  phone: z.string().trim().min(10).max(20),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS),
  note: z.string().trim().max(300).optional(),
});

export const updatePaymentSchema = z.object({
  status: z.enum(PAYMENT_STATUS),
});

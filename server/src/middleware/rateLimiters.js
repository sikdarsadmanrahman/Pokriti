import rateLimit from 'express-rate-limit';

const make = (windowMs, limit, message) =>
  rateLimit({ windowMs, limit, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message } });

export const apiLimiter = make(60 * 1000, 300, 'Too many requests. Please slow down.');
export const authLimiter = make(15 * 60 * 1000, 10, 'Too many login attempts. Try again later.');
export const orderLimiter = make(15 * 60 * 1000, 15, 'Too many order attempts. Please try again later.');

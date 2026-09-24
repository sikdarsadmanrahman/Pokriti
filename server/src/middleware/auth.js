import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/** Requires `Authorization: Bearer <jwt>` and a still-active admin account. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const admin = await Admin.findById(payload.sub).select('name email role isActive').lean();
  if (!admin || !admin.isActive) throw new ApiError(401, 'Account not found or disabled');

  req.admin = admin;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.admin?.role) ? next() : next(new ApiError(403, 'You do not have permission to do this'));

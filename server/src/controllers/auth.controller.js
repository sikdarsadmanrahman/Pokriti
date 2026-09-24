import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  const ok = admin && admin.isActive && (await admin.comparePassword(password));
  if (!ok) throw new ApiError(401, 'Invalid email or password');

  const token = jwt.sign({ sub: String(admin._id), role: admin.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
  res.json({ success: true, data: { token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } } });
});

export const me = (req, res) => res.json({ success: true, data: req.admin });

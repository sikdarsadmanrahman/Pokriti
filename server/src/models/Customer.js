import mongoose from 'mongoose';
import { SHIPPING_ZONES } from '../config/constants.js';

const { Schema } = mongoose;

const addressSchema = new Schema({
  label: { type: String, trim: true, default: 'Home' },
  fullAddress: { type: String, required: true, trim: true, maxlength: 300 },
  district: { type: String, trim: true, maxlength: 60 },
  area: { type: String, trim: true, maxlength: 60 },
  shippingZone: { type: String, enum: SHIPPING_ZONES },
});

/**
 * Customers are keyed by phone number (guest checkout - no password).
 * Order history is NOT embedded (unbounded array); query Order by `customer` instead
 * (GET /api/admin/customers/:id/orders). Counters below are cheap denormalised aggregates.
 */
const customerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    phone: {
      type: String,
      required: true,
      unique: true, // unique index -> O(log n) lookup by phone
      trim: true,
      match: [/^01[3-9]\d{8}$/, 'Invalid Bangladeshi mobile number'],
    },
    email: { type: String, lowercase: true, trim: true },
    addresses: { type: [addressSchema], default: [] }, // capped at the 5 most recent by the order service
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 }, // sum of DELIVERED order totals
    lastOrderAt: Date,
    notes: { type: String, maxlength: 500 }, // admin-only
    isBlocked: { type: Boolean, default: false }, // blocks new orders (fake/abusive numbers)
  },
  { timestamps: true }
);

customerSchema.index({ createdAt: -1 });
customerSchema.index({ lastOrderAt: -1 });
customerSchema.index({ name: 1 });

export default mongoose.model('Customer', customerSchema);

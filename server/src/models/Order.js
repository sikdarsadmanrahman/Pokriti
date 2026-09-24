import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS, SHIPPING_ZONES } from '../config/constants.js';

const { Schema } = mongoose;

/** Line items are SNAPSHOTS (name, price, image) so old orders/invoices never change if the catalog does. */
const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    image: String,
    variantLabel: { type: String, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUS, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    note: { type: String, maxlength: 300 },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true }, // e.g. ORD-260920-0007 (unique index)
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerSnapshot: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
    },
    shipping: {
      fullAddress: { type: String, required: true },
      district: String,
      area: String,
      zone: { type: String, enum: SHIPPING_ZONES, required: true },
    },

    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'An order needs at least one item'],
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    payment: {
      method: { type: String, enum: PAYMENT_METHODS, required: true },
      senderNumber: String, // bKash/Nagad/Rocket account the money was sent from
      trxId: String, // uppercase; unique across orders (see partial index)
      status: { type: String, enum: PAYMENT_STATUS, default: 'unpaid' },
      verifiedAt: Date,
      verifiedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    },

    status: { type: String, enum: ORDER_STATUS, default: 'Pending' },
    statusHistory: { type: [statusHistorySchema], default: [] },

    note: { type: String, maxlength: 300 }, // customer's delivery note
  },
  { timestamps: true }
);

// ---- Indexes ----
orderSchema.index({ createdAt: -1 }); // default admin list
orderSchema.index({ status: 1, createdAt: -1 }); // pipeline filter
orderSchema.index({ 'customerSnapshot.phone': 1, createdAt: -1 }); // phone search + order tracking
orderSchema.index({ customer: 1, createdAt: -1 }); // customer order history
// One TrxID can only ever be used once (stops customers re-using a payment). COD orders have no trxId and are skipped.
orderSchema.index(
  { 'payment.trxId': 1 },
  { unique: true, partialFilterExpression: { 'payment.trxId': { $type: 'string' } } }
);

export default mongoose.model('Order', orderSchema);

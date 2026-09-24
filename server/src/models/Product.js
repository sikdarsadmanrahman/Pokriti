import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../config/constants.js';

const { Schema } = mongoose;

/**
 * One purchasable weight/size option (250g, 500g, 1kg ...).
 * Price and stock live here, so each unit size is tracked independently.
 * The auto-generated variant _id is what carts/orders reference.
 */
const variantSchema = new Schema({
  label: { type: String, required: true, trim: true, maxlength: 30 },
  weightInGrams: { type: Number, min: 0 },
  sku: { type: String, trim: true, maxlength: 40 },
  price: { type: Number, required: true, min: 0 },
  salePrice: { type: Number, min: 0, default: null },
  stock: { type: Number, required: true, min: 0, default: 0 },
  isActive: { type: Boolean, default: true },
});

variantSchema.path('salePrice').validate(function (v) {
  return v == null || v < this.price;
}, 'salePrice must be lower than price');

const imageSchema = new Schema(
  {
    url: { type: String, required: true }, // Cloudinary secure_url (WebP)
    publicId: String, // needed to delete the asset later
    alt: { type: String, maxlength: 120 },
  },
  { _id: false }
);

const comboItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantLabel: { type: String, trim: true }, // e.g. "500g"
    quantity: { type: Number, min: 1, default: 1 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 5000 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: { type: [imageSchema], default: [] },

    variants: {
      type: [variantSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'A product needs at least one variant'],
    },

    /** Denormalised sum of variant stock (kept in sync by pre-validate + atomic $inc). Enables cheap stock queries/badges. */
    totalStock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    soldCount: { type: Number, default: 0, min: 0 },

    status: { type: String, enum: PRODUCT_STATUS, default: 'active' },
    isFeatured: { type: Boolean, default: false },

    /** Bundle deals: a combo is a normal product (own price/stock) that lists its contents for display. */
    isCombo: { type: Boolean, default: false },
    comboItems: { type: [comboItemSchema], default: undefined },

    /** Flash-sale window; applies to variants that have a salePrice. Omit dates = sale always on. */
    saleStartsAt: { type: Date, default: null },
    saleEndsAt: { type: Date, default: null },

    origin: { type: String, trim: true, maxlength: 500 }, // sourcing / origin story blurb
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

// ---- Indexes (match the real query shapes) ----
productSchema.index({ category: 1 });
productSchema.index({ status: 1, category: 1, createdAt: -1 }); // storefront: category listing, newest first
productSchema.index({ status: 1, isCombo: 1, createdAt: -1 }); // combo/bundle section
productSchema.index({ status: 1, soldCount: -1 }); // "popular" sort
productSchema.index({ status: 1, saleEndsAt: 1 }); // flash-sale lookup
productSchema.index({ status: 1, totalStock: 1 }); // stock alerts
productSchema.index({ createdAt: -1 });
productSchema.index(
  { name: 'text', tags: 'text', shortDescription: 'text' },
  { weights: { name: 10, tags: 5, shortDescription: 1 } }
);

// Keep totalStock consistent whenever the document is saved.
productSchema.pre('validate', function (next) {
  this.totalStock = (this.variants || []).reduce((sum, v) => sum + (v.stock || 0), 0);
  next();
});

productSchema.virtual('isOutOfStock').get(function () {
  return this.totalStock <= 0;
});

export default mongoose.model('Product', productSchema);

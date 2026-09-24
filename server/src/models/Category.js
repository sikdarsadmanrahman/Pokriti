import mongoose from 'mongoose';

const { Schema } = mongoose;

const categorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // unique index
    description: { type: String, trim: true, maxlength: 300 },
    image: { url: String, publicId: String }, // Cloudinary WebP
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Storefront category bar: active categories in display order.
categorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.model('Category', categorySchema);

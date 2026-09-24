import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uniqueSlug } from '../utils/strings.js';
import { deleteImages } from '../config/cloudinary.js';

// ---------- public ----------
export const listCategories = asyncHandler(async (req, res) => {
  const data = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .select('name slug description image')
    .lean();
  res.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
  res.json({ success: true, data });
});

// ---------- admin ----------
export const adminListCategories = asyncHandler(async (req, res) => {
  const data = await Category.find().sort({ sortOrder: 1, name: 1 }).lean();
  res.json({ success: true, data });
});

export const createCategory = asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(Category, req.body.name);
  const category = await Category.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  const oldImage = category.image?.publicId;

  category.set(req.body); // slug stays stable so existing links don't break
  await category.save();

  if (oldImage && oldImage !== category.image?.publicId) deleteImages([oldImage]).catch(() => {});
  res.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  if (await Product.exists({ category: req.params.id })) {
    throw new ApiError(409, 'This category still has products. Move or delete them first (or just deactivate the category).');
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  if (category.image?.publicId) deleteImages([category.image.publicId]).catch(() => {});
  res.json({ success: true, message: 'Category deleted' });
});

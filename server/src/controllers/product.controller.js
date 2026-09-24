import Product from '../models/Product.js';
import Category from '../models/Category.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { uniqueSlug, escapeRegex } from '../utils/strings.js';
import { decorateProduct } from '../utils/productView.js';
import { deleteImages } from '../config/cloudinary.js';

/** Lean projection for storefront cards (no long description, no exact stock). */
const CARD_FIELDS =
  'name slug shortDescription category images variants lowStockThreshold isCombo isFeatured saleStartsAt saleEndsAt createdAt';

const SORTS = {
  newest: { createdAt: -1 },
  popular: { soldCount: -1, createdAt: -1 },
};

// =====================================================================
// PUBLIC
// =====================================================================

/**
 * GET /api/products?page=1&limit=12&category=honey&combo=true&featured=true&inStock=true&q=ghee&sort=popular
 * Category is returned as an id; the client maps it using the (cached) /api/categories list.
 */
export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12, maxLimit: 48 });
  const { category, q, combo, featured, inStock, sort } = req.query;

  const filter = { status: 'active' };

  if (category) {
    const cat = await Category.findOne({ slug: String(category), isActive: true }).select('_id').lean();
    if (!cat) return res.json({ success: true, data: [], pagination: paginationMeta({ page, limit, total: 0 }) });
    filter.category = cat._id;
  }
  if (combo === 'true') filter.isCombo = true;
  if (combo === 'false') filter.isCombo = false;
  if (featured === 'true') filter.isFeatured = true;
  if (inStock === 'true') filter.totalStock = { $gt: 0 };
  if (q) filter.$text = { $search: String(q).slice(0, 80) };

  const [items, total] = await Promise.all([
    Product.find(filter).select(CARD_FIELDS).sort(SORTS[sort] || SORTS.newest).skip(skip).limit(limit).lean(),
    Product.countDocuments(filter),
  ]);

  const now = new Date();
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  res.json({
    success: true,
    data: items.map((p) => decorateProduct(p, { now })),
    pagination: paginationMeta({ page, limit, total }),
  });
});

/** GET /api/products/flash-sale -> live sale products + the earliest end time (drives the countdown bar). */
export const getFlashSale = asyncHandler(async (req, res) => {
  const now = new Date();
  const products = await Product.find({
    status: 'active',
    saleEndsAt: { $gt: now },
    'variants.salePrice': { $gt: 0 },
    $or: [{ saleStartsAt: null }, { saleStartsAt: { $lte: now } }],
  })
    .select(CARD_FIELDS)
    .sort({ saleEndsAt: 1 })
    .limit(12)
    .lean();

  res.set('Cache-Control', 'public, max-age=15');
  res.json({
    success: true,
    data: { endsAt: products[0]?.saleEndsAt || null, products: products.map((p) => decorateProduct(p, { now })) },
  });
});

/** GET /api/products/:slug */
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: String(req.params.slug), status: 'active' })
    .populate('category', 'name slug')
    .populate('comboItems.product', 'name slug images')
    .lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: decorateProduct(product) });
});

// =====================================================================
// ADMIN
// =====================================================================

/** GET /api/admin/products?status=active|archived&category=<id>&q=honey&stock=low|out */
export const adminListProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 20, maxLimit: 100 });
  const { status, category, q, stock } = req.query;

  const filter = {};
  if (['active', 'archived'].includes(status)) filter.status = status;
  if (category) filter.category = String(category);
  if (q) filter.name = new RegExp(escapeRegex(String(q)), 'i'); // small admin catalogue: regex scan is fine
  if (stock === 'out') filter.totalStock = 0;
  if (stock === 'low') {
    filter.totalStock = { $gt: 0 };
    filter.$expr = { $lte: ['$totalStock', '$lowStockThreshold'] };
  }

  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category', 'name slug').lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items.map((p) => decorateProduct(p, { admin: true })),
    pagination: paginationMeta({ page, limit, total }),
  });
});

export const adminGetProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: decorateProduct(product, { admin: true }) });
});

async function assertCategoryExists(id) {
  if (id && !(await Category.exists({ _id: id }))) throw new ApiError(400, 'Category does not exist');
}

export const createProduct = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.category);
  const slug = await uniqueSlug(Product, req.body.name);
  const product = await Product.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: decorateProduct(product.toObject(), { admin: true }) });
});

/**
 * PUT /api/admin/products/:id
 * NOTE: sending `variants` replaces the whole array (include each existing variant's _id).
 * For restocking prefer PATCH /:id/stock, which is atomic and safe alongside live orders.
 */
export const updateProduct = asyncHandler(async (req, res) => {
  await assertCategoryExists(req.body.category);
  const product = await Product.findById(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  const oldImageIds = product.images.map((i) => i.publicId).filter(Boolean);
  product.set(req.body); // slug/totalStock/soldCount are not accepted (stripped by validation)
  await product.save(); // pre-validate hook recomputes totalStock

  const keep = new Set(product.images.map((i) => i.publicId));
  const removed = oldImageIds.filter((id) => !keep.has(id));
  if (removed.length) deleteImages(removed).catch(() => {});

  res.json({ success: true, data: decorateProduct(product.toObject(), { admin: true }) });
});

/** PATCH /api/admin/products/:id/stock  { variantId, stock } | { variantId, delta } */
export const updateStock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { variantId, stock, delta } = req.body;

  if (delta !== undefined) {
    // Atomic relative change; never lets stock go below zero.
    const res1 = await Product.updateOne(
      { _id: id, variants: { $elemMatch: { _id: variantId, stock: { $gte: Math.max(0, -delta) } } } },
      { $inc: { 'variants.$.stock': delta, totalStock: delta } }
    );
    if (res1.modifiedCount !== 1) throw new ApiError(400, 'Product/variant not found, or stock would go below zero');
  } else {
    // Absolute set, done as compare-and-swap so it can't clobber a concurrent order.
    let done = false;
    for (let attempt = 0; attempt < 3 && !done; attempt++) {
      const product = await Product.findById(id).select('variants').lean();
      if (!product) throw new ApiError(404, 'Product not found');
      const variant = product.variants.find((v) => String(v._id) === variantId);
      if (!variant) throw new ApiError(404, 'Variant not found');
      const diff = stock - variant.stock;
      if (diff === 0) break;
      const r = await Product.updateOne(
        { _id: id, variants: { $elemMatch: { _id: variantId, stock: variant.stock } } },
        { $inc: { 'variants.$.stock': diff, totalStock: diff } }
      );
      done = r.modifiedCount === 1;
      if (!done && attempt === 2) throw new ApiError(409, 'Stock changed while updating. Please retry.');
    }
  }

  const fresh = await Product.findById(id).lean();
  res.json({ success: true, data: decorateProduct(fresh, { admin: true }) });
});

/** PATCH /api/admin/products/:id/status  { status: 'archived' | 'active' } */
export const updateProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }).lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: decorateProduct(product, { admin: true }) });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, 'Product not found');

  // Orders keep their own snapshots, so history is safe. Clean up combos that referenced it.
  await Product.updateMany({ 'comboItems.product': product._id }, { $pull: { comboItems: { product: product._id } } });
  deleteImages(product.images.map((i) => i.publicId)).catch(() => {});

  res.json({ success: true, message: 'Product deleted (consider archiving instead to keep it restorable)' });
});

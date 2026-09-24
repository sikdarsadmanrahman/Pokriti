import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';

/**
 * Atomically reserves stock for every line. Each decrement is a single conditional update
 * ("only if stock >= qty"), so two customers can never buy the last unit.
 * If any line fails, everything reserved so far is put back and a 409 is thrown.
 * (No multi-document transaction needed, so this also works on a standalone dev MongoDB.)
 */
export async function reserveStock(lines) {
  const reserved = [];
  try {
    for (const l of lines) {
      const res = await Product.updateOne(
        {
          _id: l.product,
          status: 'active',
          variants: { $elemMatch: { _id: l.variantId, isActive: true, stock: { $gte: l.quantity } } },
        },
        { $inc: { 'variants.$.stock': -l.quantity, totalStock: -l.quantity, soldCount: l.quantity } }
      );
      if (res.modifiedCount !== 1) {
        throw new ApiError(409, `Sorry, "${l.name} (${l.variantLabel})" just went out of stock or doesn't have enough quantity left.`);
      }
      reserved.push(l);
    }
  } catch (err) {
    await restoreStock(reserved);
    throw err;
  }
}

/** Puts stock back (order failed or was cancelled). */
export async function restoreStock(lines) {
  const results = await Promise.allSettled(
    lines.map((l) =>
      Product.updateOne(
        { _id: l.product, 'variants._id': l.variantId },
        { $inc: { 'variants.$.stock': l.quantity, totalStock: l.quantity, soldCount: -l.quantity } }
      )
    )
  );
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('restoreStock failed:', r.reason));
}

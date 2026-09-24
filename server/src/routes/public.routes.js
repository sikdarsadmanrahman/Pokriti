import { Router } from 'express';
import { getPublicConfig } from '../controllers/config.controller.js';
import { listCategories } from '../controllers/category.controller.js';
import { listProducts, getFlashSale, getProductBySlug } from '../controllers/product.controller.js';
import { createOrder, trackOrder } from '../controllers/order.controller.js';
import { validate } from '../middleware/validate.js';
import { orderLimiter } from '../middleware/rateLimiters.js';
import { createOrderSchema, trackOrderSchema } from '../validators/order.validators.js';

/** Storefront API - no authentication. */
const router = Router();

router.get('/config', getPublicConfig);
router.get('/categories', listCategories);

router.get('/products', listProducts); // ?category=&combo=&featured=&inStock=&q=&sort=&page=&limit=
router.get('/products/flash-sale', getFlashSale); // must stay above /:slug
router.get('/products/:slug', getProductBySlug);

router.post('/orders', orderLimiter, validate(createOrderSchema), createOrder);
router.post('/orders/track', orderLimiter, validate(trackOrderSchema), trackOrder);

export default router;

import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { imageUpload } from '../middleware/upload.js';

import { getDashboardStats } from '../controllers/dashboard.controller.js';
import { uploadImages, removeImage } from '../controllers/upload.controller.js';
import {
  adminListCategories, createCategory, updateCategory, deleteCategory,
} from '../controllers/category.controller.js';
import {
  adminListProducts, adminGetProduct, createProduct, updateProduct,
  updateStock, updateProductStatus, deleteProduct,
} from '../controllers/product.controller.js';
import {
  listOrders, getOrder, updateOrderStatus, updatePaymentStatus, getInvoice, getInvoicesBatch,
} from '../controllers/adminOrder.controller.js';
import {
  listCustomers, getCustomer, getCustomerOrders, updateCustomer,
} from '../controllers/customer.controller.js';

import { createCategorySchema, updateCategorySchema } from '../validators/category.validators.js';
import {
  createProductSchema, updateProductSchema, updateStockSchema, updateProductStatusSchema, deleteImageSchema,
} from '../validators/product.validators.js';
import { updateOrderStatusSchema, updatePaymentSchema } from '../validators/order.validators.js';
import { updateCustomerSchema } from '../validators/customer.validators.js';

/** Everything below requires a valid admin JWT. Destructive deletes are limited to role "admin". */
const router = Router();
router.use(protect);

router.get('/dashboard', getDashboardStats);

// Images (Cloudinary, WebP)
router.post('/uploads/images', imageUpload.array('images', 5), uploadImages);
router.delete('/uploads/images', restrictTo('admin'), validate(deleteImageSchema), removeImage);

// Categories
router.route('/categories').get(adminListCategories).post(validate(createCategorySchema), createCategory);
router
  .route('/categories/:id')
  .put(validate(updateCategorySchema), updateCategory)
  .delete(restrictTo('admin'), deleteCategory);

// Products
router.route('/products').get(adminListProducts).post(validate(createProductSchema), createProduct);
router
  .route('/products/:id')
  .get(adminGetProduct)
  .put(validate(updateProductSchema), updateProduct)
  .delete(restrictTo('admin'), deleteProduct);
router.patch('/products/:id/stock', validate(updateStockSchema), updateStock);
router.patch('/products/:id/status', validate(updateProductStatusSchema), updateProductStatus); // archive / restore

// Orders  (static paths before /:id)
router.get('/orders', listOrders);
router.get('/orders/invoices', getInvoicesBatch);
router.get('/orders/:id', getOrder);
router.get('/orders/:id/invoice', getInvoice);
router.patch('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.patch('/orders/:id/payment', validate(updatePaymentSchema), updatePaymentStatus);

// Customers
router.get('/customers', listCustomers);
router.get('/customers/:id', getCustomer);
router.get('/customers/:id/orders', getCustomerOrders);
router.patch('/customers/:id', validate(updateCustomerSchema), updateCustomer);

export default router;

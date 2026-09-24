import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import slugify from 'slugify';

const CATEGORIES = ['Honey', 'Ghee', 'Organic Sugar', 'Nuts', 'Combos'];

await connectDB(process.env.MONGODB_URI);

// Make sure every index declared in the schemas exists before serving traffic.
await Promise.all([Admin, Category, Product, Order, Customer].map((M) => M.syncIndexes()));

for (const [i, name] of CATEGORIES.entries()) {
  const slug = slugify(name, { lower: true, strict: true });
  await Category.updateOne({ slug }, { $setOnInsert: { name, slug, sortOrder: i } }, { upsert: true });
}
console.log('Categories ready:', CATEGORIES.join(', '));

const email = (process.env.SEED_ADMIN_EMAIL || 'admin@example.com').toLowerCase();
if (!(await Admin.exists({ email }))) {
  await Admin.create({
    name: 'Store Admin',
    email,
    passwordHash: await Admin.hashPassword(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe!12345'),
    role: 'admin',
  });
  console.log(`Admin created: ${email}  (change the password after first login!)`);
} else {
  console.log(`Admin already exists: ${email}`);
}

await mongoose.disconnect();

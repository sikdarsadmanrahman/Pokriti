import 'dotenv/config'; // must stay the first import so env vars exist for every module below
import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { ensureSeedAdmin } from './bootstrap/ensureAdmin.js';

const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}
if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be at least 32 characters in production');
  process.exit(1);
}

await connectDB(process.env.MONGODB_URI);
await ensureSeedAdmin();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`API listening on :${PORT} (${process.env.NODE_ENV || 'development'})`));

// Graceful shutdown: stop accepting requests, finish in-flight ones, close DB.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

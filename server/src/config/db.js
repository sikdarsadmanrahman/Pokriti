import mongoose from 'mongoose';

let cached = globalThis.__mongooseConn;
if (!cached) cached = globalThis.__mongooseConn = { conn: null, promise: null };

/** Safe to call multiple times (e.g. once per request in a serverless environment) — reuses the existing connection. */
export async function connectDB(uri) {
  if (cached.conn) return cached.conn;
  mongoose.set('strictQuery', true);
  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { maxPoolSize: 20, serverSelectionTimeoutMS: 10000 }).then((m) => {
      console.log(`MongoDB connected: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

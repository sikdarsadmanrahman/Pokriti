import mongoose from 'mongoose';

export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  // Indexes are declared on the schemas and built on startup (autoIndex).
  // On a very large production collection, set autoIndex=false and run Model.syncIndexes() in a deploy step.
  await mongoose.connect(uri, { maxPoolSize: 20, serverSelectionTimeoutMS: 10000 });
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

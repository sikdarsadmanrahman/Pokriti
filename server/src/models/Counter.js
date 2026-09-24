import mongoose from 'mongoose';

/** Atomic sequence generator (used for human-readable order IDs, one counter per day). */
const counterSchema = new mongoose.Schema({
  _id: { type: String },
  seq: { type: Number, default: 0 },
});

export default mongoose.model('Counter', counterSchema);

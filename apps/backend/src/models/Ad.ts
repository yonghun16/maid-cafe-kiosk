// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';
import type { Ad } from '@repo/types';

export interface AdDocument extends Document, Omit<Ad, '_id'> {}

const adSchema = new Schema<AdDocument>(
  {
    imageUrl: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<AdDocument>('Ad', adSchema);

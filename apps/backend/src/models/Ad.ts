// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';
import type { Ad } from '@repo/types';

export interface AdDocument extends Document, Omit<Ad, '_id'> {}

const adSchema = new Schema<AdDocument>(
  {
    imageUrl: { type: String, required: true },
    // 노출 순서. 값이 작을수록 앞에 표시됨.
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model<AdDocument>('Ad', adSchema);

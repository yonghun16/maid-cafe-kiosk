// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';
import type { Product } from '@repo/types';

export interface ProductDocument extends Document, Omit<Product, '_id'> {}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['coffee', 'ade', 'dessert'],
  },
});

export default mongoose.model<ProductDocument>('Product', productSchema);

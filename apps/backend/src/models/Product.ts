// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';
import type { Product } from '@repo/types';

export interface ProductDocument extends Document, Omit<Product, '_id'> {}

const productSchema = new Schema<ProductDocument>({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  // 카테고리는 더 이상 고정된 enum이 아니라 관리자가 자유롭게 추가/수정/
  // 삭제하는 Category.name 값을 그대로 저장합니다.
  category: { type: String, required: true },
  isSoldOut: { type: Boolean, default: false },
});

export default mongoose.model<ProductDocument>('Product', productSchema);

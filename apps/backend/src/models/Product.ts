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
  // 같은 카테고리 안에서의 노출 순서. 값이 작을수록 앞에 표시됨.
  order: { type: Number, required: true, default: 0 },
  isSoldOut: { type: Boolean, default: false },
  // 재고 수량. 선택 필드라 값이 없으면(undefined) 재고를 추적하지
  // 않는 상품으로 취급합니다.
  stock: { type: Number, required: false },
});

export default mongoose.model<ProductDocument>('Product', productSchema);

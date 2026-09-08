// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';

export interface CategoryDocument extends Document {
  name: string;
  order: number;
}

const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true, unique: true },
  // 관리자 화면/고객 화면에 노출되는 순서. 값이 작을수록 앞에 표시됩니다.
  order: { type: Number, required: true, default: 0 },
});

export default mongoose.model<CategoryDocument>('Category', categorySchema);

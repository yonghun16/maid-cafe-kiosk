// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';

export interface CategoryDocument extends Document {
  name: string;
}

const categorySchema = new Schema<CategoryDocument>({
  name: { type: String, required: true, unique: true },
});

export default mongoose.model<CategoryDocument>('Category', categorySchema);

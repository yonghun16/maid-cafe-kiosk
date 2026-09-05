// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';

export interface OrderItemDocument {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderDocument extends Document {
  items: OrderItemDocument[];
  totalPrice: number;
  createdAt: Date;
}

const orderSchema = new Schema<OrderDocument>({
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<OrderDocument>('Order', orderSchema);

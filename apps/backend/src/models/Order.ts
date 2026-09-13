// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';
import type { ProductOption } from '@repo/types';

export interface OrderItemDocument {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  hasExtraShot?: boolean;
  magicSpell?: string;
  temperature?: 'HOT' | 'ICE';
  iceAmount?: '적게' | '적당' | '많이';
  selectedOptions?: ProductOption[];
}

export interface OrderDocument extends Document {
  orderNumber: number;
  items: OrderItemDocument[];
  totalPrice: number;
  orderType: 'dine-in' | 'takeout';
  isCompleted: boolean;
  isCancelled: boolean;
  createdAt: Date;
  paymentMethod?: '신용카드' | 'NPay' | 'Kakao Pay' | '토스페이';
}

const orderSchema = new Schema<OrderDocument>({
  // 당일 자정(KST) 기준으로 1부터 다시 매기는 짧은 주문번호(스타벅스 매장
  // 주문번호 방식). MongoDB의 긴 _id 대신 고객 응대용으로 사용합니다.
  orderNumber: { type: Number, required: true },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      imageUrl: String,
      quantity: Number,
      hasExtraShot: Boolean,
      magicSpell: String,
      temperature: { type: String, enum: ['HOT', 'ICE'] },
      iceAmount: { type: String, enum: ['적게', '적당', '많이'] },
      selectedOptions: [
        {
          name: String,
          price: Number,
        },
      ],
    },
  ],
  totalPrice: { type: Number, required: true },
  orderType: { type: String, required: true, enum: ['dine-in', 'takeout'] },
  // 주방/관리자가 "완료" 처리했는지 여부. true가 되면 진행중 목록에서
  // 빠지고 완료한 주문 목록으로 이동합니다. 완료된 주문은 "되돌리기"로
  // 다시 false가 될 수 있습니다.
  isCompleted: { type: Boolean, default: false },
  // 주문 취소 여부. 완료 전(진행중) 주문만 취소할 수 있고, 취소되면 차감된
  // 재고를 되돌립니다([[주문취소]] 참고). 취소된 주문은 판매 통계 집계에서
  // 제외됩니다.
  isCancelled: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  // 실제 결제 게이트웨이 연동 전이라 선택값만 기록합니다.
  paymentMethod: { type: String, enum: ['신용카드', 'NPay', 'Kakao Pay', '토스페이'] },
});

export default mongoose.model<OrderDocument>('Order', orderSchema);

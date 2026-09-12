// @owner: ai
import mongoose, { Schema, type Document } from 'mongoose';

export interface PushSubscriptionDocument extends Document {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  createdAt: Date;
}

const pushSubscriptionSchema = new Schema<PushSubscriptionDocument>({
  // 브라우저가 발급하는 구독 고유 URL. 같은 기기/브라우저가 다시
  // 구독해도 endpoint가 같으면 중복 저장하지 않고 덮어씁니다.
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth: { type: String, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<PushSubscriptionDocument>('PushSubscription', pushSubscriptionSchema);

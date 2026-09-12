// @owner: ai
import webpush from 'web-push';
import type { OrderType } from '@repo/types';
import PushSubscription from '../models/PushSubscription';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@example.com';

const isConfigured = Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);

if (isConfigured) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY!, VAPID_PRIVATE_KEY!);
} else {
  console.warn(
    '⚠️ VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY 환경변수가 없어 주방 화면 새 주문 푸시 알림이 비활성화됩니다.',
  );
}

/**
 * 프론트가 `PushManager.subscribe()`에 넘길 VAPID 공개키를 반환합니다.
 * 서버에 키가 설정돼 있지 않으면 `null`입니다.
 */
export function getVapidPublicKey(): string | null {
  return VAPID_PUBLIC_KEY ?? null;
}

const ORDER_TYPE_LABEL: Record<OrderType, string> = { 'dine-in': '매장', takeout: '포장' };

/**
 * 저장된 모든 주방 화면 구독에 새 주문 알림을 보냅니다. VAPID 키가
 * 설정돼 있지 않으면 조용히 아무 것도 하지 않습니다. 구독 하나가
 * 만료됐거나(410/404) 실패해도 다른 구독 전송에는 영향이 없도록
 * 각각 독립적으로 처리하고, 만료된 구독은 DB에서 정리합니다.
 */
export async function notifyKitchenOfNewOrder(orderNumber: number, orderType: OrderType): Promise<void> {
  if (!isConfigured) return;

  const subscriptions = await PushSubscription.find();
  if (subscriptions.length === 0) return;

  const payload = JSON.stringify({
    title: `🔔 새 주문 (${ORDER_TYPE_LABEL[orderType]})`,
    body: `주문번호 No.${orderNumber}이(가) 들어왔어요!`,
    url: '/kitchen',
  });

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await webpush.sendNotification(
          { endpoint: subscription.endpoint, keys: subscription.keys },
          payload,
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await PushSubscription.deleteOne({ endpoint: subscription.endpoint });
        } else {
          console.error('주방 화면 푸시 알림 전송 중 오류가 발생했습니다:', err);
        }
      }
    }),
  );
}

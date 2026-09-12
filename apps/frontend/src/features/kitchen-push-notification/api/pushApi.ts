// @owner: ai
import type { PushSubscriptionInput, VapidPublicKeyResponse } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 웹 푸시 구독에 필요한 VAPID 공개키를 조회합니다.
 * @returns `PushManager.subscribe()`의 `applicationServerKey`로 쓸 공개키
 */
export async function getVapidPublicKey(): Promise<string> {
  const response = await apiClient.get<VapidPublicKeyResponse>('/push/vapid-public-key');
  return response.data.publicKey;
}

/**
 * 주방 화면의 웹 푸시 구독 정보를 서버에 등록합니다.
 * @param subscription - 브라우저 `PushSubscription.toJSON()` 결과
 */
export async function subscribeToPush(subscription: PushSubscriptionInput): Promise<void> {
  await apiClient.post('/push/subscribe', subscription);
}

/**
 * 주방 화면의 웹 푸시 구독을 서버에서 해제합니다.
 * @param endpoint - 해제할 구독의 endpoint
 */
export async function unsubscribeFromPush(endpoint: string): Promise<void> {
  await apiClient.post('/push/unsubscribe', { endpoint });
}

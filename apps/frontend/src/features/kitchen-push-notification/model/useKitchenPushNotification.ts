// @owner: ai
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getVapidPublicKey, subscribeToPush, unsubscribeFromPush } from '../api/pushApi';
import { urlBase64ToUint8Array } from '../lib/urlBase64ToUint8Array';

export type KitchenPushStatus = 'checking' | 'unsupported' | 'denied' | 'off' | 'on';

/**
 * 주방 화면에서 새 주문 웹 푸시 알림을 켜고 끄는 훅입니다([[주방알림]]
 * 참고). 브라우저의 실제 `PushSubscription` 존재 여부를 상태의 원본
 * 소스로 삼고, 별도로 로컬 상태를 저장하지 않습니다.
 */
export function useKitchenPushNotification() {
  const [status, setStatus] = useState<KitchenPushStatus>('checking');

  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        setStatus('unsupported');
        return;
      }
      if (Notification.permission === 'denied') {
        setStatus('denied');
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const existing = await registration.pushManager.getSubscription();
        // ✅ 구독이 브라우저(origin)마다 독립적이라는 걸 진단하기 쉽게
        // 남깁니다 — "새로고침하면 꺼진다"는 문의가 실제로는 다른
        // origin(예: localhost vs 배포 주소)을 오간 것이었던 사례가 있음.
        console.log('[주방 알림] 현재 origin:', window.location.origin, '/ 구독 존재:', Boolean(existing));
        setStatus(existing ? 'on' : 'off');
      } catch (error) {
        console.error('푸시 구독 상태를 확인하는 중 오류가 발생했습니다:', error);
        setStatus('off');
      }
    })();
  }, []);

  const enable = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }
      const publicKey = await getVapidPublicKey();
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const json = subscription.toJSON();
      if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
        throw new Error('구독 정보가 올바르지 않습니다.');
      }
      await subscribeToPush({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
      });
      setStatus('on');
      toast.success('새 주문 알림을 켰어요.');
    } catch (error) {
      console.error('푸시 알림 구독 중 오류가 발생했습니다:', error);
      toast.error('알림을 켜는 데 실패했어요.');
    }
  };

  const disable = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setStatus('off');
      toast.success('새 주문 알림을 껐어요.');
    } catch (error) {
      console.error('푸시 알림 해제 중 오류가 발생했습니다:', error);
      toast.error('알림을 끄는 데 실패했어요.');
    }
  };

  return { status, enable, disable };
}

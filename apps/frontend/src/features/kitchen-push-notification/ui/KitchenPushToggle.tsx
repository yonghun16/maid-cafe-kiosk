// @owner: ai
'use client';

import { useKitchenPushNotification } from '../model/useKitchenPushNotification';

/**
 * 주방 화면에서 새 주문 웹 푸시 알림을 켜고 끄는 버튼입니다([[주방알림]]
 * 참고). 브라우저가 지원하지 않거나 알림 권한이 거부된 경우 버튼 대신
 * 안내 문구만 보여줍니다.
 */
export function KitchenPushToggle() {
  const { status, enable, disable } = useKitchenPushNotification();

  if (status === 'checking') return null;

  if (status === 'unsupported') {
    return <span className="text-xs text-gray-400">이 브라우저는 알림을 지원하지 않아요</span>;
  }

  if (status === 'denied') {
    return <span className="text-xs text-gray-400">브라우저 설정에서 알림 권한을 허용해주세요</span>;
  }

  return (
    <button
      type="button"
      onClick={status === 'on' ? disable : enable}
      className={`rounded-md border px-4 py-2 text-sm font-semibold transition-colors ${
        status === 'on'
          ? 'border-pink-500 bg-pink-500 text-white hover:bg-pink-600'
          : 'border-pink-300 text-pink-500 hover:bg-pink-50'
      }`}
    >
      {status === 'on' ? '🔔 알림 켜짐' : '🔕 알림 꺼짐'}
    </button>
  );
}

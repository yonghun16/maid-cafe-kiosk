// @owner: ai
'use client';

import { useEffect } from 'react';
import type { Order } from '@repo/types';

interface OrderCompleteScreenProps {
  order: Order;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 8_000;

const ORDER_TYPE_LABEL: Record<Order['orderType'], string> = {
  'dine-in': '매장에서 드시고 가세요',
  takeout: '포장해서 가져가세요',
};

/**
 * 주문 제출 성공 직후 보여주는 전체 화면 안내입니다. 주문번호와 대략적인
 * 예상 대기 시간을 안내하고, 일정 시간 뒤 자동으로(또는 "확인" 버튼으로
 * 바로) 매장/포장 선택 화면으로 돌아갑니다. 실시간 대기열 데이터가 없어
 * 예상 시간은 고정 문구입니다.
 */
export function OrderCompleteScreen({ order, onDismiss }: OrderCompleteScreenProps) {
  useEffect(() => {
    const timeoutId = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timeoutId);
  }, [onDismiss]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-kiosk-pattern p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
        <p className="text-4xl">🎀</p>
        <h1 className="mt-2 text-2xl font-bold text-gray-800">주문이 완료됐어요!</h1>
        <p className="mt-1 text-sm text-gray-500">{ORDER_TYPE_LABEL[order.orderType]}</p>

        <div className="mt-6 rounded-2xl bg-pink-50 py-6">
          <p className="text-sm font-medium text-pink-500">주문번호</p>
          <p className="mt-1 text-5xl font-extrabold text-pink-500">No. {order.orderNumber}</p>
        </div>

        <p className="mt-6 text-base text-gray-600">
          메뉴 준비까지 약 <span className="font-semibold text-gray-800">10~15분</span> 정도
          걸려요. 주문번호를 불러드리면 픽업대로 와주세요!
        </p>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-8 w-full rounded-xl bg-pink-500 py-3 text-lg font-bold text-white transition-colors hover:bg-pink-600"
        >
          확인
        </button>
      </div>
    </div>
  );
}

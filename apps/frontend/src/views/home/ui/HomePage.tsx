// @owner: ai
'use client';

import { useEffect, useState } from 'react';
import type { OrderType } from '@repo/types';
import { useOrderTypeStore } from '../../../features/order-type';
import { useCartStore } from '../../../features/cart';
import { OrderTypeSelect } from '../../../widgets/order-type-select';
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';
import { OrderCompleteScreen } from '../../../widgets/order-complete';
import { Modal } from '../../../shared/ui';

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  'dine-in': '🍽️ 매장에서',
  takeout: '🥡 포장',
};

// ✅ 세션 타임아웃([[세션타임아웃]] 참고): 손님이 메뉴를 고르다가 자리를
// 뜨면 다음 손님이 이전 손님의 장바구니를 이어받게 되는 문제를 막기
// 위해, 이 시간만큼 조작이 없으면 경고 없이 바로 초기화합니다.
const IDLE_TIMEOUT_MS = 60_000;

export function HomePage() {
  const orderType = useOrderTypeStore((state) => state.orderType);
  const setOrderType = useOrderTypeStore((state) => state.setOrderType);
  const resetOrderType = useOrderTypeStore((state) => state.resetOrderType);
  const clearCart = useCartStore((state) => state.clearCart);
  const lastCompletedOrder = useCartStore((state) => state.lastCompletedOrder);
  const clearLastCompletedOrder = useCartStore((state) => state.clearLastCompletedOrder);
  // ✅ 상단 바를 계속 크게 차지하던 "처음으로" 버튼 대신, 작은 배지를
  // 눌렀을 때만 뜨는 팝업으로 옮겼습니다([[매장내포장선택]] 참고).
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [pendingOrderType, setPendingOrderType] = useState<OrderType | null>(null);

  // ✅ 주문 화면(orderType이 있는 동안)에서만 미조작 타이머를 돌립니다.
  // 어떤 조작이든(터치/클릭/키보드/휠) 타이머를 다시 시작시키고, 1분간
  // 아무 반응도 없으면 경고 없이 바로 장바구니를 비우고 매장/포장 선택
  // 화면으로 되돌립니다.
  useEffect(() => {
    if (!orderType) return;

    let timeoutId: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        clearCart();
        resetOrderType();
      }, IDLE_TIMEOUT_MS);
    };

    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'wheel'] as const;
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [orderType, clearCart, resetOrderType]);

  // ✅ 주문 제출 직후에는 매장/포장 선택 화면보다 [[주문완료화면]]이
  // 먼저 보여야 하므로, orderType 체크보다 먼저 검사합니다. "확인"을
  // 누르거나 자동으로 닫히면 그제서야 매장/포장 선택 화면으로 돌아갑니다.
  if (lastCompletedOrder) {
    const handleDismissComplete = () => {
      clearLastCompletedOrder();
      resetOrderType();
    };
    return <OrderCompleteScreen order={lastCompletedOrder} onDismiss={handleDismissComplete} />;
  }

  if (!orderType) {
    return <OrderTypeSelect />;
  }

  const handleOpenChangeModal = () => {
    setPendingOrderType(orderType);
    setIsChangeModalOpen(true);
  };

  // ✅ 매장/포장 변경은 장바구니를 건드리지 않는 비파괴적인 동작이라
  // 확인 없이 바로 적용합니다.
  const handleApplyChange = () => {
    if (pendingOrderType && pendingOrderType !== orderType) {
      setOrderType(pendingOrderType);
    }
    setIsChangeModalOpen(false);
  };

  const handleRestartClick = () => {
    setIsChangeModalOpen(false);
    setIsRestartConfirmOpen(true);
  };

  // ✅ "처음으로"는 매장/포장 선택 화면으로 되돌아가는 동작이라, 실수로
  // 눌러 화면이 갑자기 바뀌지 않도록 확인을 한 번 거칩니다.
  const handleConfirmRestart = () => {
    setIsRestartConfirmOpen(false);
    resetOrderType();
  };

  return (
    <div className="min-h-screen bg-kiosk-pattern font-sans text-gray-700">
      {/* ✅ 메뉴를 스크롤해도 항상 보이도록 상단 고정 바를 두되, 매장/포장
          표시는 작은 배지로 줄여 화면을 덜 차지하게 합니다. */}
      <div className="fixed inset-x-0 top-0 z-40 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">
          <span className="font-script text-lg font-bold text-pink-500 md:text-xl">🎀 Maid Kiosk</span>
          <button
            type="button"
            onClick={handleOpenChangeModal}
            className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-pink-50 hover:text-pink-500"
          >
            <span>{ORDER_TYPE_LABEL[orderType]}</span>
            <span className="text-gray-400">▾</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto flex flex-col gap-6 p-4 pt-20 md:flex-row md:gap-8 md:p-8 md:pt-24">
        <ProductList />
        <OrderSummary />
      </div>

      <Modal isOpen={isChangeModalOpen} onClose={() => setIsChangeModalOpen(false)} title="주문 방식">
        <div className="space-y-3">
          {(Object.keys(ORDER_TYPE_LABEL) as OrderType[]).map((type) => (
            <label
              key={type}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                pendingOrderType === type ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="orderType"
                checked={pendingOrderType === type}
                onChange={() => setPendingOrderType(type)}
                className="h-4 w-4 accent-pink-500"
              />
              <span className="font-semibold text-gray-700">{ORDER_TYPE_LABEL[type]}</span>
            </label>
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setIsChangeModalOpen(false)}
            className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleApplyChange}
            disabled={pendingOrderType === orderType}
            className="flex-1 rounded-md bg-pink-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-pink-600 disabled:bg-gray-300"
          >
            변경
          </button>
        </div>
        <button
          type="button"
          onClick={handleRestartClick}
          className="mt-4 w-full rounded-md border border-gray-200 py-2.5 text-sm font-semibold text-gray-500 transition-colors hover:border-pink-300 hover:bg-pink-50 hover:text-pink-500"
        >
          ↩ 처음부터 다시 시작
        </button>
      </Modal>

      <Modal isOpen={isRestartConfirmOpen} onClose={() => setIsRestartConfirmOpen(false)} title="처음으로">
        <p className="text-sm text-gray-600">
          매장/포장 선택 화면으로 돌아갈까요? 담아둔 메뉴는 그대로 유지됩니다.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setIsRestartConfirmOpen(false)}
            className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            계속 주문
          </button>
          <button
            type="button"
            onClick={handleConfirmRestart}
            className="flex-1 rounded-md bg-pink-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-pink-600"
          >
            처음으로
          </button>
        </div>
      </Modal>
    </div>
  );
}

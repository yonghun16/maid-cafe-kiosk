// @owner: ai
'use client';

import { useState } from 'react';
import type { OrderType } from '@repo/types';
import { useOrderTypeStore } from '../../../features/order-type';
import { OrderTypeSelect } from '../../../widgets/order-type-select';
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';
import { Modal } from '../../../shared/ui';

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  'dine-in': '🍽️ 매장에서',
  takeout: '🥡 포장',
};

export function HomePage() {
  const orderType = useOrderTypeStore((state) => state.orderType);
  const setOrderType = useOrderTypeStore((state) => state.setOrderType);
  const resetOrderType = useOrderTypeStore((state) => state.resetOrderType);
  // ✅ 상단 바를 계속 크게 차지하던 "처음으로" 버튼 대신, 작은 배지를
  // 눌렀을 때만 뜨는 팝업으로 옮겼습니다([[매장내포장선택]] 참고).
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [pendingOrderType, setPendingOrderType] = useState<OrderType | null>(null);

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
          className="mt-4 w-full text-center text-xs text-gray-400 underline hover:text-pink-500"
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

// @owner: ai
'use client';

import { useState } from 'react';
import type { PaymentMethod } from '@repo/types';
import { useCartStore } from '../../../features/cart';
import { useOrderTypeStore } from '../../../features/order-type';
import { Modal } from '../../../shared/ui';

// ✅ 실제 결제 게이트웨이 연동은 아직 없어서([[결제게이트웨이연동]] 참고),
// "주문하기"를 누르면 결제 수단을 고르는 화면만 먼저 보여주고, 고른
// 수단을 기록만 한 뒤 바로 주문을 진행합니다.
const PAYMENT_METHODS: { value: PaymentMethod; icon: string; className: string }[] = [
  { value: '신용카드', icon: '💳', className: 'bg-gray-800 text-white hover:bg-gray-900' },
  { value: 'NPay', icon: 'N', className: 'bg-[#03C75A] text-white hover:brightness-95' },
  { value: 'Kakao Pay', icon: '💬', className: 'bg-[#FEE500] text-gray-900 hover:brightness-95' },
  { value: '토스페이', icon: '🅣', className: 'bg-[#1B64DA] text-white hover:brightness-95' },
];

export function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const submitOrder = useCartStore((state) => state.submitOrder);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const orderType = useOrderTypeStore((state) => state.orderType);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenPaymentModal = () => {
    if (items.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  // ✅ 결제 수단을 고르면 바로 주문을 진행합니다. 주문이 성공하면
  // 매장/포장 선택 화면으로 바로 되돌리지 않고, 장바구니 스토어에 남은
  // `lastCompletedOrder`를 보고 `HomePage`가 [[주문완료화면]]을 띄웁니다
  // (그 화면을 닫을 때 매장/포장 선택 화면으로 되돌아갑니다).
  const handleSelectPayment = async (paymentMethod: PaymentMethod) => {
    if (!orderType || isSubmitting) return;
    setIsSubmitting(true);
    const success = await submitOrder(orderType, paymentMethod);
    setIsSubmitting(false);
    if (success) {
      setIsPaymentModalOpen(false);
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const itemList = (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-gray-400">
          <p>장바구니가 비어있어요</p>
          <p className="mt-1 text-sm">상품을 클릭해서 추가해주세요!</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.cartItemId} className="rounded-md bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={item.imageUrl} alt={item.name} className="h-12 w-12 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                {/* ✅ 이름+옵션을 하나의 truncate 문단에 넣으면 옵션이
                    화면 밖으로 밀려 통째로 가려질 수 있어서, 옵션은
                    줄바꿈되는 별도 영역으로 뺍니다. */}
                <p className="truncate font-semibold text-gray-800">{item.name}</p>
                {(item.temperature || item.magicSpell || (item.selectedOptions?.length ?? 0) > 0) && (
                  <p className="flex flex-wrap gap-x-1 text-xs font-normal text-pink-500">
                    {item.temperature && <span>({item.temperature === 'HOT' ? '🔥 HOT' : '🧊 ICE'})</span>}
                    {item.iceAmount && <span>(얼음 {item.iceAmount})</span>}
                    {item.magicSpell && <span>(🪄 {item.magicSpell})</span>}
                    {item.selectedOptions?.map((option) => <span key={option.name}>({option.name})</span>)}
                  </p>
                )}
                <p className="whitespace-nowrap text-sm text-gray-500">{item.price.toLocaleString()}원</p>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.cartItemId)}
                aria-label="삭제"
                className="shrink-0 text-gray-300 hover:text-red-400"
              >
                🗑
              </button>
            </div>
            <div className="mt-2 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => decreaseQuantity(item.cartItemId)}
                aria-label="수량 감소"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-pink-200 text-pink-500 hover:bg-pink-50"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => increaseQuantity(item.cartItemId)}
                aria-label="수량 증가"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-pink-200 text-pink-500 hover:bg-pink-50"
              >
                +
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const divider = (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-pink-200" />
      <span className="text-sm">🎀</span>
      <div className="h-px flex-1 bg-pink-200" />
    </div>
  );

  const orderButton = (
    <button
      type="button"
      onClick={handleOpenPaymentModal}
      disabled={items.length === 0}
      className="w-full rounded-full bg-pink-500 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-pink-600 disabled:bg-gray-300 disabled:shadow-none"
    >
      ♥ 주문하기
    </button>
  );

  return (
    <aside className="w-full md:w-2/5 lg:w-1/3">
      {/* 데스크톱/태블릿: 항상 펼쳐진 사이드바 */}
      <div className="sticky top-8 hidden rounded-2xl bg-white p-6 shadow-lg md:block">
        <h2 className="text-center text-xl font-bold text-pink-500">🎀 주문 목록 🎀</h2>
        <p className="mt-1 text-center text-sm text-gray-400">
          {orderType === 'dine-in' ? '🍽️ 매장에서' : '🥡 포장'}
        </p>
        <div className="mt-4 min-h-[160px] rounded-xl bg-pink-50 p-4">{itemList}</div>
        {divider}
        <div className="mb-3 flex justify-between text-lg font-bold">
          <span>총 금액</span>
          <span className="text-pink-600">{totalPrice.toLocaleString()}원</span>
        </div>
        {orderButton}
      </div>

      {/* 모바일: 화면 맨 아래에 고정되는 접이식 요약 카드. 스크롤해도
          항상 보이도록 fixed + 다른 콘텐츠 위 레이어(z-40)로 띄우고,
          펼쳤을 때 목록 자체가 화면을 넘지 않도록 내부에서만
          스크롤되게 합니다(max-h-[50vh] overflow-y-auto). */}
      <div className="fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.12)] md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileListOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <span className="relative text-xl">
              🛒
              {totalCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
                  {totalCount}
                </span>
              )}
            </span>
            <span className="text-sm text-gray-500">총 {totalCount}개</span>
          </span>
          <span className="font-bold text-pink-600">{totalPrice.toLocaleString()}원</span>
          <span className={`text-gray-400 transition-transform ${isMobileListOpen ? 'rotate-90' : ''}`}>›</span>
        </button>

        {isMobileListOpen && (
          <div className="mt-4 max-h-[50vh] overflow-y-auto rounded-xl bg-pink-50 p-4">{itemList}</div>
        )}

        <div className="mt-4">{orderButton}</div>
      </div>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="결제 수단 선택">
        <p className="mb-4 text-center text-sm text-gray-500">
          총 <span className="font-bold text-pink-600">{totalPrice.toLocaleString()}원</span>을 어떻게
          결제하시겠어요?
        </p>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.value}
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSelectPayment(method.value)}
              className={`flex flex-col items-center gap-2 rounded-xl py-5 text-sm font-bold shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-60 ${method.className}`}
            >
              <span className="text-2xl">{method.icon}</span>
              <span>{method.value}</span>
            </button>
          ))}
        </div>
        {isSubmitting && <p className="mt-4 text-center text-sm text-gray-400">주문을 처리 중이에요...</p>}
      </Modal>
    </aside>
  );
}

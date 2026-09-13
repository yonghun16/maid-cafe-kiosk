// @owner: ai
import Image from 'next/image';
import type { Order, PaymentMethod } from '@repo/types';

interface OrderCardProps {
  order: Order;
  /** 전달하면 카드에 "완료" 버튼이 표시되고, 클릭 시 호출됩니다(진행중 주문 카드용). */
  onComplete?: () => void;
  /** 전달하면 카드에 "취소" 버튼이 표시되고, 클릭 시 호출됩니다(진행중 주문 카드용). */
  onCancel?: () => void;
  /** 전달하면 카드에 "되돌리기" 버튼이 표시되고, 클릭 시 호출됩니다(지난 주문 카드용). */
  onUncomplete?: () => void;
}

// 결제수단을 한눈에 구분할 수 있도록 브랜드 색상에 맞춰 배지 색을 다르게 합니다.
const PAYMENT_METHOD_BADGE_CLASS: Record<PaymentMethod, string> = {
  신용카드: 'bg-gray-200 text-gray-600',
  NPay: 'bg-green-100 text-green-700',
  토스페이: 'bg-blue-100 text-blue-700',
  'Kakao Pay': 'bg-yellow-200 text-yellow-800',
};

export function OrderCard({ order, onComplete, onCancel, onUncomplete }: OrderCardProps) {
  const createdAt = new Date(order.createdAt);
  const date = createdAt.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
  });
  const time = createdAt.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-4 py-1.5 text-base font-bold text-white ${
              order.orderType === 'dine-in' ? 'bg-amber-400' : 'bg-pink-500'
            }`}
          >
            {order.orderType === 'dine-in' ? '🍽️ 매장' : '🥡 포장'}
          </span>
          {order.orderNumber != null && (
            <span className="text-xl font-extrabold text-gray-700">No. {order.orderNumber}</span>
          )}
          {order.isCancelled && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-600">❌ 취소됨</span>
          )}
        </div>
        {order.paymentMethod && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${PAYMENT_METHOD_BADGE_CLASS[order.paymentMethod]}`}
          >
            {order.paymentMethod}
          </span>
        )}
      </div>
      <div className="mt-1.5 text-right text-lg font-semibold text-gray-400">
        {date} {time}
      </div>
      <ul className="mt-4 space-y-3">
        {order.items.map((item, index) => (
          <li key={item._id ?? `${item.productId}-${index}`} className="flex items-start gap-3">
            {item.imageUrl && (
              <div className="relative h-16 w-16 shrink-0">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="rounded-lg object-cover"
                />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-lg font-semibold text-gray-800">{item.name}</span>
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.temperature && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-sm font-semibold ${
                        item.temperature === 'HOT' ? 'bg-orange-100 text-orange-600' : 'bg-sky-100 text-sky-600'
                      }`}
                    >
                      {item.temperature === 'HOT' ? '🔥 HOT' : '🧊 ICE'}
                    </span>
                  )}
                  {item.iceAmount && (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-sm font-semibold text-sky-600">
                      얼음 {item.iceAmount}
                    </span>
                  )}
                  {item.hasExtraShot && (
                    <span className="rounded-full bg-pink-100 px-2 py-0.5 text-sm font-semibold text-pink-600">
                      샷 추가
                    </span>
                  )}
                  {item.magicSpell && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm font-semibold text-amber-700">
                      🪄 {item.magicSpell}
                    </span>
                  )}
                  {item.selectedOptions?.map((option) => (
                    <span
                      key={option.name}
                      className="rounded-full bg-purple-100 px-2 py-0.5 text-sm font-semibold text-purple-600"
                    >
                      {option.name}
                    </span>
                  ))}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-base text-gray-500">
                    {item.price.toLocaleString()}원 × {item.quantity}
                  </p>
                  <span className="text-lg font-bold text-gray-700">
                    {(item.price * item.quantity).toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-xl font-bold text-gray-800">
        <span>합계</span>
        <span>{order.totalPrice.toLocaleString()}원</span>
      </div>
      {(onComplete || onCancel) && (
        <div className="mt-4 flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-lg font-semibold text-gray-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-500"
            >
              취소
            </button>
          )}
          {onComplete && (
            <button
              type="button"
              onClick={onComplete}
              className="flex-1 rounded-lg border border-gray-300 py-2.5 text-lg font-semibold text-gray-500 transition-colors hover:border-pink-300 hover:bg-pink-50 hover:text-pink-500"
            >
              완료
            </button>
          )}
        </div>
      )}
      {onUncomplete && (
        <button
          type="button"
          onClick={onUncomplete}
          className="mt-4 w-full rounded-lg border border-gray-300 py-2.5 text-lg font-semibold text-gray-500 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
        >
          ↩ 되돌리기
        </button>
      )}
    </div>
  );
}

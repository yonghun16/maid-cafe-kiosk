// @owner: ai
import type { Order } from '@repo/types';

interface OrderCardProps {
  order: Order;
  /** 전달하면 카드에 "완료" 버튼이 표시되고, 클릭 시 호출됩니다. */
  onComplete?: () => void;
}

export function OrderCard({ order, onComplete }: OrderCardProps) {
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
        </div>
        <span className="text-lg font-semibold text-gray-400">
          {date} {time}
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center gap-3">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-gray-800">{item.name}</p>
              <p className="text-base text-gray-500">
                {item.price.toLocaleString()}원 × {item.quantity}
              </p>
            </div>
            <span className="shrink-0 text-lg font-bold text-gray-700">
              {(item.price * item.quantity).toLocaleString()}원
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3 text-xl font-bold text-gray-800">
        <span>합계</span>
        <span>{order.totalPrice.toLocaleString()}원</span>
      </div>
      {onComplete && (
        <button
          type="button"
          onClick={onComplete}
          className="mt-4 w-full rounded-lg bg-pink-500 py-2.5 text-lg font-bold text-white transition-colors hover:bg-pink-600"
        >
          ✅ 완료
        </button>
      )}
    </div>
  );
}

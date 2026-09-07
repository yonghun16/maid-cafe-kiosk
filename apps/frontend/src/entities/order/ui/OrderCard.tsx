// @owner: ai
import type { Order } from '@repo/types';

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const time = new Date(order.createdAt).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold text-white ${
            order.orderType === 'dine-in' ? 'bg-amber-400' : 'bg-pink-500'
          }`}
        >
          {order.orderType === 'dine-in' ? '🍽️ 매장' : '🥡 포장'}
        </span>
        <span className="text-sm text-gray-400">{time}</span>
      </div>
      <ul className="mt-3 space-y-1">
        {order.items.map((item) => (
          <li key={item.productId} className="flex justify-between text-sm text-gray-700">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>{(item.price * item.quantity).toLocaleString()}원</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex justify-between border-t border-gray-200 pt-2 font-bold text-gray-800">
        <span>합계</span>
        <span>{order.totalPrice.toLocaleString()}원</span>
      </div>
    </div>
  );
}

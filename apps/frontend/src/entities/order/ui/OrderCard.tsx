// @owner: ai
import Image from 'next/image';
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
          {order.paymentMethod && (
            <span className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-600">
              {order.paymentMethod}
            </span>
          )}
        </div>
        <span className="text-lg font-semibold text-gray-400">
          {date} {time}
        </span>
      </div>
      <ul className="mt-4 space-y-3">
        {order.items.map((item, index) => (
          <li key={item._id ?? `${item.productId}-${index}`} className="flex items-center gap-3">
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
            <div className="min-w-0 flex-1">
              {/* ✅ 이름+옵션 배지를 하나의 truncate 문단에 같이 넣으면
                  줄 너비를 넘는 배지가 통째로 가려져 버려서(옵션이 안
                  보인다는 원인), flex-wrap으로 바꿔 옵션이 항상 보이게
                  합니다. */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg font-semibold text-gray-800">{item.name}</span>
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
          className="mt-4 w-full rounded-lg border border-gray-300 py-2.5 text-lg font-semibold text-gray-500 transition-colors hover:border-pink-300 hover:bg-pink-50 hover:text-pink-500"
        >
          완료
        </button>
      )}
    </div>
  );
}

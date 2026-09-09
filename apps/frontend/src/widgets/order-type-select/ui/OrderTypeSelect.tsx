// @owner: ai
'use client';

import { useOrderTypeStore } from '../../../features/order-type';
import { AdBanner } from '../../../entities/ad';

export function OrderTypeSelect() {
  const setOrderType = useOrderTypeStore((state) => state.setOrderType);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-kiosk-pattern p-8 text-center">
      <div>
        <h1 className="font-script text-4xl font-bold text-pink-500 md:text-6xl">
          🎀 Maid Kiosk 🎀
        </h1>
        <p className="mt-4 text-lg font-semibold text-gray-600 md:text-xl">
          주인님, 매장에서 드시나요 포장해드릴까요?
        </p>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={() => setOrderType('dine-in')}
          className="flex-1 rounded-2xl bg-white p-8 text-xl font-bold text-gray-700 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
        >
          🍽️
          <br />
          매장에서
        </button>
        <button
          type="button"
          onClick={() => setOrderType('takeout')}
          className="flex-1 rounded-2xl bg-pink-500 p-8 text-xl font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-pink-600 hover:shadow-xl"
        >
          🥡
          <br />
          포장
        </button>
      </div>

      <AdBanner />
    </div>
  );
}

// @owner: ai
//  역할: 관리자/주방이 들어온 주문을 최신순으로 확인합니다. 10초마다 자동
//  갱신되고, 수동 새로고침 버튼도 제공합니다.
'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Order } from '@repo/types';
import { getOrders, OrderCard } from '../../../entities/order';

const POLL_INTERVAL_MS = 10_000;

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('주문 목록을 불러오는 중 오류가 발생했습니다:', error);
      toast.error('주문 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const intervalId = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-700">주문 내역</h2>
        <button
          type="button"
          onClick={fetchOrders}
          className="rounded-md border border-pink-300 px-3 py-1 text-sm font-semibold text-pink-500 hover:bg-pink-50"
        >
          새로고침
        </button>
      </div>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">아직 들어온 주문이 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

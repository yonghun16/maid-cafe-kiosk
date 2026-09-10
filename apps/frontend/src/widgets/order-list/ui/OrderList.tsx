// @owner: ai
//  역할: 관리자/주방이 진행중 주문 또는 지난(완료) 주문을 최신순으로
//  확인합니다. 10초마다 자동 갱신되고, 수동 새로고침 버튼도 제공합니다.
'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Order, OrderStatusFilter } from '@repo/types';
import { completeOrder, getOrders, OrderCard } from '../../../entities/order';

const POLL_INTERVAL_MS = 10_000;

interface OrderListProps {
  status: OrderStatusFilter;
}

export function OrderList({ status }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(status);
      setOrders(data);
    } catch (error) {
      console.error('주문 목록을 불러오는 중 오류가 발생했습니다:', error);
      toast.error('주문 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    setIsLoading(true);
    fetchOrders();
    const intervalId = setInterval(fetchOrders, POLL_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  // ✅ 브라우저가 백그라운드 탭의 setInterval 타이머를 늦추거나 멈출 수
  // 있어서, 탭이 다시 보일 때 즉시 한 번 새로고침합니다. "직접 새로고침
  // (F5)해야만 최신 상태로 보인다"는 문제를 자동 폴링만으로는 못 잡는
  // 경우를 보완합니다.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchOrders();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchOrders]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  const handleComplete = async (orderId: string) => {
    try {
      await completeOrder(orderId);
      toast.success('주문을 완료 처리했습니다.');
      // ✅ 재조회 응답을 기다리지 않고도 방금 완료한 주문을 목록에서 바로
      // 지워서, 네트워크 지연이나 폴링 타이밍과 무관하게 클릭 즉시
      // 화면에 반영되게 합니다. fetchOrders()로 서버 상태와 다시 맞춥니다.
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      fetchOrders();
    } catch (error) {
      console.error('주문 완료 처리 중 오류가 발생했습니다:', error);
      toast.error('주문 완료 처리에 실패했습니다.');
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-700">
          {status === 'pending' ? '진행중 주문' : '지난 주문'}
        </h2>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="rounded-md border border-pink-300 px-4 py-2 text-base font-semibold text-pink-500 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">
          {status === 'pending' ? '아직 들어온 주문이 없습니다.' : '완료된 주문이 없습니다.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onComplete={status === 'pending' ? () => handleComplete(order._id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// @owner: ai
//  역할: 관리자/주방이 진행중 주문 또는 지난(완료) 주문을 최신순으로
//  확인합니다. 10초마다 자동 갱신되고, 수동 새로고침 버튼도 제공합니다.
'use client';

import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Order, OrderStatusFilter, OrderType } from '@repo/types';
import { cancelOrder, completeOrder, getOrders, OrderCard, uncompleteOrder } from '../../../entities/order';
import { Modal } from '../../../shared/ui';

const POLL_INTERVAL_MS = 10_000;

type OrderTypeFilter = OrderType | 'all';

const ORDER_TYPE_FILTERS: { value: OrderTypeFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'dine-in', label: '🍽️ 매장' },
  { value: 'takeout', label: '🥡 포장' },
];

const STATUS_LABEL: Record<OrderStatusFilter, string> = {
  pending: '진행중 주문',
  completed: '완료한 주문',
  cancelled: '취소된 주문',
};

const EMPTY_MESSAGE: Record<OrderStatusFilter, string> = {
  pending: '아직 들어온 주문이 없습니다.',
  completed: '완료된 주문이 없습니다.',
  cancelled: '취소된 주문이 없습니다.',
};

interface OrderListProps {
  status: OrderStatusFilter;
}

export function OrderList({ status }: OrderListProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<OrderTypeFilter>('all');
  // ✅ 취소는 되돌리기 어려운 동작이라, 브라우저 기본 confirm() 대신
  // 앱과 같은 스타일의 확인 모달을 한 번 거칩니다.
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders({
        status,
        date: dateFilter || undefined,
        orderType: orderTypeFilter === 'all' ? undefined : orderTypeFilter,
      });
      setOrders(data);
    } catch (error) {
      console.error('주문 목록을 불러오는 중 오류가 발생했습니다:', error);
      toast.error('주문 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [status, dateFilter, orderTypeFilter]);

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

  const handleConfirmCancel = async () => {
    const orderId = cancelTargetId;
    if (!orderId) return;
    setCancelTargetId(null);
    try {
      await cancelOrder(orderId);
      toast.success('주문을 취소했습니다.');
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      fetchOrders();
    } catch (error) {
      console.error('주문 취소 처리 중 오류가 발생했습니다:', error);
      toast.error('주문 취소에 실패했습니다.');
    }
  };

  const handleUncomplete = async (orderId: string) => {
    try {
      await uncompleteOrder(orderId);
      toast.success('주문을 진행중 상태로 되돌렸습니다.');
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      fetchOrders();
    } catch (error) {
      console.error('주문 되돌리기 처리 중 오류가 발생했습니다:', error);
      toast.error('주문 되돌리기에 실패했습니다.');
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-700">{STATUS_LABEL[status]}</h2>
        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="rounded-md border border-pink-300 px-4 py-2 text-base font-semibold text-pink-500 transition-colors hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRefreshing ? '새로고침 중...' : '새로고침'}
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-base text-gray-700"
        />
        {dateFilter && (
          <button
            type="button"
            onClick={() => setDateFilter('')}
            className="text-sm font-semibold text-gray-400 hover:text-gray-600"
          >
            날짜 초기화
          </button>
        )}
        <div className="flex gap-2">
          {ORDER_TYPE_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setOrderTypeFilter(filter.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                orderTypeFilter === filter.value
                  ? 'bg-pink-500 text-white'
                  : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-400">
          {dateFilter || orderTypeFilter !== 'all' ? '조건에 맞는 주문이 없습니다.' : EMPTY_MESSAGE[status]}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onComplete={status === 'pending' ? () => handleComplete(order._id) : undefined}
              onCancel={status === 'pending' ? () => setCancelTargetId(order._id) : undefined}
              onUncomplete={status === 'completed' ? () => handleUncomplete(order._id) : undefined}
            />
          ))}
        </div>
      )}

      <Modal isOpen={cancelTargetId !== null} onClose={() => setCancelTargetId(null)} title="주문 취소">
        <p className="text-sm text-gray-600">이 주문을 취소할까요? 차감된 재고는 되돌려집니다.</p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setCancelTargetId(null)}
            className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={handleConfirmCancel}
            className="flex-1 rounded-md bg-red-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-600"
          >
            주문 취소
          </button>
        </div>
      </Modal>
    </div>
  );
}

// @owner: ai
import type { Order, OrderStatusFilter } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 주문 목록을 최신순으로 조회합니다. 관리자 세션이 필요합니다.
 * @param status - `'pending'`(진행중)/`'completed'`(지난 주문) 필터. 생략하면 전체 조회
 * @returns 주문 배열
 */
export async function getOrders(status?: OrderStatusFilter): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders', { params: status ? { status } : undefined });
  return response.data;
}

/**
 * 주문을 완료 처리합니다. 완료되면 진행중 목록에서 빠지고 지난 주문
 * 목록으로 이동합니다.
 * @param orderId - 완료 처리할 주문의 id
 * @returns 수정된 주문
 */
export async function completeOrder(orderId: string): Promise<Order> {
  const response = await apiClient.patch<Order>(`/orders/${orderId}/complete`);
  return response.data;
}

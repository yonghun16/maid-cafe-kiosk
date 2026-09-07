// @owner: ai
import type { Order } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 전체 주문 목록을 최신순으로 조회합니다. 관리자 세션이 필요합니다.
 * @returns 주문 배열
 */
export async function getOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders');
  return response.data;
}

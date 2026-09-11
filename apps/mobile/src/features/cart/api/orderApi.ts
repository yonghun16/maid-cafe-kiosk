// @owner: ai
import type { CreateOrderInput, Order } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 장바구니 내용을 주문으로 제출합니다.
 * @param payload - 주문 아이템 목록과 총액
 * @returns 생성된 주문
 */
export async function submitOrder(payload: CreateOrderInput): Promise<Order> {
  const response = await apiClient.post<Order>('/orders', payload);
  return response.data;
}

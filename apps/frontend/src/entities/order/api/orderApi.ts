// @owner: ai
import type { MonthlySalesSummary, Order, OrderListQuery, ProductSalesRanking } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 주문 목록을 최신순으로 조회합니다. 관리자 세션이 필요합니다.
 * @param query - `status`(진행중/지난 주문)/`orderType`(매장/포장)/
 *   `date`('YYYY-MM-DD', KST 기준 하루) 필터. 전부 선택이며 생략하면
 *   해당 조건 없이 전체 조회
 * @returns 주문 배열
 */
export async function getOrders(query?: OrderListQuery): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders', { params: query });
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

/**
 * 특정 연도 1~12월의 월별 매출/판매량 추이를 조회합니다(KST 기준,
 * 주문 없는 달도 0으로 채워서 내려옴). 관리자 세션이 필요합니다.
 * @param year - 조회할 연도(생략하면 서버가 올해로 취급)
 * @returns 1월 → 12월 순서의 월별 집계 배열(12개)
 */
export async function getMonthlySalesSummary(year?: number): Promise<MonthlySalesSummary[]> {
  const response = await apiClient.get<MonthlySalesSummary[]>('/orders/stats/monthly', {
    params: year ? { year } : undefined,
  });
  return response.data;
}

/**
 * 특정 월의 메뉴별 판매량/매출 순위를 조회합니다(판매량 내림차순).
 * 관리자 세션이 필요합니다.
 * @param month - 'YYYY-MM' 형식(KST 기준)
 * @returns 메뉴별 판매 순위 배열
 */
export async function getProductSalesRanking(month: string): Promise<ProductSalesRanking[]> {
  const response = await apiClient.get<ProductSalesRanking[]>(`/orders/stats/monthly/${month}`);
  return response.data;
}

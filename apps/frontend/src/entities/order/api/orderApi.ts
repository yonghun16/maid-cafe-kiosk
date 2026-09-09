// @owner: ai
import type { MonthlySalesSummary, Order, OrderStatusFilter, ProductSalesRanking } from '@repo/types';
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

/**
 * 최근 N개월의 월별 매출/판매량 추이를 조회합니다(KST 기준, 주문 없는
 * 달도 0으로 채워서 내려옴). 관리자 세션이 필요합니다.
 * @param months - 조회할 개월 수(기본 6)
 * @returns 오래된 달 → 최신 달 순서의 월별 집계 배열
 */
export async function getMonthlySalesSummary(months = 6): Promise<MonthlySalesSummary[]> {
  const response = await apiClient.get<MonthlySalesSummary[]>('/orders/stats/monthly', {
    params: { months },
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

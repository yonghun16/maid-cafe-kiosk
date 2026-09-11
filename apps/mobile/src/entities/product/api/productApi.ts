// @owner: ai
import type { Product } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 전체 상품 목록을 조회합니다.
 * @returns 상품 배열
 */
export async function getProducts(): Promise<Product[]> {
  const response = await apiClient.get<Product[]>('/products');
  return response.data;
}

// @owner: ai
import type { Category } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 전체 카테고리 목록을 지정된 순서대로 조회합니다.
 * @returns 카테고리 배열
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
}

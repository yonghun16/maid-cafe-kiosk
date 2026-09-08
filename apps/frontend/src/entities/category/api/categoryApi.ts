// @owner: ai
import type { Category, CategoryInput } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 전체 카테고리 목록을 이름순으로 조회합니다.
 * @returns 카테고리 배열
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/categories');
  return response.data;
}

/**
 * 새 카테고리를 등록합니다.
 * @param name - 카테고리 이름
 * @returns 생성된 카테고리
 */
export async function createCategory(name: string): Promise<Category> {
  const payload: CategoryInput = { name };
  const response = await apiClient.post<Category>('/categories', payload);
  return response.data;
}

/**
 * 카테고리 이름을 수정합니다. 이 이름을 쓰던 상품들도 서버에서 함께
 * 갱신됩니다.
 * @param categoryId - 수정할 카테고리의 id
 * @param name - 새 이름
 * @returns 수정된 카테고리
 */
export async function updateCategory(categoryId: string, name: string): Promise<Category> {
  const payload: CategoryInput = { name };
  const response = await apiClient.put<Category>(`/categories/${categoryId}`, payload);
  return response.data;
}

/**
 * 카테고리를 삭제합니다. 이 카테고리에 속한 상품도 서버에서 함께
 * 삭제됩니다.
 * @param categoryId - 삭제할 카테고리의 id
 */
export async function deleteCategoryById(categoryId: string): Promise<void> {
  await apiClient.delete(`/categories/${categoryId}`);
}

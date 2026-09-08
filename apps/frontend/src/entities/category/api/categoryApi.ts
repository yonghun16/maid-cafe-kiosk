// @owner: ai
import type { Category, CategoryInput, ReorderCategoriesInput } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 전체 카테고리 목록을 지정된 순서대로 조회합니다.
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

/**
 * 카테고리 노출 순서를 한 번에 재배열합니다.
 * @param orderedIds - 원하는 순서대로 나열한 카테고리 id 배열
 * @returns 순서가 반영된 전체 카테고리 목록
 */
export async function reorderCategories(orderedIds: string[]): Promise<Category[]> {
  const payload: ReorderCategoriesInput = { orderedIds };
  const response = await apiClient.patch<Category[]>('/categories/reorder', payload);
  return response.data;
}

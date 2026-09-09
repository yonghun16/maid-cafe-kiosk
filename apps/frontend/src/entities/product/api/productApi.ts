// @owner: ai
import type {
  Product,
  ProductInput,
  ReorderProductsInput,
  UpdateSoldOutInput,
  UpdateStockInput,
} from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 전체 상품 목록을 조회합니다.
 * @returns 상품 배열
 */
export async function getProducts(): Promise<Product[]> {
  const response = await apiClient.get<Product[]>('/products');
  return response.data;
}

/**
 * 새 상품을 등록합니다.
 * @param newProduct - 상품 정보
 * @returns 서버가 생성한 상품(생성된 `_id`, `order` 포함)
 */
export async function createProduct(newProduct: ProductInput): Promise<Product> {
  const response = await apiClient.post<Product>('/products', newProduct);
  return response.data;
}

/**
 * 상품 정보를 수정합니다.
 * @param productId - 수정할 상품의 id
 * @param updatedProduct - 상품 정보(전체 필드)
 * @returns 수정된 상품
 */
export async function updateProduct(
  productId: string,
  updatedProduct: ProductInput,
): Promise<Product> {
  const response = await apiClient.put<Product>(`/products/${productId}`, updatedProduct);
  return response.data;
}

/**
 * 같은 카테고리 안에서 상품 노출 순서를 한 번에 재배열합니다.
 * @param orderedIds - 원하는 순서대로 나열한, 같은 카테고리에 속한 상품 id 배열
 * @returns 갱신된 전체 상품 목록(카테고리 → 순서 정렬)
 */
export async function reorderProducts(orderedIds: string[]): Promise<Product[]> {
  const payload: ReorderProductsInput = { orderedIds };
  const response = await apiClient.patch<Product[]>('/products/reorder', payload);
  return response.data;
}

/**
 * 상품의 품절 여부를 변경합니다.
 * @param productId - 대상 상품의 id
 * @param isSoldOut - true면 품절, false면 판매중으로 표시
 * @returns 수정된 상품
 */
export async function updateSoldOutStatus(productId: string, isSoldOut: boolean): Promise<Product> {
  const payload: UpdateSoldOutInput = { isSoldOut };
  const response = await apiClient.patch<Product>(`/products/${productId}/sold-out`, payload);
  return response.data;
}

/**
 * 상품을 삭제합니다.
 * @param productId - 삭제할 상품의 id
 */
export async function deleteProductById(productId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}`);
}

/**
 * 상품의 재고 수량을 절대값으로 설정합니다(증감이 아니라 새 값을 그대로
 * 저장). 0 이하로 설정하면 자동으로 품절 처리되고, 0보다 크게 설정하면
 * 자동으로 품절이 해제됩니다.
 * @param productId - 대상 상품의 id
 * @param stock - 새 재고 수량
 * @returns 수정된 상품
 */
export async function updateStock(productId: string, stock: number): Promise<Product> {
  const payload: UpdateStockInput = { stock };
  const response = await apiClient.patch<Product>(`/products/${productId}/stock`, payload);
  return response.data;
}

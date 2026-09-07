// @owner: ai
import type { Product, UploadImageResponse } from '@repo/types';
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
 * @param newProduct - `_id`를 제외한 상품 정보
 * @returns 서버가 생성한 상품(생성된 `_id` 포함)
 */
export async function createProduct(newProduct: Omit<Product, '_id'>): Promise<Product> {
  const response = await apiClient.post<Product>('/products', newProduct);
  return response.data;
}

/**
 * 상품 정보를 수정합니다.
 * @param productId - 수정할 상품의 id
 * @param updatedProduct - `_id`를 제외한 상품 정보(전체 필드)
 * @returns 수정된 상품
 */
export async function updateProduct(
  productId: string,
  updatedProduct: Omit<Product, '_id'>,
): Promise<Product> {
  const response = await apiClient.put<Product>(`/products/${productId}`, updatedProduct);
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
 * 상품 이미지 파일을 업로드합니다.
 * @param file - 업로드할 이미지 파일
 * @returns 업로드된 이미지의 공개 URL (Cloudflare R2)
 */
export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const response = await apiClient.post<UploadImageResponse>('/uploads', formData);
  return response.data.url;
}

// @owner: ai
import type { UploadImageResponse } from '@repo/types';
import { apiClient } from './client';

/**
 * 이미지 파일을 업로드합니다(Cloudflare R2에 저장). 상품 이미지, 광고
 * 배너 등 도메인과 무관하게 이미지 업로드가 필요한 곳에서 공통으로 씁니다.
 * @param file - 업로드할 이미지 파일
 * @returns 업로드된 이미지의 공개 URL
 */
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);
  const response = await apiClient.post<UploadImageResponse>('/uploads', formData);
  return response.data.url;
}

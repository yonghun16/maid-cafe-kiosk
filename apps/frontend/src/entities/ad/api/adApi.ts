// @owner: ai
import type { Ad, AdInput } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 첫 화면에 노출할 광고 배너 목록을 등록된 순서로 조회합니다.
 * @returns 광고 배열
 */
export async function getAds(): Promise<Ad[]> {
  const response = await apiClient.get<Ad[]>('/ads');
  return response.data;
}

/**
 * 새 광고 배너를 등록합니다.
 * @param imageUrl - 업로드된 광고 이미지의 공개 URL
 * @returns 서버가 생성한 광고
 */
export async function createAd(imageUrl: string): Promise<Ad> {
  const payload: AdInput = { imageUrl };
  const response = await apiClient.post<Ad>('/ads', payload);
  return response.data;
}

/**
 * 광고 배너 이미지를 교체합니다.
 * @param adId - 수정할 광고의 id
 * @param imageUrl - 새 이미지의 공개 URL
 * @returns 수정된 광고
 */
export async function updateAd(adId: string, imageUrl: string): Promise<Ad> {
  const payload: AdInput = { imageUrl };
  const response = await apiClient.put<Ad>(`/ads/${adId}`, payload);
  return response.data;
}

/**
 * 광고 배너를 삭제합니다.
 * @param adId - 삭제할 광고의 id
 */
export async function deleteAdById(adId: string): Promise<void> {
  await apiClient.delete(`/ads/${adId}`);
}

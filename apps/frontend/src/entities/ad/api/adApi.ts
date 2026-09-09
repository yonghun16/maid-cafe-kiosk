// @owner: ai
import type { Ad, AdInput, ReorderAdsInput } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 첫 화면에 노출할 광고 배너 목록을 지정된 순서(`order`)로 조회합니다.
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

/**
 * 광고 노출 순서를 한 번에 재배열합니다.
 * @param orderedIds - 원하는 순서대로 나열한 광고 id 배열
 * @returns 갱신된 전체 광고 목록(순서 정렬)
 */
export async function reorderAds(orderedIds: string[]): Promise<Ad[]> {
  const payload: ReorderAdsInput = { orderedIds };
  const response = await apiClient.patch<Ad[]>('/ads/reorder', payload);
  return response.data;
}

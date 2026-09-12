// @owner: ai
import type { Ad } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 첫 화면에 노출할 광고 배너 목록을 지정된 순서(`order`)로 조회합니다.
 * @returns 광고 배열
 */
export async function getAds(): Promise<Ad[]> {
  const response = await apiClient.get<Ad[]>('/ads');
  return response.data;
}

// @owner: ai
import type { AdminLoginInput, AdminSessionResponse } from '@repo/types';
import { apiClient } from '../../../shared/api';

/**
 * 관리자 비밀번호로 로그인해 세션을 발급받습니다.
 * @param password - 관리자 공유 비밀번호
 * @returns 로그인 성공 시 `isAdmin: true`
 */
export async function loginAsAdmin(password: string): Promise<AdminSessionResponse> {
  const payload: AdminLoginInput = { password };
  const response = await apiClient.post<AdminSessionResponse>('/admin/login', payload);
  return response.data;
}

/**
 * 현재 세션이 관리자로 인증되어 있는지 확인합니다.
 * @returns 인증 여부
 */
export async function fetchAdminSession(): Promise<AdminSessionResponse> {
  const response = await apiClient.get<AdminSessionResponse>('/admin/session');
  return response.data;
}

/**
 * 관리자 세션을 종료합니다.
 */
export async function logoutAdmin(): Promise<AdminSessionResponse> {
  const response = await apiClient.post<AdminSessionResponse>('/admin/logout');
  return response.data;
}

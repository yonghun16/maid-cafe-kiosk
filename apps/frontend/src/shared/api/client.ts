// @owner: ai
import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * 백엔드 REST API와 통신하는 공용 axios 인스턴스입니다.
 * 각 슬라이스의 `api/` 세그먼트는 개별적으로 axios를 설정하지 않고 이 인스턴스를 가져다 씁니다.
 * `withCredentials: true`는 관리자 로그인 세션 쿠키를 백엔드(다른 오리진)와
 * 주고받기 위해 필요합니다.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

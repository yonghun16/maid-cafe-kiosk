// @owner: ai
import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * 백엔드 REST API와 통신하는 공용 axios 인스턴스입니다.
 * 각 슬라이스의 `api/` 세그먼트는 개별적으로 axios를 설정하지 않고 이 인스턴스를 가져다 씁니다.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// @owner: ai
import axios from 'axios';
import { API_BASE_URL } from '../config';

/**
 * 백엔드 REST API와 통신하는 공용 axios 인스턴스입니다. 앱은 브라우저가
 * 아니라 CORS 제약이 적용되지 않으므로, 웹 프론트엔드처럼 같은 오리진으로
 * 프록시할 필요 없이 백엔드에 직접 요청합니다. 고객 화면(`/api/products`,
 * `/api/categories`, `/api/ads`, `/api/orders` 생성)은 전부 인증이 필요
 * 없는 공개 엔드포인트라, 프론트엔드의 `apiClient`와 달리 세션 쿠키
 * (`withCredentials`)도 필요 없습니다.
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

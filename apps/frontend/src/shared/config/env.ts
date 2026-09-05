// @owner: ai

/**
 * 백엔드 REST API의 base URL입니다.
 * 배포 환경에서는 `NEXT_PUBLIC_API_URL` 환경변수로 override합니다.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

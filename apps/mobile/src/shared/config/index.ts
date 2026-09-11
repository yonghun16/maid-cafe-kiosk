// @owner: ai

/**
 * 백엔드 REST API의 base origin. Expo의 `EXPO_PUBLIC_` 접두사 환경변수는
 * 빌드 시점에 번들에 인라인되어 런타임에 `process.env`로 그대로 읽힙니다.
 * 로컬 시뮬레이터 개발 시 기본값은 `http://localhost:4000`이며, 실기기에서
 * 테스트하려면 같은 네트워크의 PC IP로 `.env`를 바꿔야 합니다.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_ORIGIN ?? 'http://localhost:4000';

// @owner: ai

/**
 * 백엔드 REST API의 base URL입니다. 항상 이 Next.js 서버 자신을
 * 가리키는 상대 경로이며, 실제 백엔드로의 중계는 `next.config.js`의
 * `rewrites()`가 처리합니다. 브라우저가 백엔드(Render)로 직접 요청을
 * 보내지 않게 해서, 로그인 세션 쿠키가 서드파티 쿠키로 취급돼 차단되는
 * 문제를 피합니다.
 */
export const API_BASE_URL = '/api';

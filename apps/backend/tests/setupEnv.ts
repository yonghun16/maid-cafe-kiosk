// @owner: ai
// Vitest의 setupFiles로 등록되어 각 테스트 파일의 import가 실행되기
// *전에* 먼저 돕니다. `src/lib/r2Client.ts`가 모듈 로드 시점에(함수 호출이
// 아니라) 이 값들을 바로 확인하고 없으면 `process.exit(1)`하기 때문에,
// `beforeAll` 안에서 설정하면 이미 늦습니다 — import 자체가 먼저 실행돼서.
process.env.ADMIN_PASSWORD ??= 'test-admin-password';
process.env.SESSION_SECRET ??= 'test-session-secret';
process.env.R2_ENDPOINT ??= 'https://example.com';
process.env.R2_ACCESS_KEY_ID ??= 'test-access-key';
process.env.R2_SECRET_ACCESS_KEY ??= 'test-secret-key';
process.env.R2_BUCKET_NAME ??= 'test-bucket';
process.env.R2_PUBLIC_URL ??= 'https://example.com/test-bucket';
// 테스트 전용으로 새로 발급한 더미 VAPID 키 쌍입니다(실제 서비스와 무관).
process.env.VAPID_PUBLIC_KEY ??=
  'BGU3Ykec35DMS81ykLylWk8stjTzbxVZ6qvNcs4IwRWxDwtV8J32h8FYFpAkgfIyOBQJ_W-VGibwjyRPhjhmk8c';
process.env.VAPID_PRIVATE_KEY ??= 'dZOoz6BtHZNvIB0203S_KRdnNdi8uzLcCfSo8AiXBqs';

// @owner: ai
import { S3Client } from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

if (!R2_ENDPOINT || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  console.error('❌ 에러: R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

/**
 * Cloudflare R2(S3 호환 API)와 통신하는 공용 S3 클라이언트입니다.
 * R2는 리전 개념이 없어 임의의 값("auto")을 사용합니다.
 */
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? '';
export const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';

if (!R2_BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error('❌ 에러: R2_BUCKET_NAME / R2_PUBLIC_URL 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

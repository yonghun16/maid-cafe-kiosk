// @owner: ai
import 'dotenv/config';
import mongoose from 'mongoose';

import { createApp } from './app';
import { runStartupSeed } from './lib/seed';
// './types/session'은 express-session의 SessionData를 확장하는 타입 전용
// 파일이라 런타임 import가 필요 없습니다. tsconfig의 include에 포함되어
// 있으면 컴파일 시 자동으로 적용됩니다.

// Railway 등 배포 환경은 자체적으로 할당한 포트를 PORT 환경변수로 넘겨줍니다.
// 로컬 개발 시에는 지정된 값이 없으므로 4000을 기본값으로 사용합니다.
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// process.env.MONGO_URI는 .env 파일에 있는 MONGO_URI 값을 가리킵니다.
const MONGO_URI = process.env.MONGO_URI;

// 만약 MONGO_URI가 없다면 에러를 발생시켜 서버 실행을 중지합니다.
if (!MONGO_URI) {
  console.error('❌ 에러: MONGO_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const app = createApp(MONGO_URI);

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB에 성공적으로 연결되었습니다.');
    await runStartupSeed();
  })
  .catch((err) => console.error('❌ MongoDB 연결 실패:', err));

app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

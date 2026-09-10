// @owner: ai
import 'dotenv/config';
import { randomUUID } from 'crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';

import { runStartupSeed } from './lib/seed';
import { adminAuthRouter } from './routes/adminAuth';
import { uploadsRouter } from './routes/uploads';
import { categoriesRouter } from './routes/categories';
import { productsRouter } from './routes/products';
import { adsRouter } from './routes/ads';
import { ordersRouter } from './routes/orders';
// './types/session'은 express-session의 SessionData를 확장하는 타입 전용
// 파일이라 런타임 import가 필요 없습니다. tsconfig의 include에 포함되어
// 있으면 컴파일 시 자동으로 적용됩니다.

const app = express();
// Render는 앞단 프록시(Cloudflare)가 HTTPS를 종료하고 내부적으론 HTTP로
// 전달합니다. 이걸 신뢰하지 않으면 Express가 연결을 안전하지 않다고
// 판단해 `cookie.secure: true`인 세션 쿠키를 아예 심지 않습니다.
app.set('trust proxy', 1);
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

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB에 성공적으로 연결되었습니다.');
    await runStartupSeed();
  })
  .catch((err) => console.error('❌ MongoDB 연결 실패:', err));

// 프론트엔드(Vercel)와 백엔드(Render)가 다른 오리진이라 세션 쿠키를 주고받으려면
// 와일드카드가 아닌 명시적 오리진 + credentials 허용이 필요합니다.
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
  console.warn(
    '⚠️ SESSION_SECRET 환경변수가 없어 서버 프로세스마다 새로 생성한 임시 값을 사용합니다. 서버가 재시작되면 기존 로그인 세션이 모두 끊깁니다.',
  );
}

// 관리자 로그인 세션을 MongoDB에 저장합니다. 별도 세션 DB 없이 이미 연결된
// MONGO_URI를 재사용합니다.
app.use(
  session({
    secret: SESSION_SECRET ?? randomUUID(),
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 8, // 8시간
    },
  }),
);

/**
 * 서버 생존 여부만 확인하는 헬스체크입니다. DB에 접근하지 않아 가볍습니다.
 * Render의 자체 헬스체크와, 무료 티어 슬립 방지를 위한 외부 핑(예: cron)
 * 양쪽에서 사용합니다.
 * @route GET /health
 */
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/admin', adminAuthRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/ads', adsRouter);
app.use('/api/orders', ordersRouter);

// multer의 파일 크기/타입 검증 실패 등을 JSON 에러로 변환합니다.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('요청 처리 중 오류가 발생했습니다:', err);
  res.status(400).json({ message: err.message || '요청을 처리하는 중 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

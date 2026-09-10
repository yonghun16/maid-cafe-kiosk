// @owner: ai
import { randomUUID } from 'crypto';
import express, { type Express, type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';

import { adminAuthRouter } from './routes/adminAuth';
import { uploadsRouter } from './routes/uploads';
import { categoriesRouter } from './routes/categories';
import { productsRouter } from './routes/products';
import { adsRouter } from './routes/ads';
import { ordersRouter } from './routes/orders';

/**
 * Express 앱을 만들고 미들웨어/라우터를 전부 연결합니다. MongoDB
 * 연결(`mongoose.connect`)과 서버 시작(`app.listen`)은 여기서 하지
 * 않습니다 — 테스트에서는 실제 포트를 열거나 운영 DB에 연결하지 않고
 * 이 앱 인스턴스만 가져다 Supertest로 직접 요청을 보내야 하기
 * 때문입니다(`src/index.ts`가 실제 서버 기동 담당).
 * @param sessionMongoUrl - 세션 저장(`connect-mongo`)에 쓸 MongoDB
 *   연결 문자열. 운영에서는 `MONGO_URI`, 테스트에서는 인메모리
 *   MongoDB 주소를 넘깁니다.
 */
export function createApp(sessionMongoUrl: string): Express {
  const app = express();
  // Render는 앞단 프록시(Cloudflare)가 HTTPS를 종료하고 내부적으론 HTTP로
  // 전달합니다. 이걸 신뢰하지 않으면 Express가 연결을 안전하지 않다고
  // 판단해 `cookie.secure: true`인 세션 쿠키를 아예 심지 않습니다.
  app.set('trust proxy', 1);

  // 프론트엔드(Vercel)와 백엔드(Render)가 다른 오리진이라 세션 쿠키를
  // 주고받으려면 와일드카드가 아닌 명시적 오리진 + credentials 허용이
  // 필요합니다.
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000';
  app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
  app.use(express.json());

  const SESSION_SECRET = process.env.SESSION_SECRET;
  if (!SESSION_SECRET) {
    console.warn(
      '⚠️ SESSION_SECRET 환경변수가 없어 서버 프로세스마다 새로 생성한 임시 값을 사용합니다. 서버가 재시작되면 기존 로그인 세션이 모두 끊깁니다.',
    );
  }

  // 관리자 로그인 세션을 MongoDB에 저장합니다.
  app.use(
    session({
      secret: SESSION_SECRET ?? randomUUID(),
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: sessionMongoUrl }),
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

  return app;
}

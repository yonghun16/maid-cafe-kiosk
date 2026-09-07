// @owner: ai
import 'dotenv/config';
import { randomUUID, timingSafeEqual } from 'crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import mongoose from 'mongoose';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type {
  AdminLoginInput,
  AdminSessionResponse,
  CreateOrderInput,
  Product as ProductType,
  UpdateSoldOutInput,
  UploadImageResponse,
} from '@repo/types';

import Product from './models/Product';
import Order from './models/Order';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from './lib/r2Client';
import { requireAdmin } from './middleware/requireAdmin';
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
  .then(() => console.log('✅ MongoDB에 성공적으로 연결되었습니다.'))
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

/**
 * 관리자 공유 비밀번호를 확인하고, 일치하면 세션에 인증 정보를 기록합니다.
 * 응답 계약은 `@repo/types`의 `AdminSessionResponse`를 따릅니다.
 * @route POST /api/admin/login
 * @param req.body - `@repo/types`의 `AdminLoginInput` (`password`)
 */
app.post(
  '/api/admin/login',
  (req: Request<Record<string, never>, unknown, AdminLoginInput>, res: Response) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('❌ 에러: ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.');
      res.status(500).json({ message: '서버에 관리자 인증이 설정되어 있지 않습니다.' });
      return;
    }

    const password = req.body?.password;
    const isValid =
      typeof password === 'string' &&
      password.length === adminPassword.length &&
      timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));

    if (!isValid) {
      res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
      return;
    }

    req.session.isAdmin = true;
    const response: AdminSessionResponse = { isAdmin: true };
    res.status(200).json(response);
  },
);

/**
 * 현재 세션의 관리자 인증 여부를 반환합니다. 프론트엔드가 `/admin` 진입 시
 * 로그인 폼을 보여줄지 판단하는 데 사용합니다.
 * @route GET /api/admin/session
 */
app.get('/api/admin/session', (req: Request, res: Response) => {
  const response: AdminSessionResponse = { isAdmin: Boolean(req.session.isAdmin) };
  res.status(200).json(response);
});

/**
 * 관리자 세션을 종료합니다.
 * @route POST /api/admin/logout
 */
app.post('/api/admin/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 처리 중 오류가 발생했습니다:', err);
      res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
      return;
    }
    const response: AdminSessionResponse = { isAdmin: false };
    res.status(200).json(response);
  });
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('이미지 파일만 업로드할 수 있습니다.'));
      return;
    }
    cb(null, true);
  },
});

/**
 * 이미지 파일을 Cloudflare R2에 업로드하고 공개 URL을 반환합니다. 응답 계약은
 * `@repo/types`의 `UploadImageResponse`를 따르며, 프론트엔드
 * `entities/product/api/productApi.ts`와 동일한 타입을 공유합니다.
 * 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/uploads
 * @param req.file - multipart/form-data의 "image" 필드로 전달된 이미지 파일
 */
app.post('/api/uploads', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: '업로드할 이미지가 없습니다.' });
    return;
  }

  try {
    const extension = req.file.originalname.split('.').pop();
    const key = extension ? `${randomUUID()}.${extension}` : randomUUID();

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }),
    );

    const response: UploadImageResponse = { url: `${R2_PUBLIC_URL}/${key}` };
    res.status(201).json(response);
  } catch (err) {
    console.error('이미지 업로드 중 오류가 발생했습니다:', err);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
});

/**
 * 전체 상품 목록을 조회합니다.
 * @route GET /api/products
 */
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: '상품을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 새 상품을 등록합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/products
 * @param req.body - `_id`를 제외한 상품 정보
 */
app.post(
  '/api/products',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, Omit<ProductType, '_id'>>, res: Response) => {
    const { name, price, imageUrl, category } = req.body;
    const product = new Product({ name, price, imageUrl, category });
    try {
      const newProduct = await product.save();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: '상품 추가 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품 정보를 수정합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PUT /api/products/:id
 * @param req.body - `_id`를 제외한 상품 정보(전체 필드)
 */
app.put(
  '/api/products/:id',
  requireAdmin,
  async (
    req: Request<{ id: string }, unknown, Omit<ProductType, '_id'>>,
    res: Response,
  ) => {
    const { name, price, imageUrl, category } = req.body;
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { name, price, imageUrl, category },
        { new: true, runValidators: true },
      );
      if (!updatedProduct) {
        res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        return;
      }
      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ message: '상품 수정 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품의 품절 여부를 변경합니다. 관리자 세션이 없으면 `requireAdmin`에서
 * 401로 막습니다.
 * @route PATCH /api/products/:id/sold-out
 * @param req.body - `@repo/types`의 `UpdateSoldOutInput` (`isSoldOut`)
 */
app.patch(
  '/api/products/:id/sold-out',
  requireAdmin,
  async (req: Request<{ id: string }, unknown, UpdateSoldOutInput>, res: Response) => {
    if (typeof req.body?.isSoldOut !== 'boolean') {
      res.status(400).json({ message: 'isSoldOut 값이 올바르지 않습니다.' });
      return;
    }
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { isSoldOut: req.body.isSoldOut },
        { new: true, runValidators: true },
      );
      if (!updatedProduct) {
        res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        return;
      }
      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ message: '품절 상태 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품을 삭제합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route DELETE /api/products/:id
 */
app.delete('/api/products/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    await product.deleteOne();
    res.json({ message: '상품이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '상품 삭제 중 오류가 발생했습니다.' });
  }
});

/**
 * 장바구니 내용을 주문으로 생성합니다. 요청 바디 계약은 `@repo/types`의 `CreateOrderInput`을 따르며,
 * 프론트엔드 `features/cart/api/orderApi.ts`와 동일한 타입을 공유합니다.
 * @route POST /api/orders
 */
app.post(
  '/api/orders',
  async (req: Request<Record<string, never>, unknown, CreateOrderInput>, res: Response) => {
    try {
      const newOrder = new Order({
        items: req.body.items,
        totalPrice: req.body.totalPrice,
      });
      await newOrder.save();
      res.status(201).json(newOrder);
    } catch (err) {
      res.status(400).json({ message: '주문을 처리하는 중 오류가 발생했습니다.' });
    }
  },
);

// multer의 파일 크기/타입 검증 실패 등을 JSON 에러로 변환합니다.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('요청 처리 중 오류가 발생했습니다:', err);
  res.status(400).json({ message: err.message || '요청을 처리하는 중 오류가 발생했습니다.' });
});

app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

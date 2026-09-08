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
  CategoryInput,
  CreateOrderInput,
  OrderStatusFilter,
  ProductInput,
  ReorderCategoriesInput,
  ReorderProductsInput,
  UpdateSoldOutInput,
  UploadImageResponse,
} from '@repo/types';

import Product from './models/Product';
import Order from './models/Order';
import Category from './models/Category';
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

/**
 * Category 컬렉션이 비어 있으면 기존 `Product.category` 값들로부터 자동
 * 생성합니다. 카테고리가 고정 enum에서 자유 입력으로 바뀌면서, 이미 저장된
 * 상품들이 쓰던 카테고리 이름이 최소 하나씩은 목록에 등록돼 있도록
 * 보장하기 위한 1회성 시딩입니다. 이미 카테고리가 하나라도 있으면
 * 아무 것도 하지 않습니다.
 */
async function ensureDefaultCategories(): Promise<void> {
  const existingCount = await Category.countDocuments();
  if (existingCount > 0) return;

  const distinctCategoryNames = await Product.distinct('category');
  if (distinctCategoryNames.length === 0) return;

  await Category.insertMany(
    distinctCategoryNames.map((name, index) => ({ name, order: index })),
  );
  console.log(`✅ 기존 상품 카테고리로부터 Category ${distinctCategoryNames.length}개를 초기화했습니다.`);
}

/**
 * `order` 필드가 도입되기 전에 만들어진 카테고리(값이 없는 카테고리)에
 * 순서를 부여합니다. 기존 화면에 보이던 이름순 그대로 이어지도록
 * 이름순으로 정렬해 번호를 매깁니다. 1회성·멱등이며, 대상이 없으면
 * 아무 것도 하지 않습니다.
 */
async function ensureCategoryOrder(): Promise<void> {
  const unordered = await Category.find({ order: { $exists: false } }).sort({ name: 1 });
  if (unordered.length === 0) return;

  const lastOrdered = await Category.findOne({ order: { $exists: true } }).sort({ order: -1 });
  let nextOrder = lastOrdered ? lastOrdered.order + 1 : 0;

  for (const category of unordered) {
    category.order = nextOrder;
    await category.save();
    nextOrder += 1;
  }
  console.log(`✅ 순서가 없던 카테고리 ${unordered.length}개에 순서를 지정했습니다.`);
}

/**
 * `order` 필드가 도입되기 전에 만들어진 상품(값이 없는 상품)에 카테고리별
 * 순서를 부여합니다. 상품 순서는 카테고리 안에서만 의미가 있으므로,
 * 기존 생성순 그대로 이어지도록 생성순으로 정렬해 카테고리마다 0부터
 * 번호를 매깁니다. 1회성·멱등이며, 대상이 없으면 아무 것도 하지 않습니다.
 */
async function ensureProductOrder(): Promise<void> {
  const unordered = await Product.find({ order: { $exists: false } }).sort({ _id: 1 });
  if (unordered.length === 0) return;

  const nextOrderByCategory: Record<string, number> = {};
  for (const product of unordered) {
    const order = nextOrderByCategory[product.category] ?? 0;
    product.order = order;
    await product.save();
    nextOrderByCategory[product.category] = order + 1;
  }
  console.log(`✅ 순서가 없던 상품 ${unordered.length}개에 카테고리별 순서를 지정했습니다.`);
}

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB에 성공적으로 연결되었습니다.');
    await ensureDefaultCategories();
    await ensureCategoryOrder();
    await ensureProductOrder();
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
 * 전체 카테고리 목록을 지정된 순서(`order`)대로 조회합니다. 고객 화면의
 * 카테고리 필터에도 쓰이므로 인증 없이 공개합니다.
 * @route GET /api/categories
 */
app.get('/api/categories', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 새 카테고리를 등록합니다. 순서는 항상 맨 뒤로 배정됩니다. 관리자
 * 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/categories
 * @param req.body - `@repo/types`의 `CategoryInput` (`name`)
 */
app.post(
  '/api/categories',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, CategoryInput>, res: Response) => {
    try {
      const order = await Category.countDocuments();
      const category = new Category({ name: req.body.name, order });
      const newCategory = await category.save();
      res.status(201).json(newCategory);
    } catch (err) {
      res.status(400).json({ message: '이미 있는 카테고리이거나 등록 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 카테고리 노출 순서를 한 번에 재배열합니다. 원하는 순서대로 나열한
 * 카테고리 id 배열을 받아 배열 인덱스를 그대로 `order` 값으로 저장합니다.
 * 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PATCH /api/categories/reorder
 * @param req.body - `@repo/types`의 `ReorderCategoriesInput` (`orderedIds`)
 */
app.patch(
  '/api/categories/reorder',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, ReorderCategoriesInput>, res: Response) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ message: 'orderedIds 값이 올바르지 않습니다.' });
      return;
    }
    try {
      await Promise.all(
        orderedIds.map((id, index) => Category.updateOne({ _id: id }, { $set: { order: index } })),
      );
      const categories = await Category.find().sort({ order: 1, name: 1 });
      res.json(categories);
    } catch (err) {
      res.status(400).json({ message: '카테고리 순서 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 카테고리 이름을 수정합니다. 상품은 카테고리를 이름으로 참조하므로,
 * 기존 이름을 쓰던 상품들도 새 이름으로 함께 갱신합니다. 관리자 세션이
 * 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PUT /api/categories/:id
 * @param req.body - `@repo/types`의 `CategoryInput` (`name`)
 */
app.put(
  '/api/categories/:id',
  requireAdmin,
  async (req: Request<{ id: string }, unknown, CategoryInput>, res: Response) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
        return;
      }
      const oldName = category.name;
      category.name = req.body.name;
      await category.save();
      await Product.updateMany({ category: oldName }, { $set: { category: req.body.name } });
      res.json(category);
    } catch (err) {
      res.status(400).json({ message: '이미 있는 카테고리이거나 수정 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 카테고리를 삭제합니다. 이 카테고리에 속한 상품도 함께 전부 삭제됩니다.
 * 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route DELETE /api/categories/:id
 */
app.delete('/api/categories/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
      return;
    }
    await Product.deleteMany({ category: category.name });
    await category.deleteOne();
    res.json({ message: '카테고리와 소속 상품을 삭제했습니다.' });
  } catch (err) {
    res.status(500).json({ message: '카테고리 삭제 중 오류가 발생했습니다.' });
  }
});

/**
 * 전체 상품 목록을 카테고리 → 순서(`order`) 순으로 조회합니다.
 * @route GET /api/products
 */
app.get('/api/products', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ category: 1, order: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: '상품을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 새 상품을 등록합니다. 순서는 같은 카테고리 안에서 항상 맨 뒤로
 * 배정됩니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/products
 * @param req.body - `@repo/types`의 `ProductInput`
 */
app.post(
  '/api/products',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, ProductInput>, res: Response) => {
    const { name, price, imageUrl, category } = req.body;
    try {
      const order = await Product.countDocuments({ category });
      const product = new Product({ name, price, imageUrl, category, order });
      const newProduct = await product.save();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: '상품 추가 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품 노출 순서를 한 번에 재배열합니다. 같은 카테고리 안에서만 의미가
 * 있으므로, 그 카테고리에 속한 상품 id를 원하는 순서대로 나열한 배열을
 * 받아 배열 인덱스를 그대로 `order` 값으로 저장합니다. 관리자 세션이
 * 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PATCH /api/products/reorder
 * @param req.body - `@repo/types`의 `ReorderProductsInput` (`orderedIds`)
 */
app.patch(
  '/api/products/reorder',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, ReorderProductsInput>, res: Response) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ message: 'orderedIds 값이 올바르지 않습니다.' });
      return;
    }
    try {
      await Promise.all(
        orderedIds.map((id, index) => Product.updateOne({ _id: id }, { $set: { order: index } })),
      );
      const products = await Product.find().sort({ category: 1, order: 1 });
      res.json(products);
    } catch (err) {
      res.status(400).json({ message: '상품 순서 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품 정보를 수정합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PUT /api/products/:id
 * @param req.body - `@repo/types`의 `ProductInput`
 */
app.put(
  '/api/products/:id',
  requireAdmin,
  async (
    req: Request<{ id: string }, unknown, ProductInput>,
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
 * 주문 목록을 최신순으로 조회합니다. 주방/관리자가 들어온 주문을 확인하는
 * 용도입니다. `status` 쿼리로 진행중(`pending`)/완료(`completed`) 주문만
 * 걸러볼 수 있고, 생략하면 전체를 반환합니다. 관리자 세션이 없으면
 * `requireAdmin`에서 401로 막습니다.
 * @route GET /api/orders
 * @param req.query.status - `@repo/types`의 `OrderStatusFilter` (선택)
 */
app.get(
  '/api/orders',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, unknown, { status?: OrderStatusFilter }>, res: Response) => {
    try {
      const filter: Record<string, boolean> = {};
      if (req.query.status === 'pending') filter.isCompleted = false;
      if (req.query.status === 'completed') filter.isCompleted = true;

      const orders = await Order.find(filter).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: '주문 목록을 불러오는 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 주문을 완료 처리합니다. 완료된 주문은 진행중 목록에서 빠지고 지난
 * 주문 목록으로 이동합니다. 관리자 세션이 없으면 `requireAdmin`에서
 * 401로 막습니다.
 * @route PATCH /api/orders/:id/complete
 */
app.patch('/api/orders/:id/complete', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { isCompleted: true },
      { new: true },
    );
    if (!updatedOrder) {
      res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
      return;
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: '주문 완료 처리 중 오류가 발생했습니다.' });
  }
});

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 한국 시간(KST) 기준 오늘 자정에 해당하는 UTC 시각을 반환합니다.
 * 당일 주문번호를 매길 때 "오늘"의 기준으로 사용합니다.
 */
function getKstStartOfToday(): Date {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  kstNow.setUTCHours(0, 0, 0, 0);
  return new Date(kstNow.getTime() - KST_OFFSET_MS);
}

/**
 * 장바구니 내용을 주문으로 생성합니다. 요청 바디 계약은 `@repo/types`의 `CreateOrderInput`을 따르며,
 * 프론트엔드 `features/cart/api/orderApi.ts`와 동일한 타입을 공유합니다. 응답의
 * `orderNumber`는 한국 시간(KST) 기준 당일 자정부터 1번씩 다시 매기는 짧은
 * 주문번호입니다(스타벅스 매장 주문번호 방식).
 * @route POST /api/orders
 */
app.post(
  '/api/orders',
  async (req: Request<Record<string, never>, unknown, CreateOrderInput>, res: Response) => {
    try {
      const ordersToday = await Order.countDocuments({
        createdAt: { $gte: getKstStartOfToday() },
      });
      const newOrder = new Order({
        orderNumber: ordersToday + 1,
        items: req.body.items,
        totalPrice: req.body.totalPrice,
        orderType: req.body.orderType,
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

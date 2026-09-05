// @owner: ai
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import type { CreateOrderInput, Product as ProductType } from '@repo/types';

import Product from './models/Product';
import Order from './models/Order';

const app = express();
const PORT = 4000;

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

app.use(cors());
app.use(express.json());

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
 * 새 상품을 등록합니다.
 * @route POST /api/products
 * @param req.body - `_id`를 제외한 상품 정보
 */
app.post(
  '/api/products',
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
 * 상품을 삭제합니다.
 * @route DELETE /api/products/:id
 */
app.delete('/api/products/:id', async (req: Request<{ id: string }>, res: Response) => {
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

app.listen(PORT, () => {
  console.log(`🚀 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});

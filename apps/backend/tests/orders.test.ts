// @owner: ai
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { loginAsAdmin, setupTestApp } from './helpers/testApp';

describe('주문', () => {
  let app: Express;
  let teardown: () => Promise<void>;
  let agent: Awaited<ReturnType<typeof loginAsAdmin>>;
  let productId: string;

  beforeAll(async () => {
    ({ app, teardown } = await setupTestApp());
    agent = await loginAsAdmin(app);
    await agent.post('/api/categories').send({ name: '커피' });
    const product = await agent.post('/api/products').send({
      name: '아메리카노',
      price: 4000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
      stock: 10,
    });
    productId = product.body._id;
  });

  afterAll(async () => {
    await teardown();
  });

  const orderPayload = (quantity: number) => ({
    items: [
      {
        productId,
        name: '아메리카노',
        price: 4000,
        imageUrl: 'https://example.com/a.png',
        quantity,
      },
    ],
    totalPrice: 4000 * quantity,
    orderType: 'takeout',
    paymentMethod: '신용카드',
  });

  it('인증 없이도(고객용) 주문을 생성할 수 있고, 재고가 자동으로 차감된다', async () => {
    const res = await request(app).post('/api/orders').send(orderPayload(3));
    expect(res.status).toBe(201);
    expect(res.body.orderNumber).toBe(1);
    expect(res.body.isCompleted).toBe(false);

    const products = await request(app).get('/api/products');
    const product = products.body.find((p: { _id: string }) => p._id === productId);
    expect(product.stock).toBe(7);
  });

  it('당일 주문번호는 1씩 증가한다', async () => {
    const res = await request(app).post('/api/orders').send(orderPayload(1));
    expect(res.body.orderNumber).toBe(2);
  });

  it('잘못된 결제 수단은 400으로 거부된다', async () => {
    const payload = orderPayload(1);
    const res = await request(app)
      .post('/api/orders')
      .send({ ...payload, paymentMethod: '현금' });
    expect(res.status).toBe(400);
  });

  it('진행중/완료 상태로 필터링해 조회할 수 있고, 완료 처리하면 목록이 이동한다', async () => {
    const pendingBefore = await agent.get('/api/orders?status=pending');
    expect(pendingBefore.body.length).toBe(2);

    const orderId = pendingBefore.body[0]._id;
    const completed = await agent.patch(`/api/orders/${orderId}/complete`);
    expect(completed.status).toBe(200);
    expect(completed.body.isCompleted).toBe(true);

    const pendingAfter = await agent.get('/api/orders?status=pending');
    expect(pendingAfter.body.length).toBe(1);

    const completedList = await agent.get('/api/orders?status=completed');
    expect(completedList.body.some((o: { _id: string }) => o._id === orderId)).toBe(true);
  });

  it('주문 조회는 관리자 인증이 필요하다', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('월별 매출 통계가 이번 달 주문을 집계한다', async () => {
    const res = await agent.get('/api/orders/stats/monthly');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(12);
    const total = res.body.reduce(
      (sum: number, m: { totalRevenue: number }) => sum + m.totalRevenue,
      0,
    );
    // 3개 + 1개 = 4잔, 잔당 4000원 = 16000원
    expect(total).toBe(16000);
  });
});

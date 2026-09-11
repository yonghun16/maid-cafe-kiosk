// @owner: ai
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { loginAsAdmin, setupTestApp } from './helpers/testApp';

describe('상품 관리', () => {
  let app: Express;
  let teardown: () => Promise<void>;
  let agent: Awaited<ReturnType<typeof loginAsAdmin>>;

  beforeAll(async () => {
    ({ app, teardown } = await setupTestApp());
    agent = await loginAsAdmin(app);
    await agent.post('/api/categories').send({ name: '커피' });
  });

  afterAll(async () => {
    await teardown();
  });

  it('온도 옵션 없이 생성하면 temperatureOption 필드 자체가 없다', async () => {
    const res = await agent
      .post('/api/products')
      .send({ name: '카페라떼', price: 4500, category: '커피', imageUrl: 'https://example.com/a.png' });
    expect(res.status).toBe(201);
    expect(res.body).not.toHaveProperty('temperatureOption');
  });

  it.each(['BOTH', 'HOT', 'ICE'] as const)('temperatureOption "%s"로 생성할 수 있다', async (value) => {
    const res = await agent.post('/api/products').send({
      name: `온도테스트-${value}`,
      price: 1000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
      temperatureOption: value,
    });
    expect(res.status).toBe(201);
    expect(res.body.temperatureOption).toBe(value);
  });

  it('잘못된 temperatureOption 값은 400으로 거부되고, 어떤 필드가 왜 잘못됐는지 메시지에 담긴다', async () => {
    const res = await agent.post('/api/products').send({
      name: '잘못된온도',
      price: 1000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
      temperatureOption: 'WARM',
    });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('temperatureOption');
    expect(res.body.message).toContain('WARM');
  });

  it('수정 시 temperatureOption을 생략하면 $unset으로 필드가 완전히 사라진다', async () => {
    const created = await agent.post('/api/products').send({
      name: '온도지웠다가',
      price: 1000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
      temperatureOption: 'HOT',
    });
    expect(created.body.temperatureOption).toBe('HOT');

    const updated = await agent.put(`/api/products/${created.body._id}`).send({
      name: '온도지웠다가',
      price: 1000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
    });
    expect(updated.status).toBe(200);
    expect(updated.body).not.toHaveProperty('temperatureOption');
  });

  it('재고를 0으로 설정하면 자동으로 품절 처리되고, 다시 채우면 품절이 풀린다', async () => {
    const created = await agent.post('/api/products').send({
      name: '재고테스트',
      price: 1000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
      stock: 5,
    });

    const soldOut = await agent.patch(`/api/products/${created.body._id}/stock`).send({ stock: 0 });
    expect(soldOut.body).toMatchObject({ stock: 0, isSoldOut: true });

    const restocked = await agent.patch(`/api/products/${created.body._id}/stock`).send({ stock: 10 });
    expect(restocked.body).toMatchObject({ stock: 10, isSoldOut: false });
  });

  it('품절 처리 API로 직접 켜고 끌 수 있다', async () => {
    const created = await agent.post('/api/products').send({
      name: '수동품절',
      price: 1000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
    });

    const soldOut = await agent.patch(`/api/products/${created.body._id}/sold-out`).send({ isSoldOut: true });
    expect(soldOut.body.isSoldOut).toBe(true);
  });

  it('같은 카테고리 안에서만 순서를 재배열한다', async () => {
    const products = await request(app).get('/api/products');
    const coffeeIds = products.body
      .filter((p: { category: string }) => p.category === '커피')
      .map((p: { _id: string }) => p._id)
      .reverse();

    const reordered = await agent.patch('/api/products/reorder').send({ orderedIds: coffeeIds });
    expect(reordered.status).toBe(200);
  });

  it('상품을 삭제하면 목록에서 사라진다', async () => {
    const created = await agent.post('/api/products').send({
      name: '삭제될상품',
      price: 1000,
      category: '커피',
      imageUrl: 'https://example.com/a.png',
    });

    const deleted = await agent.delete(`/api/products/${created.body._id}`);
    expect(deleted.status).toBe(200);

    const products = await request(app).get('/api/products');
    expect(products.body.some((p: { _id: string }) => p._id === created.body._id)).toBe(false);
  });
});

// @owner: ai
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { loginAsAdmin, setupTestApp } from './helpers/testApp';

describe('카테고리 관리', () => {
  let app: Express;
  let teardown: () => Promise<void>;
  let agent: Awaited<ReturnType<typeof loginAsAdmin>>;

  beforeAll(async () => {
    ({ app, teardown } = await setupTestApp());
    agent = await loginAsAdmin(app);
  });

  afterAll(async () => {
    await teardown();
  });

  it('생성한 카테고리는 맨 뒤 순서로 등록되고 목록에서 순서대로 조회된다', async () => {
    const coffee = await agent.post('/api/categories').send({ name: '커피' });
    expect(coffee.status).toBe(201);
    expect(coffee.body).toMatchObject({ name: '커피', order: 0 });

    const ade = await agent.post('/api/categories').send({ name: '에이드' });
    expect(ade.body).toMatchObject({ name: '에이드', order: 1 });

    const list = await request(app).get('/api/categories');
    expect(list.body.map((c: { name: string }) => c.name)).toEqual(['커피', '에이드']);
  });

  it('이름을 수정하면 그 카테고리를 쓰던 상품도 함께 갱신된다', async () => {
    const category = await agent.post('/api/categories').send({ name: '옛이름' });
    const categoryId = category.body._id;

    const product = await agent.post('/api/products').send({
      name: '아메리카노',
      price: 4000,
      category: '옛이름',
      imageUrl: 'https://example.com/a.png',
    });

    const renamed = await agent.put(`/api/categories/${categoryId}`).send({ name: '새이름' });
    expect(renamed.status).toBe(200);
    expect(renamed.body.name).toBe('새이름');

    const products = await request(app).get('/api/products');
    const updatedProduct = products.body.find((p: { _id: string }) => p._id === product.body._id);
    expect(updatedProduct.category).toBe('새이름');
  });

  it('삭제하면 그 카테고리에 속한 상품도 함께 삭제된다', async () => {
    await agent.post('/api/categories').send({ name: '삭제될카테고리' });
    const categories = await request(app).get('/api/categories');
    const target = categories.body.find((c: { name: string }) => c.name === '삭제될카테고리');

    const product = await agent.post('/api/products').send({
      name: '삭제될상품',
      price: 1000,
      category: '삭제될카테고리',
      imageUrl: 'https://example.com/b.png',
    });

    const deleted = await agent.delete(`/api/categories/${target._id}`);
    expect(deleted.status).toBe(200);

    const products = await request(app).get('/api/products');
    expect(products.body.some((p: { _id: string }) => p._id === product.body._id)).toBe(false);
  });

  it('reorder는 보낸 순서 그대로 order 값을 매긴다', async () => {
    const categories = await request(app).get('/api/categories');
    const ids = categories.body.map((c: { _id: string }) => c._id).reverse();

    const reordered = await agent.patch('/api/categories/reorder').send({ orderedIds: ids });
    expect(reordered.status).toBe(200);
    expect(reordered.body.map((c: { _id: string }) => c._id)).toEqual(ids);
  });
});

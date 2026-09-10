// @owner: ai
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { setupTestApp } from './helpers/testApp';

describe('관리자 인증', () => {
  let app: Express;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    ({ app, teardown } = await setupTestApp());
  });

  afterAll(async () => {
    await teardown();
  });

  it('세션 없이 조회하면 isAdmin: false', async () => {
    const res = await request(app).get('/api/admin/session');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ isAdmin: false });
  });

  it('틀린 비밀번호는 401', async () => {
    const res = await request(app).post('/api/admin/login').send({ password: '틀린값' });
    expect(res.status).toBe(401);
  });

  it('올바른 비밀번호로 로그인하면 세션이 유지되고, 로그아웃하면 다시 풀린다', async () => {
    const agent = request.agent(app);

    const login = await agent.post('/api/admin/login').send({ password: 'test-admin-password' });
    expect(login.status).toBe(200);
    expect(login.body).toEqual({ isAdmin: true });

    const session = await agent.get('/api/admin/session');
    expect(session.body).toEqual({ isAdmin: true });

    const logout = await agent.post('/api/admin/logout');
    expect(logout.body).toEqual({ isAdmin: false });

    const sessionAfterLogout = await agent.get('/api/admin/session');
    expect(sessionAfterLogout.body).toEqual({ isAdmin: false });
  });

  it('인증 없이 관리자 전용 쓰기 API를 호출하면 401', async () => {
    const res = await request(app).post('/api/categories').send({ name: '커피' });
    expect(res.status).toBe(401);
  });
});

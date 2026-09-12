// @owner: ai
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';
import { loginAsAdmin, setupTestApp } from './helpers/testApp';

describe('푸시 알림', () => {
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

  it('VAPID 공개키를 인증 없이 조회할 수 있다', async () => {
    const res = await request(app).get('/api/push/vapid-public-key');
    expect(res.status).toBe(200);
    expect(typeof res.body.publicKey).toBe('string');
    expect(res.body.publicKey.length).toBeGreaterThan(0);
  });

  it('인증 없이는 구독을 등록할 수 없다', async () => {
    const res = await request(app)
      .post('/api/push/subscribe')
      .send({ endpoint: 'https://example.com/push/1', keys: { p256dh: 'p', auth: 'a' } });
    expect(res.status).toBe(401);
  });

  it('관리자는 구독을 등록/해제할 수 있고, 같은 endpoint는 덮어쓴다', async () => {
    const subscription = {
      endpoint: 'https://example.com/push/2',
      keys: { p256dh: 'p256dh-key', auth: 'auth-key' },
    };

    const first = await agent.post('/api/push/subscribe').send(subscription);
    expect(first.status).toBe(201);

    const second = await agent
      .post('/api/push/subscribe')
      .send({ ...subscription, keys: { p256dh: 'new-key', auth: 'auth-key' } });
    expect(second.status).toBe(201);

    const unsubscribe = await agent.post('/api/push/unsubscribe').send({ endpoint: subscription.endpoint });
    expect(unsubscribe.status).toBe(200);
  });
});

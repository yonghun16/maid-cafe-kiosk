// @owner: ai
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

// ✅ 실제 푸시 서비스(FCM 등)로 네트워크 요청을 보내지 않도록
// `web-push`를 모킹합니다. `vi.mock` 팩토리는 파일 맨 위로 끌어올려져
// 일반 top-level 변수를 참조할 수 없어서, `vi.hoisted`로 감싼 변수를
// 대신 참조합니다.
const { sendNotificationMock } = vi.hoisted(() => ({ sendNotificationMock: vi.fn() }));
vi.mock('web-push', () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: sendNotificationMock,
  },
}));

import PushSubscription from '../src/models/PushSubscription';
import { notifyKitchenOfNewOrder } from '../src/lib/webPush';

describe('주방 화면 새 주문 웹 푸시', () => {
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongod.stop();
  });

  beforeEach(async () => {
    await PushSubscription.deleteMany({});
    sendNotificationMock.mockReset();
  });

  it('구독이 없으면 아무 것도 보내지 않는다', async () => {
    await notifyKitchenOfNewOrder(1, 'dine-in');
    expect(sendNotificationMock).not.toHaveBeenCalled();
  });

  it('저장된 모든 구독에 새 주문 알림을 보낸다', async () => {
    await PushSubscription.create({
      endpoint: 'https://example.com/push/a',
      keys: { p256dh: 'p1', auth: 'a1' },
    });
    await PushSubscription.create({
      endpoint: 'https://example.com/push/b',
      keys: { p256dh: 'p2', auth: 'a2' },
    });
    sendNotificationMock.mockResolvedValue(undefined);

    await notifyKitchenOfNewOrder(7, 'takeout');

    expect(sendNotificationMock).toHaveBeenCalledTimes(2);
    const [, payload] = sendNotificationMock.mock.calls[0]!;
    const parsed = JSON.parse(payload as string);
    expect(parsed.body).toContain('No.7');
    expect(parsed.url).toBe('/kitchen');
  });

  it('만료된(410) 구독은 자동으로 정리한다', async () => {
    await PushSubscription.create({
      endpoint: 'https://example.com/push/expired',
      keys: { p256dh: 'p', auth: 'a' },
    });
    sendNotificationMock.mockRejectedValue({ statusCode: 410 });

    await notifyKitchenOfNewOrder(1, 'dine-in');

    const remaining = await PushSubscription.findOne({ endpoint: 'https://example.com/push/expired' });
    expect(remaining).toBeNull();
  });
});

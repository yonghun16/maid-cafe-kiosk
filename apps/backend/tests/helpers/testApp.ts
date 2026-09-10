// @owner: ai
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import type { Express } from 'express';
import request from 'supertest';
import { createApp } from '../../src/app';

interface TestApp {
  app: Express;
  teardown: () => Promise<void>;
}

/**
 * 테스트용 Express 앱을 인메모리 MongoDB에 연결해 만듭니다. 운영 DB를
 * 전혀 건드리지 않고, 테스트 파일마다 독립된 DB를 씁니다. `ADMIN_PASSWORD`
 * 등 필수 환경변수는 `tests/setupEnv.ts`(Vitest `setupFiles`)가 이 파일이
 * import되기 전에 이미 채워둡니다.
 */
export async function setupTestApp(): Promise<TestApp> {
  const mongod = await MongoMemoryServer.create();
  const mongoUri = mongod.getUri();
  await mongoose.connect(mongoUri);
  const app = createApp(mongoUri);

  return {
    app,
    teardown: async () => {
      await mongoose.connection.dropDatabase();
      await mongoose.disconnect();
      await mongod.stop();
    },
  };
}

/**
 * 관리자로 로그인된 Supertest agent를 반환합니다. agent는 쿠키를
 * 요청 사이에 그대로 유지하므로, 이후 `agent.post(...)` 등으로 계속
 * 인증된 상태로 요청을 보낼 수 있습니다.
 */
export async function loginAsAdmin(app: Express): Promise<ReturnType<typeof request.agent>> {
  const agent = request.agent(app);
  await agent.post('/api/admin/login').send({ password: process.env.ADMIN_PASSWORD });
  return agent;
}

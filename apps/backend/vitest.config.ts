// @owner: ai
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setupEnv.ts'],
    // mongodb-memory-server가 테스트 파일마다 인메모리 MongoDB를 새로
    // 기동합니다 — 첫 기동은 바이너리 캐시 확인 때문에 느릴 수 있어
    // 넉넉하게 잡습니다.
    testTimeout: 20_000,
    hookTimeout: 30_000,
    // 테스트 파일을 병렬로 돌리면 여러 프로세스가 동시에 MongoDB 바이너리를
    // 캐시에 내려받으려다 rename이 서로 충돌하는 레이스가 있었습니다
    // (mongodb-memory-server 알려진 이슈). 파일 단위 병렬 실행을 꺼서
    // 한 번에 하나씩만 바이너리 캐시에 접근하게 합니다.
    fileParallelism: false,
  },
});

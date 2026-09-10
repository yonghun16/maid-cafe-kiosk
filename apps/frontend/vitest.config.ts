// @owner: ai
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    // 지금은 Zustand 스토어 등 순수 로직만 테스트해서 DOM이 필요
    // 없습니다. 컴포넌트 렌더링 테스트를 추가하게 되면 이 환경을
    // 'jsdom'으로 바꾸고 @testing-library/react를 추가해야 합니다.
  },
});

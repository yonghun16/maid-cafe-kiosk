// @owner: ai
import { defaultCache } from '@serwist/next/worker';
import { NetworkOnly, Serwist } from 'serwist';
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// ✅ `/api/*`(메뉴/카테고리/광고/주문/관리자 세션 — next.config.js의
// rewrites()가 백엔드로 중계)는 항상 최신 상태여야 하는 데이터라, 절대
// 캐시하지 않고 매번 네트워크로만 요청합니다. Workbox 라우트는 배열
// 순서대로 첫 매치를 쓰므로, 이 규칙을 범용 `defaultCache`보다 앞에
// 둬서 API 요청이 정적 리소스용 캐시 전략에 걸리지 않게 합니다.
const apiNetworkOnly: RuntimeCaching = {
  matcher: ({ url }) => url.pathname.startsWith('/api/'),
  handler: new NetworkOnly(),
};

/**
 * 서비스워커 진입점. 빌드 시 `@serwist/next`가 이 파일을 `public/sw.js`로
 * 번들링합니다. `/api/*` 외의 이미지/폰트/CSS/JS 등 정적 리소스는
 * `defaultCache` 전략을 그대로 씁니다 — 오프라인 주문 제출 같은 기능은
 * 이번 범위에 포함하지 않았습니다.
 */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [apiNetworkOnly, ...defaultCache],
});

serwist.addEventListeners();

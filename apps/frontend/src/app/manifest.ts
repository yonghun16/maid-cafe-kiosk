// @owner: ai
import type { MetadataRoute } from 'next';

/**
 * PWA 매니페스트. Next.js App Router의 파일 컨벤션으로, 빌드 시
 * `/manifest.webmanifest`로 자동 생성되고 `layout.tsx`의 `<head>`에
 * 자동으로 링크됩니다. `start_url`을 고객 주문 화면(`/`)으로 지정해,
 * 설치된 아이콘을 누르면 관리자/주방 화면이 아니라 항상 주문 화면부터
 * 열리게 했습니다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: '메이드 키오스크',
    short_name: '메이드 키오스크',
    description: '세상에서 가장 귀여운 메이드 카페 키오스크',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fce7f3',
    theme_color: '#ec4899',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

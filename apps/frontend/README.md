Next.js(App Router) 기반 메이드 카페 키오스크 프론트엔드입니다. 전체
프로젝트 개요와 환경변수, 모노레포 구조는 저장소 루트의
[`README.md`](../../README.md)를 먼저 참고하세요.

## 화면 구성

- `/` — 고객용 키오스크 화면 (매장/포장 선택 → 메뉴 조회 → 장바구니 →
  결제 수단 선택 → 주문 완료)
- `/admin` — 관리자 화면 (메뉴/카테고리/광고 관리, 판매 통계)
- `/kitchen` — 주방/카운터 화면 (들어온 주문 확인, 완료 처리)

코드는 FSD(Feature-Sliced Design)로 구성됩니다: `app → views → widgets →
features → entities → shared`. 자세한 레이어 규칙은 저장소 루트의
[`CLAUDE.md`](../../CLAUDE.md) 참고.

## 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.
백엔드는 기본적으로 `http://localhost:4000`을 바라보며(`next.config.js`의
`rewrites()`), 다른 주소를 쓰려면 `.env.local`에 `BACKEND_ORIGIN`을
설정하세요.

## 테스트

```bash
pnpm test
```

Vitest로 Zustand 스토어 등 순수 로직을 테스트합니다(`*.test.ts`를 소스
파일 옆에 둠). 컴포넌트 렌더링 테스트는 아직 없습니다.

## PWA

`@serwist/next`로 서비스워커(`src/app/sw.ts`)와 매니페스트
(`src/app/manifest.ts`)를 구성해, 홈 화면에 설치 가능한 앱으로 동작합니다.
개발 모드에서는 서비스워커가 비활성화되고, 프로덕션 빌드(`pnpm build` +
`pnpm start`)에서만 실제로 등록됩니다.

## 폰트

[`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts)
로 Google Fonts의 **Dancing Script**를 로드합니다(`app/layout.tsx`).

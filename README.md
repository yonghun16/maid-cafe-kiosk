# 메이드 카페 키오스크 (Maid Cafe Kiosk)

카페 사장님과 고객을 위한 무인 주문 키오스크 서비스입니다. 고객은 키오스크
화면에서 메뉴를 조회하고 주문하며, 매장 관리자는 별도 화면(`/admin`)에서
메뉴·카테고리·광고를 관리하고, 주방/카운터 직원은 또 다른 화면(`/kitchen`)
에서 들어온 주문을 확인·완료 처리합니다. 포트폴리오 프로젝트라 실제 결제
게이트웨이(PG) 연동은 하지 않습니다 — 결제는 수단을 고르는 화면까지만
구현되어 있습니다.

더 자세한 기획/개발 문서는 [`docs`](https://yonghun16.github.io/maid-cafe-kiosk/)를 참고하세요.

## 기술 스택

- **모노레포**: Turborepo + pnpm workspaces
- **프론트엔드**: Next.js(App Router) · TypeScript · Tailwind CSS · Zustand
  · FSD(Feature-Sliced Design)
- **백엔드**: Express 5 · TypeScript · Mongoose(MongoDB)
- **공유 패키지**: 프론트/백엔드가 공유하는 타입(`packages/types`),
  ESLint/TypeScript 설정

## 프로젝트 구조

```
apps/
  frontend/   # Next.js 키오스크 화면 (고객용 "/", 관리자용 "/admin", 주방용 "/kitchen")
    src/
      app/       # Next.js 라우팅 + PWA 매니페스트/서비스워커 + 전역 Provider 조립
      views/     # 라우트별 화면 조합 (home, admin, kitchen)
      widgets/   # product-list, order-summary, order-type-select, order-complete,
                 # order-list, add-product-form, manage-product-list,
                 # manage-category-list, manage-ad-list, sales-dashboard
      features/  # cart, order-type, admin-auth, product-management,
                 # category-management, ad-management
      entities/  # product, category, ad, order (각각 API + UI)
      shared/    # 공용 axios 인스턴스, UI 키트(Modal/Dropdown), 유틸, 환경설정
                 # (테스트는 `*.test.ts`로 소스 파일 옆에 둠)
  backend/    # Express REST API 서버
    src/
      app.ts         # 미들웨어/라우터 조립(테스트에서 재사용)
      index.ts        # 서버 엔트리 — DB 연결 + app.listen
      routes/         # adminAuth, categories, products, ads, orders, uploads
      models/         # Mongoose 모델 (Category, Product, Ad, Order)
      lib/            # date, seed(1회성 마이그레이션), inventory, r2Client
      middleware/     # requireAdmin
    tests/       # Vitest + Supertest + 인메모리 MongoDB
  mobile/     # 고객 화면(안드로이드 키오스크 태블릿 전용) React Native + Expo 앱
              # — 스캐폴딩 단계, 실제 화면 UI 포팅은 진행 중(docs/specs/005 참고)
    App.tsx      # 임시 확인 화면(NativeWind + 백엔드 통신 스모크 테스트)
    src/shared/  # axios 인스턴스, 환경설정 — 백엔드에 직접 통신(같은 REST API 재사용)
packages/
  types/                 # Product/Order/CreateOrderInput 등 프론트-백엔드 공유 타입
  eslint-config/         # 공용 ESLint 설정
  typescript-config/     # 공용 tsconfig 프리셋
docs/                # 기획/개발 문서 (자세한 내용은 아래 "문서" 참고)
```

## 시작하기

### 준비물
- Node.js 18 이상
- pnpm 9 (`packageManager` 필드로 고정됨)
- MongoDB 연결 문자열 (Atlas 등)

### 설치

```sh
pnpm install
```

### 환경변수

`apps/backend/.env` 파일을 만들고 아래 값을 전부 설정합니다 — 이 중
하나라도 없으면 백엔드가 시작 시점에 바로 종료됩니다(`MONGO_URI`는 그냥
종료, 나머지는 해당 기능을 쓰는 요청이 올 때 500과 함께 콘솔에 에러가
찍힘).

```
MONGO_URI=mongodb+srv://...
ADMIN_PASSWORD=아무-비밀번호           # 관리자 로그인 공유 비밀번호
SESSION_SECRET=아무-랜덤-문자열         # 세션 쿠키 서명용
FRONTEND_ORIGIN=http://localhost:3000  # CORS 허용 오리진(트레일링 슬래시 금지)
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://pub-<hash>.r2.dev  # 업로드한 이미지가 공개되는 주소
```

프론트엔드는 백엔드에 직접 요청하지 않습니다 — Next.js 자신이
`/api/*` 요청을 `next.config.js`의 `rewrites()`로 백엔드에 중계해서,
브라우저 입장에서는 항상 같은 오리진(퍼스트파티)으로만 요청을 보냅니다
(로그인 세션 쿠키가 서드파티 쿠키로 취급돼 막히는 문제를 피하기 위함).
로컬 개발 시 기본값은 `http://localhost:4000`이고, 다른 백엔드 주소를
쓰려면 `apps/frontend`에 `.env.local`을 만들어 아래처럼 설정하세요.

```
BACKEND_ORIGIN=https://your-backend-host
```

### 개발 서버 실행

```sh
pnpm dev
```

`turbo run dev`가 프론트엔드(`http://localhost:3000`)와 백엔드
(`http://localhost:4000`)를 동시에 띄웁니다. 특정 앱만 실행하려면
`--filter`를 사용합니다.

```sh
pnpm dev --filter=frontend
pnpm dev --filter=backend
```

## 주요 스크립트

루트에서 실행 가능한 스크립트(모든 앱/패키지에 대해 Turborepo가 병렬 실행):

| 명령 | 설명 |
|---|---|
| `pnpm dev` | 전체 앱 개발 서버 실행 |
| `pnpm build` | 전체 앱 빌드 (`frontend`는 `next build`, `backend`는 `tsc`) |
| `pnpm check-types` | 전체 TypeScript 타입 체크 |
| `pnpm test` | 전체 테스트 실행(Vitest — 백엔드는 Supertest + 인메모리 MongoDB) |
| `pnpm lint` | 전체 ESLint 검사 |
| `pnpm format` | Prettier로 전체 포맷팅 |

`main`에 push하거나 PR을 올리면 [`.github/workflows/ci.yml`](.github/workflows/ci.yml)
이 `check-types` → `build` → `test`를 자동으로 실행합니다.

## 문서

이 저장소의 `docs/`에는 두 가지 성격의 문서가 있습니다. 세부 규칙은
[`docs/AGENTS.md`](docs/AGENTS.md)에 정의되어 있습니다.

- **Vault** (`docs/content/`) — Obsidian Vault, Quartz 5로 사이트 빌드.
  - [기획서](docs/content/기획/기획서.md) — 서비스 목적, 사용자 흐름, 기능
    범위, 일반 키오스크 기능 청사진
  - [개발계획서](docs/content/개발/개발계획서.md) — 현재 아키텍처, 완료된
    마일스톤, 다음 우선순위 로드맵
- **Spec** (`docs/specs/`) — 기능 단위 스펙. [LeanSpec](https://leanspec.dev)
  CLI로만 생성/수정합니다 (`leanspec create`, `leanspec board` 등).
- **ADR** (`docs/decisions/`) — 아키텍처/기술 스택 등 중요 결정 기록.

코드 작업 규칙(FSD 레이어, `@owner` 태그, TypeScript 규칙 등)은 저장소
루트의 [`CLAUDE.md`](CLAUDE.md)에 정의되어 있습니다.

## 배포

- 프론트엔드: Vercel
- 백엔드: Render (무료 티어). 오라클 클라우드에서 10분마다 `GET /health`로
  핑을 보내 슬립을 방지합니다.

## 현재 상태

고객 화면(메뉴 조회/장바구니/옵션 선택/결제 수단 선택/주문 완료 화면),
관리자 화면(메뉴·카테고리·광고 등록/수정/삭제, 판매 통계), 주방 화면
(주문 확인/완료 처리), 공유 비밀번호 기반 관리자 인증, PWA 설치 지원까지
구현되어 있습니다. 포트폴리오 프로젝트라 실제 PG 결제 연동은 처음부터
범위 밖입니다(결제 수단을 고르는 화면까지만 있음). 자세한 내용은
[기획서](docs/content/기획/기획서.md)의 기능 청사진 표와
[개발계획서](docs/content/개발/개발계획서.md)의 완료된 마일스톤/로드맵을
참고하세요.

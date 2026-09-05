# 메이드 카페 키오스크 (Maid Cafe Kiosk)

카페 사장님과 고객을 위한 무인 주문 키오스크 서비스입니다. 고객은 키오스크
화면에서 메뉴를 조회하고 주문하며, 매장 관리자는 별도 화면에서 메뉴를
등록·삭제합니다.

더 자세한 기획/개발 문서는 [`docs`](https://yonghun16.github.io/maid-cafe-kiosk/)를 참고하세요.

## 기술 스택

- **모노레포**: Turborepo + pnpm workspaces
- **프론트엔드**: Next.js(App Router) · TypeScript · Tailwind CSS · Zustand
  · FSD(Feature-Sliced Design)
- **백엔드**: Express 5 · TypeScript · Mongoose(MongoDB)
- **공유 패키지**: 프론트/백엔드가 공유하는 타입(`packages/types`), UI
  컴포넌트, ESLint/TypeScript 설정

## 프로젝트 구조

```
apps/
  frontend/   # Next.js 키오스크 화면 (고객용 "/", 관리자용 "/admin")
    src/
      app/       # Next.js 라우팅 + 전역 Provider 조립
      views/     # 라우트별 화면 조합 (home, admin)
      widgets/   # product-list, order-summary, add-product-form, manage-product-list
      features/  # cart(장바구니/주문), product-management(메뉴 관리)
      entities/  # product(상품 CRUD API + UI)
      shared/    # 공용 axios 인스턴스, 환경설정
  backend/    # Express REST API 서버
    src/
      index.ts       # 서버 엔트리, 라우트
      models/        # Mongoose 모델 (Product, Order)
packages/
  types/                 # Product/Order/CreateOrderInput 등 프론트-백엔드 공유 타입
  ui/                    # 공용 UI 컴포넌트
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

`apps/backend/.env` 파일을 만들고 MongoDB 연결 문자열을 설정합니다 (이 값이
없으면 백엔드 서버가 시작되지 않습니다).

```
MONGO_URI=mongodb+srv://...
```

프론트엔드는 기본적으로 `http://localhost:4000/api`를 백엔드 주소로
사용합니다. 다른 주소를 쓰려면 `apps/frontend`에 `.env.local`을 만들고
아래처럼 설정하세요.

```
NEXT_PUBLIC_API_URL=https://your-backend-host/api
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
| `pnpm lint` | 전체 ESLint 검사 |
| `pnpm format` | Prettier로 전체 포맷팅 |

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

고객 메뉴 조회/장바구니/주문 제출과 관리자 메뉴 등록/삭제 MVP가 구현되어
있습니다. 관리자 인증, 결제 연동 등은 아직 없습니다 — 자세한 내용은
[기획서](docs/content/기획/기획서.md)의 "일반 키오스크 기능 청사진"과
[개발계획서](docs/content/개발/개발계획서.md)의 로드맵을 참고하세요.

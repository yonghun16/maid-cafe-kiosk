# 🎀 메이드 카페 키오스크 (Maid Cafe Kiosk)

> **웹 + 네이티브 앱을 한 백엔드로 함께 운영하는 무인 주문 키오스크 서비스**
> 손님은 태블릿에서 메뉴를 고르고 주문하고, 사장님은 관리자 화면에서 메뉴·광고·매출을 관리하고, 주방은 새 주문을 실시간 알림으로 받습니다.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=flat-square&logo=vercel)](https://maid-cafe-kiosk-frontend.vercel.app/)
[![Docs](https://img.shields.io/badge/Docs-Quartz_v5-84a59d?style=flat-square)](https://yonghun16.github.io/maid-cafe-kiosk/)
[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-000000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Expo](https://img.shields.io/badge/React_Native-Expo-61dafb?style=flat-square&logo=react)](https://expo.dev)
[![Turborepo](https://img.shields.io/badge/Monorepo-Turborepo-EF4444?style=flat-square&logo=turborepo)](https://turbo.build/)

<p align="center">
  <a href="https://maid-cafe-kiosk-frontend.vercel.app/">
    <img src="image%20asset/layout/main.png" alt="Maid Kiosk Preview" width="700"/>
  </a>
</p>

---

## 📌 프로젝트 개요 (Overview)

카페 사장님과 고객을 위한 **무인 주문 키오스크**입니다. 고객은 태블릿
화면에서 매장/포장을 고르고, 카테고리별 메뉴를 담아 주문합니다. 사장님은
별도 관리자 화면에서 메뉴·카테고리·광고를 등록하고 판매 통계를 확인하며,
주방/카운터 직원은 주방 전용 화면에서 새 주문을 확인·완료 처리합니다.

**클라이언트가 웹 하나가 아니라 웹 + 네이티브 앱 둘이 될 것을 처음부터
전제로 설계**했습니다 — 그래서 백엔드(Express)를 Next.js에 흡수시키지
않고 독립된 REST API 서버로 유지하고, 프론트엔드/모바일 앱이 같은
API와 타입 계약(`packages/types`)을 공유합니다.

- **타겟 사용자**: 카페 손님(키오스크), 매장 사장님(관리자), 주방/카운터 직원
- **핵심 목표**: 결제 게이트웨이 없이도 실제 카페 운영 흐름(주문→조리
  확인→매출 집계)을 처음부터 끝까지 재현
- **라이브 데모**: 🔗 [https://maid-cafe-kiosk-frontend.vercel.app/](https://maid-cafe-kiosk-frontend.vercel.app/)
  — 고객용 첫 화면이며, 관리자(`/admin`)·주방(`/kitchen`) 화면은 같은
  도메인에서 공유 비밀번호로 보호됩니다
- **개발 문서**: 🔗 [온라인 아키텍처/알고리즘 명세서 바로가기](https://yonghun16.github.io/maid-cafe-kiosk/)
  (12장짜리 상세 문서 — 각 기능을 "왜 그렇게 만들었는지"까지 다룸)

이 프로젝트는 포트폴리오 목적이라 실제 결제 게이트웨이(PG) 연동은
하지 않습니다 — 결제는 수단을 고르는 화면까지만 구현되어 있고,
관리자 역할 구분/감사 로그도 매장 하나 규모에는 실익이 없다고 판단해
의도적으로 범위 밖으로 뒀습니다.

---

## ✨ 주요 기능 (Key Features)

일반적인 메뉴/카테고리/광고 CRUD, 장바구니, PWA 설치 같은 기본 흐름
위에, 기술적으로 까다로웠거나 기획 판단이 들어간 부분만 추렸습니다.

### 🧠 기술적으로 까다로웠던 부분

- 🔀 **웹 + 네이티브 앱 듀얼 클라이언트**: Next.js 웹과 React Native
  (Expo) 앱이 Express 백엔드 하나를 `packages/types` 타입 계약으로
  공유 — 백엔드를 Next.js에 흡수시키지 않고 처음부터 독립 서비스로
  설계해야 가능했던 구조
- 🔔 **Web Push 기반 실시간 주문 알림**: WebSocket 서버 없이
  VAPID/Web Push만으로 주방 화면에 새 주문 OS 알림을 띄움 — 무료
  티어 백엔드의 슬립과도 상성이 좋은 선택
- 🖱️ **외부 라이브러리 없는 커스텀 UI**: 판매 통계 SVG 꺾은선
  그래프, 포인터 이벤트 기반 드래그 재정렬 — 좌표 변환/터치 판정
  로직을 직접 구현
- 🕐 **KST 타임존 기반 도메인 로직**: 당일 자정 기준으로 리셋되는
  주문번호 채번, 월별 매출 MongoDB 집계 파이프라인 — 외부 시간대
  라이브러리 없이 UTC↔KST 변환을 직접 계산
- 🖼️ **이미지 자동 최적화 파이프라인**: 업로드 → `sharp` 리사이즈/
  WebP 재인코딩 → Cloudflare R2 저장까지 서버에서 자동 처리

### 🎯 기획 판단이 담긴 부분

- ⏱️ **세션 타임아웃**: 1분간 조작이 없으면 경고 없이 장바구니를
  비우고 초기 화면으로 복귀 — 다음 손님이 이전 손님 장바구니를
  이어받는 사고를 방지
- ↩️ **주문 취소/되돌리기 + 재고 자동 복원**: 취소 시 차감했던 재고를
  자동으로 되돌리고, 완료 처리 실수는 "되돌리기"로 복구 — 실제
  매장 운영에서 벌어질 실수까지 고려한 상태 설계
- 🧋 **옵션 조합별 장바구니 분리**: 온도(HOT/ICE)·얼음양·"마법의
  주문"·메뉴별 자유 옵션을 조합해도, 같은 메뉴라도 옵션이 다르면
  다른 줄로 분리하는 복합 키 설계
- 🍽️ **매장/포장 전환 2단계 확인**: 주문 중 실수로 처음 화면으로
  튕기지 않도록 변경 팝업 → 확인 팝업을 한 번 더 거치게 설계
- 🔐 **관리자 인증**: 매장 하나 규모에 맞춰 공유 비밀번호 방식을
  택하되, `timingSafeEqual`로 타이밍 공격은 방지 — 규모에 맞는
  선택과 보안 기본기를 함께 챙김

---

## 🎬 데모 (실제 화면)

### 고객 화면 (Client)

<table>
  <tr>
    <td align="center" width="33%">
      <img src="image%20asset/preview/mobile(web).gif" width="200"/><br/>
      <b>Mobile (Web)</b>
    </td>
    <td align="center" width="33%">
      <img src="image%20asset/preview/tablet(web).gif" width="300"/><br/>
      <b>Tablet (Web)</b>
    </td>
    <td align="center" width="33%">
      <img src="image%20asset/preview/tablet(app).gif" width="300"/><br/>
      <b>Tablet (Native App)</b>
    </td>
  </tr>
</table>

### 관리자 · 주방 화면 (Admin / Kitchen)

<table>
  <tr>
    <td align="center" width="50%">
      <img src="image%20asset/preview/admin.gif" width="360"/><br/>
      <b>관리자 화면 (<code>/admin</code>)</b> — 메뉴·카테고리·광고 관리, 판매 통계
    </td>
    <td align="center" width="50%">
      <img src="image%20asset/preview/kitchen.gif" width="360"/><br/>
      <b>주방 화면 (<code>/kitchen</code>)</b> — 진행중/완료/취소 주문 확인·처리
    </td>
  </tr>
</table>

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 / 라이브러리 | 용도 |
| :--- | :--- | :--- |
| **모노레포** | Turborepo, pnpm workspaces | 웹/백엔드/모바일이 타입(`packages/types`)과 설정을 공유하면서도 독립 배포 |
| **프론트엔드** | Next.js 15(App Router), TypeScript, Tailwind CSS v4, Zustand | 고객(`/`)·관리자(`/admin`)·주방(`/kitchen`) 3개 화면을 FSD 구조로 구성 |
| **백엔드** | Express 5, TypeScript, Mongoose(MongoDB) | REST API 전용 — 웹/모바일 앱이 동등하게 호출하는 독립 서비스 |
| **모바일 앱** | React Native(Expo), NativeWind | 안드로이드 키오스크 태블릿 전용 네이티브 앱, 웹과 같은 FSD 구조 |
| **이미지 처리** | `sharp`, Cloudflare R2(S3 호환) | 업로드 이미지 리사이즈+WebP 재인코딩 후 오브젝트 스토리지 저장 |
| **실시간 알림** | `web-push`, VAPID, Service Worker | 주방 화면 새 주문 OS 알림(WebSocket 미사용) |
| **PWA** | `@serwist/next` | 오프라인 캐싱 전략(`NetworkOnly` API + `defaultCache` 정적 리소스), 홈 화면 설치 |
| **인증** | `express-session`, `connect-mongo` | 공유 비밀번호 + MongoDB 세션 저장(서버 재시작에도 로그인 유지) |
| **테스트** | Vitest, Supertest, `mongodb-memory-server` | 백엔드는 인메모리 MongoDB로 실제 요청-응답 통합 테스트 |
| **CI/CD** | GitHub Actions | push/PR마다 타입체크 → 빌드 → 테스트 자동 실행 |
| **배포** | Vercel(프론트엔드), Render(백엔드), MongoDB Atlas, Cloudflare R2 | 전부 무료 티어 조합 — Render 슬립은 외부 헬스체크 크론으로 방지 |
| **Docs Engine** | Quartz v5 + LeanSpec | Obsidian Vault 기반 아키텍처 문서 사이트 자동 배포 + 기능 단위 스펙 관리 |

---

## 🚀 시작하기 (Getting Started)

### 준비물
- Node.js 18 이상 · pnpm 9(`packageManager` 필드로 고정)
- MongoDB 연결 문자열(Atlas 등)

```bash
# 의존성 설치
pnpm install

# apps/backend/.env 파일 생성 후 필수 환경변수 설정 (아래 참고)

# 프론트엔드(:3000) + 백엔드(:4000) 동시 실행
pnpm dev

# 특정 앱만 실행
pnpm dev --filter=frontend
pnpm dev --filter=backend

# 모바일 앱(Expo Go로 즉시 실행)
cd apps/mobile && pnpm dev
```

> ⚠️ 프론트엔드는 백엔드에 직접 요청하지 않습니다 — `next.config.js`의
> `rewrites()`가 `/api/*`를 백엔드로 중계해, 브라우저가 항상 같은
> 오리진으로만 요청하게 만듭니다(로그인 세션 쿠키가 서드파티 쿠키로
> 취급돼 막히는 문제 회피). 다른 백엔드 주소를 쓰려면 `apps/frontend`에
> `.env.local`을 만들어 `BACKEND_ORIGIN=https://your-backend-host`를 설정하세요.

### 환경변수(`apps/backend/.env`)
```
MONGO_URI=mongodb+srv://...
ADMIN_PASSWORD=아무-비밀번호
SESSION_SECRET=아무-랜덤-문자열
FRONTEND_ORIGIN=http://localhost:3000
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
VAPID_PUBLIC_KEY=...       # 없어도 서버는 뜨고 알림 기능만 비활성화
VAPID_PRIVATE_KEY=...
```

### 주요 스크립트
| 명령 | 설명 |
|---|---|
| `pnpm dev` | 전체 앱 개발 서버 실행 |
| `pnpm build` | 전체 앱 빌드 |
| `pnpm check-types` | 전체 TypeScript 타입 체크 |
| `pnpm test` | 전체 테스트 실행(Vitest — 백엔드는 인메모리 MongoDB) |
| `pnpm lint` | 전체 ESLint 검사 |

`main`에 push/PR을 올리면 [`ci.yml`](.github/workflows/ci.yml)이
`check-types → build → test`를 자동 실행합니다.

---

## 📁 프로젝트 구조 (Directory Structure)

```text
maid-cafe-kiosk/
 ├── CLAUDE.md                  # AI 에이전트 개발 지침서 (FSD, @owner 태그 규칙)
 ├── README.md
 ├── apps/
 │    ├── frontend/             # Next.js — 고객("/") · 관리자("/admin") · 주방("/kitchen")
 │    │    └── src/
 │    │         ├── app/          # 라우팅 + PWA 매니페스트/서비스워커 + 전역 Provider
 │    │         ├── views/        # 라우트별 화면 조합 (home, admin, kitchen)
 │    │         ├── widgets/      # product-list, order-summary, manage-*, sales-dashboard 등
 │    │         ├── features/     # cart, order-type, admin-auth, *-management
 │    │         ├── entities/     # product, category, ad, order (API + UI)
 │    │         └── shared/       # 공용 axios 인스턴스, UI 키트, 유틸
 │    ├── backend/              # Express REST API 서버
 │    │    └── src/
 │    │         ├── app.ts        # 미들웨어/라우터 조립(테스트에서 재사용)
 │    │         ├── index.ts      # 서버 엔트리 — DB 연결 + listen
 │    │         ├── routes/       # adminAuth, categories, products, ads, orders, uploads, push
 │    │         ├── models/       # Category, Product, Ad, Order, PushSubscription
 │    │         ├── lib/          # date(KST 계산), image(재인코딩), r2Client, webPush, inventory
 │    │         └── middleware/   # requireAdmin
 │    └── mobile/               # React Native(Expo) — 안드로이드 키오스크 태블릿 전용
 │         └── src/              # frontend와 동일한 FSD 레이어 구조
 ├── packages/
 │    ├── types/                # 프론트/백엔드/모바일 공유 계약 타입
 │    ├── eslint-config/
 │    └── typescript-config/
 └── docs/                       # 기획/개발 문서 (Quartz Vault + LeanSpec + ADR)
      ├── content/기획/          # 기획서, 기능별 상세 문서
      ├── content/개발/          # 개발계획서(12장 아키텍처/알고리즘 상세 문서)
      ├── specs/                 # LeanSpec 기능 단위 스펙
      └── decisions/             # ADR(아키텍처 결정 기록)
```

---

## 🔧 개발 하이라이트 (Engineering Highlights)

- **KST 시간대 날짜 계산**: MongoDB/JS의 `Date`는 항상 UTC인데, "오늘
  하루"·"이번 달" 경계는 한국 시간 기준이어야 합니다. 9시간을 더해
  UTC 필드에 KST 값을 담은 뒤 자정을 계산하고 다시 9시간을 빼서
  되돌리는 방식으로, 외부 시간대 라이브러리 없이 당일 자정 기준
  주문번호 리셋과 월별 매출 집계 경계를 정확히 계산했습니다.
- **RN에서 반응형 "구조" 변경은 위험하다는 걸 실기기로 발견**: 태블릿
  좌우 분할 레이아웃을 웹처럼 `md:flex-row` 반응형 className으로
  구현했더니 `check-types`는 통과했지만, 실제 태블릿에서는 사이드바와
  카테고리 탭이 겹쳐 보이는 버그가 있었습니다. `useWindowDimensions()`로
  폭을 직접 읽어 JS로 레이아웃을 분기하는 방식으로 바꿔 해결했고,
  "크기는 반응형 className, 구조 전환은 JS 분기"라는 규칙을 프로젝트
  전반에 적용했습니다.
- **`IntersectionObserver`로 만든 헤더 도킹 효과**: 카테고리 탭이
  스크롤로 상단 고정 헤더에 닿는 순간을 감지하기 위해 스크롤 이벤트
  대신 `rootMargin`을 헤더 높이만큼 당긴 `IntersectionObserver`를
  사용해, 매 스크롤마다 계산하지 않고도 정확한 시점에 헤더 도킹
  전환을 트리거합니다.
- **RN `Modal`은 별도 네이티브 화면이라는 함정**: 세션 타임아웃용 유휴
  타이머를 최상위 화면에만 붙였더니 옵션 선택 모달 안에서의 조작이
  감지되지 않았습니다 — RN의 `<Modal>`이 iOS
  `UIViewController`/안드로이드 `Dialog`라는 완전히 별도의 네이티브
  화면이기 때문입니다. `onStartShouldSetResponderCapture`(항상
  `false`를 반환해 실제 터치 처리는 그대로 넘기는 캡처 단계 콜백)를
  메인 화면과 모달 오버레이 양쪽에 달아 해결했습니다.
- **Web Push 알림에서 겪은 두 겹의 권한 문제**: 브라우저 안의
  `Notification.requestPermission()`이 `'granted'`를 반환해도 macOS
  시스템 설정에서 그 브라우저 앱 자체의 알림이 꺼져 있으면 알림이
  뜨지 않는, 브라우저 권한과 OS 권한이 별개 레이어라는 걸 실제
  배포 환경에서 확인하고 진단 로그를 보강했습니다.
- **주문 성공과 부가 효과의 실패 허용 범위 분리**: 주문 저장 후
  응답을 먼저 반환하고, 재고 차감과 주방 웹 푸시 발송은 각각 독립된
  `try/catch`로 감싸 실패해도 로그만 남기는 "fire-and-forget"
  패턴을 적용했습니다 — 부가 기능 장애가 손님의 "주문하기" 성공
  경험에 영향을 주지 않게 하기 위함입니다.

> 위 항목들을 포함해 이 프로젝트의 모든 설계 결정과 알고리즘은
> [온라인 개발 문서(12장)](https://yonghun16.github.io/maid-cafe-kiosk/)에서
> 코드와 함께 더 자세히 볼 수 있습니다.

---

## 📚 문서

이 저장소의 `docs/`에는 세 가지 성격의 문서가 있습니다. 세부 규칙은
[`docs/AGENTS.md`](docs/AGENTS.md)에 정의되어 있습니다.

- **Vault** (`docs/content/`) — Obsidian Vault, Quartz 5로 사이트 빌드.
  - [기획서](docs/content/기획/기획서.md) — 서비스 목적, 사용자 흐름, 기능 범위
  - [개발계획서](docs/content/개발/개발계획서.md) — 아키텍처/기술스택/알고리즘
    상세 문서(12장) 목차와 로드맵
- **Spec** (`docs/specs/`) — 기능 단위 스펙. [LeanSpec](https://leanspec.dev)
  CLI로만 생성/수정합니다.
- **ADR** (`docs/decisions/`) — 아키텍처/기술 스택 등 중요 결정 기록.

코드 작업 규칙(FSD 레이어, `@owner` 태그, TypeScript 규칙 등)은 저장소
루트의 [`CLAUDE.md`](CLAUDE.md)에 정의되어 있습니다.

---

## 📄 라이선스

개인 포트폴리오 및 학습 목적으로 제작된 프로젝트입니다. 별도의 오픈소스
라이선스는 지정되어 있지 않습니다.

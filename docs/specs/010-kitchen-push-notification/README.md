---
status: complete
created: 2026-09-12
priority: high
tags:
- 기능
created_at: 2026-09-12T02:08:05.873128Z
updated_at: 2026-09-12T03:07:55.747048Z
completed_at: 2026-09-12T03:07:55.747048Z
transitions:
- status: complete
  at: 2026-09-12T03:07:55.747048Z
---
# 주방 화면 새 주문 웹 푸시 알림

## Overview

고객이 키오스크에서 주문을 넣으면 주방 화면(`/kitchen`)에는 지금까지
10초 폴링으로만 반영됐다(`docs/content/개발/개발계획서.md` 참고). 이
스펙은 사용자의 "서비스워커를 사용해서 클라이언트 페이지에서 주문한
것이 바로 주방화면 사용자에게 알람이 가게 해줘" 요청에 따라, **Web
Push**로 주문 즉시 주방 화면에 OS 알림이 뜨도록 한다(탭이 백그라운드에
있거나 꺼져 있어도 뜬다). 기존 10초 폴링은 그대로 유지하고(신뢰성
보완용 백업), 이번 기능은 그 위에 "즉시성"을 더하는 것이다.

## Design

**조사 결과 기반 결정**
- 프론트엔드에는 이미 Serwist 서비스워커(`apps/frontend/src/app/sw.ts`)가
  있지만 정적 리소스 캐싱 전용이었고, **등록 코드 자체가 없어서 실제로는
  전혀 동작하지 않고 있었다**(`@serwist/next`는 `SerwistProvider`를 직접
  붙여야 등록됨). 이번에 `layout.tsx`에 `SerwistProvider`를 추가해 처음으로
  실제 등록되게 했다 — 이 프로젝트의 서비스워커 인프라 자체가 이번에
  "켜진" 것이다.
- 백엔드는 Render 무료 티어(슬립 방지용 10분 외부 헬스체크에 의존)라
  WebSocket 같은 상시 연결 방식은 이 배포 환경과 마찰이 있다(연결이
  끊기면 무의미, 슬립/재기동 시 재연결 필요). Web Push는 발송 시점에만
  요청이 오면 되므로 이 제약과 더 잘 맞는다. `CLAUDE.md`의 "통신 방식:
  REST API" 원칙과도 상충하지 않는다(푸시 발송도 결국 백엔드가 만드는
  일반 HTTP 요청).
- 주방/관리자 인증은 이미 쿠키 기반 세션(`requireAdmin`)이 있어서, 구독
  등록/해제 API에 별도 토큰 체계 없이 그대로 재사용했다.

**구현**
- `packages/types`: `PushSubscriptionInput`, `VapidPublicKeyResponse` 추가.
- 백엔드:
  - `web-push` 패키지 추가(+ `@types/web-push`).
  - `models/PushSubscription.ts`(신규) — endpoint(unique)/keys 저장.
  - `lib/webPush.ts`(신규) — VAPID 키가 없으면 조용히 비활성화(콘솔
    경고만). `notifyKitchenOfNewOrder(orderNumber, orderType)`가 저장된
    모든 구독에 전송하고, 구독 하나가 만료(410/404)돼도 다른 구독
    전송에 영향 없이 독립 처리 + 만료 구독은 자동 정리.
  - `routes/push.ts`(신규) — `GET /vapid-public-key`(공개, 키 없으면
    503), `POST /subscribe`/`POST /unsubscribe`(`requireAdmin`).
  - `routes/orders.ts`의 `POST /` — 응답을 보낸 뒤(재고 차감과 동일한
    자리) `notifyKitchenOfNewOrder` 호출. 실패해도 로그만 남기고 고객의
    주문 성공에는 영향 없음(기존 재고 차감과 같은 "fire and forget"
    패턴).
- 프론트엔드:
  - `app/layout.tsx`에 `SerwistProvider` 추가(`disable`은
    `next.config.js`와 동일하게 개발 모드에서 끔).
  - `app/sw.ts`에 `push`/`notificationclick` 이벤트 리스너 추가 — 알림
    클릭 시 이미 열린 `/kitchen` 탭이 있으면 포커스만 옮기고 없으면
    새로 연다.
  - `features/kitchen-push-notification`(신규) — `api/pushApi.ts`,
    `lib/urlBase64ToUint8Array.ts`(VAPID 공개키 base64→Uint8Array 변환),
    `model/useKitchenPushNotification.ts`(브라우저의 실제
    `PushSubscription` 존재 여부를 상태 원본으로 삼는 훅), `ui/
    KitchenPushToggle.tsx`(켜기/끄기 버튼, 미지원/권한거부 시 안내
    문구로 대체).
  - `views/kitchen/ui/KitchenPage.tsx`에 `KitchenPushToggle` 배치.
- `turbo.json`에 `globalEnv: ["NODE_ENV"]` 추가 — `layout.tsx`에서 새로
  `process.env.NODE_ENV`를 참조하게 되면서 `turbo/no-undeclared-env-vars`
  린트 경고가 발생해 함께 고쳤다(캐시 정확성을 위한 선언이기도 함).

**운영 배포에 필요한 조치(사용자가 직접 해야 함)**
- Render(백엔드) 환경변수에 `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/
  `VAPID_SUBJECT`를 추가해야 한다. 로컬 개발용 키는 `apps/backend/.env`에
  새로 생성해 넣어뒀지만(`npx web-push generate-vapid-keys`로 생성),
  운영에는 별도로 새로 발급해서 등록하는 걸 권장한다(`VAPID_SUBJECT`는
  `mailto:` 형식의 연락처 — 지금은 플레이스홀더 `admin@example.com`을
  넣어뒀으니 실제 연락 가능한 주소로 바꿔도 됨).
- 이 환경변수들이 없으면 `notifyKitchenOfNewOrder`가 조용히 아무 것도
  하지 않고(콘솔 경고만), `GET /api/push/vapid-public-key`는 503을
  반환해 주방 화면의 "알림 켜기" 버튼이 항상 비활성 상태로 보인다 —
  기존 기능(주문 생성, 10초 폴링)에는 전혀 영향 없다.

## Plan

- [x] `packages/types`에 `PushSubscriptionInput`/`VapidPublicKeyResponse` 추가
- [x] 백엔드: `web-push` 설치, `PushSubscription` 모델, `lib/webPush.ts`,
      `routes/push.ts`, `orders.ts` 연동, `app.ts` 라우터 마운트
- [x] 프론트엔드: `SerwistProvider` 등록, `sw.ts`에 push/notificationclick
      핸들러, `kitchen-push-notification` 기능, `KitchenPage` 통합
- [x] `pnpm --filter backend check-types`/`test`(37개, 신규 6개 포함)
      통과 확인 — `notifyKitchenOfNewOrder`는 `web-push`를 모킹해
      구독 전체 발송/만료 구독 자동 정리/구독 없을 때 무동작까지 검증
- [x] `pnpm --filter frontend check-types`/`lint` 통과 확인
- [x] `pnpm --filter frontend build`로 서비스워커가 실제로
      번들링되는지, `next start`(로컬 백엔드를 가리키도록
      `BACKEND_ORIGIN` 지정)로 `/sw.js` 서빙과 `/api/push/vapid-public-key`
      가 프록시를 통해 로컬 백엔드까지 정상 응답하는지 확인
- [x] **실제 브라우저에서 "알림 켜기" 클릭 → 권한 허용 → 다른 기기/탭에서
      주문 → OS 알림이 실제로 뜨는지 확인** — 에뮬레이터 Chrome을 쓰다가
      실제 사용자 Google 계정 이메일이 로그인 화면에 자동완성되는 걸
      발견해 그 즉시 중단한 사고가 있어서, 이 검증은 AI가 아니라
      **사용자가 실제 배포(Render+Vercel)에서 직접 진행**했다.

**실사용 검증 결과 및 트러블슈팅(사용자가 실제로 겪고 해결한 것들)**
- **안드로이드 Chrome**: 정상 동작 확인. 다른 기기에서 주문 → 실제로
  OS 알림 수신됨.
- **안드로이드 삼성 인터넷 브라우저**: 알림이 오지 않음 — 이 브라우저는
  Web Push API 지원이 예전부터 불안정하기로 알려져 있어(배터리
  최적화가 백그라운드 푸시 전달을 막는 경우가 많음), 이번 구현의
  버그라기보다 브라우저 자체의 한계로 판단. 안드로이드는 Chrome 사용을
  권장.
- **데스크탑 Chrome/Brave**: 처음엔 "알림 켜기"를 눌러도 아무 알림도
  안 뜸(에러도 없음) — 원인은 **macOS 시스템 설정 → 알림에서 해당
  브라우저 앱 자체의 알림이 꺼져 있던 것**. 브라우저 안에서
  `Notification.requestPermission()`이 "허용"을 반환해도, macOS가 그
  앱의 알림 표시 자체를 막고 있으면 브라우저는 성공했다고 판단하는데
  화면엔 아무 것도 안 뜨는 흔한 함정이다. 시스템 설정에서 브라우저
  앱의 알림을 허용하고 나서 해결됨.
- 이 과정에서 두 가지를 별도로 발견해 함께 고쳤다(진단용 로그 보강,
  `29af8d8` 커밋): (1) `VAPID_PUBLIC_KEY`/`PRIVATE_KEY` 중 하나만
  빠져도 에러 없이 조용히 알림이 전송되지 않던 문제 — 서버 시작 시
  어느 키가 빠졌는지 콘솔에 명확히 남기도록 함. (2) 구독 상태 확인
  로직에 에러 처리가 없어 실패해도 조용히 "꺼짐"으로만 보이던 문제 —
  try/catch 추가 + origin/구독 존재 여부를 콘솔에 남김(다른 origin,
  예: localhost vs 배포 주소, 을 오갈 때 생기는 혼동도 바로 확인 가능).

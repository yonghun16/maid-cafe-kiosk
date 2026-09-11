---
status: complete
created: 2026-09-11
priority: high
tags:
- 기능
- 모바일
created_at: 2026-09-11T13:27:58.902532Z
updated_at: 2026-09-11T13:44:37.944191Z
completed_at: 2026-09-11T13:44:37.944191Z
transitions:
- status: complete
  at: 2026-09-11T13:44:37.944191Z
---
# 고객용 앱 — 실제 주문 화면 UI 포팅 (1차)

## Overview

`docs/specs/005-mobile-app-scaffold`에서 만든 스캐폴딩(임시 확인 화면)을
실제 웹 키오스크(`apps/frontend`)와 동등한 주문 흐름으로 교체한다. 웹의
`views/home`, `widgets/order-type-select`, `widgets/product-list`,
`widgets/order-summary`, `features/cart`, `features/order-type`를 React
Native + NativeWind로 다시 구현한다(005 스펙의 결정대로 로직은 복붙 후
조정, 공유 패키지 추출은 안 함).

## Design

**1차 범위 (이번 스펙)**
- 매장/포장 선택 화면
- 카테고리 탭 + 메뉴 목록 조회
- 장바구니 담기(수량만, 옵션 선택 모달은 2차로 미룸) / 수량 조절 /
  삭제
- 결제 수단 선택 모달 + 주문 제출
- 주문 완료 화면

**2차로 미루는 것 (이번 스펙 범위 밖)**
- 메뉴 옵션 선택 모달(온도/마법의 주문/커스텀 옵션) — 대부분 상품은
  옵션이 없고, 있는 상품도 `CreateOrderInput`의 옵션 필드들이 전부
  선택값이라 생략해도 유효한 주문이 됨. 옵션 모달은 온도 콤보박스,
  마법의 주문 드롭다운, ICE일 때만 추가로 뜨는 얼음양 등 조건부 UI가
  많아 범위가 커서 별도 스펙으로 분리.
- 광고 배너(`AdBanner`)
- 세션 타임아웃(1분 무조작 시 초기화)
- "처음으로"/매장·포장 변경 팝업
- 품절 처리 UI(흑백 처리 등 — 일단 품절 상품도 그냥 노출, 서버가
  막지는 않으므로 주문은 가능한 상태로 남음. 실사용 전 반드시 2차에서
  채워야 함)

**결정 필요 (구현 착수 전 확정)**
- 네비게이션: 웹처럼 별도 화면 전환 없이 한 화면 안에서 Zustand 상태
  (`orderType` 유무, `lastCompletedOrder` 유무)에 따라 조건부 렌더링.
  React Navigation 등 라우팅 라이브러리는 이번 범위에서 추가하지 않음
  (웹 원본도 라우팅 없이 조건부 렌더링만 씀 — 그대로 대응).
- 모달: RN 내장 `Modal` 컴포넌트로 `shared/ui/Modal` 구현(웹의
  `shared/ui/Modal`과 같은 역할 — 결제 수단 선택에 사용).
- 알림/에러 표시: 웹은 `react-hot-toast`를 쓰는데 RN에 직접 대응품이
  없어 `react-native-toast-message`를 새로 추가. 간단한 토스트만
  필요하고(성공/실패 메시지), 복잡한 UI가 아니라 가벼운 라이브러리로
  충분.
- 이미지: `expo-image` 사용(WebP 지원, 캐싱) — RN 기본 `Image`도
  WebP를 지원하지만 캐싱/로딩 상태 처리가 더 나은 `expo-image`를
  채택. `expo`가 이미 의존성에 있어 추가 설치만 필요.

**영향 범위**
- `apps/mobile/src/entities/{product,category}` — API 호출(웹과 거의
  동일, axios 인스턴스만 다름)
- `apps/mobile/src/features/{cart,order-type}` — Zustand 스토어(웹의
  로직을 복붙 후 토스트 라이브러리만 교체)
- `apps/mobile/src/widgets/{order-type-select,product-list,order-summary,order-complete}`
- `apps/mobile/src/views/home`
- `apps/mobile/src/shared/ui/Modal.tsx`
- `App.tsx`를 `views/home`을 렌더링하도록 교체(지금의 스캐폴딩 확인용
  코드는 삭제)
- `apps/backend`, `apps/frontend`, `packages/types`는 변경 없음(이미
  있는 공개 API/공유 타입을 그대로 씀)

## Plan

- [x] `expo-image`, `react-native-toast-message`, `zustand`(누락돼서
      check-types 단계에서 발견해 추가) 의존성 추가
- [x] `shared/ui/Modal.tsx`(RN `Modal` 기반)
- [x] `entities/category`(API), `entities/product`(API + `ProductCard`
      UI — 옵션 모달 없이 탭하면 바로 담기)
- [x] `features/order-type`(store), `features/cart`(store — 옵션 필드는
      전부 생략하고 기본 수량만 다룸, 로직은 웹과 동일하게 포팅)
- [x] `widgets/order-type-select`, `widgets/product-list`,
      `widgets/order-summary`(장바구니 목록 + 결제 수단 모달),
      `widgets/order-complete`
- [x] `views/home`으로 전체 흐름 조립, `App.tsx` 교체
- [x] `pnpm --filter mobile check-types`, `npx expo export --platform
      android` 통과 확인
- [x] 실행 중인 에뮬레이터에서 실제로 매장/포장 선택 → 메뉴 담기 →
      수량 조절 → 결제 수단 선택 → 주문 제출 → 완료 화면까지 눈으로
      확인 — 전부 정상 동작(스크린샷으로 확인). 테스트 중 실제 주문이
      백엔드에 생성돼(주문번호 No. 6) 확인 후 즉시 삭제.
      - 확인 과정에서 실제 버그 2개 발견해 수정: (1) `HomePage.tsx`에서
        `SafeAreaView`를 `react-native`(deprecated)에서 잘못 import해
        헤더가 상태 표시줄과 겹치던 문제 — `react-native-safe-area-context`
        로 수정. (2) `FlatList` 2열 그리드에서 마지막 줄에 상품이
        하나만 남으면 그 카드가 `flex-1` 때문에 줄 전체 너비로 늘어나던
        문제 — 홀수개일 때 보이지 않는 채움 칸(`null` 데이터 + 빈 View
        렌더링)을 추가해 해결.

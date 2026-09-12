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

**후속 조정(다른 날, `docs/specs/009-mobile-tablet-sizing`에서 진행) —
"처음으로"/매장·포장 변경 팝업**: 이번 스펙에서 2차로 미뤘던 항목 중
"처음으로"/매장·포장 변경 팝업"을 구현했다("헤더Bar에 '매장에서' 버튼
기능 추가해줘, 포장도 되어야되고 프론트 화면으로 갈 수 있어야 하고").
웹의 `views/home/ui/HomePage.tsx`에 있는 로직(주문 방식 변경 모달 +
"처음부터 다시 시작" 확인 모달)을 RN으로 그대로 포팅 — 헤더의 매장/포장
Text를 `Pressable`로 바꾸고, `shared/ui/Modal`을 이용한 두 개의 모달
(주문 방식 라디오 선택, 처음으로 확인)을 추가했다. 에뮬레이터에서
매장→포장 변경, "처음으로" → 매장/포장 선택 화면 복귀까지 스크린샷으로
확인.

**후속 조정(같은 날) — 세션 타임아웃**: 위에서 남겨뒀던 마지막 2차 미룸
항목인 세션 타임아웃(1분 무조작 시 초기화)도 구현했다. 웹은
`window.addEventListener`로 전역 조작을 감지하지만 RN은 그런 전역
이벤트가 없고, 특히 옵션 선택/결제 모달처럼 `<Modal>`로 뜨는 화면은
별도 네이티브 창(iOS `UIViewController`/안드로이드 `Dialog`)이라 최상위
화면에만 감지기를 달면 모달 안에서의 조작을 놓친다.
- `shared/lib/idleTimer.ts`(새 파일): 타이머 상태를 React state나
  Zustand가 아니라 **모듈 전역 함수**로 관리 — `shared/ui/Modal`이
  `features/`를 import할 수 없어서(FSD 레이어 규칙), 이 로직 자체가
  `shared/`에 있어야 `HomePage`와 `Modal` 양쪽에서 같은 타이머를 공유할
  수 있다. `startIdleTimer(onTimeout)`/`resetIdleTimer()`/`stopIdleTimer()`
  세 함수만 노출.
- 터치 감지는 `onTouchStartCapture`(웹의 캡처 이벤트와 이름이 비슷해
  처음엔 이걸 시도했으나, RN 타입 정의에는 `View`에도 없어 컴파일
  에러) 대신 `onStartShouldSetResponderCapture`(RN 제스처 리스폰더
  시스템의 캡처 단계 질의 콜백)를 씀 — 항상 `false`를 반환해 실제
  터치 응답(버튼 `onPress` 등)은 그대로 자식에게 넘기고, 호출 자체는
  모든 터치 시작 시점에 일어난다는 점만 이용해 부수효과로 타이머만
  갱신한다.
- `HomePage.tsx`(주문 화면 루트 `View`)와 `shared/ui/Modal.tsx`(모달
  오버레이 `View`) 양쪽에 이 핸들러를 달아, 메인 화면 조작과 모달 안
  조작 모두 타이머를 갱신하게 했다.
- **검증 과정에서 얻은 교훈**: 실제 기기 확인 없이 타입체크만 믿었으면
  놓쳤을 문제 두 가지를 실기기 테스트로 잡았다. (1) `onTouchStartCapture`
  가 `Pressable`/`SafeAreaView`/`View` 타입 어디에도 없어 컴파일부터
  실패 — `onStartShouldSetResponderCapture`로 교체. (2) 타임아웃을
  6초로 줄여 모달 안에서 4초 간격으로 탭했는데도 화면이 초기화되는
  것처럼 보여 처음엔 "모달 안 터치가 감지 안 된다"고 오판했으나,
  원인은 메커니즘이 아니라 **테스트 방법** — 스크린샷을 읽고 다음 명령을
  입력하는 사이(에이전트 자신의 처리 시간)에 실제 벽시계 기준 6초가
  이미 지나버린 것이었다. 탭-대기-탭을 전부 한 셸 명령으로 묶어
  실행하고 나서야(중간에 에이전트가 끼어들 틈 없이) 12초 넘게 유지되는
  것을 확인해 정정했다. `console.log` + `adb logcat`으로 캡처 핸들러가
  실제로 호출되는지 먼저 직접 확인한 뒤 지운 것도 이 오판을 바로잡는 데
  결정적이었다.
- `pnpm --filter mobile check-types` 통과 확인, 타임아웃을 6초로 줄인
  임시 빌드로 (a) 무조작 시 6초 후 자동으로 매장/포장 선택 화면 복귀,
  (b) 메인 화면 탭이 타이머를 갱신해 계속 조작 중이면 초기화되지 않음,
  (c) 옵션 모달 안에서의 탭도 동일하게 타이머를 갱신함을 각각 확인한
  뒤, 원래 값(60초)으로 되돌리고 재확인.

**후속 결정(같은 날) — 남은 마지막 항목(Lock Task Mode 키오스크 잠금)은
코드 작업 대신 운영 절차로 해결**: 이번 스펙에서 2차로 미룬 항목 중
"Lock Task Mode(키오스크 잠금) 네이티브 모듈 연동"만 유일하게 남아있었는데,
조사 결과 신뢰할 만한 Expo 호환 라이브러리가 없어(전부 방치되었거나
Expo와 비호환) 직접 네이티브 모듈 + config plugin을 새로 만들어야 하는
상황이었다. 매장 규모(태블릿 한두 대)를 고려해 Device Owner 완전 잠금
대신 안드로이드 기본 기능인 **Screen Pinning**(코드 변경 없이 태블릿에서
수동으로 한 번 설정)으로 시작하기로 결정 — 자세한 배경과 트레이드오프는
`docs/decisions/0001-kiosk-lock-screen-pinning.md` 참고. 이로써 spec 006이
2차로 미뤘던 항목이 전부 처리됐다(포팅 완료 또는 의도적으로 더 가벼운
대안 채택).

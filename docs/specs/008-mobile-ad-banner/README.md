---
status: complete
created: 2026-09-11
priority: high
tags:
- 기능
- 모바일
created_at: 2026-09-11T14:29:31.161383Z
updated_at: 2026-09-11T14:29:34.472841Z
completed_at: 2026-09-11T14:29:34.472841Z
transitions:
- status: complete
  at: 2026-09-11T14:29:34.472841Z
---
# 고객용 앱 — 광고 배너 (3차)

## Overview

`docs/specs/006-mobile-order-flow`에서 미룬 항목. 웹의
`entities/ad/ui/AdBanner.tsx`처럼, 매장/포장 선택 화면에 관리자가
등록한 광고 이미지를 순환 노출하는 배너를 포팅한다. 관리자 CRUD 화면
(`ManageAdList`/`AdForm`)은 이번 범위 밖 — 모바일 앱은 고객용 화면만
포팅하므로 광고 등록/수정/삭제는 계속 웹 관리자에서 한다. API 계약은
백엔드 변경 없이 기존 `GET /api/ads` 그대로 재사용한다.

## Design

- `apps/mobile/src/entities/ad/api/adApi.ts`(신규) — `getAds()`만 포팅
  (관리자 CRUD 함수는 불필요)
- `apps/mobile/src/entities/ad/ui/AdBanner.tsx`(신규) — 웹과 동일한
  수치/로직 그대로 이식: 5000ms 자동 순환, 40px 스와이프 임계값, 4:3
  비율, 컷 전환(애니메이션 없음), 인덱스 순환(`% length`), 광고 없으면
  `null` 렌더링
  - 웹은 브라우저 Pointer Event(`onPointerDown`/`onPointerUp`)로
    스와이프를 처리하지만, RN에는 그 API가 없으므로 RN 코어 내장
    `PanResponder`로 동일한 델타 X 기반 판정을 구현했다. 새 라이브러리
    추가 없이 가능해서 `react-native-gesture-handler` 등은 도입하지
    않음.
  - `PanResponder.create(...)`는 `useRef`로 최초 렌더에서 한 번만
    생성되므로, 이후 렌더에서 바뀐 `ads` state를 직접 클로저로 캡처하면
    안 된다(스와이프 시 항상 최초 렌더 시점의 `ads.length`를 참조하게
    되는 stale-closure 버그). `adsLengthRef`를 렌더마다 갱신해 이벤트
    핸들러가 항상 최신 길이를 읽도록 했다.
- `apps/mobile/src/widgets/order-type-select/ui/OrderTypeSelect.tsx` —
  제목과 매장/포장 버튼 사이에 `<AdBanner />` 삽입(웹과 동일한 위치)

## Plan

- [x] `entities/ad` 포팅(`getAds` + `AdBanner`)
- [x] `OrderTypeSelect`에 배너 삽입
- [x] `pnpm --filter mobile check-types` 통과 확인
- [x] 실행 중인 에뮬레이터에서 실제 등록된 광고 4개로 확인: 5초
      자동 순환이 실제로 인덱스를 넘기는 것(디버그 로그로 tick 발생
      확인 후 스크린샷으로 이미지 전환 확인), 좌우 스와이프가 즉시
      다음/이전 광고로 전환되는 것까지 확인

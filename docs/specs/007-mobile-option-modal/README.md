---
status: complete
created: 2026-09-11
priority: high
tags:
- 기능
- 모바일
created_at: 2026-09-11T13:49:04.630666Z
updated_at: 2026-09-11T13:55:25.532416Z
completed_at: 2026-09-11T13:55:25.532416Z
transitions:
- status: complete
  at: 2026-09-11T13:55:25.532416Z
---
# 고객용 앱 — 메뉴 옵션 선택 모달 (2차)

## Overview

`docs/specs/006-mobile-order-flow`에서 미룬 항목. 웹의
`entities/product/ui/ProductCard.tsx`처럼, 메뉴 카드를 탭하면 바로
담기지 않고 온도(HOT/ICE)/마법의 주문/메뉴별 커스텀 옵션을 고르는
모달이 먼저 뜨도록 한다. 웹의 [[옵션조합관리]]와 동일한 동작을
포팅한다.

## Design

**결정 필요**
- 마법의 주문 선택 UI: 웹은 커스텀 `Dropdown` 컴포넌트를 쓰는데,
  이건 HTML 네이티브 `<select>`가 모바일에서 페이지 레이어 밖에
  뜨는 문제를 피하려고 만든 웹 전용 해결책이었다(RN에는 이 문제
  자체가 없음). RN에서는 별도 Dropdown 컴포넌트를 새로 만들지 않고,
  온도 버튼과 같은 방식(버튼 그리드, 다시 누르면 해제)으로 통일한다
  — 항목 4개라 2×2로도 충분히 자연스러움.
- 품절 메뉴 탭 시 동작: 웹처럼 모달을 열지 않고 토스트 에러만 띄운다
  (006 스펙 때는 "일단 그냥 노출"로 미뤄뒀던 부분을 이번에 웹과
  동일하게 맞춤).

**영향 범위**
- `apps/mobile/src/entities/product/model/optionConstants.ts`(신규) —
  웹의 `TEMPERATURE_OPTIONS`/`ICE_AMOUNT_OPTIONS`/`MAGIC_SPELL_OPTIONS`
  그대로 포팅
- `apps/mobile/src/entities/product/ui/ProductCard.tsx` — 옵션 모달
  추가
- `apps/mobile/src/widgets/product-list/ui/ProductList.tsx` — 변경
  없음(이미 `addToCart`를 그대로 넘기고 있어서 옵션 객체 전달은
  자동으로 됨)
- `apps/mobile/src/widgets/order-summary/ui/OrderSummary.tsx` —
  (설계 당시엔 범위 밖이었지만) 실제 확인 과정에서 장바구니 목록에
  옵션 배지가 하나도 안 보이는 게 눈에 띄어 함께 추가함(웹의
  `OrderSummary`와 동일하게 온도/얼음양/마법의 주문/커스텀 옵션 배지
  표시)

## Plan

- [x] `optionConstants.ts` 포팅
- [x] `ProductCard.tsx`에 옵션 모달 추가(온도 버튼 + ICE 얼음양,
      마법의 주문 버튼 그리드, 커스텀 옵션 체크박스, 합계 금액, 담기
      버튼, 품절 시 토스트만)
- [x] `pnpm --filter mobile check-types` 통과 확인
- [x] 실행 중인 에뮬레이터에서 온도(ICE)+얼음양(적당)+마법의 주문
      (모에모에뀽)+커스텀 옵션(샷 추가 +700원)을 한 메뉴에 동시에
      선택해 실제로 담아보고 합계(22,700원)가 정확히 계산되는 것,
      장바구니를 펼쳤을 때 옵션 배지("🧊 ICE" 등)가 반영되는 것까지
      스크린샷으로 확인

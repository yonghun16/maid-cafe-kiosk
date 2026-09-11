---
status: in-progress
created: 2026-09-11
priority: medium
tags:
- 기능
- 프론트엔드
- 백엔드
created_at: 2026-09-11T00:19:58.402936Z
updated_at: 2026-09-11T00:19:58.402936Z
---

# 주문 내역 검색/필터 추가

## Overview

`/kitchen`의 "진행중 주문"/"지난 주문" 탭은 현재 최신순 전체 목록만
보여준다([[주문내역조회]]). 완료된 주문이 계속 쌓이면 "지난 주문" 탭에서
특정 날짜나 매장/포장 구분으로 걸러볼 방법이 없다는 게 [[기획서]]
청사진 표에서 유일하게 남은 `작업중` 항목이다(상태 세분화는 이미
검토를 마치고 필요 없다고 결정함 — [[주문상태전이-API]]).

이 스펙은 [[주문내역조회]] 문서가 명시한 범위(날짜, 매장/포장)만큼만
`GET /api/orders`와 `/kitchen` 화면에 필터를 추가하는 것을 목표로
한다. 주문번호 텍스트 검색은 넣지 않는다 — `orderNumber`가 당일
자정 기준으로 리셋돼 날짜 없이는 값 자체가 모호하고, 문서가 명시한
범위(날짜/매장·포장)를 벗어나는 확장이라 이번 스코프에서 뺀다.

## Design

**결정 필요 (구현 착수 전 확정할 것)**
- 날짜 필터 기본값: 필터를 아무것도 안 걸면 지금처럼 전체 기간을
  보여준다(기존 동작 변경 없음). 관리자가 날짜를 직접 고르면 그 날
  (KST 기준 하루)로 좁혀진다. "기본값을 오늘로 강제"하지 않는 이유는
  진행중 주문 탭에서 자정을 넘겨 남아있는 오래된 미완료 주문을 필터
  기본값 때문에 놓치면 안 되기 때문.
- 매장/포장 필터는 전체/매장/포장 3버튼 세그먼트로, 날짜 필터와
  동시에(AND 조건) 적용된다.
- 두 필터 모두 프론트엔드 `OrderList` 위젯의 로컬 상태로만 관리하고
  전역 상태(Zustand)는 새로 만들지 않는다 — 탭 전환 시 초기화돼도
  문제없는 화면 전용 UI 상태.

**영향 범위**
- 백엔드: `GET /api/orders` 쿼리에 `orderType`(선택), `date`(선택,
  'YYYY-MM-DD' KST) 추가. `lib/date.ts`에 `getKstMonthRange`와 같은
  패턴으로 `getKstDayRange` 헬퍼 추가.
- `packages/types`: 기존에 `status?: OrderStatusFilter`만 받던 조회
  파라미터를 `OrderListQuery`(status/orderType/date 전부 선택)로
  묶어서 프론트/백엔드가 공유.
- 프론트엔드: `entities/order/api/orderApi.ts`의 `getOrders` 시그니처를
  `OrderListQuery`로 변경(기존 호출부 `OrderList.tsx` 함께 수정),
  `OrderList`에 날짜 입력(`<input type="date">`) + 매장/포장 세그먼트
  버튼 UI 추가.

## Plan

- [x] 백엔드: `getKstDayRange` 헬퍼 추가, `GET /api/orders`에
      `orderType`/`date` 쿼리 필터 적용(+ 잘못된 날짜 형식 400 처리)
- [x] `packages/types`: `OrderListQuery` 타입 추가, `getOrders`가
      이를 쓰도록 변경
- [x] 프론트엔드: `OrderList`에 날짜/매장·포장 필터 UI 추가
- [x] 백엔드 테스트: 날짜 필터, 매장/포장 필터, 조합 필터, 잘못된
      날짜 형식 거부 케이스 추가(`pnpm --filter backend test`,
      27개 전부 통과)
- [x] `pnpm check-types`, `pnpm build`(백엔드+프론트엔드), `pnpm
      --filter frontend test`, `pnpm --filter frontend lint` 통과 확인
- [ ] 실제 화면에서 필터 UI 동작 확인 — 이 세션엔 브라우저 도구가 없어
      미확인. 자동 테스트로 백엔드 필터 로직은 충분히 검증했지만, 새
      날짜 입력/매장·포장 버튼 UI 자체의 시각적 동작은 다음에 실제
      기기/브라우저로 확인 필요

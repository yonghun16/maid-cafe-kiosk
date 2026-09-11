---
status: complete
created: 2026-09-11
priority: low
tags:
- 기능
- 백엔드
created_at: 2026-09-11T00:38:26.371961Z
updated_at: 2026-09-11T00:38:56.139242Z
completed_at: 2026-09-11T00:38:56.139242Z
transitions:
- status: complete
  at: 2026-09-11T00:38:56.139242Z
---
# 요청 검증 에러 메시지 구체화

## Overview

[[기획서]]의 "알려진 제약 / 리스크"에 명시된 항목: 백엔드가 요청 바디를
Mongoose 스키마의 `required`/`enum` 검증에만 의존하고 있어, 검증
실패 시 사용자(관리자)에게 구체적인 원인이 전달되지 않는다. 예를 들어
잘못된 `temperatureOption` 값을 보내도 "상품 수정 중 오류가
발생했습니다"라는 뭉뚱그린 메시지만 오고, 어떤 필드가 왜 잘못됐는지는
알 수 없었다.

이 스펙은 관리자 화면(메뉴/카테고리/광고 등록·수정)과 고객 주문 생성
경로에서 요청 검증이 실패했을 때, Mongoose가 이미 만들어주는 구체적인
원인(필드명 + 잘못된 값)을 응답 메시지에 그대로 실어 보내는 것을
목표로 한다. 스키마 자체나 검증 규칙은 바꾸지 않고, catch 블록에서
에러를 사람이 읽을 메시지로 바꾸는 부분만 손댄다.

## Design

**결정 필요 (구현 착수 전 확정할 것)**
- Mongoose `ValidationError`의 기본 메시지(예: "\`WARM\` is not a valid
  enum value for path \`temperatureOption\`.")를 한국어로 전부 새로
  쓰지 않고, 기존 한국어 기본 메시지 뒤에 괄호로 그대로 덧붙인다
  (예: "상품 수정 중 오류가 발생했습니다. (`WARM` is not a valid enum
  value for path `temperatureOption`.)"). 모든 스키마 필드에 커스텀
  한국어 에러 메시지를 다는 것도 대안이었지만, 스키마 필드 수만큼
  손대야 하는 큰 변경이라 이번 스코프에는 과함 — 관리자 전용 내부
  도구라는 점을 고려해 영어 기술 메시지라도 "구체적인 원인이
  전달된다"는 목표는 충분히 달성.
- MongoDB 중복 키 오류(E11000, 카테고리 이름의 `unique` 인덱스)는
  `ValidationError`가 아니라 별도 에러라서, 이것만 따로 감지해 전용
  한국어 메시지("이미 있는 카테고리 이름입니다.")로 바꾼다.
- 목록 조회(GET)·삭제(DELETE)처럼 요청 바디 검증이 없는 엔드포인트는
  건드리지 않는다 — 거기서 나는 에러는 대부분 DB 연결 등 진짜 500
  오류라 기존 뭉뚱그린 메시지가 오히려 적절함.

**영향 범위**
- `apps/backend/src/lib/errors.ts`(신규): `toClientErrorMessage(err,
  fallback)`, `isDuplicateKeyError(err)` 헬퍼
- 적용 대상: `routes/products.ts`(등록/수정/품절/재고 변경),
  `routes/categories.ts`(등록/수정, 중복 이름 처리 포함),
  `routes/ads.ts`(등록/수정), `routes/orders.ts`(주문 생성)
- 스키마(`models/*.ts`)나 API 계약(`packages/types`)은 변경 없음 —
  응답의 `message` 필드 내용만 더 구체적으로 바뀜

## Plan

- [x] `lib/errors.ts`에 `toClientErrorMessage`/`isDuplicateKeyError`
      헬퍼 추가
- [x] products/categories/ads/orders 라우트의 등록·수정 관련 catch
      블록에 적용(카테고리는 중복 이름 케이스 별도 처리)
- [x] 백엔드 테스트: 잘못된 enum 값(temperatureOption/paymentMethod)과
      중복 카테고리 이름 각각에서 메시지에 구체적인 원인이 담기는지
      확인(28개 전부 통과)
- [x] `pnpm --filter backend test`, `check-types`, `build` 통과 확인
- [x] [[기획서]]의 "알려진 제약" 항목 갱신(해당 항목 제거)

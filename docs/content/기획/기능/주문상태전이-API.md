---
title: 주문 상태 전이 API
description: 주문은 진행중/완료 2단계로만 전이됨. 접수→준비중→완료→픽업 같은 세분화는 검토 후 필요 없다고 결정
tags: [기능, 백엔드, 완료]
aliases: []
created: 2026-09-06
updated: 2026-09-11
status: active
---

## 개요
주문은 생성 직후 `isCompleted: false`(진행중) 상태로 시작하며,
관리자가 "완료" 처리하면 `isCompleted: true`(완료)로 바뀝니다.

접수/준비중/완료/픽업처럼 더 세분화된 상태 전이가 필요한지는 로드맵에
"검토 필요" 항목으로 남아있었는데, "주방에서 실제로 더 세분화된 단계가
필요한가"라는 질문에 "지금의 2단계로 충분하다"고 답해 **세분화하지
않기로 결정**했습니다 — 작은 매장/단일 카운터 운영 규모에서는 "진행중
주문" 탭에 뜬 주문을 준비해서 "완료" 버튼 한 번 누르는 흐름만으로
충분하다는 판단입니다. 그래서 이 기능은 (더 세분화될 예정인 미완성이
아니라) **지금 상태로 완결된 설계**입니다.

## 동작 방식
`PATCH /api/orders/:id/complete`가 주문을 완료 처리합니다
(`requireAdmin`으로 보호). `GET /api/orders`는 `status=pending|
completed` 쿼리로 두 상태를 나눠 조회할 수 있습니다. [[주문내역조회]]의
"진행중 주문"/"지난 주문" 탭이 이 API를 사용합니다.

## 관련 코드
- `apps/backend/src/models/Order.ts` (`isCompleted` 필드, 기본값
  `false`)
- `apps/backend/src/routes/orders.ts` — `PATCH /api/orders/:id/complete`,
  `GET /api/orders`의 `status` 쿼리 필터링
- `packages/types`의 `Order`(`isCompleted` 필드), `OrderStatusFilter`

## 범위 밖
- 접수/준비중/완료/픽업 같은 세분화된 상태 전이 — 위 결정에 따라
  범위 밖으로 정리. 매장 규모가 커지거나 운영 방식이 바뀌면 그때
  다시 검토합니다.

## 관련 문서
- [[기획서]]
- [[주문내역조회]]

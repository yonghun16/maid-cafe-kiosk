---
title: 주문 상태 전이 API
description: 진행중/완료 2단계 전이는 완료. 접수→준비중→완료→픽업 등 세분화된 전이는 아직 없음
tags: [기능, 백엔드, 작업중]
aliases: []
created: 2026-09-06
updated: 2026-09-08
status: active
---

## 개요
주문은 생성 직후 `isCompleted: false`(진행중) 상태로 시작하며,
관리자가 "완료" 처리하면 `isCompleted: true`(완료)로 바뀝니다. 접수/
준비중/완료/픽업처럼 더 세분화된 상태 전이는 아직 없어 전체 상태는
작업중입니다.

## 완료: 진행중 ↔ 완료 2단계 전이
`PATCH /api/orders/:id/complete`가 주문을 완료 처리합니다
(`requireAdmin`으로 보호). `GET /api/orders`는 `status=pending|
completed` 쿼리로 두 상태를 나눠 조회할 수 있습니다. [[주문내역조회]]의
"진행중 주문"/"지난 주문" 탭이 이 API를 사용합니다.

### 관련 코드
- `apps/backend/src/models/Order.ts` (`isCompleted` 필드, 기본값
  `false`)
- `apps/backend/src/index.ts` — `PATCH /api/orders/:id/complete`,
  `GET /api/orders`의 `status` 쿼리 필터링
- `packages/types`의 `Order`(`isCompleted` 필드), `OrderStatusFilter`

## 작업전: 세분화된 상태 전이
- 접수/준비중/완료/픽업처럼 더 세분화된 단계가 실제로 필요한지 검토
  (도메인 정책 판단 필요 — 지금은 "진행중/완료" 2단계로 충분한지, 주방
  운영을 더 오래 써본 뒤 결정)
- 상태 전이 규칙(어떤 상태에서 어떤 상태로만 이동 가능한지) 정의
- [[실시간주방디스플레이KDS]]에서 이 API를 사용

아직 착수 전입니다. 실제 작업을 시작하면 `docs/AGENTS.md`의 SDD
워크플로우에 따라 LeanSpec으로 개별 스펙(`docs/specs/`)을 만들어 진행
상태를 추적합니다.

## 관련 문서
- [[기획서]]
- [[주문내역조회]]
- [[실시간주방디스플레이KDS]]

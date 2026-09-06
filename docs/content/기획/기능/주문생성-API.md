---
title: 주문 생성 API
description: 고객이 제출한 주문을 생성해 저장하는 백엔드 REST API
tags: [기능, 백엔드, 완료]
aliases: []
created: 2026-09-06
updated: 2026-09-06
status: active
---

## 개요
고객 화면에서 제출된 주문을 받아 저장하는 엔드포인트입니다.

## 동작 방식
`POST /api/orders`가 `packages/types`의 `CreateOrderInput` 타입을 요청
계약으로 사용해, 주문 아이템 목록(상품 id, 이름, 가격, 수량)과 총액, 생성
시각을 저장합니다.

## 관련 코드
- `apps/backend` (`POST /api/orders`)
- `packages/types` (`CreateOrderInput`)

## 관련 문서
- [[기획서]]

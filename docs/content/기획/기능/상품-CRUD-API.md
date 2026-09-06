---
title: 상품 CRUD API
description: 상품(메뉴) 등록/조회/삭제를 처리하는 백엔드 REST API
tags: [기능, 백엔드, 완료]
aliases: []
created: 2026-09-06
updated: 2026-09-06
status: active
---

## 개요
프론트엔드(고객 화면, 관리자 화면)가 사용하는 상품 관련 REST 엔드포인트입니다.

## 동작 방식
Express 5 + Mongoose로 구현되어 있으며, `GET /api/products`(목록 조회),
`POST /api/products`(등록), `DELETE /api/products/:id`(삭제)를 제공합니다.
입력 검증은 Mongoose 스키마의 `required`/`enum`에 의존합니다 ([[기획서]]의
"알려진 제약" 참고).

## 관련 코드
- `apps/backend`

## 관련 문서
- [[기획서]]

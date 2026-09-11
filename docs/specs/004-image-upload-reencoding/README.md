---
status: complete
created: 2026-09-11
priority: medium
tags:
- 기능
- 백엔드
created_at: 2026-09-11T01:11:09.545701Z
updated_at: 2026-09-11T01:14:28.347381Z
completed_at: 2026-09-11T01:14:28.347381Z
transitions:
- status: complete
  at: 2026-09-11T01:14:28.347381Z
---
# 이미지 업로드 시 서버 자동 재인코딩

## Overview

관리자가 메뉴/광고 이미지를 올릴 때 원본 파일을 그대로 Cloudflare
R2에 저장하고 있어서, 사용자가 압축 없이 찍은 사진(예: PNG 2MB)을
그대로 올리면 그 크기 그대로 저장·서빙된다. `next/image`가 화면에
보여줄 때는 알아서 리사이즈하지만, 원본을 처음 가져올 때는 여전히
그 큰 파일을 그대로 받아와야 해서 R2 대역폭과 최초 로딩이
느려진다.

이 스펙은 `POST /api/uploads`가 파일을 R2에 올리기 전에 서버에서
`sharp`로 리사이즈 + WebP 재인코딩을 하도록 만드는 것을 목표로 한다.
관리자가 매번 업로드 전에 직접 압축할 필요가 없어진다.

## Design

**결정 필요 (구현 착수 전 확정할 것)**
- 출력 포맷: WebP로 통일. JPEG보다 같은 화질에서 더 작고, PNG처럼
  투명도(alpha)도 지원해서 입력 포맷과 무관하게 하나로 통일할 수
  있음.
- 리사이즈 상한: 가장 큰 변(가로/세로)이 1600px를 넘으면 비율을
  유지한 채 1600px로 축소(`fit: 'inside'`), 더 작은 이미지는 확대하지
  않음(`withoutEnlargement: true`). 상품 카드(3:4)·광고 배너(최대
  `lg:max-w-4xl` ≈ 896px 표시 폭)가 실제로 이 정도보다 훨씨 작게
  보이므로, 레티나(2x) 디스플레이까지 감안해도 충분한 여유.
- 압축 품질: WebP quality 82(육안으로 화질 저하가 거의 안 보이면서
  파일 크기를 크게 줄이는 통상적인 절충값).
- 재인코딩 실패(손상된 파일 등)는 500이 아니라 400으로 처리 —
  서버 문제가 아니라 사용자가 보낸 파일 자체의 문제이므로.
- 저장 파일명 확장자를 원본 확장자 대신 항상 `.webp`로 통일(실제
  내용물과 확장자가 항상 일치하게).

**영향 범위**
- 백엔드: `apps/backend/src/routes/uploads.ts`만 수정. `sharp`를
  새 의존성으로 추가.
- 프론트엔드/`packages/types`: 응답 계약(`UploadImageResponse`,
  `{ url }`)이 그대로라 변경 없음 — 프론트는 이미 R2가 돌려준 URL을
  그대로 쓰고 있어서 저장 포맷이 바뀐 걸 알 필요가 없음.
- 기존에 올려둔 이미지(PNG/JPEG 원본)는 그대로 남아있고, 이 변경은
  **이후 새로 업로드하는 이미지부터만** 적용됨(과거 이미지 재처리는
  범위 밖).

## Plan

- [x] `apps/backend`에 `sharp` 의존성 추가
- [x] `lib/image.ts`에 `reencodeImageToWebp`(리사이즈 최대 1600px,
      `fit: inside`, `withoutEnlargement` + WebP quality 82) 추가,
      `routes/uploads.ts`가 R2에 올리기 전에 이걸 거치도록 변경.
      재인코딩 실패는 400으로 처리, 저장 키/ContentType을
      `.webp`/`image/webp`로 고정
- [x] 백엔드 테스트(`tests/image.test.ts`): 큰 이미지가 실제로
      1600px 이내로 축소되고 WebP로 바뀌는지, 작은 이미지는 확대되지
      않는지, 이미지가 아닌 버퍼는 오류가 나는지 확인(31개 전부 통과)
- [x] `pnpm --filter backend test`, `check-types`, `build` 통과 확인

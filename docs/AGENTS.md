# docs — AI 작업 규칙

> 📌 이 파일은 보일러플레이트입니다. `[[ ]]`로 표시된 부분만 프로젝트에 맞게
> 채우고, 그 외 규칙은 프로젝트가 바뀌어도 그대로 유지하세요.
>
> 이 저장소의 `docs/` 폴더 안에는 **성격이 다른 두 개의 문서 시스템**이
> 공존합니다. 작업 전 반드시 어느 쪽에 해당하는지 먼저 판단하세요.
>
> | 시스템 | 위치 | 관리 도구 | 용도 |
> |---|---|---|---|
> | **Vault (일반 문서)** | `docs/content/` | 사람이 직접 작성 + Obsidian/Quartz | 기획, 개발 프로세스, 회의/결정 기록 등 |
> | **Spec (기획/계획서)** | `docs/specs/` | **LeanSpec CLI/MCP 전용** | 기능 단위 스펙, 진행 상태 추적 |
>
> 이 둘은 frontmatter 스키마도, 편집 방식도 다릅니다. 섞어 쓰지 마세요.

---

# 프로젝트 설정 (새 프로젝트 시작 시 여기만 채우면 됩니다)

## 프로젝트 개요
[["메이드 카페 키오스크" 기획/개발 문서를 관리하는 저장소입니다. `docs/content/`는
Obsidian Vault로 Quartz 5를 통해 정적 사이트로 퍼블리시하고, `docs/specs/`는
LeanSpec으로 기능 단위 스펙을 관리합니다.]]

## 문서 폴더 추가
`기획/`, `개발/`, `private/`

---

# 1. Spec 관리 (`docs/specs/` — LeanSpec)

## 🚨 CRITICAL: 스펙 작업 전 반드시 먼저 할 것

1. **Discover context** → `board` 도구로 프로젝트 현황 확인
2. **Search for related work** → `search` 도구로 기존 스펙 먼저 확인
3. **Never create files manually** → 새 스펙은 항상 `create` 도구로 생성

> 이유: 탐색을 건너뛰면 중복 작업이 생기고, 파일을 수동으로 만들면 LeanSpec
> 툴링이 깨집니다.

## MCP 도구 (권장) + CLI 폴백

| Action | MCP Tool | CLI Fallback |
|---|---|---|
| 프로젝트 현황 | `board` | `lean-spec board` |
| 스펙 목록 | `list` | `lean-spec list` |
| 스펙 검색 | `search` | `lean-spec search "query"` |
| 스펙 보기 | `view` | `lean-spec view <spec>` |
| 스펙 생성 | `create` | `lean-spec create <name>` |
| 스펙 수정 | `update` | `lean-spec update <spec> --status <status>` |
| 스펙 연결 | `rel` | `lean-spec rel add <spec> --depends-on <other>` |
| 연결 해제 | `rel` | `lean-spec rel rm <spec> --depends-on <other>` |
| 의존성 확인 | `deps` | `lean-spec deps <spec>` |
| 토큰 수 확인 | `tokens` | `lean-spec tokens <spec>` |
| 유효성 검사 | `validate` | `lean-spec validate` |

> 현재 이 프로젝트는 CLI로 사용 중. MCP 서버 등록 시 위 표의 MCP Tool 칼럼이
> 우선 적용됨.
>
> ⚠️ **2026-09-05 CLI 스모크 테스트 결과**: 설치된 `@leanspec/cli@0.3.0`
> (npm 최신 버전) 기준으로 `validate`, `tokens`, `deps`, `analyze`, `rel`
> 명령어가 전부 `Error: '<cmd>' is not yet migrated to the adapter API`로
> 실패합니다. `create`/`update`/`list`/`board`/`view`/`search`/`archive`는
> 정상 동작합니다. 즉 "작업 완료 전 `lean-spec validate` 필수 실행", 의존성
> 연결(`rel`) 규칙은 **현재 이 CLI 버전에서 강제할 수 없습니다** — 새
> 버전이 나오면 이 경고를 지우고 다시 확인하세요.

## ⚠️ Spec 핵심 규칙

| 규칙 | 설명 |
|---|---|
| **frontmatter 수동 편집 금지** | `status`, `priority`, `tags`, `assignee`, `depends_on` 등은 반드시 `update`/`link`/`unlink` 사용 |
| **스펙 참조는 항상 링크** | 내용에서 다른 스펙 언급 시 `lean-spec link <spec> --depends-on <other>` |
| **상태 전이 추적** | `planned` → `in-progress` (코딩 시작 전) → `complete` (완료 후) |
| **최신 상태 유지** | 작업하며 진행상황·결정·배운 점을 문서화. 낡은 스펙은 사람과 AI 모두를 오도함 |
| **중첩 코드블록 금지** | 들여쓰기로 대체 |

### 🚫 흔한 실수

| ❌ 하지 말 것 | ✅ 대신 이렇게 |
|---|---|
| 스펙 파일 수동 생성 | `create` 도구 사용 |
| 탐색 생략 | `board`, `search` 먼저 실행 |
| 상태를 "planned"로 방치 | 코딩 시작 전 `in-progress`로 갱신 |
| frontmatter 수동 편집 | `update` 도구 사용 |
| 문서화 없이 완료 처리 | 진행상황·프롬프트·배운 점 먼저 기록 |

## SDD 워크플로우

```
BEFORE: board → search → 기존 스펙 확인
DURING: 상태를 in-progress로 갱신 → 코딩 → 결정사항 문서화 → 의존성 연결
AFTER:  완료 내용 문서화 → 상태를 complete로 갱신
```

**상태는 구현 진행도를 추적하는 것이지, 스펙 작성 여부가 아닙니다.**

## 스펙 작성 여부 판단

| ✅ 스펙 작성 | ❌ 스펙 생략 |
|---|---|
| 여러 파트로 구성된 기능 | 버그 수정 |
| 破괴적 변경 | 사소한 변경 |
| 설계 결정 | 자명한 리팩터링 |

## 토큰 임계값

| 토큰 수 | 상태 |
|---|---|
| <2,000 | ✅ 최적 |
| 2,000–3,500 | ✅ 양호 |
| 3,500–5,000 | ⚠️ 분리 고려 |
| >5,000 | 🔴 반드시 분리 |

작업 완료 전 검증:
```bash
lean-spec validate              # 구조·품질 확인
lean-spec validate --check-deps # 의존성 정합성 확인
```

## Spec 작성 원칙 (First Principles)

1. **Context Economy** — 2,000 토큰 이하가 최적, 3,500 넘으면 분리
2. **Signal-to-Noise** — 모든 문장이 결정에 도움이 되어야 함
3. **Intent Over Implementation** — "왜"를 담고 "어떻게"는 흘러나오게
4. **Bridge the Gap** — 사람과 AI 모두 이해 가능해야 함
5. **Progressive Disclosure** — 필요성이 느껴질 때만 복잡도 추가

---

# 2. 의사결정 기록 (`docs/decisions/` — ADR)

아키텍처, 기술 스택, 설계 방향에 대한 중요한 결정을 내리거나 기존 결정을
뒤집을 때마다, `docs/decisions/` 폴더에 새 md 파일을 만들어 기록합니다.

- 파일명: `NNNN-짧은-제목.md` (번호는 순차 증가)
- 기존 결정 파일은 절대 수정하지 않고, 바뀌면 새 파일에
  "이전 결정(0003)을 대체함"이라고 명시
- 내용 구조:
  - **Context**: 왜 이 결정을 고민하게 됐는지
  - **Decision**: 뭘로 결정했는지
  - **Consequences**: 트레이드오프, 앞으로 영향받는 부분

> Spec(`docs/specs/`)이 "무엇을 만들지"를 다룬다면, ADR(`docs/decisions/`)은
> "왜 이 방향으로 정했는지"의 역사를 남깁니다. 둘은 서로 다른 목적이므로
> 혼동하지 마세요.

---

# 3. Vault 문서 관리 (`docs/content/` — Obsidian / Quartz)

프로젝트 문서(기획, 구현 프롬프트, 개발 프로세스, 회의/결정 기록 등)는
`docs/content/`(Obsidian Vault, Quartz 5로 사이트 빌드)에서 관리되는 마크다운
파일로 작성합니다. `docs/` 폴더에는 Quartz 5 관련 설정/코드와 `docs/specs/`,
`docs/decisions/`가 함께 있으므로, Vault(일반 문서)는 반드시 `docs/content/`
하위에만 작성합니다.

## 폴더 구조
- **folder-page가 켜져 있으므로 폴더 자체가 목록 페이지가 됩니다.** 문서를
  `docs/content/` 바로 아래에 평평하게 흩어놓지 말고, 반드시 주제별 폴더로
  묶어서 넣습니다.
  - `기획/` — 요구사항, 기능 정의 등 기획 문서
  - `개발/` — 개발 프로세스, 구현 프롬프트 등 개발 관련 문서
  - `private/` — 초안/메모용. `ignorePatterns`에 이미 제외되어 있어 퍼블리시되지
    않습니다. 아직 정리되지 않은 초안은 우선 여기에 둡니다.
  - (프로젝트별 추가 폴더는 최상단 "프로젝트 설정 > 문서 폴더 추가" 참고)
  - 새로운 주제가 생기면 임의로 루트에 파일을 만들지 말고, 어울리는 폴더가 없는지
    먼저 확인하고 필요하면 새 폴더를 제안합니다.
- 파일명: 한글 파일명을 허용합니다 (예: `개발프로세스.md`).

## 폴더 vs 태그
- **폴더**는 큰 카테고리(기획/개발/회의록) 분류에만 사용합니다.
- **태그**는 폴더를 가로지르는 속성에 사용합니다 (예: `#스펙`, `#체크리스트`,
  `#진행중`). tag-page가 켜져 있어 태그를 붙이면 자동으로 태그별 모음 페이지가
  생성되므로, "이 문서는 어떤 성격인가"를 나타낼 때는 폴더를 새로 만들기보다
  태그를 답니다.

## 문서 메타데이터 (Frontmatter)
모든 Vault 문서 최상단에 YAML frontmatter를 채웁니다 (LeanSpec 스펙과는 다른
스키마입니다 — 섞어 쓰지 마세요).
```yaml
---
title: 문서 제목
description: 한두 문장 요약 (검색 결과·미리보기에 쓰입니다)
tags: [스펙, 체크리스트]
aliases: [이 문서를 부르는 다른 이름]
created: 2026-01-15
updated: 2026-01-15
status: draft   # draft | active | archived
---
```
- `description`은 본문 첫 문단을 그대로 복사하지 말고, 그 문서 하나만 봐도
  무엇에 대한 문서인지 알 수 있게 요약합니다.
- 문서를 실질적으로 수정할 때마다 `updated` 값을 갱신합니다.

## 문서 작성 원칙 (자기완결적으로 쓰기)
문서 하나, 섹션 하나가 전체 맥락 없이도 이해되도록 씁니다.
- **한 문서 = 한 주제.** 문서가 커지면 하위 주제로 쪼개고 MOC로 연결합니다.
- **"위에서 언급했듯이" 금지.** 필요하면 짧게 재설명하거나 `[[문서명]]` 링크로
  대체합니다.
- **제목 구조를 일관되게.** 문서당 H1은 하나, 그 아래는 H2/H3로 통일합니다.
- **같은 사실을 여러 문서에 복사하지 않습니다.** `[[문서명]]` 링크로 참조합니다.
- **용어는 한 곳에서만 정의합니다** (예: `기획/용어집.md`).
- **한 화면을 넘기는 문서에는 상단에 짧은 요약(TL;DR)을 둡니다.**

## MOC(허브) 패턴
- `docs/content/index.md`는 하위 문서들을 `[[문서명]]` 형태로 모아 링크하는
  허브(MOC) 역할을 합니다. 새 문서를 추가하면 관련 허브 문서에서 반드시
  링크를 걸어줍니다.
- **링크 없이 고립된 문서를 만들지 않습니다.**
- 내용이 어느 정도 있는 문서에는 맨 아래에 `## 관련 문서` 섹션을 둡니다.

## 문서 최신성 관리
- 문서를 실질적으로 수정하면 `updated`를 갱신합니다.
- 더 이상 유효하지 않은 문서는 **삭제하지 말고** `status`를 `archived`로
  바꿉니다 (히스토리 보존 목적).
- 결정이 바뀌었다면 문서 상단에 "(YYYY-MM-DD 기준 변경됨, [[새 문서명]] 참고)"
  안내를 남깁니다. (큰 방향 전환이라면 `docs/decisions/`에 ADR도 함께 남깁니다.)

## 옵시디언 전용 파일
- `docs/content/.obsidian/`, `docs/content/templates/`는 이미 `ignorePatterns`로
  빌드에서 제외됩니다. 그대로 저장소에 둬도 됩니다.

## 문서 종류 예시
- **구현 프롬프트 문서** (`개발/`): AI 코딩 툴에 맡긴 프롬프트 원문 보관.
- **개발 프로세스 문서** (`개발/`): 단계별 개발 순서, 완료 기준, 체크리스트.
- **기획 문서** (`기획/`): 요구사항, 흐름, 기능 정의.
- **초안/메모** (`private/`): 아직 정리되지 않았거나 비공개 내용.

## 파일명 규칙
```
docs/content/기획/[[문서명]].md   #스펙
docs/content/개발/개발프로세스.md  #체크리스트
docs/content/개발/[[기능명]]_구현프롬프트.md  #프롬프트
```

## (선택) AI 에이전트를 위한 진입점 — llms.txt
Vault가 커진 뒤 여유가 있으면, 배포 결과물 루트에 `llms.txt`(핵심 문서 목록을
마크다운 링크로 정리한 짧은 색인 파일)를 두는 걸 고려할 수 있습니다. 필수는
아닙니다.

---

# 4. AI 작업 공통 체크리스트

작업 전 **어느 시스템(Spec / ADR / Vault)에 해당하는지 먼저 판단**한 뒤, 해당
섹션의 규칙을 따릅니다.

1. 기능/작업 관련 스펙은 `docs/specs/`에 **LeanSpec 도구로만** 생성·수정합니다
   (수동 파일 생성 금지, frontmatter 수동 편집 금지).
2. 중요한 아키텍처/방향 결정은 `docs/decisions/`에 새 ADR 파일로 기록합니다
   (기존 ADR 수정 금지, 새 파일로 대체).
3. 일반 기획/개발 문서는 `docs/content/` 하위 주제별 폴더에 저장하고,
   frontmatter·태그·MOC 링크 규칙을 따릅니다. `docs/` 최상위(Quartz 설정
   위치)에는 절대 문서를 두지 않습니다.
4. 문서 하나에는 하나의 주제만 담습니다. 다른 문서에 이미 있는 내용은
   `[[문서명]]` 링크로 참조합니다.
5. 각 섹션은 문맥 없이도 이해할 수 있게 쓰고, 긴 문서에는 TL;DR을 둡니다.
6. 수정 전 기존 구조와 관련 문서를 먼저 확인하고, 수정 후 `updated` 날짜를
   갱신합니다.
7. 더 이상 유효하지 않은 Vault 문서는 삭제 대신 `status: archived`로
   표시합니다.
8. 큰 구조 변경(폴더 재편, 다수 문서 이동 등)은 먼저 사용자에게 확인합니다.
9. 관련 없는 문서는 수정하지 않습니다.

# 0002. 백엔드를 Next.js API Route로 합치지 않고 Express로 분리 유지

## Context

`/admin` 관리자 인증을 만들며 프론트엔드(Vercel)와 백엔드(Render)가
다른 오리진이라 CORS와 세션 쿠키를 신경 써야 했다. 이걸 계기로
"차라리 백엔드를 Next.js API Route로 합쳐서 같은 오리진으로 만들면
더 간단하지 않을까"라는 질문이 나왔다.

**클라이언트가 웹 하나뿐이라면** Next.js API Route로 합치는 쪽이
실제로 더 단순했을 것이다(같은 오리진이라 CORS 자체가 불필요,
배포 대상도 Vercel 하나로 통합). 이 경우 `packages/types` 같은 공유
패키지와 Turborepo도 존재 의미가 줄어서 단일 Next.js 프로젝트로
단순화하는 것도 합리적인 선택지였다.

하지만 이 프로젝트는 애초에 **웹 키오스크뿐 아니라 향후 React
Native 모바일 앱도 만들 계획**이 있었다(현재는 `apps/mobile`로
실제 구현 완료). 클라이언트가 둘이 되는 순간 계산이 달라졌다.

## Decision

**`apps/backend`(Express)를 독립된 서비스로 계속 유지한다.**
Next.js API Route로 흡수하지 않는다.

이유:
- React Native 앱도 결국 이 백엔드의 REST API를 호출해야 한다.
  Next.js API Route도 기술적으로는 모바일에서 호출 가능하지만,
  그러면 API가 "특정 웹 프론트엔드 프로젝트의 부속물"이 되어
  프론트 UI만 바꿔도 API가 같이 재배포되는 등 결합이 생긴다.
  웹/앱이 동등하게 의존하는 **독립된 백엔드 서비스**로 두는 게
  구조적으로 더 깔끔하다.
- 앱이 웹(Next.js) + 모바일(React Native) + 백엔드(Express) 3개가
  되면 `packages/types`(공유 계약 타입)와 Turborepo 모노레포 구조가
  확실한 존재 이유를 가진다.
- 실시간 주방 디스플레이(KDS, WebSocket 필요)도 서버리스보다 지속
  연결이 가능한 별도 서버가 유리해서 같은 결론을 지지한다(실제로는
  이후 WebSocket 대신 Web Push로 방향이 바뀌었지만 — 자세한 내용은
  `docs/content/개발/개발계획서-상세/07-실시간-알림-아키텍처.md` —
  "독립 백엔드가 필요하다"는 결론 자체에는 영향 없음).

## Consequences

- Turborepo 모노레포 + `apps/backend` 분리 구조를 그대로 유지한다.
  모바일 앱 착수가 확정되면서 `apps/mobile`이 실제로 이 구조 위에
  추가됐고, 예상대로 웹/모바일이 같은 백엔드 REST API와
  `packages/types`를 공유하는 형태로 완성됐다.
- **인증 방식에 대한 참고**: 관리자 인증(`express-session` 쿠키
  기반)은 매장 스태프가 웹으로만 쓰는 화면이라 문제없이 유지된다.
  다만 앞으로 **고객용 로그인**을 만들 일이 생기면 웹/모바일 양쪽에서
  써야 하므로, 쿠키 세션보다 토큰 기반(JWT를 `Authorization`
  헤더로 전달)이 React Native와 궁합이 좋다 — 브라우저가 아닌 앱은
  쿠키 자동 관리가 안 되기 때문이다. 그 기능을 실제로 만들 때
  다시 검토한다.

## 관련 문서
- `docs/content/개발/개발계획서-상세/01-시스템-아키텍처.md`
- `docs/content/개발/개발계획서-상세/02-기술스택과-선정이유.md`
- `docs/content/개발/개발계획서-상세/10-모바일-앱-아키텍처.md`

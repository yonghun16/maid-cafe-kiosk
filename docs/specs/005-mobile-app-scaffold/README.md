---
status: complete
created: 2026-09-11
priority: high
tags:
- 기능
- 모바일
- 아키텍처
created_at: 2026-09-11T12:49:35.705885Z
updated_at: 2026-09-11T13:16:45.738130Z
completed_at: 2026-09-11T13:16:45.738130Z
transitions:
- status: complete
  at: 2026-09-11T13:16:45.738130Z
---
# 고객용 네이티브 앱(apps/mobile) 스캐폴딩

## Overview

키오스크 고객 화면(`/`)을 안드로이드 키오스크 전용 태블릿에 고정 설치할
네이티브 앱으로도 만들기로 결정([[개발계획서]]의 PWA-우선 결정에서 예고된
다음 단계). PWA와 달리, 매장에 물리적으로 설치된 기기를 다른 화면으로
못 벗어나게 잠그는 게 목적이라 안드로이드의 Lock Task Mode(키오스크
모드)가 필요하고, 이건 순수 웹으로는 불가능해 네이티브 앱이 필요하다.

이 스펙은 **스캐폴딩까지만** 다룬다 — 실제 고객 화면 UI 전체를 React
Native로 옮기는 건 이후 별도 스펙에서 진행하고, 여기서는 `apps/mobile`이
모노레포 안에서 빌드·실행되고 백엔드와 통신하는 최소 골격을 만드는 것까지가
범위다. 관리자(`/admin`)·주방(`/kitchen`) 화면은 대상이 아니다(매장
스태프가 PC 브라우저로 쓰는 화면이라 앱으로 만들 필요 없음).

## Design

**확정된 결정 (사용자와 논의 완료)**
- 프레임워크: React Native + Expo. Lock Task Mode 같은 커스텀 네이티브
  모듈이 필요해 Expo Go로는 못 돌리고, EAS Build로 만든 커스텀 dev
  client가 필요함(이번 스캐폴딩 범위에는 Lock Task Mode 자체는 포함하지
  않음 — 화면 UI가 먼저 있어야 잠글 대상이 생기므로 다음 단계로 미룸).
- 스타일링: NativeWind(Tailwind 문법을 RN에서 사용). 다만 `grid`,
  `hover:` 등 웹 전용 유틸리티는 RN에서 동작하지 않으므로 클래스를
  그대로 복붙하지 않고 포팅 시마다 확인 필요.
- 코드 공유: 이번 단계에서는 `features/cart` 등 웹의 비즈니스 로직을
  `packages/`로 추출하지 않고 `apps/mobile` 안에 독립적으로 다시
  구현(복붙 후 앱 상황에 맞게 수정). 두 구현이 갈라지기 시작하면 그때
  공유 패키지 추출을 재검토.
- 화면 방향: `portrait` 고정.
- 백엔드 통신: 웹의 Next.js `rewrites()` 프록시 방식을 쓰지 않고, 앱이
  백엔드 REST API(`apps/backend`)에 직접 요청. 브라우저가 아니라
  CORS 제약이 적용되지 않아 프록시가 필요 없음. `packages/types`의
  타입을 그대로 가져다 씀.
- 앱 식별자: `android.package: "com.yonghun16.maidcafekiosk"`. 아이콘은
  PWA용으로 이미 만든 `apps/frontend/src/app/icon.png`(1254×1254)을
  재사용.

**영향 범위**
- 새 `apps/mobile` — pnpm workspace의 `apps/*` glob에 이미 포함되므로
  워크스페이스 설정 변경 불필요.
- `apps/mobile/package.json`에 `dev`/`build`/`check-types`/`lint` 스크립트를
  기존 앱들과 이름을 맞춰 정의 — `turbo.json`의 태스크 정의도 그대로
  재사용되므로 `turbo.json` 자체는 수정할 필요 없음.
- `packages/types`를 workspace 의존성으로 추가해 공유 타입 재사용.
- `apps/backend`, `apps/frontend`, `docs/`는 이번 스캐폴딩에서 수정하지
  않음(백엔드 API는 이미 인증 없는 고객용 엔드포인트를 제공 중).

**범위 밖 (다음 단계)**
- 실제 고객 화면 UI(매장/포장 선택 → 메뉴 → 장바구니 → 결제 → 완료)
  포팅
- Lock Task Mode(키오스크 잠금) 네이티브 모듈 연동
- EAS Build/Update 설정, 실기기 배포

## Plan

- [x] `apps/mobile` 생성 — `npx create-expo-app` 자체가 이 환경의 npm
      12.0.2와 호환 안 되는 업스트림 버그(`npm pack --dry-run --json`
      응답 형식이 객체로 바뀌었는데 `create-expo-app@4.0.0`은 배열을
      기대)로 계속 실패해서, 공식 템플릿 tarball(`npm pack
      expo-template-blank-typescript@latest`)을 직접 받아 그 안의
      파일(App.tsx/app.json/index.ts/tsconfig.json/assets 등)을 그대로
      가져오는 방식으로 우회. 내용은 실제 공식 템플릿 그대로라 동작은
      `create-expo-app`으로 만든 것과 동일함.
- [x] `app.json`에 `orientation: portrait`, `android.package:
      com.yonghun16.maidcafekiosk`, 앱 이름/아이콘 설정 — 아이콘은
      PWA용으로 만든 `apps/frontend/src/app/icon.png`을 재사용해 메인
      아이콘/안드로이드 적응형 아이콘(전경·배경·모노크롬)/파비콘을
      새로 생성
- [x] NativeWind 설치·설정(babel/metro/tailwind config) — `nativewind`가
      쓰는 `react-native-css-interop`을 Metro가 못 찾는 문제가 있었음.
      처음엔 `apps/mobile`에 직접 의존성으로 추가해 임시로 해결했다고
      봤지만, 실제 기기 테스트 중 `react-native` 패키지 자신의 내부
      파일(`LogBox/Data/LogBoxData.js`)에서도 같은 오류가 재발 — pnpm의
      격리된(symlink) node_modules 구조를 Metro가 완전히 이해하지 못해
      생기는 근본적인 문제였음.
      - 처음엔 루트 `.npmrc`에 `node-linker=hoisted`(전체를 평탄한
        구조로)를 추가해 해결했다고 봤는데, 이게 `apps/frontend`(Next.js
        용 React)와 `apps/mobile`(Expo SDK 57용 React 19.2.3)의 서로
        다른 React 버전을 한 트리로 합쳐버려서 CI에서 frontend 빌드가
        `Cannot read properties of null (reading 'useRef')`로 깨지는
        React 이중 로드 문제를 일으킴 — **로컬에서는 재현 안 되고 CI에서만
        걸려서, CI가 실제로 회귀를 잡아낸 사례**. `node-linker=hoisted`를
        되돌리고, 대신 `public-hoist-pattern[]=react-native-css-interop`
        로 딱 그 패키지 하나만 루트로 끌어올려서 다른 앱들의 React 버전
        격리는 그대로 유지한 채 해결. `pnpm turbo run build --force`로
        frontend가 다시 정상 프리렌더되는 것, `npx expo export`로
        mobile이 여전히 정상 번들링되는 것 둘 다 재확인.
- [x] `packages/types`를 workspace 의존성으로 추가, 타입 import 확인용
      최소 예시(상품 목록을 fetch해서 화면에 개수만 표시)
- [x] `package.json` 스크립트(dev/android/ios/check-types) 정의.
      `pnpm turbo run check-types`(루트 전체)와 `npx expo export
      --platform android`(945개 모듈 번들링)로 확인
- [x] 실제 `expo start --android`로 안드로이드 에뮬레이터(Pixel 9 Pro,
      사용자가 직접 설치/부팅)에서 앱을 띄워 화면이 뜨고 백엔드 응답이
      표시되는 것까지 확인 — NativeWind 스타일(핑크 배경/텍스트 색)이
      정상 렌더링되고, "백엔드 연결 성공 — 메뉴 N개"가 실제 운영 DB의
      상품 개수와 함께 표시됨.
      - 과정에서 실제로 겪은 문제: Expo가 딥링크로 기기에 전달하는
        주소가 호스트의 LAN IP(`exp://172.30.1.65:8081`)였는데, 에뮬
        레이터에서 이 주소로 접속이 계속 걸려 화면이 계속 검게 떠
        있었음(크래시도 없고 Metro도 요청을 못 받은 상태로 유휴 상태 —
        가능성 높은 원인은 macOS 방화벽이 LAN발 수신 연결을 막았지만
        승인할 사람이 없어 그대로 걸린 것). `adb reverse tcp:8081
        tcp:8081`은 이미 정상 설정돼 있었던 걸 확인하고,
        `exp://127.0.0.1:8081`로 직접 딥링크를 보내 이 터널을 타도록
        강제하니 바로 정상 번들링·로드됨. 실기기(에뮬레이터 아닌 진짜
        휴대폰)로 테스트할 땐 이 우회가 안 통하므로(같은 네트워크의
        LAN IP로 접속해야 함), macOS 방화벽에서 node/expo의 수신 연결을
        허용해줘야 할 수 있음 — 다음에 실기기 테스트 시 참고.
      - 추가로 `react-native` 자체의 `SafeAreaView`(deprecated) 경고를
        발견해 `react-native-safe-area-context`로 교체.
- [x] 루트 `README.md`의 프로젝트 구조 설명에 `apps/mobile` 추가

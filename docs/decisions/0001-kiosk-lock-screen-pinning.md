# 0001. 키오스크 잠금: Device Owner 완전 잠금 대신 Screen Pinning으로 시작

## Context

`apps/mobile`(React Native + Expo 고객용 키오스크 앱)을 애초에 웹 PWA
대신 네이티브 앱으로 만든 이유 자체가 "매장에 고정 설치한 태블릿을 다른
화면으로 못 벗어나게 잠근다"(안드로이드 Lock Task Mode/Device Owner
기반 완전 잠금)는 목적이었다(`docs/specs/005-mobile-app-scaffold`).
화면 UI(spec 006~010)를 다 채운 뒤 이 기능을 실제로 붙이려고 조사한
결과:

- 이 기능을 표준적으로 제공하는 신뢰할 만한 Expo/RN 라이브러리가 없었다.
  - `expo-kiosk-mode`: 주간 다운로드 0, 마지막 릴리즈 1년 전 — 사실상
    방치.
  - `expo-kiosk-control`: 커밋 2개, star 7개 — 신뢰하기엔 너무 얇음.
  - `react-native-lock-task`: Device Owner/DeviceAdminReceiver 설정까지
    가장 잘 갖춘 라이브러리였지만, **Expo와 호환되지 않고** bare
    React Native로 네이티브 파일을 직접 수정해야 함.
- 원인을 따져보니, "Device Owner 완전 잠금이 필요한 사람" ∩ "RN/Expo를
  쓰는 사람"의 교집합 자체가 라이브러리 유지보수를 지탱할 만큼 크지
  않았다. 실제로 이 정도 규모(매장 대수가 많은 기업용 키오스크)가 필요한
  곳은 대부분 직접 코드를 짜지 않고 Scalefusion/Hexnode/SOTI
  MobiControl 같은 유료 MDM(기기 관리) 솔루션을 구매해서 쓴다.
- 신뢰할 만한 기존 라이브러리가 없다는 것은 곧, 직접 만들 경우 Kotlin
  네이티브 모듈 + `DeviceAdminReceiver` + Expo config plugin을 처음부터
  작성해야 한다는 뜻이고, `expo-dev-client`/`expo prebuild`/EAS Build로
  넘어가야 해서(더 이상 Expo Go로 테스트 불가) 구조 변경 폭이 크다.
  게다가 Device Owner 설정을 잘못 다루면 실제 기기에서 ADB가 붙기 전까지
  다른 앱을 못 켜는 상태가 될 수 있어 위험 부담도 있다.
- 반면 이 프로젝트는 매장 하나, 태블릿 한두 대 규모의 포트폴리오
  프로젝트라, 기업용 다중 기기 관리 수준의 견고함이 필요한지부터
  다시 따져볼 필요가 있었다.

## Decision

**Device Owner 기반 완전 잠금(커스텀 네이티브 모듈)을 지금 만들지 않고,
안드로이드가 이미 기본 제공하는 Screen Pinning(화면 고정)으로 먼저
시작한다.**

Screen Pinning은 완전 잠금과 내부적으로 같은 안드로이드 API
(`startLockTask()`)를 쓰지만, Device Owner 권한 없이 **사용자가 수동으로
한 번 설정**하는 것만으로 동작한다 — 앱 코드 변경이 전혀 필요 없다.

**매장 태블릿 설정 절차(운영 절차, 코드 아님)**:
1. 키오스크 앱을 켠 상태에서 최근 앱(overview) 버튼을 길게 누른다.
2. 앱 카드에 뜨는 고정 핀 아이콘을 탭한다.
3. 이후 이 앱 화면만 보이고 뒤로가기/홈 버튼이 막힌다.

**빠져나가는 법(안드로이드 OS가 기본 제공, 앱이 구현할 필요 없음)**:
뒤로가기 + 최근 앱 버튼을 동시에 길게 누르면 고정 해제 팝업이 뜬다.
기기에 화면 잠금 PIN을 걸어두면 해제 시 그 PIN도 요구하게 만들 수
있다 — 이 PIN 설정을 매장 운영자에게 안내해 실질적인 보안 장치로
쓴다.

## Consequences

- `apps/mobile`은 여전히 Expo Go로 개발/테스트하며, `expo-dev-client`/
  `expo prebuild`/EAS Build 같은 새 빌드 파이프라인을 지금 도입하지
  않는다. 코드 저장소에 이 결정으로 인한 변경 사항은 없다(순수 운영
  절차).
- 탈출 방법이 앱이 만든 "숨은 관리자 제스처"가 아니라 안드로이드 표준
  제스처(뒤로가기+최근앱 길게 누르기)라서, 안드로이드를 잘 아는
  손님이면 이론적으로 스스로 풀 수도 있다 — 기기 자체의 화면 잠금
  PIN 설정이 사실상의 유일한 방어선이므로, 실제 배포 시 태블릿에
  PIN을 반드시 걸어야 한다는 점을 운영 문서(`docs/content/`)에
  남겨야 한다.
- 일부 기종/펌웨어에서는 재부팅 후 고정이 풀릴 수 있어, 재부팅마다
  다시 고정해야 할 수 있다.
- 이 방식으로 실제 운영해보고도 부족하다고 판단되면(예: 손님이 실제로
  풀고 나가는 사례 발생, 재부팅마다 다시 고정하는 게 번거로움), 그때
  이 문서를 대체하는 새 ADR을 만들고 커스텀 Device Owner 네이티브
  모듈 작업을 다시 스펙으로 진행한다.

## 관련 문서

- `docs/specs/005-mobile-app-scaffold` — 네이티브 앱을 만든 원래 동기
  (Lock Task Mode)
- `docs/specs/006-mobile-order-flow` — "처음으로"/매장·포장 변경 팝업,
  세션 타임아웃 등 2차로 미뤘던 항목들의 최종 처리 현황

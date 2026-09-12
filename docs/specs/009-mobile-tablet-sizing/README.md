---
status: complete
created: 2026-09-11
priority: high
tags:
- 기능
- 모바일
created_at: 2026-09-11T14:49:01.921629Z
updated_at: 2026-09-11T14:49:01.969247Z
completed_at: 2026-09-11T14:49:01.969247Z
transitions:
- status: complete
  at: 2026-09-11T14:49:01.969247Z
---
# 고객용 앱 — 태블릿 화면 크기 리밸런싱

## Overview

지금까지 에뮬레이터 테스트는 전부 폰 크기(Pixel 9 Pro, dp 폭 약 427)로만
진행했는데, 실제 운영 대상은 안드로이드 키오스크 **태블릿**이다. 로컬에
태블릿 AVD가 없어서, 이번에 `pixel_tablet` 스킨(2560×1600, 276dpi — 같은
시스템 이미지를 재사용해 추가 다운로드 없음)으로 `Galaxy_Tab` AVD를 수동
구성해 실제로 띄워봤더니, 전체 텍스트와 모달이 폰 크기 그대로 떠서 넓은
화면 대비 너무 작아 보이는 문제가 확인됐다(사용자 피드백).

## Design

- **RN 화면 폭 계산**: `Galaxy_Tab` AVD는 세로 모드 실물 해상도
  1600×2560, 276dpi → dp 폭 약 927. 웹 Tailwind 기본 브레이크포인트 기준
  `md`(768) 이상 `lg`(1024) 미만 구간에 들어간다. 기존 Pixel 폰(dp 폭 약
  427)은 `sm`(640) 미만이라 `md:` 변형은 폰에 영향을 주지 않는다.
- 새 반응형 breakpoint 테마를 추가하지 않고, NativeWind(v4)가 기본
  제공하는 Tailwind 표준 브레이크포인트(`sm/md/lg/xl/2xl`)를 그대로
  사용 — 웹 앱이 이미 `md:text-xl` 같은 패턴을 쓰고 있어서 그 관례를
  그대로 RN에도 적용한 것.
- 고객용 화면 전체(주문 타입 선택, 광고 배너, 메뉴 카드/그리드, 옵션
  모달, 장바구니 바/목록, 결제 수단 모달, 주문완료 화면, 헤더)의 글자
  크기·패딩·아이콘/버튼 크기·모달 최대폭에 `md:` 변형을 추가해 태블릿
  폭에서 한 단계씩 커지도록 함. 그리드 열 수(2열 고정)는 이번 범위 밖 —
  사용자가 지적한 건 "글자/모달이 작다"였지 열 배치가 아니었음.
- `shared/ui/Modal.tsx`의 `max-w-md` → `md:max-w-xl`로 넓혀서, 이 컴포넌트를
  쓰는 옵션 모달/결제 모달이 함께 커지도록 함(개별 화면마다 모달 폭을
  따로 지정하지 않음 — 공용 컴포넌트 하나만 고치면 전체에 반영됨).

**후속 조정 1(같은 날)**: 1차 적용본을 본 사용자가 "모달 크기가 좀 작은 것
같다"고 재지적 — `md:max-w-xl`(576px, 태블릿 dp 폭 927 대비 약 62%)로는
부족하다고 판단해 `md:max-w-3xl`(768px, 약 83%)까지 한 번 더 키움. 모달
폭이 커진 만큼 내부 여백(`md:p-10`)과 제목(`md:text-3xl`), 그리고
`ProductCard`의 옵션 모달 이미지(`md:w-48`)·담기 버튼·합계 금액, 결제
수단 모달의 아이콘·버튼도 비례해서 함께 키워 빈 공간만 넓어지지 않게 함.

**후속 조정 2(같은 날)**: 사용자가 "모달 더 키워도 될 것 같고, 키오스크는
화면이 크니까 전반적인 글자 크기도 다 커야 더 잘 보인다"고 재요청 — 이번엔
개별 값을 조금씩 올리는 대신, 지금까지 건드린 화면 전체의 `md:` 크기를
Tailwind 단계 기준 한 단계씩 더 키우는 방식으로 한 번에 처리:
- `Modal.tsx`: `md:max-w-3xl` → `md:max-w-4xl`(896px, 태블릿 폭의 약
  97% — 바깥 backdrop 패딩만 남기고 거의 화면을 채움), 제목 `md:text-4xl`
- 주문 타입 선택 제목 `md:text-6xl`, 광고 배너 `md:max-w-2xl`
- 메뉴 카드 이름 `md:text-2xl`, 옵션 모달 이미지 `md:w-56`, 옵션
  버튼/합계 금액/담기 버튼도 한 단계씩 확대(`md:text-4xl` 합계 등)
- 장바구니 목록·결제 모달·주문완료 화면(주문번호 `md:text-9xl`까지)도
  동일하게 한 단계씩 확대
- 이렇게 처음부터 "한 단계 더 크게"를 전체에 일괄 적용한 이유는, 화면
  하나씩 따로 미세조정하면 사용자가 다시 "이것도 작다"를 반복해서
  말해야 하는 비효율이 생기기 때문 — 키오스크는 시야 거리가 있는
  대형 화면이라는 전제 자체가 "기본적으로 크게"가 맞는 방향이라고
  판단했다.

`Galaxy_Tab` AVD에서 옵션 모달(화면을 거의 채움)·결제 모달·장바구니
펼친 목록까지 다시 스크린샷으로 확인.

**후속 조정 3(같은 날) — 장바구니 썸네일이 안 커지던 버그**: 사용자가
"장바구니의 이미지는 좀 더 클 필요가 있는 것 같아"라고 지적. 원인은
`OrderSummary.tsx`의 `CartLine`이 이미지 크기를 NativeWind `className`이
아니라 `style={{ width: 48, height: 48 }}` 고정 픽셀 값으로 주고 있었던
것 — `md:` 반응형은 className에만 적용되므로 이 썸네일만 조용히 반응형
대상에서 빠져 있었다. `ProductCard`/`AdBanner`와 같은 패턴으로, 크기를
가진 `View`(`h-12 w-12 md:h-24 md:w-24`)로 이미지를 감싸고 `Image`는
`style={{ flex: 1 }}`로 그 안을 채우도록 바꿔서 해결.

**후속 조정 4(같은 날) — 광고 배너 가로 잘림 버그(근본 원인)**: 사용자가
"광고 이미지가 잘려 보인다, 가로 크기가 커야 할 것 같다"고 지적. 실제
광고 원본(R2에서 직접 다운로드해 확인)은 정확히 1448×1086(4:3)이고
컨테이너도 `aspect-[4/3]`라 수치상 안 맞을 이유가 없었는데, 실기기에서
`uiautomator dump`로 렌더링된 박스의 실제 bounds를 재보니 비율이
0.899(거의 정사각형에 가까운 세로 비율)로 나와 실제로 좌우가 크게
잘리고 있었다.
- **원인 진단**: 고정 픽셀 `width`(예: 600) + `aspectRatio: 4/3` 조합은
  정확히 4:3으로 렌더링되는데(직접 실험으로 확인), `w-full`(퍼센트
  너비) + `aspectRatio`(NativeWind `aspect-[4/3]` 클래스) 조합은 이
  RN/Yoga 환경에서 박스 비율이 어긋나는 것을 실험으로 확인 — 퍼센트
  너비와 `aspectRatio`를 같이 쓰는 조합 자체가 문제였다.
- **해결**: `aspect-[4/3]` 클래스와 `w-full`/`max-w-*` 클래스를 걷어내고,
  `onLayout`으로 부모의 실제 가용 너비를 실측한 뒤(`useWindowDimensions`로
  태블릿/폰 브레이크포인트 판단은 그대로 유지) `width`/`height`를 JS에서
  직접 계산해 `style`로 명시적 px 값을 준다. 이렇게 고정 숫자 조합으로
  주면 Yoga가 항상 정확한 4:3을 만들어낸다.
- `uiautomator dump`로 수정 후 박스 비율이 정확히 1.333(=4:3)인 것,
  실제 화면에서 광고 텍스트/캐릭터가 잘리지 않고 전부 보이는 것,
  좌우 스와이프가 여전히 정상 동작하는 것까지 스크린샷으로 재확인.
  같은 `aspect-[3/4]` 패턴을 쓰는 `ProductCard`의 이미지들은 고정폭
  (`w-28`/`md:w-56`) 컨테이너라 퍼센트 너비가 섞이지 않아 이 버그의
  대상이 아님 — `w-full`과 `aspectRatio`가 함께 쓰인 곳은 `AdBanner`가
  유일했다.

**후속 조정 5(같은 날) — 배너를 더 키움**: 잘림 버그를 고치고 나니
사용자가 "광고 이미지의 전반적인 크기가 좀 더 커도 될 것 같다"고 요청.
`onLayout`으로 실측한 `availableWidth`(부모 padding을 뺀 실제 가용
너비)가 이미 정확한 상한이므로, `MAX_WIDTH_TABLET` 상수를 672 → 900으로
올려 사실상 캡이 아니라 여유값으로 만들었다 — 실제로는 항상
`availableWidth`(태블릿에서 약 863dp)가 더 작아서 그 값이 그대로
반영되고, 배너가 좌우 padding만 남기고 가용 폭을 거의 다 채운다. 점
인디케이터도 커진 배너에 맞춰 `md:h-3/w-3` → `md:h-4/w-4`로 비례
확대. `uiautomator dump`로 실제 렌더링 폭이 약 872dp(가용 폭 대비
거의 100%)이고 비율은 여전히 정확히 4:3인 것을 확인.

**후속 조정 6(다른 날) — 폰 레이아웃 그대로였던 문제(구조 변경)**: 지금까지의
후속 조정은 전부 "크기"(글자/모달/이미지 치수)만 키운 것이었는데,
`Galaxy_Tab` AVD에서 실제로 보니 화면 **구조** 자체가 여전히 폰과 동일하게
메뉴 목록과 장바구니가 위아래로 쌓여 있고, 장바구니도 폰처럼 화면 하단에
붙는 접이식 바로 보인다는 지적을 받았다("레이아웃이 모바일 버전이야").
웹은 `md` 이상에서 메뉴 목록(좌측, `md:w-3/5`)과 장바구니(우측, 항상 펼쳐진
사이드바, `md:w-2/5`)가 좌우로 나뉘는데, RN 쪽은 그 구조 분기 자체가 없었다.

- **원인**: 웹은 `HomePage.tsx`의 컨테이너에 `md:flex-row`를 줘서 태블릿
  이상에서 좌우 분할로 바뀌지만, RN `HomePage.tsx`는 `ProductList`와
  `OrderSummary`를 감싸는 컨테이너 없이 그냥 나란히(세로로) 렌더링만 하고
  있어 폭과 무관하게 항상 위아래로 쌓였다. `OrderSummary`도 웹처럼 "폭이
  넓어지면 항상 펼쳐진 사이드바로 바뀌는" 구조 분기가 없이, 폰용 접이식 바
  하나만 존재해서 크기만 커질 뿐 구조는 그대로였다.
- **해결**: 웹과 동일한 방식을 그대로 이식.
  - `HomePage.tsx`: `ProductList`/`OrderSummary`를 `flex-1 md:flex-row`
    컨테이너로 감싸서, 폰(기본 `flex-col`)에서는 세로로 쌓이고 태블릿에서는
    좌우로 나뉘게 함.
  - `ProductList.tsx`: 바깥 `View`에 `md:w-3/5 md:flex-none` 추가(웹의
    `md:w-3/5`와 동일 비율).
  - `OrderSummary.tsx`: 웹의 `hidden md:block`(항상 펼쳐진 사이드바) /
    `md:hidden`(접이식 바) 쌍과 동일한 두 가지 레이아웃을 만듦.
  - 메뉴 그리드 열 수(2열)는 이번에도 바꾸지 않음 — 웹도 `xl`(1280px)
    미만에서는 2열 그대로라, `Galaxy_Tab`의 dp 폭(927, `md`~`lg` 구간)
    에서는 웹과 동일하게 2열이 맞는 선택.
- `pnpm --filter mobile check-types` 통과 확인. 이 저장소의 mobile 앱은
  별도 lint 스크립트가 없어(package.json 확인) check-types만 검증 대상.

**후속 조정 7(같은 날) — 첫 시도(`md:flex-row`)가 실제로는 겹쳐 보이던
버그**: 후속 조정 6을 `md:flex-row`(HomePage 컨테이너) + `md:w-3/5
md:flex-none`(ProductList) + `hidden md:flex md:w-2/5 md:flex-none`/
`md:hidden`(OrderSummary) 조합, 즉 웹처럼 반응형 className만으로 구현해
`check-types`까지 통과시켰지만, 실제로 `Galaxy_Tab` AVD에 떠 있는 화면을
스크린샷/`uiautomator dump`로 확인해보니 장바구니 사이드바(폭 40%는 정확)가
왼쪽에, 카테고리 탭들이 그 사이드바 영역과 겹쳐서 세로로 우겨 접힌 채
보이는 등 완전히 깨져 있었다("화면이 아주 엉망인데?" 라는 사용자 지적).
- **원인**: 이 저장소에서 `md:flex-row`처럼 반응형 클래스로 **구조**(방향
  전환, 폭 분할)를 바꾸는 시도는 이번이 처음이었다. `entities/ad/AdBanner`가
  겪었던 것과 같은 계열의 RN/Yoga·NativeWind 신뢰성 문제로 보이며(그때는
  `w-full`+`aspectRatio` 조합이 문제), 이번엔 `flex-1`/`flex-none`/
  분수 `w-*`/`hidden`+`md:flex`를 반응형 프리픽스와 함께 조합한 구조 변경이
  깨지는 것으로 재현됨. `check-types`는 클래스 문자열이 유효한 문자열이기만
  하면 통과하므로 이런 런타임 레이아웃 버그를 전혀 잡아내지 못했다 —
  실제 기기/에뮬레이터 화면 확인이 반드시 필요했던 사례.
- **해결**: `AdBanner`가 이미 쓰고 있는, 이 저장소의 검증된 패턴을 그대로
  따름 — 반응형 className 대신 `useWindowDimensions()`로 폭을 직접 읽어
  `TABLET_BREAKPOINT = 768`과 비교한 JS 값(`isTablet`)으로 분기.
  - `HomePage.tsx`: 컨테이너 className을 `isTablet ? 'flex-1 flex-row' :
    'flex-1'`로 JS 삼항 분기.
  - `ProductList.tsx`: `className={isTablet ? 'flex-none' : 'flex-1'}
    style={isTablet ? { width: '60%' } : undefined}` — 폭은 className이
    아니라 명시적 `style`로 지정.
  - `OrderSummary.tsx`: `hidden`/`md:flex` 두 블록을 동시에 마운트하는
    대신, `{isTablet ? <사이드바 JSX> : <접이식 바 JSX>}`로 아예 둘 중
    하나만 렌더링하도록 완전히 분기(마운트 자체를 나눔) — 폭도 `style={{
    width: '40%' }}`로 명시.
- `pnpm --filter mobile check-types` 통과 재확인 후, `adb`로 에뮬레이터를
  강제 재시작(`am force-stop` → 재실행)해 최신 번들로 다시 띄우고
  스크린샷으로 실제 확인 — 카테고리 탭 한 줄 + 2열 메뉴 그리드(좌측
  60%)와 "🎀 주문 목록 🎀" 제목의 항상 펼쳐진 장바구니 사이드바(우측 40%)가
  올바르게 좌우로 나뉘어 보이는 것을 확인.
- **교훈**: 이 프로젝트에서 RN 쪽 반응형 처리는 **크기(글자/패딩/치수)는
  `md:` className, 구조(방향 전환/폭 분할/보임-숨김 전환)는
  `useWindowDimensions` + JS 분기**로 나눠 쓰는 것이 안전하다. 크기 변경은
  이미 여러 화면(spec 009 앞부분, `md:text-*`/`md:p-*` 등)에서 문제없이
  검증됐지만, 구조 변경은 지금까지 두 번(`AdBanner`, 이번 건) 모두 className
  방식에서 실패했다.

**후속 조정 8(같은 날) — 카테고리 탭 한 줄 + 드래그 스크롤**: 후속 조정
7까지 고치고 나니 카테고리가 5개라 좁은 폭에서 두 줄로 줄바꿈되는 게
눈에 띈다는 지적("카테고리를 1줄로 만들고, 길면 드래그로 끌어서 이동
시키게 할 수 있어?")을 받았다. `ProductList.tsx`의 카테고리 탭 컨테이너를
`flex-row flex-wrap`인 `View`에서 `horizontal` `ScrollView`
(`showsHorizontalScrollIndicator={false}`)로 교체해, 줄바꿈 대신 한 줄로
고정하고 다 안 들어가는 나머지는 옆으로 드래그해서 넘기게 했다(웹의 헤더
도킹 카테고리 바 `variant="scroll"`과 동일한 의도). `pnpm --filter mobile
check-types` 통과 확인 후, 에뮬레이터에서 스크린샷 + `adb shell input
swipe`로 실제 드래그 스크롤이 동작하는 것까지 확인.

## Plan

- [x] `shared/ui/Modal.tsx`, `entities/ad/ui/AdBanner.tsx`,
      `entities/product/ui/ProductCard.tsx`,
      `widgets/order-type-select/ui/OrderTypeSelect.tsx`,
      `widgets/product-list/ui/ProductList.tsx`,
      `widgets/order-summary/ui/OrderSummary.tsx`,
      `widgets/order-complete/ui/OrderCompleteScreen.tsx`,
      `views/home/ui/HomePage.tsx`에 `md:` 반응형 크기 추가
- [x] `pnpm --filter mobile check-types` 통과 확인
- [x] `Galaxy_Tab` AVD에서 주문 타입 선택 → 메뉴 목록/카테고리 탭 →
      옵션 모달(온도 없음/마법의 주문+커스텀 옵션 조합) → 장바구니 담기
      → 결제 수단 선택 모달까지 실제로 조작하며 스크린샷으로 전/후 비교
      확인 — 반응형 적용 전에는 폰 크기 그대로였던 제목/버튼/모달 텍스트가
      적용 후 눈에 띄게 커지고 균형 잡힌 것을 확인
- [x] (후속 조정 6, 실패 → 후속 조정 7에서 교체) `HomePage.tsx`/
      `ProductList.tsx`/`OrderSummary.tsx`에 웹과 동일한 `md:flex-row` 좌우
      분할 + 항상 펼쳐진 장바구니 사이드바 구조 추가 시도 — `check-types`는
      통과했으나 실제 기기에서는 겹쳐 보이는 버그로 확인됨
- [x] (후속 조정 7) `useWindowDimensions` 기반 JS 분기로 교체, `pnpm
      --filter mobile check-types` 통과 확인 + 에뮬레이터 재기동 후
      스크린샷으로 좌우 분할이 실제로 정상 동작하는 것까지 확인
- [x] (후속 조정 8) `ProductList.tsx` 카테고리 탭을 `horizontal ScrollView`로
      교체, `check-types` 통과 확인 + 에뮬레이터에서 드래그 스크롤 동작 확인

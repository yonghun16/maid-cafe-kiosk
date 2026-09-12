// @owner: ai
import { useEffect, useRef, useState } from 'react';
import { Image } from 'expo-image';
import { type LayoutChangeEvent, PanResponder, View, useWindowDimensions } from 'react-native';
import type { Ad } from '@repo/types';
import { getAds } from '../api/adApi';

const ROTATE_INTERVAL_MS = 5000;
const SWIPE_THRESHOLD_PX = 40;
const AD_ASPECT_RATIO = 4 / 3;
const MAX_WIDTH_DEFAULT = 448; // max-w-md
// ✅ 태블릿에서는 사실상 캡이 아니라 여유값 — `onLayout`으로 잰
// availableWidth(부모 padding 반영한 실제 가용 너비)가 항상 이보다
// 작으므로, 배너가 가용 폭을 거의 꽉 채우게 된다.
const MAX_WIDTH_TABLET = 900;
const TABLET_BREAKPOINT = 768; // Tailwind md

/**
 * 매장/포장 선택 화면에 보여주는 광고 배너. 웹의
 * `entities/ad/ui/AdBanner.tsx`와 동일한 동작(5초 자동 순환 + 좌우
 * 스와이프, 컷 전환, 4:3 비율)을 포팅한 것이다. 광고가 없으면 아무것도
 * 렌더링하지 않는다.
 *
 * ✅ 배너 크기는 NativeWind의 `aspect-[4/3]` 클래스 대신 `onLayout`으로
 * 실측한 너비를 바탕으로 JS에서 직접 계산합니다. `w-full`(퍼센트 너비)과
 * `aspectRatio`를 같이 쓰면 이 RN/Yoga 환경에서 박스 비율이 어긋나면서
 * `contentFit="cover"`가 이미지 좌우를 잘라내는 문제가 있었습니다(고정
 * px 너비 + aspectRatio 조합은 정상 동작하는 것으로 확인). 실측 너비는
 * `useWindowDimensions`(브레이크포인트 판단용)와 `onLayout`(부모 padding을
 * 반영한 실제 가용 너비)을 함께 사용해 계산합니다.
 */
export function AdBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [availableWidth, setAvailableWidth] = useState(0);
  const adsLengthRef = useRef(0);
  adsLengthRef.current = ads.length;
  const { width: windowWidth } = useWindowDimensions();

  useEffect(() => {
    getAds()
      .then(setAds)
      .catch((error) => console.error('광고 목록을 불러오는 중 오류가 발생했습니다:', error));
  }, []);

  useEffect(() => {
    if (ads.length < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % ads.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ads.length]);

  // panResponder는 최초 렌더에서 한 번만 생성되므로, 매 렌더의 ads
  // state를 직접 클로저로 캡처하지 않고 adsLengthRef를 거쳐 최신 길이를
  // 읽는다.
  const goToOffset = (offset: number) => {
    const length = adsLengthRef.current;
    if (length === 0) return;
    setActiveIndex((prev) => (prev + offset + length) % length);
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) < SWIPE_THRESHOLD_PX) return;
        goToOffset(gesture.dx < 0 ? 1 : -1);
      },
    }),
  ).current;

  const handleLayout = (event: LayoutChangeEvent) => {
    setAvailableWidth(event.nativeEvent.layout.width);
  };

  const activeAd = ads[activeIndex];
  if (!activeAd) return null;

  const maxWidth = windowWidth >= TABLET_BREAKPOINT ? MAX_WIDTH_TABLET : MAX_WIDTH_DEFAULT;
  const bannerWidth = Math.min(availableWidth, maxWidth);
  const bannerHeight = bannerWidth / AD_ASPECT_RATIO;

  return (
    <View className="w-full items-center" onLayout={handleLayout}>
      {bannerWidth > 0 && (
        <View
          {...panResponder.panHandlers}
          style={{ width: bannerWidth, height: bannerHeight }}
          className="overflow-hidden rounded-2xl shadow-lg"
        >
          <Image source={{ uri: activeAd.imageUrl }} style={{ flex: 1 }} contentFit="cover" />
          {ads.length > 1 && (
            <View className="pointer-events-none absolute inset-x-0 bottom-3 flex-row justify-center gap-1.5 md:bottom-6 md:gap-4">
              {ads.map((ad, index) => (
                <View
                  key={ad._id}
                  className={`h-1.5 w-1.5 rounded-full shadow md:h-4 md:w-4 ${
                    index === activeIndex ? 'bg-pink-500' : 'bg-white/70'
                  }`}
                />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

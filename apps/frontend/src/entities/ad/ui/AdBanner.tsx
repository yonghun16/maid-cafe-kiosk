// @owner: ai
'use client';

import { useEffect, useRef, useState } from 'react';
import type { Ad } from '@repo/types';
import { getAds } from '../api/adApi';

const ROTATE_INTERVAL_MS = 5000;
// 이 픽셀 이상 좌우로 드래그해야 슬라이드가 넘어갑니다(살짝 스친 정도로는
// 안 넘어가게 하는 최소 이동 거리).
const SWIPE_THRESHOLD_PX = 40;

/**
 * 등록된 광고 배너를 순서대로 자동 전환하며 보여줍니다. 좌우로
 * 드래그(스와이프)해서 직접 넘길 수도 있습니다. 등록된 광고가 없으면
 * 아무것도 렌더링하지 않습니다.
 */
export function AdBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const dragStartX = useRef<number | null>(null);

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

  const goToOffset = (offset: number) => {
    setActiveIndex((prev) => (prev + offset + ads.length) % ads.length);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current == null) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    // 왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전 광고로.
    goToOffset(deltaX < 0 ? 1 : -1);
  };

  const activeAd = ads[activeIndex];
  if (!activeAd) return null;

  return (
    <div className="relative w-full max-w-sm touch-pan-y select-none overflow-hidden rounded-2xl shadow-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      <img
        src={activeAd.imageUrl}
        alt="광고"
        draggable={false}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStartX.current = null;
        }}
        // ✅ 화면 너비별로 높이를 따로 지정하면 실제 업로드하는 광고
        // 이미지 비율과 어긋나 object-cover가 상하단을 잘라냅니다.
        // 관리자가 올리는 광고 이미지가 1448×1086(4:3)이라, 박스 자체를
        // aspect-[4/3]으로 고정해 화면 너비가 바뀌어도 항상 이미지
        // 원본 비율과 정확히 맞도록 했습니다.
        className="aspect-[4/3] w-full cursor-grab object-cover active:cursor-grabbing"
      />
      {ads.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {ads.map((ad, index) => (
            <span
              key={ad._id}
              className={`h-1.5 w-1.5 rounded-full shadow ${
                index === activeIndex ? 'bg-pink-500' : 'bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

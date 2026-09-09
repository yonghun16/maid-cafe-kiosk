// @owner: ai
'use client';

import { useEffect, useState } from 'react';
import type { Ad } from '@repo/types';
import { getAds } from '../api/adApi';

const ROTATE_INTERVAL_MS = 5000;

/**
 * 등록된 광고 배너를 순서대로 자동 전환하며 보여줍니다. 등록된 광고가
 * 없으면 아무것도 렌더링하지 않습니다.
 */
export function AdBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const activeAd = ads[activeIndex];
  if (!activeAd) return null;

  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-lg">
      <img src={activeAd.imageUrl} alt="광고" className="h-40 w-full object-cover" />
      {ads.length > 1 && (
        <div className="flex justify-center gap-1.5 bg-white py-2">
          {ads.map((ad, index) => (
            <span
              key={ad._id}
              className={`h-1.5 w-1.5 rounded-full ${index === activeIndex ? 'bg-pink-500' : 'bg-pink-100'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

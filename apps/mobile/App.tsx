// @owner: ai
import './global.css';
import { useEffect, useState } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import type { Product } from '@repo/types';
import { apiClient } from './src/shared/api/client';

/**
 * 스캐폴딩 확인용 임시 화면입니다. NativeWind 스타일링, `@repo/types` 공유
 * 타입, 백엔드 REST API 직접 통신이 전부 정상 동작하는지만 확인하고,
 * 실제 고객 화면(매장/포장 선택 → 메뉴 → 장바구니 → 결제 → 완료) 포팅은
 * 다음 스펙에서 진행합니다.
 */
export default function App() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<Product[]>('/products')
      .then((res) => setProductCount(res.data.length))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-pink-50">
      <Text className="text-2xl font-bold text-pink-500">🍰 메이드 카페 키오스크</Text>
      <Text className="mt-2 text-base text-gray-500">앱 스캐폴딩 확인 중...</Text>
      {productCount != null && (
        <Text className="mt-4 text-lg text-gray-700">백엔드 연결 성공 — 메뉴 {productCount}개</Text>
      )}
      {error && <Text className="mt-4 text-base text-red-500">백엔드 연결 실패: {error}</Text>}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

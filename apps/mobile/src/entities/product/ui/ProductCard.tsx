// @owner: ai
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import type { Product } from '@repo/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

/**
 * 메뉴 카드입니다. 1차 포팅 범위에서는 옵션 선택 모달 없이 탭하면 바로
 * 기본 옵션으로 장바구니에 담깁니다(옵션 모달은 2차 스펙에서 추가 예정
 * — `docs/specs/006-mobile-order-flow`의 "2차로 미루는 것" 참고).
 */
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <Pressable onPress={() => onAddToCart(product)} className="flex-1 overflow-hidden rounded-2xl bg-white shadow-sm">
      <View className="aspect-[3/4] w-full bg-pink-50">
        <Image source={{ uri: product.imageUrl }} style={{ flex: 1 }} contentFit="cover" />
        {product.isSoldOut && (
          <View className="absolute inset-0 items-center justify-center bg-black/40">
            <Text className="rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-700">품절</Text>
          </View>
        )}
      </View>
      <View className="p-3">
        <Text className="font-semibold text-gray-800" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="mt-1 text-sm text-pink-600">{product.price.toLocaleString()}원</Text>
      </View>
    </Pressable>
  );
}

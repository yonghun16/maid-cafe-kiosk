// @owner: ai
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Order } from '@repo/types';

interface OrderCompleteScreenProps {
  order: Order;
  onDismiss: () => void;
}

const AUTO_DISMISS_MS = 8_000;

const ORDER_TYPE_LABEL: Record<Order['orderType'], string> = {
  'dine-in': '매장에서 드시고 가세요',
  takeout: '포장해서 가져가세요',
};

/**
 * 주문 제출 성공 직후 보여주는 전체 화면 안내입니다. 주문번호와 예상
 * 대기 시간을 안내하고, 일정 시간 뒤 자동으로(또는 "확인" 버튼으로 바로)
 * 매장/포장 선택 화면으로 돌아갑니다.
 */
export function OrderCompleteScreen({ order, onDismiss }: OrderCompleteScreenProps) {
  useEffect(() => {
    const timeoutId = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timeoutId);
  }, [onDismiss]);

  return (
    <View className="flex-1 items-center justify-center bg-pink-50 p-4">
      <View className="w-full max-w-md rounded-3xl bg-white p-8 md:max-w-3xl md:p-16">
        <Text className="text-center text-4xl md:text-8xl">🎀</Text>
        <Text className="mt-2 text-center text-2xl font-bold text-gray-800 md:mt-4 md:text-5xl">
          주문이 완료됐어요!
        </Text>
        <Text className="mt-1 text-center text-sm text-gray-500 md:mt-2 md:text-2xl">
          {ORDER_TYPE_LABEL[order.orderType]}
        </Text>

        <View className="mt-6 items-center rounded-2xl bg-pink-50 py-6 md:mt-10 md:py-10">
          <Text className="text-sm font-medium text-pink-500 md:text-2xl">주문번호</Text>
          <Text className="mt-1 text-5xl font-extrabold text-pink-500 md:mt-2 md:text-9xl">No. {order.orderNumber}</Text>
        </View>

        <Text className="mt-6 text-center text-base text-gray-600 md:mt-10 md:text-2xl">
          메뉴 준비까지 약 10~15분 정도 걸려요. 주문번호를 불러드리면 픽업대로 와주세요!
        </Text>

        <Pressable onPress={onDismiss} className="mt-8 items-center rounded-xl bg-pink-500 py-3 md:mt-10 md:py-6">
          <Text className="text-lg font-bold text-white md:text-3xl">확인</Text>
        </Pressable>
      </View>
    </View>
  );
}

// @owner: ai
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import type { CartItem, PaymentMethod } from '@repo/types';
import { useCartStore } from '../../../features/cart';
import { useOrderTypeStore } from '../../../features/order-type';
import { Modal } from '../../../shared/ui';

// ✅ 실제 결제 게이트웨이 연동은 아직 없어서, "주문하기"를 누르면 결제
// 수단을 고르는 모달만 먼저 보여주고, 고른 수단을 기록만 한 뒤 바로
// 주문을 진행합니다(웹의 [[결제수단선택]]과 동일).
const PAYMENT_METHODS: { value: PaymentMethod; icon: string }[] = [
  { value: '신용카드', icon: '💳' },
  { value: 'NPay', icon: 'N' },
  { value: 'Kakao Pay', icon: '💬' },
  { value: '토스페이', icon: '🅣' },
];

interface CartLineProps {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

function CartLine({ item, onIncrease, onDecrease, onRemove }: CartLineProps) {
  return (
    <View className="rounded-md bg-white p-3 shadow-sm">
      <View className="flex-row items-center gap-3">
        <Image source={{ uri: item.imageUrl }} style={{ width: 48, height: 48, borderRadius: 8 }} contentFit="cover" />
        <View className="flex-1">
          <Text className="font-semibold text-gray-800" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-sm text-gray-500">{item.price.toLocaleString()}원</Text>
        </View>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text className="text-gray-300">🗑</Text>
        </Pressable>
      </View>
      <View className="mt-2 flex-row items-center justify-end gap-2">
        <Pressable onPress={onDecrease} className="h-7 w-7 items-center justify-center rounded-full border border-pink-200">
          <Text className="text-pink-500">−</Text>
        </Pressable>
        <Text className="w-6 text-center text-sm font-semibold">{item.quantity}</Text>
        <Pressable onPress={onIncrease} className="h-7 w-7 items-center justify-center rounded-full border border-pink-200">
          <Text className="text-pink-500">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const submitOrder = useCartStore((state) => state.submitOrder);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const orderType = useOrderTypeStore((state) => state.orderType);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleOpenPaymentModal = () => {
    if (items.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  // ✅ 결제 수단을 고르면 바로 주문을 진행합니다. 성공하면 장바구니
  // 스토어에 남은 `lastCompletedOrder`를 보고 HomePage가 주문완료화면을
  // 띄웁니다.
  const handleSelectPayment = async (paymentMethod: PaymentMethod) => {
    if (!orderType || isSubmitting) return;
    setIsSubmitting(true);
    const success = await submitOrder(orderType, paymentMethod);
    setIsSubmitting(false);
    if (success) setIsPaymentModalOpen(false);
  };

  return (
    <View className="border-t border-pink-100 bg-white p-4 pb-6">
      <Pressable onPress={() => setIsListOpen((prev) => !prev)} className="flex-row items-center justify-between">
        <Text className="text-sm text-gray-500">🛒 총 {totalCount}개</Text>
        <Text className="font-bold text-pink-600">{totalPrice.toLocaleString()}원</Text>
        <Text className="text-gray-400">{isListOpen ? '접기 ︿' : '펼치기 ﹀'}</Text>
      </Pressable>

      {isListOpen && (
        <ScrollView className="mt-3 max-h-64 rounded-xl bg-pink-50 p-3" nestedScrollEnabled>
          {items.length === 0 ? (
            <Text className="py-6 text-center text-gray-400">장바구니가 비어있어요</Text>
          ) : (
            <View className="gap-2">
              {items.map((item) => (
                <CartLine
                  key={item.cartItemId}
                  item={item}
                  onIncrease={() => increaseQuantity(item.cartItemId)}
                  onDecrease={() => decreaseQuantity(item.cartItemId)}
                  onRemove={() => removeFromCart(item.cartItemId)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <Pressable
        onPress={handleOpenPaymentModal}
        disabled={items.length === 0}
        className={`mt-3 items-center rounded-full py-3 ${items.length === 0 ? 'bg-gray-300' : 'bg-pink-500'}`}
      >
        <Text className="text-lg font-bold text-white">♥ 주문하기</Text>
      </Pressable>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="결제 수단 선택">
        <Text className="mb-4 text-center text-sm text-gray-500">
          총 {totalPrice.toLocaleString()}원을 어떻게 결제하시겠어요?
        </Text>
        <View className="flex-row flex-wrap gap-3">
          {PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method.value}
              disabled={isSubmitting}
              onPress={() => handleSelectPayment(method.value)}
              style={{ width: '47%' }}
              className="items-center gap-2 rounded-xl bg-gray-100 py-5"
            >
              <Text className="text-2xl">{method.icon}</Text>
              <Text className="text-sm font-bold text-gray-800">{method.value}</Text>
            </Pressable>
          ))}
        </View>
        {isSubmitting && <Text className="mt-4 text-center text-sm text-gray-400">주문을 처리 중이에요...</Text>}
      </Modal>
    </View>
  );
}

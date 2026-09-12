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
    <View className="rounded-md bg-white p-3 shadow-sm md:p-5">
      <View className="flex-row items-center gap-3 md:gap-4">
        <View className="h-12 w-12 shrink-0 overflow-hidden rounded-lg md:h-24 md:w-24 md:rounded-xl">
          <Image source={{ uri: item.imageUrl }} style={{ flex: 1 }} contentFit="cover" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-800 md:text-2xl" numberOfLines={1}>
            {item.name}
          </Text>
          {(item.temperature || item.magicSpell || (item.selectedOptions?.length ?? 0) > 0) && (
            <View className="mt-0.5 flex-row flex-wrap gap-x-1">
              {item.temperature && (
                <Text className="text-xs text-pink-500 md:text-lg">
                  ({item.temperature === 'HOT' ? '🔥 HOT' : '🧊 ICE'})
                </Text>
              )}
              {item.iceAmount && <Text className="text-xs text-pink-500 md:text-lg">(얼음 {item.iceAmount})</Text>}
              {item.magicSpell && <Text className="text-xs text-pink-500 md:text-lg">(🪄 {item.magicSpell})</Text>}
              {item.selectedOptions?.map((option) => (
                <Text key={option.name} className="text-xs text-pink-500 md:text-lg">
                  ({option.name})
                </Text>
              ))}
            </View>
          )}
          <Text className="text-sm text-gray-500 md:text-xl">{item.price.toLocaleString()}원</Text>
        </View>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text className="text-gray-300 md:text-2xl">🗑</Text>
        </Pressable>
      </View>
      <View className="mt-2 flex-row items-center justify-end gap-2 md:mt-4 md:gap-4">
        <Pressable
          onPress={onDecrease}
          className="h-7 w-7 items-center justify-center rounded-full border border-pink-200 md:h-12 md:w-12"
        >
          <Text className="text-pink-500 md:text-2xl">−</Text>
        </Pressable>
        <Text className="w-6 text-center text-sm font-semibold md:w-10 md:text-xl">{item.quantity}</Text>
        <Pressable
          onPress={onIncrease}
          className="h-7 w-7 items-center justify-center rounded-full border border-pink-200 md:h-12 md:w-12"
        >
          <Text className="text-pink-500 md:text-2xl">+</Text>
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

  const cartItemList =
    items.length === 0 ? (
      <Text className="py-6 text-center text-gray-400 md:text-2xl">장바구니가 비어있어요</Text>
    ) : (
      <View className="gap-2 md:gap-3">
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
    );

  const orderButton = (
    <Pressable
      onPress={handleOpenPaymentModal}
      disabled={items.length === 0}
      className={`items-center rounded-full py-3 md:py-6 ${items.length === 0 ? 'bg-gray-300' : 'bg-pink-500'}`}
    >
      <Text className="text-lg font-bold text-white md:text-3xl">♥ 주문하기</Text>
    </Pressable>
  );

  return (
    <>
      {/* ✅ 태블릿(md 이상): 웹의 항상 펼쳐진 사이드바와 동일한 레이아웃으로
          바꿉니다 — 접이식 대신 목록이 늘 보이는 오른쪽 패널입니다. 폰 쪽
          접이식 바와 동시에 마운트되지만 display:none으로 숨겨집니다
          (웹 OrderSummary의 `hidden md:block` / `md:hidden` 쌍과 동일한
          방식). */}
      <View className="hidden border-l border-pink-100 bg-white p-6 md:flex md:w-2/5 md:flex-none">
        <Text className="text-center text-2xl font-bold text-pink-500">🎀 주문 목록 🎀</Text>
        <Text className="mt-1 text-center text-lg text-gray-400">
          {orderType === 'dine-in' ? '🍽️ 매장에서' : '🥡 포장'}
        </Text>
        <ScrollView className="mt-4 flex-1 rounded-xl bg-pink-50 p-4" nestedScrollEnabled>
          {cartItemList}
        </ScrollView>
        <View className="my-4 flex-row items-center justify-between">
          <Text className="text-lg font-bold text-gray-700">총 금액</Text>
          <Text className="text-lg font-bold text-pink-600">{totalPrice.toLocaleString()}원</Text>
        </View>
        {orderButton}
      </View>

      {/* ✅ 폰(md 미만): 화면 하단에 붙는 기존 접이식 요약 바. */}
      <View className="border-t border-pink-100 bg-white p-4 pb-6 md:hidden">
        <Pressable onPress={() => setIsListOpen((prev) => !prev)} className="flex-row items-center justify-between">
          <Text className="text-sm text-gray-500">🛒 총 {totalCount}개</Text>
          <Text className="font-bold text-pink-600">{totalPrice.toLocaleString()}원</Text>
          <Text className="text-gray-400">{isListOpen ? '접기 ︿' : '펼치기 ﹀'}</Text>
        </Pressable>

        {isListOpen && (
          <ScrollView className="mt-3 max-h-64 rounded-xl bg-pink-50 p-3" nestedScrollEnabled>
            {cartItemList}
          </ScrollView>
        )}

        <View className="mt-3">{orderButton}</View>
      </View>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="결제 수단 선택">
        <Text className="mb-4 text-center text-sm text-gray-500 md:mb-8 md:text-2xl">
          총 {totalPrice.toLocaleString()}원을 어떻게 결제하시겠어요?
        </Text>
        <View className="flex-row flex-wrap gap-3 md:gap-5">
          {PAYMENT_METHODS.map((method) => (
            <Pressable
              key={method.value}
              disabled={isSubmitting}
              onPress={() => handleSelectPayment(method.value)}
              style={{ width: '47%' }}
              className="items-center gap-2 rounded-xl bg-gray-100 py-5 md:py-12"
            >
              <Text className="text-2xl md:text-6xl">{method.icon}</Text>
              <Text className="text-sm font-bold text-gray-800 md:text-2xl">{method.value}</Text>
            </Pressable>
          ))}
        </View>
        {isSubmitting && (
          <Text className="mt-4 text-center text-sm text-gray-400 md:text-xl">주문을 처리 중이에요...</Text>
        )}
      </Modal>
    </>
  );
}

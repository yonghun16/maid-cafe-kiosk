// @owner: ai
import { useEffect, useState } from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { OrderType } from '@repo/types';
import { useOrderTypeStore } from '../../../features/order-type';
import { useCartStore } from '../../../features/cart';
import { OrderTypeSelect } from '../../../widgets/order-type-select';
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';
import { OrderCompleteScreen } from '../../../widgets/order-complete';
import { Modal } from '../../../shared/ui';
import { resetIdleTimer, startIdleTimer, stopIdleTimer } from '../../../shared/lib';

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  'dine-in': '🍽️ 매장에서',
  takeout: '🥡 포장',
};

// ✅ Tailwind `md` 기준. `md:flex-row` 같은 반응형 클래스로 구조(방향/폭)
// 자체를 바꾸면 이 RN/Yoga 환경에서 자식들이 겹쳐 보이는 문제가 있어서
// (entities/ad/AdBanner의 `w-full`+`aspectRatio` 버그와 같은 계열),
// `useWindowDimensions`로 직접 판단해 JS에서 분기합니다.
const TABLET_BREAKPOINT = 768;

/**
 * 고객용 키오스크 화면 전체를 조립합니다. 헤더의 매장/포장 배지를 누르면
 * 웹의 `views/home`과 동일하게 주문 방식을 바꾸거나 처음 화면(매장/포장
 * 선택)으로 되돌아갈 수 있습니다. 웹과 동일하게 1분간 조작이 없으면
 * 장바구니를 비우고 매장/포장 선택 화면으로 되돌리는 세션 타임아웃도
 * 적용됩니다(`docs/specs/006-mobile-order-flow` 참고).
 */
export function HomePage() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const orderType = useOrderTypeStore((state) => state.orderType);
  const setOrderType = useOrderTypeStore((state) => state.setOrderType);
  const resetOrderType = useOrderTypeStore((state) => state.resetOrderType);
  const clearCart = useCartStore((state) => state.clearCart);
  const lastCompletedOrder = useCartStore((state) => state.lastCompletedOrder);
  const clearLastCompletedOrder = useCartStore((state) => state.clearLastCompletedOrder);
  // ✅ 배지를 눌렀을 때만 뜨는 팝업으로 매장/포장을 바꿉니다(웹의
  // [[매장내포장선택]]과 동일).
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const [pendingOrderType, setPendingOrderType] = useState<OrderType | null>(null);

  // ✅ 주문 화면(orderType이 있는 동안)에서만 미조작 타이머를 돌립니다.
  // 웹과 달리 실제 타이머 로직은 `shared/lib/idleTimer`에 있습니다 —
  // RN `Modal`이 별도 네이티브 화면으로 뜨기 때문에, 옵션 선택/결제 모달
  // 안에서의 조작도 놓치지 않으려면 `shared/ui/Modal`도 같은 타이머를
  // 갱신해야 하고, 그러려면 `shared/` 레이어에서 접근 가능해야 합니다.
  useEffect(() => {
    if (!orderType) return;
    startIdleTimer(() => {
      clearCart();
      resetOrderType();
    });
    return () => stopIdleTimer();
  }, [orderType, clearCart, resetOrderType]);

  // ✅ 주문 제출 직후에는 매장/포장 선택 화면보다 주문완료화면이 먼저
  // 보여야 하므로, orderType 체크보다 먼저 검사합니다.
  if (lastCompletedOrder) {
    const handleDismissComplete = () => {
      clearLastCompletedOrder();
      resetOrderType();
    };
    return <OrderCompleteScreen order={lastCompletedOrder} onDismiss={handleDismissComplete} />;
  }

  if (!orderType) {
    return <OrderTypeSelect />;
  }

  const handleOpenChangeModal = () => {
    setPendingOrderType(orderType);
    setIsChangeModalOpen(true);
  };

  // ✅ 매장/포장 변경은 장바구니를 건드리지 않는 비파괴적인 동작이라
  // 확인 없이 바로 적용합니다.
  const handleApplyChange = () => {
    if (pendingOrderType && pendingOrderType !== orderType) {
      setOrderType(pendingOrderType);
    }
    setIsChangeModalOpen(false);
  };

  const handleRestartClick = () => {
    setIsChangeModalOpen(false);
    setIsRestartConfirmOpen(true);
  };

  // ✅ "처음으로"는 매장/포장 선택 화면(프론트 화면)으로 되돌아가는
  // 동작이라, 실수로 눌러 화면이 갑자기 바뀌지 않도록 확인을 한 번
  // 거칩니다. 담아둔 장바구니는 그대로 유지됩니다.
  const handleConfirmRestart = () => {
    setIsRestartConfirmOpen(false);
    resetOrderType();
  };

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      {/* ✅ `onStartShouldSetResponderCapture`는 항상 `false`를 반환해
          터치를 가로채지 않으면서, 모든 터치 시작 시점에 타이머만
          갱신합니다(`shared/ui/Modal`과 동일한 방식). */}
      <View
        className="flex-1"
        onStartShouldSetResponderCapture={() => {
          resetIdleTimer();
          return false;
        }}
      >
        <View className="flex-row items-center justify-between gap-2 border-b border-pink-100 bg-white px-4 py-3 md:px-8 md:py-6">
          <Text className="shrink text-lg font-bold text-pink-500 md:text-3xl" numberOfLines={1}>
            🎀 Maid Kiosk
          </Text>
          <Pressable
            onPress={handleOpenChangeModal}
            className="shrink-0 flex-row items-center gap-1 rounded-full border border-pink-200 bg-white px-3 py-1.5 md:px-6 md:py-3"
          >
            <Text className="text-sm font-semibold text-gray-600 md:text-2xl">{ORDER_TYPE_LABEL[orderType]}</Text>
            <Text className="text-gray-400 md:text-2xl">▾</Text>
          </Pressable>
        </View>
        {/* ✅ 폰에서는 세로로 쌓이고, 태블릿에서는 웹 태블릿 레이아웃과
            동일하게 메뉴 목록 + 장바구니 사이드바가 좌우로 나뉩니다. */}
        <View className={isTablet ? 'flex-1 flex-row' : 'flex-1'}>
          <ProductList />
          <OrderSummary />
        </View>

        <Modal isOpen={isChangeModalOpen} onClose={() => setIsChangeModalOpen(false)} title="주문 방식">
          <View className="gap-3">
            {(Object.keys(ORDER_TYPE_LABEL) as OrderType[]).map((type) => (
              <Pressable
                key={type}
                onPress={() => setPendingOrderType(type)}
                className={`flex-row items-center gap-3 rounded-lg border px-4 py-3 md:px-6 md:py-5 ${
                  pendingOrderType === type ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                }`}
              >
                <View
                  className={`h-4 w-4 items-center justify-center rounded-full border-2 md:h-7 md:w-7 ${
                    pendingOrderType === type ? 'border-pink-500' : 'border-gray-300'
                  }`}
                >
                  {pendingOrderType === type && (
                    <View className="h-2 w-2 rounded-full bg-pink-500 md:h-3.5 md:w-3.5" />
                  )}
                </View>
                <Text className="font-semibold text-gray-700 md:text-2xl">{ORDER_TYPE_LABEL[type]}</Text>
              </Pressable>
            ))}
          </View>
          <View className="mt-5 flex-row gap-2">
            <Pressable
              onPress={() => setIsChangeModalOpen(false)}
              className="flex-1 items-center rounded-md border border-gray-300 py-2.5 md:py-5"
            >
              <Text className="text-sm font-semibold text-gray-600 md:text-2xl">취소</Text>
            </Pressable>
            <Pressable
              onPress={handleApplyChange}
              disabled={pendingOrderType === orderType}
              className={`flex-1 items-center rounded-md py-2.5 md:py-5 ${
                pendingOrderType === orderType ? 'bg-gray-300' : 'bg-pink-500'
              }`}
            >
              <Text className="text-sm font-bold text-white md:text-2xl">변경</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={handleRestartClick}
            className="mt-4 items-center rounded-md border border-gray-200 py-2.5 md:py-5"
          >
            <Text className="text-sm font-semibold text-gray-500 md:text-2xl">↩ 처음부터 다시 시작</Text>
          </Pressable>
        </Modal>

        <Modal isOpen={isRestartConfirmOpen} onClose={() => setIsRestartConfirmOpen(false)} title="처음으로">
          <Text className="text-sm text-gray-600 md:text-2xl">
            매장/포장 선택 화면으로 돌아갈까요? 담아둔 메뉴는 그대로 유지됩니다.
          </Text>
          <View className="mt-5 flex-row gap-2">
            <Pressable
              onPress={() => setIsRestartConfirmOpen(false)}
              className="flex-1 items-center rounded-md border border-gray-300 py-2.5 md:py-5"
            >
              <Text className="text-sm font-semibold text-gray-600 md:text-2xl">계속 주문</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmRestart}
              className="flex-1 items-center rounded-md bg-pink-500 py-2.5 md:py-5"
            >
              <Text className="text-sm font-bold text-white md:text-2xl">처음으로</Text>
            </Pressable>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// @owner: ai
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { OrderType } from '@repo/types';
import { useOrderTypeStore } from '../../../features/order-type';
import { useCartStore } from '../../../features/cart';
import { OrderTypeSelect } from '../../../widgets/order-type-select';
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';
import { OrderCompleteScreen } from '../../../widgets/order-complete';

const ORDER_TYPE_LABEL: Record<OrderType, string> = {
  'dine-in': '🍽️ 매장에서',
  takeout: '🥡 포장',
};

/**
 * 고객용 키오스크 화면 전체를 조립합니다. 1차 포팅 범위라 세션 타임아웃,
 * 매장/포장 변경 팝업, 광고 배너는 아직 없습니다(웹의 `views/home`과
 * 달리 단순화됨 — `docs/specs/006-mobile-order-flow` 참고).
 */
export function HomePage() {
  const orderType = useOrderTypeStore((state) => state.orderType);
  const resetOrderType = useOrderTypeStore((state) => state.resetOrderType);
  const lastCompletedOrder = useCartStore((state) => state.lastCompletedOrder);
  const clearLastCompletedOrder = useCartStore((state) => state.clearLastCompletedOrder);

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

  return (
    <SafeAreaView className="flex-1 bg-pink-50">
      <View className="flex-row items-center justify-between border-b border-pink-100 bg-white px-4 py-3">
        <Text className="text-lg font-bold text-pink-500">🎀 Maid Kiosk</Text>
        <Text className="text-sm font-semibold text-gray-600">{ORDER_TYPE_LABEL[orderType]}</Text>
      </View>
      <ProductList />
      <OrderSummary />
    </SafeAreaView>
  );
}

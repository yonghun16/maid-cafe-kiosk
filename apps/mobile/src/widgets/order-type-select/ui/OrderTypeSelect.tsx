// @owner: ai
import { Pressable, Text, View } from 'react-native';
import { AdBanner } from '../../../entities/ad';
import { useOrderTypeStore } from '../../../features/order-type';

export function OrderTypeSelect() {
  const setOrderType = useOrderTypeStore((state) => state.setOrderType);

  return (
    <View className="flex-1 items-center justify-center gap-8 bg-pink-50 p-8">
      <View className="items-center">
        <Text className="text-center text-3xl font-bold text-pink-500 md:text-6xl">🎀 Maid Kiosk 🎀</Text>
        <Text className="mt-4 text-center text-lg font-semibold text-gray-600 md:text-3xl">
          주인님, 매장에서 드시나요{'\n'}포장해드릴까요?
        </Text>
      </View>

      <AdBanner />

      <View className="w-full max-w-md flex-row gap-4 md:max-w-3xl md:gap-8">
        <Pressable onPress={() => setOrderType('dine-in')} className="flex-1 items-center rounded-2xl bg-white p-8 shadow-sm md:p-14">
          <Text className="text-center text-xl font-bold text-gray-700 md:text-4xl">🍽️{'\n'}매장에서</Text>
        </Pressable>
        <Pressable onPress={() => setOrderType('takeout')} className="flex-1 items-center rounded-2xl bg-pink-500 p-8 shadow-sm md:p-14">
          <Text className="text-center text-xl font-bold text-white md:text-4xl">🥡{'\n'}포장</Text>
        </Pressable>
      </View>
    </View>
  );
}

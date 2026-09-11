// @owner: ai
import { Pressable, Text, View } from 'react-native';
import { useOrderTypeStore } from '../../../features/order-type';

export function OrderTypeSelect() {
  const setOrderType = useOrderTypeStore((state) => state.setOrderType);

  return (
    <View className="flex-1 items-center justify-center gap-8 bg-pink-50 p-8">
      <View className="items-center">
        <Text className="text-center text-3xl font-bold text-pink-500">🎀 Maid Kiosk 🎀</Text>
        <Text className="mt-4 text-center text-lg font-semibold text-gray-600">
          주인님, 매장에서 드시나요{'\n'}포장해드릴까요?
        </Text>
      </View>

      <View className="w-full max-w-md flex-row gap-4">
        <Pressable onPress={() => setOrderType('dine-in')} className="flex-1 items-center rounded-2xl bg-white p-8 shadow-sm">
          <Text className="text-center text-xl font-bold text-gray-700">🍽️{'\n'}매장에서</Text>
        </Pressable>
        <Pressable onPress={() => setOrderType('takeout')} className="flex-1 items-center rounded-2xl bg-pink-500 p-8 shadow-sm">
          <Text className="text-center text-xl font-bold text-white">🥡{'\n'}포장</Text>
        </Pressable>
      </View>
    </View>
  );
}

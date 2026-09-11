// @owner: ai
import { useState } from 'react';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import type { Product, ProductOption } from '@repo/types';
import { Modal } from '../../../shared/ui';
import {
  ICE_AMOUNT_OPTIONS,
  MAGIC_SPELL_OPTIONS,
  TEMPERATURE_OPTIONS,
  type IceAmount,
  type Temperature,
} from '../model/optionConstants';

interface ProductCardOptions {
  temperature?: Temperature;
  iceAmount?: IceAmount;
  magicSpell?: string;
  selectedOptions?: ProductOption[];
}

const TEMPERATURE_LABEL: Record<Temperature, string> = { HOT: '🔥 HOT', ICE: '🧊 ICE' };

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, options?: ProductCardOptions) => void;
}

/**
 * 메뉴 카드입니다. 탭하면 바로 담기지 않고, 그 메뉴에 설정된 옵션
 * (온도/마법의 주문/커스텀 옵션)을 고르는 모달이 먼저 뜹니다. 매장
 * 전체 고정 옵션은 없고, 관리자가 그 메뉴에 켜두거나 등록한 것만
 * 나타납니다(웹의 [[옵션조합관리]]와 동일한 동작).
 */
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [temperature, setTemperature] = useState<Temperature | ''>('');
  const [iceAmount, setIceAmount] = useState<IceAmount | ''>('');
  const [magicSpell, setMagicSpell] = useState('');
  const [selectedOptionNames, setSelectedOptionNames] = useState<string[]>([]);

  const productOptions = product.options ?? [];

  const handlePress = () => {
    if (product.isSoldOut) {
      Toast.show({ type: 'error', text1: '품절된 메뉴입니다.' });
      return;
    }
    // ✅ 온도가 HOT/ICE 중 하나로 고정된 메뉴는 고를 게 없으니 미리 그
    // 값으로 채워둡니다 — 고객이 따로 고르지 않아도 기록됩니다.
    setTemperature(
      product.temperatureOption === 'HOT' || product.temperatureOption === 'ICE'
        ? product.temperatureOption
        : '',
    );
    setIceAmount('');
    setMagicSpell('');
    setSelectedOptionNames([]);
    setIsOptionModalOpen(true);
  };

  // ✅ ICE가 아닐 때 골라둔 얼음양이 남아있지 않도록, 온도를 바꾸면 ICE가
  // 아닌 이상 얼음양도 같이 초기화합니다.
  const handleTemperaturePress = (option: Temperature) => {
    setTemperature((prev) => {
      const next = prev === option ? '' : option;
      if (next !== 'ICE') setIceAmount('');
      return next;
    });
  };

  const toggleCustomOption = (name: string) => {
    setSelectedOptionNames((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
  };

  const handleAdd = () => {
    const selectedOptions = productOptions.filter((option) => selectedOptionNames.includes(option.name));
    onAddToCart(product, {
      temperature: temperature || undefined,
      iceAmount: temperature === 'ICE' ? iceAmount || undefined : undefined,
      magicSpell: magicSpell || undefined,
      selectedOptions: selectedOptions.length > 0 ? selectedOptions : undefined,
    });
    setIsOptionModalOpen(false);
  };

  const selectedOptionsPrice = productOptions
    .filter((option) => selectedOptionNames.includes(option.name))
    .reduce((sum, option) => sum + option.price, 0);
  const totalPrice = product.price + selectedOptionsPrice;

  return (
    <>
      <Pressable onPress={handlePress} className="flex-1 overflow-hidden rounded-2xl bg-white shadow-sm">
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

      <Modal isOpen={isOptionModalOpen} onClose={() => setIsOptionModalOpen(false)} title={product.name}>
        <View className="gap-4">
          {/* ✅ 사진을 왼쪽에, 옵션을 오른쪽에 둬서 상품 사진 비율(3:4)이
              눌리지 않고 그대로 보이게 합니다. items-start로 옵션이
              늘어나도(예: ICE 얼음양 선택지) 사진 높이가 같이 늘어나지
              않게 합니다(웹의 ProductCard와 동일한 레이아웃). */}
          <View className="flex-row items-start gap-4">
            <View className="aspect-[3/4] w-28 shrink-0 overflow-hidden rounded-lg bg-pink-50">
              <Image source={{ uri: product.imageUrl }} style={{ flex: 1 }} contentFit="cover" />
            </View>

            <View className="flex-1 gap-3">
              {product.temperatureOption && (
                <View>
                  <Text className="mb-1 text-sm font-semibold text-gray-700">🌡️ 온도</Text>
                  {product.temperatureOption === 'BOTH' ? (
                    <View className="flex-row gap-2">
                      {TEMPERATURE_OPTIONS.map((option) => (
                        <Pressable
                          key={option}
                          onPress={() => handleTemperaturePress(option)}
                          className={`flex-1 items-center rounded-lg border px-3 py-2 ${
                            temperature === option ? 'border-pink-500 bg-pink-500' : 'border-pink-100'
                          }`}
                        >
                          <Text
                            className={`text-sm font-semibold ${
                              temperature === option ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {TEMPERATURE_LABEL[option]}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <View className="self-start rounded-lg border border-pink-100 bg-pink-50 px-3 py-2">
                      <Text className="text-sm font-semibold text-gray-600">
                        {TEMPERATURE_LABEL[product.temperatureOption]}
                      </Text>
                    </View>
                  )}
                  {temperature === 'ICE' && (
                    <View className="mt-2">
                      <Text className="mb-1 text-xs font-semibold text-gray-500">얼음양</Text>
                      <View className="flex-row gap-2">
                        {ICE_AMOUNT_OPTIONS.map((option) => (
                          <Pressable
                            key={option}
                            onPress={() => setIceAmount((prev) => (prev === option ? '' : option))}
                            className={`flex-1 items-center rounded-lg border px-2 py-1.5 ${
                              iceAmount === option ? 'border-sky-500 bg-sky-500' : 'border-sky-100'
                            }`}
                          >
                            <Text
                              className={`text-xs font-semibold ${
                                iceAmount === option ? 'text-white' : 'text-gray-600'
                              }`}
                            >
                              {option}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}

              {product.hasMagicSpellOption && (
                <View>
                  <Text className="mb-1 text-sm font-semibold text-gray-700">🪄 마법의 주문</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {MAGIC_SPELL_OPTIONS.map((option) => (
                      <Pressable
                        key={option}
                        onPress={() => setMagicSpell((prev) => (prev === option ? '' : option))}
                        style={{ width: '47%' }}
                        className={`items-center rounded-lg border px-2 py-2 ${
                          magicSpell === option ? 'border-amber-500 bg-amber-500' : 'border-amber-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            magicSpell === option ? 'text-white' : 'text-gray-600'
                          }`}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {productOptions.length > 0 && (
                <View className="gap-2">
                  {productOptions.map((option) => {
                    const isSelected = selectedOptionNames.includes(option.name);
                    return (
                      <Pressable
                        key={option.name}
                        onPress={() => toggleCustomOption(option.name)}
                        className="flex-row items-center justify-between rounded-lg border border-pink-100 px-3 py-2.5"
                      >
                        <Text className="text-sm font-semibold text-gray-700">{option.name}</Text>
                        <View className="flex-row items-center gap-2">
                          {option.price > 0 && (
                            <Text className="text-xs text-gray-500">+{option.price.toLocaleString()}원</Text>
                          )}
                          <View
                            className={`h-5 w-5 items-center justify-center rounded border ${
                              isSelected ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                            }`}
                          >
                            {isSelected && <Text className="text-xs text-white">✓</Text>}
                          </View>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>

          <Text className="text-right text-lg font-bold text-pink-600">{totalPrice.toLocaleString()}원</Text>

          <Pressable onPress={handleAdd} className="items-center rounded-md bg-pink-500 py-3">
            <Text className="text-base font-bold text-white">담기</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
}

// @owner: ai
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product, ProductOption } from '@repo/types';
import { Modal } from '../../../shared/ui';
import {
  ICE_AMOUNT_OPTIONS,
  MAGIC_SPELL_OPTIONS,
  TEMPERATURE_OPTIONS,
  type IceAmount,
  type Temperature,
} from '../model/optionConstants';

interface ProductOptions {
  temperature?: Temperature;
  iceAmount?: IceAmount;
  magicSpell?: string;
  selectedOptions?: ProductOption[];
}

const TEMPERATURE_LABEL: Record<Temperature, string> = { HOT: '🔥 HOT', ICE: '🧊 ICE' };

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, options: ProductOptions) => void;
}

// 카테고리를 관리자가 자유롭게 추가/삭제할 수 있어 카테고리별 고정 색상
// 대신 카드 전체에 하나의 통일된 스타일을 씁니다.
const CARD_STYLE = { bg: 'bg-pink-50', paw: 'text-pink-400' };

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // ✅ 카드를 클릭하면 바로 담기지 않고, 옵션을 고를 수 있는 모달이
  // 먼저 뜹니다([[상품옵션선택]] 참고). 온도/마법의 주문/커스텀 옵션
  // 모두 매장 전체 고정이 아니라, 메뉴별로 관리자가 켜거나 등록해야
  // 나타납니다([[옵션조합관리]] 참고).
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [temperature, setTemperature] = useState<Temperature | ''>('');
  const [iceAmount, setIceAmount] = useState<IceAmount | ''>('');
  const [magicSpell, setMagicSpell] = useState('');
  const [selectedOptionNames, setSelectedOptionNames] = useState<string[]>([]);

  const productOptions = product.options ?? [];

  const handleClick = () => {
    if (product.isSoldOut) {
      toast.error('품절된 메뉴입니다.');
      return;
    }
    setTemperature('');
    setIceAmount('');
    setMagicSpell('');
    setSelectedOptionNames([]);
    setIsOptionModalOpen(true);
  };

  // ✅ ICE가 아닐 때 골라둔 얼음양이 남아있지 않도록, 온도를 바꿀 때
  // ICE가 아니면 얼음양도 같이 초기화합니다.
  const handleTemperatureClick = (option: Temperature) => {
    setTemperature((prev) => {
      const next = prev === option ? '' : option;
      if (next !== 'ICE') setIceAmount('');
      return next;
    });
  };

  const toggleOption = (name: string) => {
    setSelectedOptionNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
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
      <div
        className={`group relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 ${
          product.isSoldOut ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'
        }`}
        onClick={handleClick}
      >
        {product.isSoldOut && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-gray-700/90 px-3 py-1 text-xs font-bold text-white">
            품절
          </span>
        )}
        <div className={`${CARD_STYLE.bg} p-3`}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`aspect-[3/4] w-full rounded-lg object-cover transition-transform duration-300 ${
              product.isSoldOut ? 'grayscale' : 'group-hover:scale-105' // ✅ 마우스 올렸을 때 이미지 확대 효과(품절 시에는 비활성)
            }`}
          />
        </div>
        <div className="relative p-3 sm:p-4">
          <h3 className="flex items-center gap-1 text-base font-semibold text-gray-800 sm:text-lg">
            {product.name}
            <span className="text-pink-400">♥</span>
          </h3>
          <p className="mt-1 font-bold text-pink-600">{product.price.toLocaleString()}원</p>
          <span className={`absolute bottom-3 right-3 ${CARD_STYLE.paw}`}>🐾</span>
        </div>
      </div>

      <Modal isOpen={isOptionModalOpen} onClose={() => setIsOptionModalOpen(false)} title={product.name}>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {/* ✅ 그림을 왼쪽에, 옵션을 오른쪽에 둬서 상품 사진 비율(3:4)이
                눌리지 않고 그대로 보이게 합니다. items-start로 옵션이
                늘어나도(예: ICE 얼음양 선택지) flex가 사진 높이를 늘리지
                않게 합니다. */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="aspect-[3/4] w-28 shrink-0 rounded-lg object-cover sm:w-32"
            />
            <div className="flex-1 space-y-3">
              {product.hasTemperatureOption && (
                <div>
                  <span className="mb-1 block text-sm font-semibold text-gray-700">🌡️ 온도</span>
                  <div className="flex gap-2">
                    {TEMPERATURE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleTemperatureClick(option)}
                        className={`flex-1 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
                          temperature === option
                            ? 'border-pink-500 bg-pink-500 text-white'
                            : 'border-pink-100 text-gray-600 hover:bg-pink-50'
                        }`}
                      >
                        {TEMPERATURE_LABEL[option]}
                      </button>
                    ))}
                  </div>
                  {temperature === 'ICE' && (
                    <div className="mt-2">
                      <span className="mb-1 block text-xs font-semibold text-gray-500">얼음양</span>
                      <div className="flex gap-2">
                        {ICE_AMOUNT_OPTIONS.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setIceAmount((prev) => (prev === option ? '' : option))}
                            className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors ${
                              iceAmount === option
                                ? 'border-sky-500 bg-sky-500 text-white'
                                : 'border-sky-100 text-gray-600 hover:bg-sky-50'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {product.hasMagicSpellOption && (
                <div>
                  <label htmlFor="magic-spell" className="mb-1 block text-sm font-semibold text-gray-700">
                    🪄 마법의 주문
                  </label>
                  <select
                    id="magic-spell"
                    value={magicSpell}
                    onChange={(e) => setMagicSpell(e.target.value)}
                    className="w-full rounded-lg border border-pink-100 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                  >
                    <option value="">선택 안 함</option>
                    {MAGIC_SPELL_OPTIONS.map((spell) => (
                      <option key={spell} value={spell}>
                        {spell}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {productOptions.length > 0 && (
                <div className="space-y-2">
                  {productOptions.map((option) => (
                    <label
                      key={option.name}
                      className="flex cursor-pointer items-center justify-between rounded-lg border border-pink-100 px-3 py-2.5"
                    >
                      <span className="text-sm font-semibold text-gray-700">{option.name}</span>
                      <span className="flex items-center gap-2">
                        {option.price > 0 && (
                          <span className="text-xs text-gray-500">+{option.price.toLocaleString()}원</span>
                        )}
                        <input
                          type="checkbox"
                          checked={selectedOptionNames.includes(option.name)}
                          onChange={() => toggleOption(option.name)}
                          className="h-5 w-5 accent-pink-500"
                        />
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <p className="text-right text-lg font-bold text-pink-600">{totalPrice.toLocaleString()}원</p>
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-md bg-pink-500 py-3 text-base font-bold text-white transition-colors hover:bg-pink-600"
          >
            담기
          </button>
        </div>
      </Modal>
    </>
  );
}

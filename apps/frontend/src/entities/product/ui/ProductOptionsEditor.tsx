// @owner: ai
'use client';

import type { ProductOption } from '@repo/types';

interface ProductOptionsEditorProps {
  options: ProductOption[];
  onChange: (options: ProductOption[]) => void;
  idPrefix?: string;
}

/**
 * 예전에 매장 전체 고정 옵션이었다가 메뉴별 자유 옵션으로 옮겨온
 * 항목들([[옵션조합관리]] 참고). 매번 이름/가격을 새로 입력하지 않고
 * 클릭 한 번으로 추가할 수 있게 자주 쓰는 옵션 모음으로 제공합니다.
 */
const PRESET_OPTIONS: ProductOption[] = [
  { name: '샷 추가', price: 700 },
  { name: 'HOT', price: 0 },
  { name: 'ICE', price: 0 },
  { name: '모에모에뀽', price: 0 },
  { name: '오이시쿠나레', price: 0 },
  { name: '냥냥쿵', price: 0 },
  { name: '하피네스차지!', price: 0 },
];

/**
 * 메뉴 추가/수정 폼에서 이 메뉴만의 옵션(이름 + 추가금, 예: "샷 추가"
 * +700원)을 자유롭게 추가/삭제하는 UI. 온도/마법의 주문처럼 매장
 * 전체에 고정된 옵션과 별개로, 메뉴마다 다르게 설정하는 옵션입니다
 * ([[옵션조합관리]] 참고).
 */
export function ProductOptionsEditor({ options, onChange, idPrefix = 'option' }: ProductOptionsEditorProps) {
  const handleAdd = () => {
    onChange([...options, { name: '', price: 0 }]);
  };

  const handleAddPreset = (preset: ProductOption) => {
    if (options.some((option) => option.name === preset.name)) return;
    onChange([...options, preset]);
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleNameChange = (index: number, name: string) => {
    onChange(options.map((option, i) => (i === index ? { ...option, name } : option)));
  };

  const handlePriceChange = (index: number, price: string) => {
    onChange(options.map((option, i) => (i === index ? { ...option, price: Number(price) } : option)));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600">메뉴 옵션 (선택)</label>
      <p className="mt-0.5 text-xs text-gray-400">이 메뉴에서만 고를 수 있는 옵션이에요. (예: 펄 추가 +500원)</p>
      <div className="mt-2 space-y-2">
        {options.map((option, index) => (
          <div key={`${idPrefix}-${index}`} className="flex items-center gap-2">
            <input
              type="text"
              value={option.name}
              onChange={(e) => handleNameChange(index, e.target.value)}
              placeholder="옵션 이름 (예: 펄 추가)"
              className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
            />
            <input
              type="number"
              value={option.price}
              onChange={(e) => handlePriceChange(index, e.target.value)}
              placeholder="추가금"
              className="w-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
            />
            <span className="shrink-0 text-sm text-gray-500">원</span>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label="옵션 삭제"
              className="shrink-0 text-gray-400 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESET_OPTIONS.filter((preset) => !options.some((option) => option.name === preset.name)).map(
          (preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleAddPreset(preset)}
              className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-pink-300 hover:bg-pink-50 hover:text-pink-500"
            >
              + {preset.name}
              {preset.price > 0 && ` (+${preset.price.toLocaleString()}원)`}
            </button>
          ),
        )}
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 rounded-md border border-dashed border-pink-300 px-3 py-1.5 text-sm font-semibold text-pink-500 hover:bg-pink-50"
      >
        + 옵션 추가
      </button>
    </div>
  );
}

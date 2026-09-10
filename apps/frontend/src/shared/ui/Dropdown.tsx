// @owner: ai
'use client';

import { useEffect, useRef, useState } from 'react';

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  id?: string;
}

/**
 * 커스텀 스타일의 드롭다운. 네이티브 `<select>`는 모바일에서 OS
 * 기본 선택 UI(예: iOS의 화면 하단 휠, 안드로이드의 바텀시트)로
 * 열려서 앱 디자인과 어울리지 않는다는 피드백으로, 같은 페이지
 * 레이어 위에 뜨는 커스텀 목록으로 대체했습니다. 도메인 지식이
 * 없는 순수 UI 껍데기라 `shared/ui`에 둡니다.
 */
export function Dropdown({ value, onChange, options, placeholder = '선택 안 함', id }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (next: string) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-lg border border-pink-100 px-3 py-2 text-left text-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value || placeholder}</span>
        <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-pink-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => handleSelect('')}
            className={`block w-full px-3 py-2 text-left text-sm hover:bg-pink-50 ${
              !value ? 'font-semibold text-pink-500' : 'text-gray-600'
            }`}
          >
            {placeholder}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-pink-50 ${
                value === option ? 'font-semibold text-pink-500' : 'text-gray-600'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

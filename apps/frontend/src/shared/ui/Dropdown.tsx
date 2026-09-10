// @owner: ai
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
 *
 * 펼침 목록은 `document.body`에 포털로 렌더링합니다. 처음엔 트리거
 * 버튼 바로 아래에 `position: absolute`로 붙였는데, `shared/ui/Modal`
 * 처럼 `overflow-y-auto`로 스크롤되는 부모 안에서 쓰면 목록이 그
 * 부모의 스크롤 경계에서 잘려 보이는 문제가 있었습니다(모달 박스를
 * 아무리 키워도, 내용이 그보다 많아지는 순간 다시 재현됨) —
 * `position: fixed` + 포털로 부모의 overflow 클리핑 자체를 벗어나게
 * 해서 근본적으로 해결했습니다.
 */
export function Dropdown({ value, onChange, options, placeholder = '선택 안 함', id }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // 펼침 목록이 포털로 body에 따로 렌더링되어 containerRef의 DOM
  // 자손이 아니게 됐습니다 — "바깥 클릭" 판정에서 이 목록 안쪽 클릭을
  // 빼먹으면 옵션을 누르자마자 mousedown 시점에 먼저 닫혀버립니다.
  const listRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!isOpen) {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) setPosition({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target);
      const insideList = listRef.current?.contains(target);
      if (!insideTrigger && !insideList) {
        setIsOpen(false);
      }
    };
    // 포털로 빼낸 목록은 트리거 버튼과 DOM상 형제가 아니라서, 모달/페이지가
    // 스크롤되거나 화면 크기가 바뀌면 위치가 어긋날 수 있습니다. 다시
    // 계산하는 대신 간단하게 닫아버립니다. capture: true로 등록해야
    // 어떤 조상 요소가 스크롤되든(버블링 없이도) 감지할 수 있습니다.
    const handleScrollOrResize = () => setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen]);

  const handleSelect = (next: string) => {
    onChange(next);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between rounded-lg border border-pink-100 px-3 py-2 text-left text-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
      >
        <span className={value ? 'text-gray-800' : 'text-gray-400'}>{value || placeholder}</span>
        <span className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {isOpen &&
        position &&
        createPortal(
          <div
            ref={listRef}
            style={{ position: 'fixed', top: position.top, left: position.left, width: position.width }}
            className="z-50 max-h-56 overflow-y-auto rounded-lg border border-pink-100 bg-white py-1 shadow-lg"
          >
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
          </div>,
          document.body,
        )}
    </div>
  );
}

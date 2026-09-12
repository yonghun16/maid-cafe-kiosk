// @owner: ai
'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

/**
 * 화면 중앙에 뜨는 범용 모달. 배경 클릭, ✕ 버튼, ESC 키로 닫을 수 있습니다.
 * 도메인 지식이 없는 순수 UI 껍데기라 `shared/ui`에 둡니다.
 */
export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl md:max-w-3xl md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between md:mb-6">
          <h2 className="text-2xl font-bold text-gray-700 md:text-3xl">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="text-2xl leading-none text-gray-400 hover:text-gray-600 md:text-3xl"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// @owner: ai
//  역할: 첫 화면(매장/포장 선택 화면)에 노출되는 광고 배너 목록을
//  관리합니다. 추가/수정은 모달에서, 삭제는 목록에서 바로 처리합니다.
'use client';

import { useEffect, useRef, useState } from 'react';
import type { Ad } from '@repo/types';
import { useAdStore } from '../../../features/ad-management';
import { Modal } from '../../../shared/ui';
import { AdForm } from './AdForm';

export function ManageAdList() {
  const ads = useAdStore((state) => state.ads);
  const isLoading = useAdStore((state) => state.isLoading);
  const fetchAds = useAdStore((state) => state.fetchAds);
  const deleteAd = useAdStore((state) => state.deleteAd);
  const moveAd = useAdStore((state) => state.moveAd);
  const reorderLocally = useAdStore((state) => state.reorderLocally);
  const commitAdOrder = useAdStore((state) => state.commitAdOrder);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  // ✅ 지금 드래그로 옮기고 있는 광고의 id.
  const [draggedId, setDraggedId] = useState<string | null>(null);
  // 각 광고 카드의 DOM 엘리먼트를 담아뒀다가, 드래그 중 포인터 좌표가
  // 어느 카드 위에 있는지 판단(hit-test)하는 데 씁니다.
  const adRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // ✅ [[카테고리관리]]에서 쓴 것과 같은 포인터 이벤트 기반 커스텀 드래그.
  // 브라우저 네이티브 HTML5 드래그는 기기/브라우저에 따라 시작 자체가
  // 인식되지 않는 경우가 있어(터치 기기는 애초에 미지원) 이 방식이 더
  // 안정적입니다.
  useEffect(() => {
    if (!draggedId) return;

    const handlePointerMove = (e: PointerEvent) => {
      let hoveredId: string | null = null;
      adRefs.current.forEach((el, id) => {
        if (id === draggedId) return;
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          hoveredId = id;
        }
      });
      if (hoveredId) {
        const targetIndex = ads.findIndex((a) => a._id === hoveredId);
        if (targetIndex !== -1) {
          reorderLocally(draggedId, targetIndex);
        }
      }
    };

    const handlePointerUp = () => {
      setDraggedId(null);
      commitAdOrder();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggedId, ads, reorderLocally, commitAdOrder]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-700">광고 관리</h2>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-md bg-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pink-600"
        >
          + 광고 추가
        </button>
      </div>
      <p className="mb-5 text-sm text-gray-500">
        여기 등록한 이미지가 고객 화면 첫 화면(매장/포장 선택 화면)에 등록된
        순서대로 나타납니다.
      </p>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : ads.length === 0 ? (
        <p className="text-gray-400">등록된 광고가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ads.map((ad, index) => (
            <div
              key={ad._id}
              ref={(el) => {
                if (el) adRefs.current.set(ad._id, el);
                else adRefs.current.delete(ad._id);
              }}
              className={`overflow-hidden rounded-lg bg-gray-50 ${draggedId === ad._id ? 'opacity-40' : ''}`}
            >
              <div className="flex items-center justify-between bg-white px-1.5 py-1">
                <span
                  onPointerDown={() => setDraggedId(ad._id)}
                  aria-label="드래그해서 순서 변경"
                  className="touch-none cursor-grab select-none px-1 text-xs text-gray-300 active:cursor-grabbing"
                >
                  ⠿
                </span>
                <div className="flex gap-1 text-xs">
                  <button
                    type="button"
                    onClick={() => moveAd(ad._id, 'up')}
                    disabled={index === 0}
                    aria-label="앞으로 이동"
                    className="rounded px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ◀
                  </button>
                  <button
                    type="button"
                    onClick={() => moveAd(ad._id, 'down')}
                    disabled={index === ads.length - 1}
                    aria-label="뒤로 이동"
                    className="rounded px-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▶
                  </button>
                </div>
              </div>
              <img src={ad.imageUrl} alt="광고" className="h-32 w-full object-cover" />
              <div className="flex gap-3 p-2 text-sm">
                <button
                  type="button"
                  onClick={() => setEditingAd(ad)}
                  className="font-semibold text-pink-500 hover:text-pink-700"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => deleteAd(ad._id)}
                  className="font-semibold text-red-500 hover:text-red-700"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="광고 추가">
        <AdForm onSuccess={() => setIsAddModalOpen(false)} />
      </Modal>
      <Modal isOpen={editingAd != null} onClose={() => setEditingAd(null)} title="광고 수정">
        {editingAd && <AdForm ad={editingAd} onSuccess={() => setEditingAd(null)} />}
      </Modal>
    </div>
  );
}

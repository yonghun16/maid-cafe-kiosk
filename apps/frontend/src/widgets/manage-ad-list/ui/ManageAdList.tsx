// @owner: ai
//  역할: 첫 화면(매장/포장 선택 화면)에 노출되는 광고 배너 목록을
//  관리합니다. 추가/수정은 모달에서, 삭제는 목록에서 바로 처리합니다.
'use client';

import { useEffect, useState } from 'react';
import type { Ad } from '@repo/types';
import { useAdStore } from '../../../features/ad-management';
import { Modal } from '../../../shared/ui';
import { AdForm } from './AdForm';

export function ManageAdList() {
  const ads = useAdStore((state) => state.ads);
  const isLoading = useAdStore((state) => state.isLoading);
  const fetchAds = useAdStore((state) => state.fetchAds);
  const deleteAd = useAdStore((state) => state.deleteAd);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

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
          {ads.map((ad) => (
            <div key={ad._id} className="overflow-hidden rounded-lg bg-gray-50">
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

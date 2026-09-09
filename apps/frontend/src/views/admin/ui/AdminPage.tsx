// @owner: ai
'use client';

import { useEffect, useState } from 'react';
import { LoginForm, useAdminAuthStore } from '../../../features/admin-auth';
import { AddProductForm } from '../../../widgets/add-product-form';
import { ManageProductList } from '../../../widgets/manage-product-list';
import { ManageCategoryList } from '../../../widgets/manage-category-list';
import { ManageAdList } from '../../../widgets/manage-ad-list';
import { OrderList } from '../../../widgets/order-list';
import { Modal } from '../../../shared/ui';

type AdminTab = 'menu' | 'orders' | 'history' | 'ads';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'menu', label: '메뉴 관리' },
  { key: 'orders', label: '진행중 주문' },
  { key: 'history', label: '지난 주문' },
  { key: 'ads', label: '광고 관리' },
];

export function AdminPage() {
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);
  const isChecking = useAdminAuthStore((state) => state.isChecking);
  const checkSession = useAdminAuthStore((state) => state.checkSession);
  const logout = useAdminAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<AdminTab>('menu');
  // ✅ "메뉴 관리" 탭 안에서 카테고리 칩을 눌러 고른 필터. 'all'이면 전체.
  const [selectedCategory, setSelectedCategory] = useState('all');
  // ✅ "메뉴 추가" 버튼을 누르면 뜨는 모달의 열림/닫힘 상태.
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isChecking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-400">
        확인 중...
      </div>
    );
  }

  if (!isAdmin) {
    return <LoginForm />;
  }

  return (
    <div className="mx-auto w-full max-w-[1800px] p-8 font-sans">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold text-pink-500">🛠️ 관리자 페이지</h1>
        <button
          type="button"
          onClick={logout}
          className="rounded-md border border-pink-300 px-4 py-2 text-sm font-semibold text-pink-500 hover:bg-pink-50"
        >
          로그아웃
        </button>
      </div>

      <div className="mb-6 flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-full px-5 py-2.5 text-base font-semibold shadow-sm transition-all ${
              activeTab === tab.key
                ? 'bg-pink-500 text-white shadow-md'
                : 'border border-pink-100 bg-white text-gray-600 hover:bg-pink-100 hover:text-pink-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'menu' && (
        <>
          <ManageCategoryList selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="rounded-md bg-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pink-600"
            >
              + 메뉴 추가
            </button>
          </div>
          <ManageProductList selectedCategory={selectedCategory} />
          <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="새 메뉴 추가">
            <AddProductForm onSuccess={() => setIsAddModalOpen(false)} />
          </Modal>
        </>
      )}
      {activeTab === 'orders' && <OrderList status="pending" />}
      {activeTab === 'history' && <OrderList status="completed" />}
      {activeTab === 'ads' && <ManageAdList />}
    </div>
  );
}

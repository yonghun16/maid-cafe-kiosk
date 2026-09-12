// @owner: ai
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LoginForm, useAdminAuthStore } from '../../../features/admin-auth';
import { KitchenPushToggle } from '../../../features/kitchen-push-notification';
import { OrderList } from '../../../widgets/order-list';

type KitchenTab = 'orders' | 'history';

const TABS: { key: KitchenTab; label: string }[] = [
  { key: 'orders', label: '진행중 주문' },
  { key: 'history', label: '지난 주문' },
];

/**
 * 주방/카운터에서 들어온 주문만 확인하는 화면(`/kitchen`). 메뉴 관리·
 * 광고 관리·판매 통계 같은 다른 관리 기능 없이 주문 확인에만
 * 집중하도록 관리자 화면(`/admin`)에서 분리했습니다. 로그인 세션은
 * 관리자 화면과 동일하게 공유 비밀번호 기반 세션을 그대로 씁니다
 * (권한 분리는 이번 범위에 포함하지 않음).
 */
export function KitchenPage() {
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);
  const isChecking = useAdminAuthStore((state) => state.isChecking);
  const checkSession = useAdminAuthStore((state) => state.checkSession);
  const logout = useAdminAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<KitchenTab>('orders');

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
        <h1 className="text-4xl font-bold text-pink-500">🍳 주방 화면</h1>
        <div className="flex items-center gap-3">
          <KitchenPushToggle />
          <Link
            href="/admin"
            className="rounded-md border border-pink-300 px-4 py-2 text-sm font-semibold text-pink-500 hover:bg-pink-50"
          >
            관리자 화면
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-md border border-pink-300 px-4 py-2 text-sm font-semibold text-pink-500 hover:bg-pink-50"
          >
            로그아웃
          </button>
        </div>
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

      {activeTab === 'orders' && <OrderList status="pending" />}
      {activeTab === 'history' && <OrderList status="completed" />}
    </div>
  );
}

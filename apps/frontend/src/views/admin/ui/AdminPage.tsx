// @owner: ai
'use client';

import { useEffect } from 'react';
import { LoginForm, useAdminAuthStore } from '../../../features/admin-auth';
import { AddProductForm } from '../../../widgets/add-product-form';
import { ManageProductList } from '../../../widgets/manage-product-list';

export function AdminPage() {
  const isAdmin = useAdminAuthStore((state) => state.isAdmin);
  const isChecking = useAdminAuthStore((state) => state.isChecking);
  const checkSession = useAdminAuthStore((state) => state.checkSession);
  const logout = useAdminAuthStore((state) => state.logout);

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
    <div className="container mx-auto p-8 font-sans">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <AddProductForm />
        </div>
        <div className="lg:col-span-2">
          <ManageProductList />
        </div>
      </div>
    </div>
  );
}

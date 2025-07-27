//  역할: 현재 메뉴 목록을 보여주고, 삭제 기능을 제공합니다.
'use client';

import { useEffect } from 'react';
import { useProductStore } from '../../../features/product-management/model/store';

export function ManageProductList() {
  // ✅ 상품 목록 데이터와 기능 모두 스토어에서 가져옵니다.
  const { products, isLoading, fetchProducts, deleteProduct } = useProductStore();

  // ✅ 위젯이 처음 화면에 나타날 때, 상품 목록을 불러오는 함수를 실행합니다.
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">메뉴 목록</h2>
      <div className="space-y-3">
        {isLoading ? <p>로딩 중...</p> : products.map(product => (
          <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-gray-500">{product.price.toLocaleString()}원</p>
              </div>
            </div>
            <button onClick={() => deleteProduct(product._id)} className="text-red-500 hover:text-red-700 font-semibold">
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

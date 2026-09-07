// @owner: ai
//  역할: 현재 메뉴 목록을 보여주고, 수정/품절 처리/삭제 기능을 제공합니다.
'use client';

import { useEffect, useState } from 'react';
import { useProductStore } from '../../../features/product-management';
import { EditProductForm } from './EditProductForm';

export function ManageProductList() {
  // ✅ 상품 목록 데이터와 기능 모두 스토어에서 가져옵니다.
  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const toggleSoldOut = useProductStore((state) => state.toggleSoldOut);
  const deleteProduct = useProductStore((state) => state.deleteProduct);

  // ✅ 지금 수정 폼이 펼쳐져 있는 상품의 id. 한 번에 하나만 수정합니다.
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // ✅ 위젯이 처음 화면에 나타날 때, 상품 목록을 불러오는 함수를 실행합니다.
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">메뉴 목록</h2>
      <div className="space-y-3">
        {isLoading ? <p>로딩 중...</p> : products.map(product => (
          editingProductId === product._id ? (
            <EditProductForm
              key={product._id}
              product={product}
              onCancel={() => setEditingProductId(null)}
            />
          ) : (
            <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`w-12 h-12 rounded-md object-cover ${product.isSoldOut ? 'opacity-40 grayscale' : ''}`}
                />
                <div>
                  <p className="flex items-center gap-2 font-semibold">
                    {product.name}
                    {product.isSoldOut && (
                      <span className="rounded-full bg-gray-400 px-2 py-0.5 text-xs font-semibold text-white">
                        품절
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">{product.price.toLocaleString()}원</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleSoldOut(product._id, !product.isSoldOut)}
                  className="font-semibold text-gray-500 hover:text-gray-700"
                >
                  {product.isSoldOut ? '판매 재개' : '품절 처리'}
                </button>
                <button
                  onClick={() => setEditingProductId(product._id)}
                  className="text-pink-500 hover:text-pink-700 font-semibold"
                >
                  수정
                </button>
                <button onClick={() => deleteProduct(product._id)} className="text-red-500 hover:text-red-700 font-semibold">
                  삭제
                </button>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

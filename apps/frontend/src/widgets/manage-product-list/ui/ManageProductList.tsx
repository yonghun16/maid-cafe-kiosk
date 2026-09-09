// @owner: ai
//  역할: 현재 메뉴 목록을 보여주고, 수정/품절 처리/삭제 기능을 제공합니다.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useProductStore } from '../../../features/product-management';
import { Modal } from '../../../shared/ui';
import { EditProductForm } from './EditProductForm';

interface ManageProductListProps {
  /** 'all'이면 전체, 아니면 이 이름과 category가 같은 상품만 보여줍니다. */
  selectedCategory: string;
}

export function ManageProductList({ selectedCategory }: ManageProductListProps) {
  // ✅ 상품 목록 데이터와 기능 모두 스토어에서 가져옵니다.
  const products = useProductStore((state) => state.products);
  const isLoading = useProductStore((state) => state.isLoading);
  const fetchProducts = useProductStore((state) => state.fetchProducts);
  const toggleSoldOut = useProductStore((state) => state.toggleSoldOut);
  const deleteProduct = useProductStore((state) => state.deleteProduct);
  const moveProduct = useProductStore((state) => state.moveProduct);
  const reorderLocally = useProductStore((state) => state.reorderLocally);
  const commitProductOrder = useProductStore((state) => state.commitProductOrder);
  const adjustStock = useProductStore((state) => state.adjustStock);

  // ✅ 지금 수정 폼이 펼쳐져 있는 상품의 id. 한 번에 하나만 수정합니다.
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  // ✅ 지금 드래그로 옮기고 있는 상품의 id.
  const [draggedId, setDraggedId] = useState<string | null>(null);
  // 각 상품 행의 DOM 엘리먼트를 담아뒀다가, 드래그 중 포인터가 어느 행
  // 위에 있는지 판단(hit-test)하는 데 씁니다.
  const productRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // ✅ 위젯이 처음 화면에 나타날 때, 상품 목록을 불러오는 함수를 실행합니다.
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const visibleProducts =
    selectedCategory === 'all' ? products : products.filter((p) => p.category === selectedCategory);

  // ✅ 수정 모달에 띄울 상품. 목록 필터와 무관하게 항상 찾을 수 있도록
  // 전체 상품 목록에서 찾습니다.
  const editingProduct = products.find((p) => p._id === editingProductId) ?? null;

  // ✅ 순서는 카테고리 안에서만 의미가 있어서, 특정 카테고리를 골랐을
  // 때만(=화면에 그 카테고리 상품만 보일 때만) 드래그/버튼 순서 변경을
  // 허용합니다. "전체"를 보고 있을 땐 여러 카테고리가 섞여 있어 순서
  // 변경이 무의미하므로 숨깁니다.
  const canReorder = selectedCategory !== 'all';

  useEffect(() => {
    if (!draggedId || !canReorder) return;

    const handlePointerMove = (e: PointerEvent) => {
      let hoveredId: string | null = null;
      productRefs.current.forEach((el, id) => {
        if (id === draggedId) return;
        const rect = el.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          hoveredId = id;
        }
      });
      if (hoveredId) {
        const targetIndex = visibleProducts.findIndex((p) => p._id === hoveredId);
        if (targetIndex !== -1) {
          reorderLocally(draggedId, targetIndex);
        }
      }
    };

    const handlePointerUp = () => {
      setDraggedId(null);
      commitProductOrder(selectedCategory);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggedId, canReorder, visibleProducts, reorderLocally, commitProductOrder, selectedCategory]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-700 mb-5">
        메뉴 목록{selectedCategory !== 'all' && ` · ${selectedCategory}`}
      </h2>
      <div className="space-y-4">
        {isLoading ? (
          <p>로딩 중...</p>
        ) : visibleProducts.length === 0 ? (
          <p className="text-gray-400">이 카테고리에는 메뉴가 없습니다.</p>
        ) : (
          visibleProducts.map((product, index) => (
            <div
              key={product._id}
              ref={(el) => {
                if (el) productRefs.current.set(product._id, el);
                else productRefs.current.delete(product._id);
              }}
              className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg ${
                draggedId === product._id ? 'opacity-40' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {canReorder && (
                  <span
                    onPointerDown={() => setDraggedId(product._id)}
                    aria-label="드래그해서 순서 변경"
                    className="touch-none cursor-grab select-none px-1 text-lg text-gray-300 active:cursor-grabbing"
                  >
                    ⠿
                  </span>
                )}
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`h-20 w-20 rounded-md object-cover ${product.isSoldOut ? 'opacity-40 grayscale' : ''}`}
                />
                <div>
                  <p className="flex items-center gap-2 text-lg font-semibold">
                    {product.name}
                    {product.isSoldOut && (
                      <span className="rounded-full bg-gray-400 px-2.5 py-1 text-sm font-semibold text-white">
                        품절
                      </span>
                    )}
                  </p>
                  <p className="text-base text-gray-500">{product.price.toLocaleString()}원</p>
                  {product.stock != null && (
                    <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                      재고 {product.stock}개
                      <button
                        type="button"
                        onClick={() => adjustStock(product._id, Math.max(product.stock! - 1, 0))}
                        aria-label="재고 1 감소"
                        className="rounded border border-gray-300 px-1.5 leading-tight hover:bg-gray-100"
                      >
                        －
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustStock(product._id, product.stock! + 1)}
                        aria-label="재고 1 증가"
                        className="rounded border border-gray-300 px-1.5 leading-tight hover:bg-gray-100"
                      >
                        ＋
                      </button>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-base">
                {canReorder && (
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => moveProduct(product._id, 'up')}
                      disabled={index === 0}
                      aria-label="위로 이동"
                      className="leading-none text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => moveProduct(product._id, 'down')}
                      disabled={index === visibleProducts.length - 1}
                      aria-label="아래로 이동"
                      className="leading-none text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                )}
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
        )
        )}
      </div>
      <Modal isOpen={editingProduct != null} onClose={() => setEditingProductId(null)} title="메뉴 수정">
        {editingProduct && (
          <EditProductForm product={editingProduct} onCancel={() => setEditingProductId(null)} />
        )}
      </Modal>
    </div>
  );
}

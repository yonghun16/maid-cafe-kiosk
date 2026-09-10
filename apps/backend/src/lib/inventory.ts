// @owner: ai
import type { OrderItem } from '@repo/types';
import Product from '../models/Product';

/**
 * 주문에 담긴 아이템만큼 상품 재고를 줄입니다. 재고를 추적하지 않는
 * 상품(`stock`이 없음)은 건너뜁니다. 재고가 0 이하로 떨어지면 자동으로
 * `isSoldOut: true`가 됩니다. 재고 갱신은 주문 성공 여부에 영향을 주지
 * 않도록 호출 쪽에서 별도로 감싸 처리합니다([[재고관리]] 참고).
 */
export async function decrementStockForOrder(items: OrderItem[]): Promise<void> {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock == null) continue;
    const nextStock = Math.max(product.stock - item.quantity, 0);
    product.stock = nextStock;
    if (nextStock <= 0) product.isSoldOut = true;
    await product.save();
  }
}

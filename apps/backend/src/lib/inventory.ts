// @owner: ai
import type mongoose from 'mongoose';
import Product from '../models/Product';

// 저장된 주문 문서(OrderItemDocument)의 productId는 ObjectId, 주문 생성
// 요청 바디(OrderItem)의 productId는 string이라 둘 다 받을 수 있게 합니다.
interface StockAdjustableItem {
  productId: string | mongoose.Types.ObjectId;
  quantity: number;
}

/**
 * 주문에 담긴 아이템만큼 상품 재고를 줄입니다. 재고를 추적하지 않는
 * 상품(`stock`이 없음)은 건너뜁니다. 재고가 0 이하로 떨어지면 자동으로
 * `isSoldOut: true`가 됩니다. 재고 갱신은 주문 성공 여부에 영향을 주지
 * 않도록 호출 쪽에서 별도로 감싸 처리합니다([[재고관리]] 참고).
 */
export async function decrementStockForOrder(items: StockAdjustableItem[]): Promise<void> {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock == null) continue;
    const nextStock = Math.max(product.stock - item.quantity, 0);
    product.stock = nextStock;
    if (nextStock <= 0) product.isSoldOut = true;
    await product.save();
  }
}

/**
 * 주문 취소 시 `decrementStockForOrder`로 줄였던 재고를 되돌립니다. 재고를
 * 추적하지 않는 상품(`stock`이 없음)은 건너뜁니다. 재고가 다시 0보다
 * 커지면 자동 품절(`isSoldOut`)도 함께 풀어줍니다([[재고관리]],
 * [[주문취소]] 참고).
 */
export async function restoreStockForOrder(items: StockAdjustableItem[]): Promise<void> {
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.stock == null) continue;
    const nextStock = product.stock + item.quantity;
    product.stock = nextStock;
    if (nextStock > 0) product.isSoldOut = false;
    await product.save();
  }
}

// 상품 정보 타입
export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: 'coffee' | 'ade' | 'dessert'; // 예시 카테고리
}

// 장바구니 아이템 타입 (상품 정보에 수량을 추가)
export interface CartItem extends Product {
  quantity: number;
}

// 주문 정보 타입
export interface Order {
  _id: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
}

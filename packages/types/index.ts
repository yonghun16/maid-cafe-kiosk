// @owner: ai

// 상품 정보 타입
export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: 'coffee' | 'ade' | 'dessert'; // 예시 카테고리
  isSoldOut?: boolean; // 품절 여부. 없으면 판매 중으로 취급
}

// 장바구니 아이템 타입 (상품 정보에 수량을 추가)
export interface CartItem extends Product {
  quantity: number;
}

// 매장 내(dine-in) / 포장(takeout) 구분
export type OrderType = 'dine-in' | 'takeout';

// 주문에 담긴 아이템 하나의 타입. 이름/가격/이미지를 주문 시점 스냅샷으로
// 남기고 상품 자체(카테고리 등)는 참조하지 않습니다 — 나중에 상품이
// 수정/삭제돼도 과거 주문 내역은 그대로 남아야 하기 때문입니다. 이미지는
// 주방에서 어떤 메뉴인지 한눈에 알아보기 위해 포함합니다.
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

// 주문 정보 타입
export interface Order {
  _id: string;
  items: OrderItem[];
  totalPrice: number;
  orderType: OrderType;
  createdAt: Date;
}

// 주문 생성 요청(POST /api/orders)의 바디 타입 — 프론트/백엔드가 공유하는 계약
export interface CreateOrderInput {
  items: OrderItem[];
  totalPrice: number;
  orderType: OrderType;
}

// 이미지 업로드 응답(POST /api/uploads)의 바디 타입 — 프론트/백엔드가 공유하는 계약
export interface UploadImageResponse {
  url: string;
}

// 관리자 로그인 요청(POST /api/admin/login)의 바디 타입 — 프론트/백엔드가 공유하는 계약
export interface AdminLoginInput {
  password: string;
}

// 관리자 인증 상태 응답(POST /api/admin/login, GET /api/admin/session,
// POST /api/admin/logout)의 바디 타입 — 프론트/백엔드가 공유하는 계약
export interface AdminSessionResponse {
  isAdmin: boolean;
}

// 품절 상태 변경 요청(PATCH /api/products/:id/sold-out)의 바디 타입 —
// 프론트/백엔드가 공유하는 계약
export interface UpdateSoldOutInput {
  isSoldOut: boolean;
}

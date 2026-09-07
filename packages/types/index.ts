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

// 주문 정보 타입
export interface Order {
  _id: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
}

// 주문 생성 요청(POST /api/orders)의 아이템 하나에 대한 타입
export interface CreateOrderItemInput {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// 주문 생성 요청(POST /api/orders)의 바디 타입 — 프론트/백엔드가 공유하는 계약
export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  totalPrice: number;
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

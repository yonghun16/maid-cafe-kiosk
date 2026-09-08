// @owner: ai

// 상품 정보 타입
export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string; // Category.name 값. 관리자가 자유롭게 추가/수정/삭제 가능
  order: number; // 같은 카테고리 안에서의 노출 순서. 값이 작을수록 앞에 표시됨
  isSoldOut?: boolean; // 품절 여부. 없으면 판매 중으로 취급
}

// 상품 생성/수정 요청(POST/PUT /api/products)의 바디 타입 — 프론트/백엔드가
// 공유하는 계약. `order`는 서버가 정하므로(생성 시 맨 뒤로 배정, 순서
// 변경은 별도 API) 여기 포함하지 않습니다.
export interface ProductInput {
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

// 상품 순서 변경 요청(PATCH /api/products/reorder)의 바디 타입 — 같은
// 카테고리 안에서 원하는 순서대로 나열한 상품 id 배열을 그대로 보냅니다.
export interface ReorderProductsInput {
  orderedIds: string[];
}

// 메뉴 카테고리 타입. 상품의 `category` 필드는 이 이름을 그대로 참조합니다
// (별도 id 참조가 아니라 이름 문자열 매칭 — 카테고리 이름을 바꾸면 그
// 이름을 쓰던 상품도 함께 갱신됩니다).
export interface Category {
  _id: string;
  name: string;
  order: number; // 값이 작을수록 앞에 표시됨
}

// 카테고리 생성/수정 요청(POST/PUT /api/categories)의 바디 타입 —
// 프론트/백엔드가 공유하는 계약
export interface CategoryInput {
  name: string;
}

// 카테고리 순서 변경 요청(PATCH /api/categories/reorder)의 바디 타입 —
// 원하는 순서대로 나열한 카테고리 id 배열을 그대로 보냅니다.
export interface ReorderCategoriesInput {
  orderedIds: string[];
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
  orderNumber: number; // 당일(KST) 자정 기준 1부터 다시 매기는 짧은 주문번호
  items: OrderItem[];
  totalPrice: number;
  orderType: OrderType;
  isCompleted: boolean; // true면 지난 주문(완료)으로 취급
  createdAt: Date;
}

// 주문 목록 조회(GET /api/orders) 시 진행중/지난 주문을 나누는 필터 값
export type OrderStatusFilter = 'pending' | 'completed';

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

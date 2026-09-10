// @owner: ai

// 메뉴별로 관리자가 자유롭게 추가하는 옵션 하나(예: "샷 추가" +700원,
// "펄 추가" +500원). 온도/마법의 주문처럼 매장 전체에 고정된 옵션과는
// 별개로, 메뉴마다 다르게 설정할 수 있는 옵션입니다([[옵션조합관리]]
// 참고). `price`는 0원도 허용합니다(가격 영향 없는 옵션도 만들 수 있게).
export interface ProductOption {
  name: string;
  price: number;
}

// 상품 정보 타입
export interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string; // Category.name 값. 관리자가 자유롭게 추가/수정/삭제 가능
  order: number; // 같은 카테고리 안에서의 노출 순서. 값이 작을수록 앞에 표시됨
  isSoldOut?: boolean; // 품절 여부. 없으면 판매 중으로 취급
  // 재고 수량. 상품마다 선택적으로만 추적합니다 — 값이 없으면(`undefined`)
  // 이 메뉴는 재고 추적을 안 하는 상품이라는 뜻이고, 품절 처리는 여전히
  // 수동 토글로만 이뤄집니다. 값이 있으면 주문 시마다 자동으로 줄고,
  // 0이 되면 자동으로 `isSoldOut: true`가 됩니다([[재고관리]] 참고).
  stock?: number;
  // 이 메뉴에서 고객이 추가로 고를 수 있는 옵션 목록. 없거나 빈 배열이면
  // 이 메뉴엔 커스텀 옵션이 없다는 뜻입니다.
  options?: ProductOption[];
}

// 상품 생성/수정 요청(POST/PUT /api/products)의 바디 타입 — 프론트/백엔드가
// 공유하는 계약. `order`는 서버가 정하므로(생성 시 맨 뒤로 배정, 순서
// 변경은 별도 API) 여기 포함하지 않습니다. `stock`은 선택 필드이며,
// 생략하면 재고를 추적하지 않는 상품이 됩니다.
export interface ProductInput {
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock?: number;
  options?: ProductOption[];
}

// 상품 순서 변경 요청(PATCH /api/products/reorder)의 바디 타입 — 같은
// 카테고리 안에서 원하는 순서대로 나열한 상품 id 배열을 그대로 보냅니다.
export interface ReorderProductsInput {
  orderedIds: string[];
}

// 재고 수량 변경 요청(PATCH /api/products/:id/stock)의 바디 타입 —
// 프론트/백엔드가 공유하는 계약. 절대값으로 설정합니다(증감이 아님).
export interface UpdateStockInput {
  stock: number;
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
  // 장바구니 안에서 이 줄을 구분하는 고유 id. 같은 상품이라도 옵션
  // 조합(예: 마법의 주문, 온도, 커스텀 옵션)이 다르면 다른 줄로
  // 취급해야 해서, 상품 `_id`와는 별도로 둡니다.
  cartItemId: string;
  // "마법의 주문" 선택값(예: '모에모에뀽'). 가격에는 영향 없는 메이드
  // 카페 컨셉의 재미 옵션이라, 값이 없으면 선택 안 한 것으로 취급합니다.
  magicSpell?: string;
  // HOT/ICE 온도 선택. 가격에는 영향 없고, 값이 없으면 선택 안 한
  // 것으로 취급합니다.
  temperature?: 'HOT' | 'ICE';
  // 이 메뉴에 등록된 커스텀 옵션(`Product.options`) 중 고객이 고른 것들.
  // 이름/가격을 선택 시점 스냅샷으로 담아, 이후 관리자가 메뉴 옵션을
  // 바꿔도 이미 담긴 장바구니/주문 내역은 그대로 유지됩니다.
  selectedOptions?: ProductOption[];
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
  price: number; // 옵션 추가금이 있으면 이미 더해진 최종 단가
  imageUrl: string;
  quantity: number;
  // 샷 추가 옵션을 골랐는지 여부. 예전엔 매장 전체 고정 옵션이었지만
  // 이제는 메뉴별 커스텀 옵션(`selectedOptions`)으로 등록하는 방식으로
  // 바뀌어서, 이 필드는 그 이전에 생성된 주문에만 남아있습니다
  // ([[옵션조합관리]] 참고).
  hasExtraShot?: boolean;
  // "마법의 주문" 선택값. 가격에는 영향 없습니다.
  magicSpell?: string;
  // HOT/ICE 온도 선택. 가격에는 영향 없습니다.
  temperature?: 'HOT' | 'ICE';
  // 이 아이템에 고른 커스텀 옵션들(이름/가격 스냅샷). `price`에는 이미
  // 이 옵션들의 가격이 더해져 있습니다.
  selectedOptions?: ProductOption[];
  // MongoDB가 하위 문서에 자동으로 부여하는 id. 주문 생성 요청 바디에는
  // 없고(서버가 저장하며 채움), 저장된 주문을 조회할 때만 내려옵니다 —
  // 같은 상품이 옵션만 다르게 두 줄로 들어간 경우를 구분하는 key로 씁니다.
  _id?: string;
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

// 월별 매출/판매량 추이 조회(GET /api/orders/stats/monthly)의 응답
// 배열 원소 타입. `month`는 KST 기준 'YYYY-MM'. 주문이 없는 달도 0으로
// 채워서 내려주므로, 배열 길이는 항상 요청한 개월 수와 같습니다
// ([[매출통계대시보드]] 참고).
export interface MonthlySalesSummary {
  month: string;
  totalRevenue: number;
  totalQuantity: number;
  orderCount: number;
}

// 특정 월의 메뉴별 판매 순위 조회(GET /api/orders/stats/monthly/:month)의
// 응답 배열 원소 타입. `quantitySold` 내림차순으로 정렬돼서 내려옵니다.
export interface ProductSalesRanking {
  productId: string;
  name: string;
  imageUrl: string;
  quantitySold: number;
  revenue: number;
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

// 첫 화면(매장/포장 선택 화면)에 보여주는 광고 배너 타입.
export interface Ad {
  _id: string;
  imageUrl: string;
  order: number; // 노출 순서. 값이 작을수록 앞에 표시됨
  createdAt: Date;
}

// 광고 생성/수정 요청(POST/PUT /api/ads)의 바디 타입 — 프론트/백엔드가
// 공유하는 계약. `order`는 서버가 정하므로(생성 시 맨 뒤로 배정, 순서
// 변경은 별도 API) 여기 포함하지 않습니다.
export interface AdInput {
  imageUrl: string;
}

// 광고 순서 변경 요청(PATCH /api/ads/reorder)의 바디 타입 — 원하는
// 순서대로 나열한 광고 id 배열을 그대로 보냅니다.
export interface ReorderAdsInput {
  orderedIds: string[];
}

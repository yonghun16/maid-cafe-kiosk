// @owner: ai
import Product from '../models/Product';
import Category from '../models/Category';
import Ad from '../models/Ad';

/**
 * Category 컬렉션이 비어 있으면 기존 `Product.category` 값들로부터 자동
 * 생성합니다. 카테고리가 고정 enum에서 자유 입력으로 바뀌면서, 이미 저장된
 * 상품들이 쓰던 카테고리 이름이 최소 하나씩은 목록에 등록돼 있도록
 * 보장하기 위한 1회성 시딩입니다. 이미 카테고리가 하나라도 있으면
 * 아무 것도 하지 않습니다.
 */
async function ensureDefaultCategories(): Promise<void> {
  const existingCount = await Category.countDocuments();
  if (existingCount > 0) return;

  const distinctCategoryNames = await Product.distinct('category');
  if (distinctCategoryNames.length === 0) return;

  await Category.insertMany(
    distinctCategoryNames.map((name, index) => ({ name, order: index })),
  );
  console.log(`✅ 기존 상품 카테고리로부터 Category ${distinctCategoryNames.length}개를 초기화했습니다.`);
}

/**
 * `order` 필드가 도입되기 전에 만들어진 카테고리(값이 없는 카테고리)에
 * 순서를 부여합니다. 기존 화면에 보이던 이름순 그대로 이어지도록
 * 이름순으로 정렬해 번호를 매깁니다. 1회성·멱등이며, 대상이 없으면
 * 아무 것도 하지 않습니다.
 */
async function ensureCategoryOrder(): Promise<void> {
  const unordered = await Category.find({ order: { $exists: false } }).sort({ name: 1 });
  if (unordered.length === 0) return;

  const lastOrdered = await Category.findOne({ order: { $exists: true } }).sort({ order: -1 });
  let nextOrder = lastOrdered ? lastOrdered.order + 1 : 0;

  for (const category of unordered) {
    category.order = nextOrder;
    await category.save();
    nextOrder += 1;
  }
  console.log(`✅ 순서가 없던 카테고리 ${unordered.length}개에 순서를 지정했습니다.`);
}

/**
 * `order` 필드가 도입되기 전에 만들어진 상품(값이 없는 상품)에 카테고리별
 * 순서를 부여합니다. 상품 순서는 카테고리 안에서만 의미가 있으므로,
 * 기존 생성순 그대로 이어지도록 생성순으로 정렬해 카테고리마다 0부터
 * 번호를 매깁니다. 1회성·멱등이며, 대상이 없으면 아무 것도 하지 않습니다.
 */
async function ensureProductOrder(): Promise<void> {
  const unordered = await Product.find({ order: { $exists: false } }).sort({ _id: 1 });
  if (unordered.length === 0) return;

  const nextOrderByCategory: Record<string, number> = {};
  for (const product of unordered) {
    const order = nextOrderByCategory[product.category] ?? 0;
    product.order = order;
    await product.save();
    nextOrderByCategory[product.category] = order + 1;
  }
  console.log(`✅ 순서가 없던 상품 ${unordered.length}개에 카테고리별 순서를 지정했습니다.`);
}

/**
 * `order` 필드가 도입되기 전에 만들어진 광고(값이 없는 광고)에 순서를
 * 부여합니다. 기존에 보이던 순서(등록순)를 그대로 이어가도록 생성
 * 시각순으로 정렬해 0부터 번호를 매깁니다. 1회성·멱등이며, 대상이
 * 없으면 아무 것도 하지 않습니다.
 */
async function ensureAdOrder(): Promise<void> {
  const unordered = await Ad.find({ order: { $exists: false } }).sort({ createdAt: 1 });
  if (unordered.length === 0) return;

  let nextOrder = 0;
  for (const ad of unordered) {
    ad.order = nextOrder;
    await ad.save();
    nextOrder += 1;
  }
  console.log(`✅ 순서가 없던 광고 ${unordered.length}개에 순서를 지정했습니다.`);
}

/**
 * 온도 옵션이 `hasTemperatureOption`(boolean) 하나였던 옛 스키마의
 * 상품을 `temperatureOption`(`'BOTH' | 'HOT' | 'ICE'`) 필드로 옮깁니다.
 * `hasTemperatureOption: true`는 "HOT/ICE 둘 다 고를 수 있음"을
 * 뜻했으므로 그대로 `'BOTH'`로 매핑합니다([[옵션조합관리]] 참고).
 * 스키마에서 이미 빠진 필드를 다루므로 Mongoose 문서가 아니라
 * 드라이버 컬렉션에 직접 접근합니다. 1회성·멱등이며, 옮길 대상이
 * 없으면 아무 것도 하지 않습니다.
 */
async function migrateTemperatureOption(): Promise<void> {
  const migrated = await Product.collection.updateMany(
    { hasTemperatureOption: true, temperatureOption: { $exists: false } },
    { $set: { temperatureOption: 'BOTH' } },
  );
  if (migrated.modifiedCount > 0) {
    console.log(
      `✅ hasTemperatureOption(boolean)을 쓰던 상품 ${migrated.modifiedCount}개를 temperatureOption('BOTH')로 이전했습니다.`,
    );
  }
  // 옛 boolean 필드는 이전 여부와 무관하게 더 이상 쓰이지 않으니 정리합니다.
  await Product.collection.updateMany(
    { hasTemperatureOption: { $exists: true } },
    { $unset: { hasTemperatureOption: '' } },
  );
}

/**
 * 서버 시작 시 한 번 돌아가는 1회성·멱등 마이그레이션/시딩을 전부
 * 실행합니다. MongoDB 연결이 완료된 직후 호출합니다.
 */
export async function runStartupSeed(): Promise<void> {
  await ensureDefaultCategories();
  await ensureCategoryOrder();
  await ensureProductOrder();
  await ensureAdOrder();
  await migrateTemperatureOption();
}

// @owner: ai
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import Toast from 'react-native-toast-message';
import type { Category, Product } from '@repo/types';
import { ProductCard, getProducts } from '../../../entities/product';
import { getCategories } from '../../../entities/category';
import { useCartStore } from '../../../features/cart';

// ✅ HomePage와 동일한 이유로 `md:w-3/5` 같은 반응형 구조 클래스 대신
// `useWindowDimensions`로 직접 판단합니다([[태블릿레이아웃]] 참고).
const TABLET_BREAKPOINT = 768;
// ✅ 카테고리 탭 좌우 화살표 버튼을 한 번 누를 때 이동하는 픽셀 양.
const CATEGORY_SCROLL_STEP = 160;

export function ProductList() {
  const { width } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ✅ 손님은 "전체보기"에서 메뉴를 고르지 않고 항상 카테고리를 먼저
  // 골라 담기 때문에, "전체" 옵션 없이 첫 카테고리를 기본 선택으로 둡니다.
  const [selectedCategory, setSelectedCategory] = useState('');
  const addToCart = useCartStore((state) => state.addToCart);
  const listRef = useRef<FlatList>(null);
  const categoryScrollRef = useRef<ScrollView>(null);
  // ✅ 리렌더 없이 현재 스크롤 위치만 기억해뒀다가, 화살표 버튼을 눌렀을
  // 때 그 위치를 기준으로 이동시키는 데 씁니다.
  const categoryScrollOffsetRef = useRef(0);

  const handlePressCategoryArrow = (direction: 'left' | 'right') => {
    const delta = direction === 'left' ? -CATEGORY_SCROLL_STEP : CATEGORY_SCROLL_STEP;
    const nextOffset = Math.max(0, categoryScrollOffsetRef.current + delta);
    categoryScrollRef.current?.scrollTo({ x: nextOffset, animated: true });
  };

  // ✅ 카테고리를 바꾸면 이전 카테고리에서 스크롤해둔 위치가 그대로
  // 남아있어 새 목록의 중간부터 보이는 문제가 있어서, 카테고리를 누를
  // 때마다 목록을 맨 위로 되돌립니다.
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [products, categoryList] = await Promise.all([getProducts(), getCategories()]);
        setAllProducts(products);
        setCategories(categoryList);
        setSelectedCategory(categoryList[0]?.name ?? '');
      } catch (error) {
        console.error('메뉴 목록을 불러오는 중 오류가 발생했습니다:', error);
        Toast.show({ type: 'error', text1: '메뉴 목록을 불러오는 데 실패했습니다.' });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredProducts = selectedCategory
    ? allProducts.filter((product) => product.category === selectedCategory)
    : allProducts;

  // ✅ FlatList의 2열 그리드는 마지막 줄에 상품이 하나만 남으면 그 카드가
  // flex-1 때문에 줄 전체 너비로 늘어나 버립니다. `null` 채움 칸을 하나
  // 더 넣어(보이지 않는 빈 View로 렌더링) 항상 2칸이 채워지게 합니다.
  const dataWithFiller: (Product | null)[] =
    filteredProducts.length % 2 !== 0 ? [...filteredProducts, null] : filteredProducts;

  return (
    <View className={isTablet ? 'flex-none' : 'flex-1'} style={isTablet ? { width: '60%' } : undefined}>
      {/* ✅ 카테고리가 많아 한 줄에 다 안 들어가면 줄바꿈되던 것을,
          한 줄로 고정하고 대신 옆으로 드래그하거나 좌우 화살표 버튼으로
          넘기게 바꿨습니다(웹의 헤더 도킹 카테고리 바 `variant="scroll"`과
          동일한 의도). */}
      <View className="flex-row items-center gap-1 pl-2 pr-3 pt-4 pb-2">
        <Pressable
          onPress={() => handlePressCategoryArrow('left')}
          hitSlop={8}
          className="items-center justify-center rounded-full bg-white p-1.5 shadow-sm md:p-3"
        >
          <Text className="text-xs text-gray-400 md:text-xl">◀</Text>
        </Pressable>
        <ScrollView
          ref={categoryScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            categoryScrollOffsetRef.current = event.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}
          contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 8 }}
        >
          {categories.map((category) => (
            <Pressable
              key={category._id}
              onPress={() => handleSelectCategory(category.name)}
              className={
                selectedCategory === category.name
                  ? 'rounded-full bg-pink-500 px-4 py-2 md:px-8 md:py-4'
                  : 'rounded-full border border-pink-100 bg-white px-4 py-2 md:px-8 md:py-4'
              }
            >
              <Text
                className={
                  selectedCategory === category.name
                    ? 'text-sm font-semibold text-white md:text-2xl'
                    : 'text-sm font-semibold text-gray-600 md:text-2xl'
                }
              >
                {category.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable
          onPress={() => handlePressCategoryArrow('right')}
          hitSlop={8}
          className="items-center justify-center rounded-full bg-white p-1.5 shadow-sm md:p-3"
        >
          <Text className="text-xs text-gray-400 md:text-xl">▶</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#ec4899" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={dataWithFiller}
          keyExtractor={(item, index) => item?._id ?? `filler-${index}`}
          numColumns={2}
          columnWrapperStyle={{ gap: 12, paddingHorizontal: 16 }}
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
          renderItem={({ item }) =>
            item ? <ProductCard product={item} onAddToCart={addToCart} /> : <View style={{ flex: 1 }} />
          }
        />
      )}
    </View>
  );
}

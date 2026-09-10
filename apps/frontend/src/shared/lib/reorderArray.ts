// @owner: ai
/**
 * `id`를 가진 항목을 `toIndex` 위치로 옮긴 새 배열을 반환합니다. 옮길 게
 * 없으면(대상을 못 찾았거나, 범위를 벗어났거나, 이미 그 자리라면) null을
 * 반환합니다. 카테고리/광고처럼 "전체를 통틀어 하나의 순서"만 갖는
 * 목록의 드래그 재배치에 씁니다(카테고리 안에서만 순서가 의미 있는
 * 상품 재배치는 이 함수로 표현할 수 없어 별도로 둡니다).
 */
export function reorderArray<T extends { _id: string }>(
  items: T[],
  id: string,
  toIndex: number,
): T[] | null {
  const fromIndex = items.findIndex((item) => item._id === id);
  if (fromIndex === -1 || toIndex < 0 || toIndex >= items.length || fromIndex === toIndex) {
    return null;
  }
  const reordered = [...items];
  const moved = reordered[fromIndex];
  if (!moved) return null;
  reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered;
}

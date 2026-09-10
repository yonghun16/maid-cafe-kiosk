// @owner: ai
import { describe, expect, it } from 'vitest';
import { reorderArray } from './reorderArray';

interface Item {
  _id: string;
  name: string;
}

const items: Item[] = [
  { _id: 'a', name: 'A' },
  { _id: 'b', name: 'B' },
  { _id: 'c', name: 'C' },
];

describe('reorderArray', () => {
  it('앞에 있던 항목을 뒤로 옮긴다', () => {
    const result = reorderArray(items, 'a', 2);
    expect(result?.map((i) => i._id)).toEqual(['b', 'c', 'a']);
  });

  it('뒤에 있던 항목을 앞으로 옮긴다', () => {
    const result = reorderArray(items, 'c', 0);
    expect(result?.map((i) => i._id)).toEqual(['c', 'a', 'b']);
  });

  it('원본 배열을 변형하지 않는다', () => {
    reorderArray(items, 'a', 2);
    expect(items.map((i) => i._id)).toEqual(['a', 'b', 'c']);
  });

  it('존재하지 않는 id는 null을 반환한다', () => {
    expect(reorderArray(items, '없는id', 1)).toBeNull();
  });

  it('이미 그 자리면 null을 반환한다', () => {
    expect(reorderArray(items, 'b', 1)).toBeNull();
  });

  it('범위를 벗어난 인덱스는 null을 반환한다', () => {
    expect(reorderArray(items, 'a', -1)).toBeNull();
    expect(reorderArray(items, 'a', 99)).toBeNull();
  });
});

// @owner: ai
import { beforeEach, describe, expect, it } from 'vitest';
import { useOrderTypeStore } from './store';

beforeEach(() => {
  useOrderTypeStore.setState({ orderType: null });
});

describe('useOrderTypeStore', () => {
  it('초기값은 null이다(매장/포장 선택 화면이 먼저 뜸)', () => {
    expect(useOrderTypeStore.getState().orderType).toBeNull();
  });

  it('setOrderType으로 값을 정하고 resetOrderType으로 되돌릴 수 있다', () => {
    useOrderTypeStore.getState().setOrderType('dine-in');
    expect(useOrderTypeStore.getState().orderType).toBe('dine-in');

    useOrderTypeStore.getState().resetOrderType();
    expect(useOrderTypeStore.getState().orderType).toBeNull();
  });
});

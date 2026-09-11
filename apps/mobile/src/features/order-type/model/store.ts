// @owner: ai
import { create } from 'zustand';
import type { OrderType } from '@repo/types';

interface OrderTypeState {
  orderType: OrderType | null;
  setOrderType: (orderType: OrderType) => void;
  resetOrderType: () => void;
}

export const useOrderTypeStore = create<OrderTypeState>((set) => ({
  orderType: null,
  setOrderType: (orderType) => set({ orderType }),
  resetOrderType: () => set({ orderType: null }),
}));

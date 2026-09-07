// @owner: ai
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { fetchAdminSession, loginAsAdmin, logoutAdmin } from '../api/adminAuthApi';

interface AdminAuthState {
  isAdmin: boolean;
  isChecking: boolean;
  isLoggingIn: boolean;
  checkSession: () => Promise<void>;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  isAdmin: false,
  isChecking: true,
  isLoggingIn: false,

  checkSession: async () => {
    try {
      const { isAdmin } = await fetchAdminSession();
      set({ isAdmin, isChecking: false });
    } catch (error) {
      console.error('관리자 세션 확인 중 오류가 발생했습니다:', error);
      set({ isAdmin: false, isChecking: false });
    }
  },

  login: async (password) => {
    set({ isLoggingIn: true });
    try {
      const { isAdmin } = await loginAsAdmin(password);
      set({ isAdmin, isLoggingIn: false });
      return isAdmin;
    } catch (error) {
      console.error('관리자 로그인 중 오류가 발생했습니다:', error);
      toast.error('비밀번호가 올바르지 않습니다.');
      set({ isAdmin: false, isLoggingIn: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error('관리자 로그아웃 중 오류가 발생했습니다:', error);
    } finally {
      set({ isAdmin: false });
    }
  },
}));

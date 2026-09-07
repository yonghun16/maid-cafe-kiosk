// @owner: ai
'use client';

import { useState } from 'react';
import { useAdminAuthStore } from '../model/store';

export function LoginForm() {
  const [password, setPassword] = useState('');
  const login = useAdminAuthStore((state) => state.login);
  const isLoggingIn = useAdminAuthStore((state) => state.isLoggingIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    await login(password);
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg"
      >
        <h1 className="mb-4 text-center text-2xl font-bold text-pink-500">
          🔒 관리자 로그인
        </h1>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-medium text-gray-600">
            비밀번호
          </label>
          <input
            type="password"
            id="admin-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoggingIn || !password}
          className="mt-4 w-full rounded-md bg-pink-500 py-2 px-4 font-bold text-white transition-colors hover:bg-pink-600 disabled:bg-gray-300"
        >
          {isLoggingIn ? '확인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}

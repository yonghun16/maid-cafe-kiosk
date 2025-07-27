// 파일: apps/frontend/app/layout.tsx (수정)
// 역할: 앱 전체에서 토스트 팝업을 표시할 수 있도록 설정합니다.

import type { Metadata } from "next";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

export const metadata: Metadata = {
  title: "메이드 키오스크",
  description: "세상에서 가장 귀여운 메이드 카페 키오스크",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}

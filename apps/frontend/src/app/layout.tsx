// @owner: ai
import type { Metadata, Viewport } from "next";
import { Dancing_Script } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { SerwistProvider } from '@serwist/next/react';
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-dancing-script",
});

export const metadata: Metadata = {
  title: "메이드 키오스크",
  description: "세상에서 가장 귀여운 메이드 카페 키오스크",
  // PWA로 홈 화면에 추가했을 때 아이콘/앱 이름이 뜨게 합니다. 매니페스트
  // (`app/manifest.ts`)는 대부분의 안드로이드/데스크탑에서 쓰이고,
  // iOS Safari는 매니페스트를 부분적으로만 지원해 이 애플 전용 메타
  // 태그가 따로 필요합니다(예: standalone 모드, 상태바 스타일).
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "메이드 키오스크",
  },
};

// themeColor는 Next.js에서 metadata와 분리된 별도 export입니다.
export const viewport: Viewport = {
  themeColor: "#ec4899",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={dancingScript.variable}>
      <body>
        {/* ✅ 서비스워커(`sw.ts`)를 실제로 등록해야 정적 리소스 캐싱과
            주방 화면 새 주문 웹 푸시([[주방알림]])가 동작합니다.
            next.config.js와 동일하게 개발 중에는 비활성화합니다 —
            개발 서버는 sw.js를 빌드하지 않아 등록해도 404입니다. */}
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === 'development'}>
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </SerwistProvider>
      </body>
    </html>
  );
}

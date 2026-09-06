// @owner: ai
import type { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-dancing-script",
});

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
    <html lang="ko" className={dancingScript.variable}>
      <body>
        <Toaster position="top-center" reverseOrder={false} />
        {children}
      </body>
    </html>
  );
}

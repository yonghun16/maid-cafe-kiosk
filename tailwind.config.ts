import type { Config } from "tailwindcss";

const config: Config = {
  // ✅ 이 부분이 가장 중요합니다!
  // 'apps/frontend/app/**/*.{js,ts,jsx,tsx,mdx}' 경로가 반드시 포함되어야 합니다.
  // 이렇게 해야 app 폴더 안의 모든 파일에 작성된 Tailwind 클래스를 인식할 수 있습니다.
  content: [
    "./apps/frontend/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/frontend/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./apps/frontend/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  // FSD 레이어(app/pages/widgets/features/entities/shared) 전체를 스캔해야
  // 각 레이어에서 작성된 Tailwind 클래스를 모두 인식할 수 있습니다.
  content: ["./apps/frontend/src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;

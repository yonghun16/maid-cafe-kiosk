/** @type {import('next').NextConfig} */
const nextConfig = {
  // 프론트엔드(Vercel)와 백엔드(Render)가 서로 다른 사이트라서, 브라우저가
  // 로그인 세션 쿠키를 "서드파티 쿠키"로 취급해 저장을 막거나(Safari ITP,
  // 크롬의 서드파티 쿠키 단계적 폐지 등) 새로고침 후 날려버리는 문제가
  // 있었다. `/api`를 이 Next.js 서버가 백엔드로 그대로 중계(proxy)하게
  // 만들어서, 브라우저 입장에서는 항상 같은 오리진(퍼스트파티)에만 요청을
  // 보내도록 바꾼다.
  async rewrites() {
    const backendOrigin = process.env.BACKEND_ORIGIN ?? 'http://localhost:4000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

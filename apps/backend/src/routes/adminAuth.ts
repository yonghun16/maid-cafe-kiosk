// @owner: ai
import { timingSafeEqual } from 'crypto';
import { Router, type Request, type Response } from 'express';
import type { AdminLoginInput, AdminSessionResponse } from '@repo/types';

export const adminAuthRouter: Router = Router();

/**
 * 관리자 공유 비밀번호를 확인하고, 일치하면 세션에 인증 정보를 기록합니다.
 * 응답 계약은 `@repo/types`의 `AdminSessionResponse`를 따릅니다.
 * @route POST /api/admin/login
 * @param req.body - `@repo/types`의 `AdminLoginInput` (`password`)
 */
adminAuthRouter.post(
  '/login',
  (req: Request<Record<string, never>, unknown, AdminLoginInput>, res: Response) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('❌ 에러: ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.');
      res.status(500).json({ message: '서버에 관리자 인증이 설정되어 있지 않습니다.' });
      return;
    }

    const password = req.body?.password;
    const isValid =
      typeof password === 'string' &&
      password.length === adminPassword.length &&
      timingSafeEqual(Buffer.from(password), Buffer.from(adminPassword));

    if (!isValid) {
      res.status(401).json({ message: '비밀번호가 올바르지 않습니다.' });
      return;
    }

    req.session.isAdmin = true;
    const response: AdminSessionResponse = { isAdmin: true };
    res.status(200).json(response);
  },
);

/**
 * 현재 세션의 관리자 인증 여부를 반환합니다. 프론트엔드가 `/admin` 진입 시
 * 로그인 폼을 보여줄지 판단하는 데 사용합니다.
 * @route GET /api/admin/session
 */
adminAuthRouter.get('/session', (req: Request, res: Response) => {
  const response: AdminSessionResponse = { isAdmin: Boolean(req.session.isAdmin) };
  res.status(200).json(response);
});

/**
 * 관리자 세션을 종료합니다.
 * @route POST /api/admin/logout
 */
adminAuthRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 처리 중 오류가 발생했습니다:', err);
      res.status(500).json({ message: '로그아웃 처리 중 오류가 발생했습니다.' });
      return;
    }
    const response: AdminSessionResponse = { isAdmin: false };
    res.status(200).json(response);
  });
});

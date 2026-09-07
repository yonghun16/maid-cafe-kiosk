// @owner: ai
import type { NextFunction, Request, Response } from 'express';

/**
 * 세션에 관리자 인증 정보(`req.session.isAdmin`)가 없으면 401을 반환하는
 * 미들웨어입니다. 관리자 전용 쓰기 API(메뉴 등록/삭제, 이미지 업로드)를
 * 보호하는 데 사용합니다.
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.isAdmin) {
    res.status(401).json({ message: '관리자 인증이 필요합니다.' });
    return;
  }
  next();
}

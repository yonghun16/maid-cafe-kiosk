// @owner: ai
import { Router, type Request, type Response } from 'express';
import type { PushSubscriptionInput, VapidPublicKeyResponse } from '@repo/types';
import PushSubscription from '../models/PushSubscription';
import { requireAdmin } from '../middleware/requireAdmin';
import { getVapidPublicKey } from '../lib/webPush';

export const pushRouter: Router = Router();

/**
 * 웹 푸시 구독에 필요한 VAPID 공개키를 조회합니다. 비밀값이 아니라
 * 인증 없이 조회할 수 있습니다. 서버에 키가 설정돼 있지 않으면
 * 503으로 알립니다.
 * @route GET /api/push/vapid-public-key
 */
pushRouter.get('/vapid-public-key', (_req: Request, res: Response) => {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    res.status(503).json({ message: '푸시 알림이 서버에 설정되어 있지 않습니다.' });
    return;
  }
  const body: VapidPublicKeyResponse = { publicKey };
  res.json(body);
});

/**
 * 주방 화면의 웹 푸시 구독 정보를 등록합니다. 같은 endpoint가 이미
 * 있으면 최신 키로 덮어씁니다. 관리자 세션이 없으면 `requireAdmin`에서
 * 401로 막습니다.
 * @route POST /api/push/subscribe
 */
pushRouter.post(
  '/subscribe',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, PushSubscriptionInput>, res: Response) => {
    try {
      await PushSubscription.findOneAndUpdate(
        { endpoint: req.body.endpoint },
        { endpoint: req.body.endpoint, keys: req.body.keys },
        { upsert: true },
      );
      res.status(201).json({ message: '구독이 등록되었습니다.' });
    } catch (err) {
      res.status(400).json({ message: '구독 등록 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 주방 화면의 웹 푸시 구독을 해제합니다. 관리자 세션이 없으면
 * `requireAdmin`에서 401로 막습니다.
 * @route POST /api/push/unsubscribe
 */
pushRouter.post(
  '/unsubscribe',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, { endpoint: string }>, res: Response) => {
    try {
      await PushSubscription.deleteOne({ endpoint: req.body.endpoint });
      res.json({ message: '구독이 해제되었습니다.' });
    } catch (err) {
      res.status(400).json({ message: '구독 해제 중 오류가 발생했습니다.' });
    }
  },
);

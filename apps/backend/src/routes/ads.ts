// @owner: ai
import { Router, type Request, type Response } from 'express';
import type { AdInput, ReorderAdsInput } from '@repo/types';
import Ad from '../models/Ad';
import { requireAdmin } from '../middleware/requireAdmin';
import { toClientErrorMessage } from '../lib/errors';

export const adsRouter: Router = Router();

/**
 * 첫 화면(매장/포장 선택 화면)에 보여줄 광고 배너 목록을 지정된 순서
 * (`order`)로 조회합니다. 고객 화면에서도 쓰이므로 인증 없이 공개합니다.
 * @route GET /api/ads
 */
adsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const ads = await Ad.find().sort({ order: 1 });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: '광고 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 새 광고 배너를 등록합니다. 순서는 항상 맨 뒤로 배정됩니다. 관리자
 * 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/ads
 * @param req.body - `@repo/types`의 `AdInput` (`imageUrl`)
 */
adsRouter.post(
  '/',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, AdInput>, res: Response) => {
    try {
      const order = await Ad.countDocuments();
      const ad = new Ad({ imageUrl: req.body.imageUrl, order });
      const newAd = await ad.save();
      res.status(201).json(newAd);
    } catch (err) {
      res.status(400).json({ message: toClientErrorMessage(err, '광고 등록 중 오류가 발생했습니다.') });
    }
  },
);

/**
 * 광고 노출 순서를 한 번에 재배열합니다. 원하는 순서대로 나열한 광고 id
 * 배열을 받아 배열 인덱스를 그대로 `order` 값으로 저장합니다. 관리자
 * 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PATCH /api/ads/reorder
 * @param req.body - `@repo/types`의 `ReorderAdsInput` (`orderedIds`)
 */
adsRouter.patch(
  '/reorder',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, ReorderAdsInput>, res: Response) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ message: 'orderedIds 값이 올바르지 않습니다.' });
      return;
    }
    try {
      await Promise.all(
        orderedIds.map((id, index) => Ad.updateOne({ _id: id }, { $set: { order: index } })),
      );
      const ads = await Ad.find().sort({ order: 1 });
      res.json(ads);
    } catch (err) {
      res.status(400).json({ message: '광고 순서 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 광고 배너 이미지를 교체합니다. 관리자 세션이 없으면 `requireAdmin`에서
 * 401로 막습니다.
 * @route PUT /api/ads/:id
 * @param req.body - `@repo/types`의 `AdInput` (`imageUrl`)
 */
adsRouter.put(
  '/:id',
  requireAdmin,
  async (req: Request<{ id: string }, unknown, AdInput>, res: Response) => {
    try {
      const updatedAd = await Ad.findByIdAndUpdate(
        req.params.id,
        { imageUrl: req.body.imageUrl },
        { new: true, runValidators: true },
      );
      if (!updatedAd) {
        res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
        return;
      }
      res.json(updatedAd);
    } catch (err) {
      res.status(400).json({ message: toClientErrorMessage(err, '광고 수정 중 오류가 발생했습니다.') });
    }
  },
);

/**
 * 광고 배너를 삭제합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로
 * 막습니다.
 * @route DELETE /api/ads/:id
 */
adsRouter.delete('/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) {
      res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
      return;
    }
    await ad.deleteOne();
    res.json({ message: '광고를 삭제했습니다.' });
  } catch (err) {
    res.status(500).json({ message: '광고 삭제 중 오류가 발생했습니다.' });
  }
});

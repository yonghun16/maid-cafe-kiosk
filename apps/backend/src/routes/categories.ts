// @owner: ai
import { Router, type Request, type Response } from 'express';
import type { CategoryInput, ReorderCategoriesInput } from '@repo/types';
import Category from '../models/Category';
import Product from '../models/Product';
import { requireAdmin } from '../middleware/requireAdmin';
import { isDuplicateKeyError, toClientErrorMessage } from '../lib/errors';

export const categoriesRouter: Router = Router();

/**
 * 전체 카테고리 목록을 지정된 순서(`order`)대로 조회합니다. 고객 화면의
 * 카테고리 필터에도 쓰이므로 인증 없이 공개합니다.
 * @route GET /api/categories
 */
categoriesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: '카테고리 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 새 카테고리를 등록합니다. 순서는 항상 맨 뒤로 배정됩니다. 관리자
 * 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/categories
 * @param req.body - `@repo/types`의 `CategoryInput` (`name`)
 */
categoriesRouter.post(
  '/',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, CategoryInput>, res: Response) => {
    try {
      const order = await Category.countDocuments();
      const category = new Category({ name: req.body.name, order });
      const newCategory = await category.save();
      res.status(201).json(newCategory);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        res.status(400).json({ message: '이미 있는 카테고리 이름입니다.' });
        return;
      }
      res.status(400).json({ message: toClientErrorMessage(err, '카테고리 등록 중 오류가 발생했습니다.') });
    }
  },
);

/**
 * 카테고리 노출 순서를 한 번에 재배열합니다. 원하는 순서대로 나열한
 * 카테고리 id 배열을 받아 배열 인덱스를 그대로 `order` 값으로 저장합니다.
 * 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PATCH /api/categories/reorder
 * @param req.body - `@repo/types`의 `ReorderCategoriesInput` (`orderedIds`)
 */
categoriesRouter.patch(
  '/reorder',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, ReorderCategoriesInput>, res: Response) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ message: 'orderedIds 값이 올바르지 않습니다.' });
      return;
    }
    try {
      await Promise.all(
        orderedIds.map((id, index) => Category.updateOne({ _id: id }, { $set: { order: index } })),
      );
      const categories = await Category.find().sort({ order: 1, name: 1 });
      res.json(categories);
    } catch (err) {
      res.status(400).json({ message: '카테고리 순서 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 카테고리 이름을 수정합니다. 상품은 카테고리를 이름으로 참조하므로,
 * 기존 이름을 쓰던 상품들도 새 이름으로 함께 갱신합니다. 관리자 세션이
 * 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PUT /api/categories/:id
 * @param req.body - `@repo/types`의 `CategoryInput` (`name`)
 */
categoriesRouter.put(
  '/:id',
  requireAdmin,
  async (req: Request<{ id: string }, unknown, CategoryInput>, res: Response) => {
    try {
      const category = await Category.findById(req.params.id);
      if (!category) {
        res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
        return;
      }
      const oldName = category.name;
      category.name = req.body.name;
      await category.save();
      await Product.updateMany({ category: oldName }, { $set: { category: req.body.name } });
      res.json(category);
    } catch (err) {
      if (isDuplicateKeyError(err)) {
        res.status(400).json({ message: '이미 있는 카테고리 이름입니다.' });
        return;
      }
      res.status(400).json({ message: toClientErrorMessage(err, '카테고리 수정 중 오류가 발생했습니다.') });
    }
  },
);

/**
 * 카테고리를 삭제합니다. 이 카테고리에 속한 상품도 함께 전부 삭제됩니다.
 * 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route DELETE /api/categories/:id
 */
categoriesRouter.delete('/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: '카테고리를 찾을 수 없습니다.' });
      return;
    }
    await Product.deleteMany({ category: category.name });
    await category.deleteOne();
    res.json({ message: '카테고리와 소속 상품을 삭제했습니다.' });
  } catch (err) {
    res.status(500).json({ message: '카테고리 삭제 중 오류가 발생했습니다.' });
  }
});

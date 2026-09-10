// @owner: ai
import { Router, type Request, type Response } from 'express';
import type { ProductInput, ReorderProductsInput, UpdateSoldOutInput, UpdateStockInput } from '@repo/types';
import Product from '../models/Product';
import { requireAdmin } from '../middleware/requireAdmin';

export const productsRouter: Router = Router();

/**
 * 전체 상품 목록을 카테고리 → 순서(`order`) 순으로 조회합니다.
 * @route GET /api/products
 */
productsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ category: 1, order: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: '상품을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 새 상품을 등록합니다. 순서는 같은 카테고리 안에서 항상 맨 뒤로
 * 배정됩니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/products
 * @param req.body - `@repo/types`의 `ProductInput`
 */
productsRouter.post(
  '/',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, ProductInput>, res: Response) => {
    const { name, price, imageUrl, category, stock, options, hasTemperatureOption, hasMagicSpellOption } = req.body;
    try {
      const order = await Product.countDocuments({ category });
      const product = new Product({
        name,
        price,
        imageUrl,
        category,
        order,
        stock,
        options,
        hasTemperatureOption,
        hasMagicSpellOption,
      });
      const newProduct = await product.save();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(400).json({ message: '상품 추가 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품 노출 순서를 한 번에 재배열합니다. 같은 카테고리 안에서만 의미가
 * 있으므로, 그 카테고리에 속한 상품 id를 원하는 순서대로 나열한 배열을
 * 받아 배열 인덱스를 그대로 `order` 값으로 저장합니다. 관리자 세션이
 * 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PATCH /api/products/reorder
 * @param req.body - `@repo/types`의 `ReorderProductsInput` (`orderedIds`)
 */
productsRouter.patch(
  '/reorder',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, ReorderProductsInput>, res: Response) => {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      res.status(400).json({ message: 'orderedIds 값이 올바르지 않습니다.' });
      return;
    }
    try {
      await Promise.all(
        orderedIds.map((id, index) => Product.updateOne({ _id: id }, { $set: { order: index } })),
      );
      const products = await Product.find().sort({ category: 1, order: 1 });
      res.json(products);
    } catch (err) {
      res.status(400).json({ message: '상품 순서 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품 정보를 수정합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PUT /api/products/:id
 * @param req.body - `@repo/types`의 `ProductInput`
 */
productsRouter.put(
  '/:id',
  requireAdmin,
  async (req: Request<{ id: string }, unknown, ProductInput>, res: Response) => {
    const { name, price, imageUrl, category, stock, options, hasTemperatureOption, hasMagicSpellOption } = req.body;
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          name,
          price,
          imageUrl,
          category,
          ...(stock !== undefined ? { stock } : {}),
          // 옵션 목록은 폼에서 항상 전체를 다시 보내므로, 비어있으면
          // 기존 옵션을 전부 지우는 것으로 취급합니다(재고와 달리 "생략하면
          // 유지"가 아님).
          options: options ?? [],
          hasTemperatureOption: hasTemperatureOption ?? false,
          hasMagicSpellOption: hasMagicSpellOption ?? false,
        },
        { new: true, runValidators: true },
      );
      if (!updatedProduct) {
        res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        return;
      }
      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ message: '상품 수정 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품의 품절 여부를 변경합니다. 관리자 세션이 없으면 `requireAdmin`에서
 * 401로 막습니다.
 * @route PATCH /api/products/:id/sold-out
 * @param req.body - `@repo/types`의 `UpdateSoldOutInput` (`isSoldOut`)
 */
productsRouter.patch(
  '/:id/sold-out',
  requireAdmin,
  async (req: Request<{ id: string }, unknown, UpdateSoldOutInput>, res: Response) => {
    if (typeof req.body?.isSoldOut !== 'boolean') {
      res.status(400).json({ message: 'isSoldOut 값이 올바르지 않습니다.' });
      return;
    }
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { isSoldOut: req.body.isSoldOut },
        { new: true, runValidators: true },
      );
      if (!updatedProduct) {
        res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        return;
      }
      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ message: '품절 상태 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품의 재고 수량을 절대값으로 설정합니다(증감이 아니라 새 값을 그대로
 * 저장). 0 이하로 설정하면 자동으로 품절 처리되고, 0보다 큰 값으로
 * 설정하면 자동으로 품절이 해제됩니다(재입고 시나리오). 관리자 세션이
 * 없으면 `requireAdmin`에서 401로 막습니다.
 * @route PATCH /api/products/:id/stock
 * @param req.body - `@repo/types`의 `UpdateStockInput` (`stock`)
 */
productsRouter.patch(
  '/:id/stock',
  requireAdmin,
  async (req: Request<{ id: string }, unknown, UpdateStockInput>, res: Response) => {
    if (typeof req.body?.stock !== 'number' || Number.isNaN(req.body.stock)) {
      res.status(400).json({ message: 'stock 값이 올바르지 않습니다.' });
      return;
    }
    try {
      const stock = Math.max(0, Math.round(req.body.stock));
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { stock, isSoldOut: stock <= 0 },
        { new: true, runValidators: true },
      );
      if (!updatedProduct) {
        res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
        return;
      }
      res.json(updatedProduct);
    } catch (err) {
      res.status(400).json({ message: '재고 수량 변경 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 상품을 삭제합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route DELETE /api/products/:id
 */
productsRouter.delete('/:id', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
    }
    await product.deleteOne();
    res.json({ message: '상품이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ message: '상품 삭제 중 오류가 발생했습니다.' });
  }
});

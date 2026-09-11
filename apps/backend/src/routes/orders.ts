// @owner: ai
import { Router, type Request, type Response } from 'express';
import type { CreateOrderInput, MonthlySalesSummary, OrderListQuery, ProductSalesRanking } from '@repo/types';
import Order from '../models/Order';
import Product from '../models/Product';
import { requireAdmin } from '../middleware/requireAdmin';
import { getKstDayRange, getKstMonthRange, getKstStartOfToday, getKstYear, getMonthLabelsForYear } from '../lib/date';
import { decrementStockForOrder } from '../lib/inventory';

export const ordersRouter: Router = Router();

/**
 * 주문 목록을 최신순으로 조회합니다. 주방/관리자가 들어온 주문을 확인하는
 * 용도입니다. `status`(진행중/완료), `orderType`(매장/포장), `date`(그
 * 날짜 하루, KST 기준 'YYYY-MM-DD')로 걸러볼 수 있고, 전부 생략하면
 * 전체를 반환합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로
 * 막습니다.
 * @route GET /api/orders
 * @param req.query - `@repo/types`의 `OrderListQuery` (전부 선택)
 */
ordersRouter.get(
  '/',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, unknown, OrderListQuery>, res: Response) => {
    if (req.query.date && !/^\d{4}-\d{2}-\d{2}$/.test(req.query.date)) {
      res.status(400).json({ message: 'date 형식이 올바르지 않습니다(YYYY-MM-DD).' });
      return;
    }
    try {
      const filter: Record<string, unknown> = {};
      if (req.query.status === 'pending') filter.isCompleted = false;
      if (req.query.status === 'completed') filter.isCompleted = true;
      if (req.query.orderType) filter.orderType = req.query.orderType;
      if (req.query.date) {
        const { start, end } = getKstDayRange(req.query.date);
        filter.createdAt = { $gte: start, $lt: end };
      }

      const orders = await Order.find(filter).sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      res.status(500).json({ message: '주문 목록을 불러오는 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 주문을 완료 처리합니다. 완료된 주문은 진행중 목록에서 빠지고 지난
 * 주문 목록으로 이동합니다. 관리자 세션이 없으면 `requireAdmin`에서
 * 401로 막습니다.
 * @route PATCH /api/orders/:id/complete
 */
ordersRouter.patch('/:id/complete', requireAdmin, async (req: Request<{ id: string }>, res: Response) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { isCompleted: true },
      { new: true },
    );
    if (!updatedOrder) {
      res.status(404).json({ message: '주문을 찾을 수 없습니다.' });
      return;
    }
    res.json(updatedOrder);
  } catch (err) {
    res.status(400).json({ message: '주문 완료 처리 중 오류가 발생했습니다.' });
  }
});

/**
 * 장바구니 내용을 주문으로 생성합니다. 요청 바디 계약은 `@repo/types`의 `CreateOrderInput`을 따르며,
 * 프론트엔드 `features/cart/api/orderApi.ts`와 동일한 타입을 공유합니다. 응답의
 * `orderNumber`는 한국 시간(KST) 기준 당일 자정부터 1번씩 다시 매기는 짧은
 * 주문번호입니다(스타벅스 매장 주문번호 방식).
 * @route POST /api/orders
 */
ordersRouter.post(
  '/',
  async (req: Request<Record<string, never>, unknown, CreateOrderInput>, res: Response) => {
    try {
      const ordersToday = await Order.countDocuments({
        createdAt: { $gte: getKstStartOfToday() },
      });
      const newOrder = new Order({
        orderNumber: ordersToday + 1,
        items: req.body.items,
        totalPrice: req.body.totalPrice,
        orderType: req.body.orderType,
        paymentMethod: req.body.paymentMethod,
      });
      await newOrder.save();
      res.status(201).json(newOrder);

      // 재고 갱신은 주문 자체의 성공/실패와 분리합니다 — 이미 응답을
      // 보낸 뒤이므로 여기서 오류가 나도 손님의 주문 제출에는 영향이
      // 없고, 로그만 남깁니다.
      try {
        await decrementStockForOrder(req.body.items);
      } catch (stockErr) {
        console.error('주문 후 재고 갱신 중 오류가 발생했습니다:', stockErr);
      }
    } catch (err) {
      res.status(400).json({ message: '주문을 처리하는 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 특정 연도(기본값: 올해, KST 기준) 1~12월의 월별 매출/판매량 추이를
 * 집계해 조회합니다. 주문이 없는 달도 0으로 채워 넣어 차트 x축이
 * 끊기지 않게 합니다. 관리자 세션이 없으면 `requireAdmin`에서 401로
 * 막습니다.
 * @route GET /api/orders/stats/monthly
 * @param req.query.year - 조회할 연도(선택, 기본 올해)
 */
ordersRouter.get(
  '/stats/monthly',
  requireAdmin,
  async (req: Request<Record<string, never>, unknown, unknown, { year?: string }>, res: Response) => {
    try {
      const year = Number(req.query.year) || getKstYear();
      const labels = getMonthLabelsForYear(year);
      const rangeStart = getKstMonthRange(labels[0]!).start;
      const rangeEnd = getKstMonthRange(labels[labels.length - 1]!).end;

      const rows: { _id: string; totalRevenue: number; totalQuantity: number; orderCount: number }[] =
        await Order.aggregate([
          { $match: { createdAt: { $gte: rangeStart, $lt: rangeEnd } } },
          {
            $project: {
              month: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: '+09:00' } },
              totalPrice: 1,
              totalQuantity: { $sum: '$items.quantity' },
            },
          },
          {
            $group: {
              _id: '$month',
              totalRevenue: { $sum: '$totalPrice' },
              totalQuantity: { $sum: '$totalQuantity' },
              orderCount: { $sum: 1 },
            },
          },
        ]);

      const byMonth = new Map(rows.map((r) => [r._id, r]));
      const summary: MonthlySalesSummary[] = labels.map((month) => {
        const row = byMonth.get(month);
        return {
          month,
          totalRevenue: row?.totalRevenue ?? 0,
          totalQuantity: row?.totalQuantity ?? 0,
          orderCount: row?.orderCount ?? 0,
        };
      });
      res.json(summary);
    } catch (err) {
      res.status(500).json({ message: '월별 매출 통계를 불러오는 중 오류가 발생했습니다.' });
    }
  },
);

/**
 * 특정 월(KST 기준)의 메뉴별 판매량/매출 순위를 조회합니다.
 * 판매량(`quantitySold`)이 많은 순으로 정렬됩니다. 관리자 세션이 없으면
 * `requireAdmin`에서 401로 막습니다.
 * @route GET /api/orders/stats/monthly/:month
 * @param req.params.month - 'YYYY-MM' 형식(KST 기준)
 */
ordersRouter.get(
  '/stats/monthly/:month',
  requireAdmin,
  async (req: Request<{ month: string }>, res: Response) => {
    if (!/^\d{4}-\d{2}$/.test(req.params.month)) {
      res.status(400).json({ message: 'month 형식이 올바르지 않습니다(YYYY-MM).' });
      return;
    }
    try {
      const { start, end } = getKstMonthRange(req.params.month);
      const rows: { _id: string; name: string; imageUrl: string; quantitySold: number; revenue: number }[] =
        await Order.aggregate([
          { $match: { createdAt: { $gte: start, $lt: end } } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.productId',
              name: { $first: '$items.name' },
              imageUrl: { $first: '$items.imageUrl' },
              quantitySold: { $sum: '$items.quantity' },
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
          { $sort: { quantitySold: -1 } },
        ]);

      // 주문 아이템은 주문 시점 스냅샷이라, `imageUrl` 필드가 상품/주문
      // 코드에 나중에 추가되기 전에 만들어진 옛 주문에는 값이 없습니다.
      // 그런 경우엔 지금 상품 정보의 이미지로 대신 채웁니다(상품이
      // 삭제됐으면 그냥 빈 문자열).
      const missingImageIds = rows.filter((r) => !r.imageUrl).map((r) => r._id);
      const fallbackImageById = new Map<string, string>();
      if (missingImageIds.length > 0) {
        const products = await Product.find({ _id: { $in: missingImageIds } }, 'imageUrl');
        for (const product of products) {
          fallbackImageById.set(String(product._id), product.imageUrl);
        }
      }

      const ranking: ProductSalesRanking[] = rows.map((r) => ({
        productId: r._id,
        name: r.name,
        imageUrl: r.imageUrl || fallbackImageById.get(String(r._id)) || '',
        quantitySold: r.quantitySold,
        revenue: r.revenue,
      }));
      res.json(ranking);
    } catch (err) {
      res.status(500).json({ message: '메뉴별 판매 순위를 불러오는 중 오류가 발생했습니다.' });
    }
  },
);

// @owner: ai
//  역할: 관리자 화면의 "판매 통계" 탭. 최근 몇 개월간의 월별 판매량/매출
//  추이를 막대 차트로 보여주고, 막대를 클릭해 고른 달의 메뉴별 판매
//  순위를 함께 보여줍니다.
'use client';

import { useEffect, useState } from 'react';
import type { MonthlySalesSummary, ProductSalesRanking } from '@repo/types';
import { getMonthlySalesSummary, getProductSalesRanking } from '../../../entities/order';

const MONTHS_TO_SHOW = 6;

function formatMonthLabel(month: string): string {
  const [, monthNum] = month.split('-');
  return `${Number(monthNum)}월`;
}

export function SalesDashboard() {
  const [summary, setSummary] = useState<MonthlySalesSummary[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [ranking, setRanking] = useState<ProductSalesRanking[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);

  useEffect(() => {
    getMonthlySalesSummary(MONTHS_TO_SHOW)
      .then((data) => {
        setSummary(data);
        // ✅ 기본으로 가장 최근 달(배열의 마지막)을 선택해둡니다.
        setSelectedMonth((prev) => prev ?? data[data.length - 1]?.month ?? null);
      })
      .catch((error) => console.error('월별 매출 통계를 불러오는 중 오류가 발생했습니다:', error))
      .finally(() => setIsLoadingSummary(false));
  }, []);

  useEffect(() => {
    if (!selectedMonth) return;
    setIsLoadingRanking(true);
    getProductSalesRanking(selectedMonth)
      .then(setRanking)
      .catch((error) => console.error('메뉴별 판매 순위를 불러오는 중 오류가 발생했습니다:', error))
      .finally(() => setIsLoadingRanking(false));
  }, [selectedMonth]);

  const maxQuantity = Math.max(1, ...summary.map((row) => row.totalQuantity));

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-5 text-3xl font-bold text-gray-700">월별 판매량 추이</h2>
        {isLoadingSummary ? (
          <p>로딩 중...</p>
        ) : (
          <div className="flex items-end gap-3 sm:gap-4">
            {summary.map((row) => (
              <button
                type="button"
                key={row.month}
                onClick={() => setSelectedMonth(row.month)}
                className={`flex flex-1 flex-col items-center gap-2 rounded-lg p-2 transition-colors ${
                  selectedMonth === row.month ? 'bg-pink-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-semibold text-gray-600">{row.totalQuantity}개</span>
                <div className="flex h-40 w-full items-end">
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      selectedMonth === row.month ? 'bg-pink-500' : 'bg-pink-200'
                    }`}
                    style={{ height: `${(row.totalQuantity / maxQuantity) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-500">{formatMonthLabel(row.month)}</span>
                <span className="text-xs text-gray-400">{row.totalRevenue.toLocaleString()}원</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-5 text-3xl font-bold text-gray-700">
          {selectedMonth ? `${formatMonthLabel(selectedMonth)} 메뉴별 판매 순위` : '메뉴별 판매 순위'}
        </h2>
        {isLoadingRanking ? (
          <p>로딩 중...</p>
        ) : ranking.length === 0 ? (
          <p className="text-gray-400">이 달에는 판매 기록이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {ranking.map((item, index) => (
              <div key={item.productId} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <span className="w-6 text-center text-lg font-bold text-pink-500">{index + 1}</span>
                <img src={item.imageUrl} alt={item.name} className="h-14 w-14 rounded-md object-cover" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.revenue.toLocaleString()}원</p>
                </div>
                <span className="text-lg font-bold text-gray-700">{item.quantitySold}개</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

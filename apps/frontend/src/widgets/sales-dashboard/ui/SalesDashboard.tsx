// @owner: ai
//  역할: 관리자 화면의 "판매 통계" 탭. 연도를 골라 그 해의 월별 판매량
//  추이를 꺾은선 그래프로 보여주고, 그래프의 점을 클릭해 고른 달의
//  메뉴별 판매 순위를 함께 보여줍니다. PC 화면에서 크고 넓게 보이도록
//  데스크탑 위주로 만들었습니다.
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { MonthlySalesSummary, ProductSalesRanking } from '@repo/types';
import { getMonthlySalesSummary, getProductSalesRanking } from '../../../entities/order';

const CURRENT_YEAR = new Date().getFullYear();
// 올해부터 4년 전까지, 최근 5개년을 고를 수 있게 합니다.
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

function formatMonthLabel(month: string): string {
  const [, monthNum] = month.split('-');
  return `${Number(monthNum)}월`;
}

const CHART_WIDTH = 1000;
const CHART_HEIGHT = 320;
const CHART_PADDING_X = 32;
const CHART_PADDING_TOP = 40;
const CHART_PADDING_BOTTOM = 40;
const PLOT_WIDTH = CHART_WIDTH - CHART_PADDING_X * 2;
const PLOT_HEIGHT = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
const BASELINE_Y = CHART_PADDING_TOP + PLOT_HEIGHT;

interface MonthlyLineChartProps {
  summary: MonthlySalesSummary[];
  selectedMonth: string | null;
  onSelectMonth: (month: string) => void;
}

/** 1~12월 판매량을 꺾은선 그래프로 그립니다. 외부 차트 라이브러리 없이 SVG로 직접 그립니다. */
function MonthlyLineChart({ summary, selectedMonth, onSelectMonth }: MonthlyLineChartProps) {
  const maxQuantity = Math.max(1, ...summary.map((row) => row.totalQuantity));
  const points = summary.map((row, index) => {
    const ratio = summary.length > 1 ? index / (summary.length - 1) : 0.5;
    return {
      ...row,
      x: CHART_PADDING_X + ratio * PLOT_WIDTH,
      y: BASELINE_Y - (row.totalQuantity / maxQuantity) * PLOT_HEIGHT,
    };
  });
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-72 w-full sm:h-80 lg:h-[26rem]"
      role="img"
      aria-label="월별 판매량 추이 그래프"
    >
      <line x1={CHART_PADDING_X} y1={BASELINE_Y} x2={CHART_WIDTH - CHART_PADDING_X} y2={BASELINE_Y} stroke="#e5e7eb" strokeWidth={1} />
      <polyline
        points={linePoints}
        fill="none"
        stroke="#ec4899"
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p) => {
        const isSelected = p.month === selectedMonth;
        return (
          <g key={p.month} onClick={() => onSelectMonth(p.month)} className="cursor-pointer">
            {/* 실제 보이는 원보다 넉넉한 투명 클릭 영역 */}
            <circle cx={p.x} cy={p.y} r={20} fill="transparent" />
            <circle
              cx={p.x}
              cy={p.y}
              r={isSelected ? 7 : 5}
              fill={isSelected ? '#ec4899' : '#ffffff'}
              stroke="#ec4899"
              strokeWidth={2}
            />
            <text x={p.x} y={p.y - 14} textAnchor="middle" className="fill-gray-600 text-[13px] font-semibold">
              {p.totalQuantity}
            </text>
            <text
              x={p.x}
              y={BASELINE_Y + 26}
              textAnchor="middle"
              className={`text-[13px] font-semibold ${isSelected ? 'fill-pink-500' : 'fill-gray-500'}`}
            >
              {formatMonthLabel(p.month)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function SalesDashboard() {
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [summary, setSummary] = useState<MonthlySalesSummary[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [ranking, setRanking] = useState<ProductSalesRanking[]>([]);
  const [isLoadingRanking, setIsLoadingRanking] = useState(false);

  useEffect(() => {
    setIsLoadingSummary(true);
    getMonthlySalesSummary(selectedYear)
      .then((data) => {
        setSummary(data);
        // ✅ 판매 기록이 있는 가장 최근 달을 기본으로 선택합니다. 한
        // 건도 없으면(예: 아직 시작 안 한 미래 연도) 12월을 기본값으로 둡니다.
        const lastWithData = [...data].reverse().find((row) => row.orderCount > 0);
        setSelectedMonth((lastWithData ?? data[data.length - 1])?.month ?? null);
      })
      .catch((error) => console.error('월별 매출 통계를 불러오는 중 오류가 발생했습니다:', error))
      .finally(() => setIsLoadingSummary(false));
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedMonth) return;
    setIsLoadingRanking(true);
    getProductSalesRanking(selectedMonth)
      .then(setRanking)
      .catch((error) => console.error('메뉴별 판매 순위를 불러오는 중 오류가 발생했습니다:', error))
      .finally(() => setIsLoadingRanking(false));
  }, [selectedMonth]);

  const selectedSummary = summary.find((row) => row.month === selectedMonth);

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-white p-6 shadow-lg lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-bold text-gray-700">월별 판매량 추이</h2>
          <div className="flex gap-2">
            {YEAR_OPTIONS.map((year) => (
              <button
                type="button"
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                  selectedYear === year
                    ? 'bg-pink-500 text-white shadow-md'
                    : 'border border-pink-100 bg-white text-gray-600 hover:bg-pink-100 hover:text-pink-600'
                }`}
              >
                {year}년
              </button>
            ))}
          </div>
        </div>
        {isLoadingSummary ? (
          <p>로딩 중...</p>
        ) : (
          <MonthlyLineChart summary={summary} selectedMonth={selectedMonth} onSelectMonth={setSelectedMonth} />
        )}
      </div>

      <div className="rounded-xl bg-white p-6 shadow-lg lg:p-8">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-3xl font-bold text-gray-700">
            {selectedMonth ? `${formatMonthLabel(selectedMonth)} 메뉴별 판매 순위` : '메뉴별 판매 순위'}
          </h2>
          {selectedSummary && (
            <p className="text-base text-gray-500">
              총 판매량 <span className="font-semibold text-gray-700">{selectedSummary.totalQuantity}개</span> ·
              매출 <span className="font-semibold text-gray-700">{selectedSummary.totalRevenue.toLocaleString()}원</span>
            </p>
          )}
        </div>
        {isLoadingRanking ? (
          <p>로딩 중...</p>
        ) : ranking.length === 0 ? (
          <p className="text-gray-400">이 달에는 판매 기록이 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {ranking.map((item, index) => (
              <div key={item.productId} className="flex items-center gap-4 rounded-lg bg-gray-50 p-3">
                <span className="w-6 text-center text-lg font-bold text-pink-500">{index + 1}</span>
                {item.imageUrl ? (
                  <div className="relative h-14 w-14 shrink-0">
                    <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="rounded-md object-cover" />
                  </div>
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-md bg-gray-200" aria-hidden="true" />
                )}
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

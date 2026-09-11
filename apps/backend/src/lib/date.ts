// @owner: ai
export const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

/**
 * 한국 시간(KST) 기준 오늘 자정에 해당하는 UTC 시각을 반환합니다.
 * 당일 주문번호를 매길 때 "오늘"의 기준으로 사용합니다.
 */
export function getKstStartOfToday(): Date {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  kstNow.setUTCHours(0, 0, 0, 0);
  return new Date(kstNow.getTime() - KST_OFFSET_MS);
}

/** KST 기준 현재 연도를 반환합니다. */
export function getKstYear(): number {
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  return kstNow.getUTCFullYear();
}

/**
 * 주어진 연도의 1월~12월 'YYYY-MM' 라벨 12개를 반환합니다(예:
 * year=2026이면 ['2026-01', ..., '2026-12']). [[매출통계대시보드]]의
 * 연도별 월간 추이 x축으로 씁니다.
 */
export function getMonthLabelsForYear(year: number): string[] {
  return Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
}

/** 'YYYY-MM' 라벨이 가리키는 KST 기준 월의 시작/끝(다음 달 시작, exclusive)을 UTC Date로 반환합니다. */
export function getKstMonthRange(month: string): { start: Date; end: Date } {
  const [year, monthNum] = month.split('-').map(Number) as [number, number];
  const start = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0) - KST_OFFSET_MS);
  const end = new Date(Date.UTC(year, monthNum, 1, 0, 0, 0) - KST_OFFSET_MS);
  return { start, end };
}

/** 'YYYY-MM-DD' 날짜가 가리키는 KST 기준 하루의 시작/끝(다음 날 시작, exclusive)을 UTC Date로 반환합니다. */
export function getKstDayRange(date: string): { start: Date; end: Date } {
  const [year, month, day] = date.split('-').map(Number) as [number, number, number];
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - KST_OFFSET_MS);
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0) - KST_OFFSET_MS);
  return { start, end };
}

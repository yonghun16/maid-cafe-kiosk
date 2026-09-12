// @owner: ai

const IDLE_TIMEOUT_MS = 60_000;

let timeoutId: ReturnType<typeof setTimeout> | null = null;
let onTimeoutCallback: (() => void) | null = null;

/**
 * 화면 전체의 유휴 상태를 감지하는 타이머입니다. RN의 `<Modal>`은 별도
 * 네이티브 화면(iOS `UIViewController`/안드로이드 `Dialog`)으로 떠서,
 * 최상위 화면에 붙인 터치 감지만으로는 모달 안에서의 조작(예: 메뉴 옵션
 * 고르기)을 놓칩니다. 그래서 React 컴포넌트 트리나 Zustand 상태가 아니라
 * 모듈 전역 함수로 만들어, `shared/ui/Modal`을 포함한 모든 화면이 같은
 * 타이머를 공유하게 했습니다(`shared/ui/Modal`은 `features/` 이상 레이어를
 * import할 수 없어 이 로직이 `shared/`에 있어야 합니다).
 */
export function startIdleTimer(onTimeout: () => void) {
  onTimeoutCallback = onTimeout;
  resetIdleTimer();
}

export function resetIdleTimer() {
  if (timeoutId) clearTimeout(timeoutId);
  if (!onTimeoutCallback) return;
  timeoutId = setTimeout(() => {
    onTimeoutCallback?.();
  }, IDLE_TIMEOUT_MS);
}

export function stopIdleTimer() {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = null;
  onTimeoutCallback = null;
}

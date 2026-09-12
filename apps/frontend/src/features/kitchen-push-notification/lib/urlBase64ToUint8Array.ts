// @owner: ai

/**
 * `PushManager.subscribe()`의 `applicationServerKey`는 `Uint8Array`가
 * 필요한데, VAPID 공개키는 URL-safe base64 문자열로 내려오므로 변환이
 * 필요합니다.
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

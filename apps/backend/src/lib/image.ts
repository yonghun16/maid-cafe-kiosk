// @owner: ai
import sharp from 'sharp';

// 상품 카드(3:4)·광고 배너(최대 표시 폭 lg:max-w-4xl ≈ 896px)가 실제로
// 훨씬 작게 보이므로, 레티나(2x) 디스플레이까지 감안해도 이 안이면
// 충분합니다. 이보다 작은 이미지는 확대하지 않습니다.
export const MAX_IMAGE_DIMENSION = 1600;
// 육안으로 화질 저하가 거의 안 보이면서 파일 크기를 크게 줄이는 통상적인
// WebP 절충 품질값.
export const WEBP_QUALITY = 82;

/**
 * 이미지 버퍼를 리사이즈(가장 큰 변이 `MAX_IMAGE_DIMENSION`을 넘지 않게,
 * 비율 유지, 확대는 하지 않음) + WebP로 재인코딩합니다. 업로드 원본을
 * 그대로 저장하면(예: 압축 없는 PNG 2MB) 저장 공간과 최초 로딩이
 * 불필요하게 커지는 문제를 막기 위해 씁니다. 손상되었거나 이미지가
 * 아닌 버퍼를 넘기면 `sharp`가 던지는 오류가 그대로 올라갑니다.
 * @param input - 원본 이미지 버퍼(포맷 무관 — PNG/JPEG 등)
 * @returns 재인코딩된 WebP 이미지 버퍼
 */
export async function reencodeImageToWebp(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize(MAX_IMAGE_DIMENSION, MAX_IMAGE_DIMENSION, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

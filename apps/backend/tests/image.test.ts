// @owner: ai
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { MAX_IMAGE_DIMENSION, reencodeImageToWebp } from '../src/lib/image';

async function makePng(width: number, height: number): Promise<Buffer> {
  return sharp({
    create: { width, height, channels: 4, background: { r: 255, g: 200, b: 220, alpha: 1 } },
  })
    .png()
    .toBuffer();
}

describe('reencodeImageToWebp', () => {
  it('큰 이미지는 가장 큰 변이 상한을 넘지 않도록 비율을 유지한 채 축소되고, WebP로 바뀐다', async () => {
    const original = await makePng(3000, 1500);
    const result = await reencodeImageToWebp(original);
    const metadata = await sharp(result).metadata();

    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBe(MAX_IMAGE_DIMENSION);
    expect(metadata.height).toBe(Math.round((1500 / 3000) * MAX_IMAGE_DIMENSION));
    expect(result.length).toBeLessThan(original.length);
  });

  it('상한보다 작은 이미지는 확대하지 않고 크기를 그대로 유지한다', async () => {
    const original = await makePng(100, 80);
    const result = await reencodeImageToWebp(original);
    const metadata = await sharp(result).metadata();

    expect(metadata.format).toBe('webp');
    expect(metadata.width).toBe(100);
    expect(metadata.height).toBe(80);
  });

  it('이미지가 아닌 버퍼를 넘기면 오류가 발생한다', async () => {
    await expect(reencodeImageToWebp(Buffer.from('이건 이미지가 아닙니다'))).rejects.toThrow();
  });
});

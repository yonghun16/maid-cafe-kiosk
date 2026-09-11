// @owner: ai
import { randomUUID } from 'crypto';
import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { UploadImageResponse } from '@repo/types';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../lib/r2Client';
import { requireAdmin } from '../middleware/requireAdmin';
import { reencodeImageToWebp } from '../lib/image';

export const uploadsRouter: Router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('이미지 파일만 업로드할 수 있습니다.'));
      return;
    }
    cb(null, true);
  },
});

/**
 * 이미지 파일을 리사이즈 + WebP로 재인코딩한 뒤 Cloudflare R2에 업로드하고
 * 공개 URL을 반환합니다. 원본을 그대로 저장하면(예: 압축 없는 PNG 2MB)
 * R2 대역폭과 최초 로딩이 불필요하게 느려져서, 관리자가 매번 업로드 전에
 * 직접 압축할 필요 없이 서버가 항상 적당한 크기로 맞춥니다. 응답 계약은
 * `@repo/types`의 `UploadImageResponse`를 따르며, 프론트엔드
 * `shared/api/uploadImage.ts`와 동일한 타입을 공유합니다. 저장 포맷을
 * WebP로 통일하므로 응답 URL의 확장자는 원본과 무관하게 항상 `.webp`
 * 입니다. 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/uploads
 * @param req.file - multipart/form-data의 "image" 필드로 전달된 이미지 파일
 */
uploadsRouter.post('/', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: '업로드할 이미지가 없습니다.' });
    return;
  }

  let webpBuffer: Buffer;
  try {
    webpBuffer = await reencodeImageToWebp(req.file.buffer);
  } catch (err) {
    console.error('이미지 재인코딩 중 오류가 발생했습니다:', err);
    res
      .status(400)
      .json({ message: '이미지 파일을 처리할 수 없습니다. 손상되었거나 지원하지 않는 형식일 수 있습니다.' });
    return;
  }

  try {
    const key = `${randomUUID()}.webp`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: webpBuffer,
        ContentType: 'image/webp',
      }),
    );

    const response: UploadImageResponse = { url: `${R2_PUBLIC_URL}/${key}` };
    res.status(201).json(response);
  } catch (err) {
    console.error('이미지 업로드 중 오류가 발생했습니다:', err);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
});

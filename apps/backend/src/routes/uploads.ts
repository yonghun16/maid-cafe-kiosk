// @owner: ai
import { randomUUID } from 'crypto';
import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import type { UploadImageResponse } from '@repo/types';
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../lib/r2Client';
import { requireAdmin } from '../middleware/requireAdmin';

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
 * 이미지 파일을 Cloudflare R2에 업로드하고 공개 URL을 반환합니다. 응답 계약은
 * `@repo/types`의 `UploadImageResponse`를 따르며, 프론트엔드
 * `shared/api/uploadImage.ts`와 동일한 타입을 공유합니다.
 * 관리자 세션이 없으면 `requireAdmin`에서 401로 막습니다.
 * @route POST /api/uploads
 * @param req.file - multipart/form-data의 "image" 필드로 전달된 이미지 파일
 */
uploadsRouter.post('/', requireAdmin, upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ message: '업로드할 이미지가 없습니다.' });
    return;
  }

  try {
    const extension = req.file.originalname.split('.').pop();
    const key = extension ? `${randomUUID()}.${extension}` : randomUUID();

    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      }),
    );

    const response: UploadImageResponse = { url: `${R2_PUBLIC_URL}/${key}` };
    res.status(201).json(response);
  } catch (err) {
    console.error('이미지 업로드 중 오류가 발생했습니다:', err);
    res.status(500).json({ message: '이미지 업로드 중 오류가 발생했습니다.' });
  }
});

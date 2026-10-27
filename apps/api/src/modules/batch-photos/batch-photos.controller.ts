import { Request, Response, NextFunction } from 'express';
import { batchPhotosService, convertToWebP } from './batch-photos.service.js';
import { AppError } from '../../middleware/error.js';

export class BatchPhotosController {
  /** The archive, as the public site reads it. */
  listPublic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await batchPhotosService.listPublic(req.query);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /** How the archive is spread out. */
  stats = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await batchPhotosService.stats();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  /** Downloads the full-quality original photograph file. */
  download = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filePath, downloadFilename } = await batchPhotosService.getDownloadFile(req.params.id);
      res.download(filePath, downloadFilename);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Converts a photograph to WebP and hands back where it was written.
   *
   * The file is not put into the archive by this call — the console posts
   * the photograph here, learns where it went, and then posts the record
   * along with it. That way a photograph that is converted but never
   * described does not leave a stray file behind in the record.
   */
  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError('BAD_REQUEST', 'A photograph is required.', 400);
      }

      const converted = await convertToWebP(req.file.buffer, req.file.originalname);

      res.status(201).json({
        success: true,
        data: {
          photoUrl: converted.url,
          fileSizeBytes: converted.sizeBytes,
          imageFormat: 'webp',
          width: converted.width,
          height: converted.height,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await batchPhotosService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await batchPhotosService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await batchPhotosService.remove(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };
}

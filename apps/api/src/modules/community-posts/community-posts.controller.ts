import { Request, Response, NextFunction } from 'express';
import { CommunityPostCreateSchema, CommunityPostFeedQuerySchema, CommunityPostUpdateSchema } from '@nirakar/shared';
import { CommunityPostsService } from './community-posts.service.js';
import { broadcastCommunityPostUpdate } from '../../lib/socket.js';

export class CommunityPostsController {
  constructor(private service = new CommunityPostsService()) {}

  feed = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = CommunityPostFeedQuerySchema.parse(req.query);
      const result = await this.service.list(query.cursor, query.limit);
      res.json({ success: true, data: result.records, meta: { cursor: result.nextCursor, hasNextPage: !!result.nextCursor } });
    } catch (error) { next(error); }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommunityPostCreateSchema.parse(req.body);
      const post = await this.service.create(req.user!.sub, input);
      broadcastCommunityPostUpdate('created', post.id);
      res.status(201).json({ success: true, data: post });
    } catch (error) { next(error); }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = CommunityPostUpdateSchema.parse(req.body);
      const post = await this.service.update(req.params.id, req.user!.sub, input);
      broadcastCommunityPostUpdate('updated', post.id);
      res.json({ success: true, data: post });
    } catch (error) { next(error); }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.delete(req.params.id, req.user!.sub);
      broadcastCommunityPostUpdate('deleted', req.params.id);
      res.json({ success: true });
    } catch (error) { next(error); }
  };

  upload = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { message: 'Select an image or video to upload.' } });
        return;
      }
      const result = await this.service.upload(req.user!.sub, req.file.buffer, req.file.originalname, req.file.mimetype);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  };
}

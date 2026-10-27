import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './logger.js';
import { config } from '../config/index.js';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: config.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
  });

  ioInstance.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Socket.IO client connected');

    socket.on('disconnect', () => {
      logger.info({ socketId: socket.id }, 'Socket.IO client disconnected');
    });
  });

  return ioInstance;
}

export function getSocketIO(): SocketIOServer | null {
  return ioInstance;
}

export function broadcastAdmissionsUpdate(config: any) {
  if (ioInstance) {
    ioInstance.emit('admissions:config_updated', config);
    logger.info('Dispatched admissions:config_updated event to connected clients');
  }
}

export function broadcastAdmissionsPopupUpdate(popup: any) {
  if (ioInstance) {
    ioInstance.emit('admissions:popup_updated', { ...popup, timestamp: Date.now() });
    logger.info('Dispatched admissions:popup_updated event to connected clients');
  }
}

export function broadcastFacultyUpdate(action: 'created' | 'updated' | 'deleted' | 'approved', payload?: any) {
  if (ioInstance) {
    ioInstance.emit('faculty:updated', { action, data: payload, timestamp: Date.now() });
    if (action === 'deleted') {
      ioInstance.emit('faculty:deleted', { id: payload?.id, timestamp: Date.now() });
    }
    logger.info({ action, id: payload?.id }, 'Dispatched live faculty update event to connected clients');
  }
}

export function broadcastFacultyReorder(facultyIds: string[]) {
  if (ioInstance) {
    ioInstance.emit('faculty:reordered', { facultyIds, timestamp: Date.now() });
    logger.info({ count: facultyIds.length }, 'Dispatched faculty reorder event to connected clients');
  }
}

export function broadcastAlumniUpdate(action: 'created' | 'updated' | 'verification_changed' | 'deleted', payload?: any) {
  if (ioInstance) {
    ioInstance.emit('alumni:updated', { action, data: payload, timestamp: Date.now() });
    logger.info({ action, id: payload?.id }, 'Dispatched alumni directory update event to connected clients');
  }
}

/**
 * Tells the site that the circulars have changed.
 *
 * The notice board and the archive both read from the same list, so a
 * single event is enough for the whole site to catch up.
 */
export function broadcastNoticeUpdate(action: 'created' | 'updated' | 'deleted', payload?: any) {
  if (ioInstance) {
    ioInstance.emit('notices:updated', { action, data: payload, timestamp: Date.now() });
    logger.info({ action, id: payload?.id }, 'Dispatched circular update event to connected clients');
  }
}

/**
 * Tells the site that the calendar has changed.
 *
 * The same event serves the home page, the calendar and an event's own
 * page, so that all three are reading the same moment in time.
 */
export function broadcastEventUpdate(action: 'created' | 'updated' | 'deleted', payload?: any) {
  if (ioInstance) {
    ioInstance.emit('events:updated', { action, data: payload, timestamp: Date.now() });
    logger.info({ action, id: payload?.id }, 'Dispatched event update event to connected clients');
  }
}

/**
 * Tells the site that the batch archive has changed.
 *
 * The archive is one list wherever it is shown, so a single event is
 * enough for the gallery and the console to catch up.
 */
export function broadcastBatchPhotoUpdate(action: 'created' | 'updated' | 'deleted', payload?: any) {
  if (ioInstance) {
    ioInstance.emit('batch_photos:updated', { action, data: payload, timestamp: Date.now() });
    logger.info({ action, id: payload?.id }, 'Dispatched batch photo update event to connected clients');
  }
}

export function broadcastCommunityPostUpdate(action: 'created' | 'updated' | 'deleted', postId: string) {
  ioInstance?.emit('community-posts:updated', { action, postId, timestamp: Date.now() });
}

export function broadcastLibraryReviewUpdate(volumeId: string) {
  ioInstance?.emit('library:reviews_updated', { volumeId, timestamp: Date.now() });
}

export function broadcastMagazineReviewUpdate(issueId: string) {
  ioInstance?.emit('magazine:reviews_updated', { issueId, timestamp: Date.now() });
}

export function broadcastMagazineUpdate(payload: {
  issueId: string;
  status: string;
  action?: 'updated' | 'deleted';
  progress?: number;
  message?: string;
}) {
  ioInstance?.emit('magazine:updated', { ...payload, timestamp: Date.now() });
}

export function broadcastInstitutionUpdate(payload: {
  action: 'updated' | 'committee_updated';
  id: string;
  code: string;
  slug: string;
}) {
  ioInstance?.emit('institutions:updated', { ...payload, timestamp: Date.now() });
}

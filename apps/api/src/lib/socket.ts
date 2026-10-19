import { Server as HttpServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { logger } from './logger.js';

let ioInstance: SocketIOServer | null = null;

export function initSocketIO(httpServer: HttpServer): SocketIOServer {
  ioInstance = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
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

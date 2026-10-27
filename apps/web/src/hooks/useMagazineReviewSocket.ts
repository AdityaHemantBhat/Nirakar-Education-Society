import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { socketOrigin } from '../lib/api.js';

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(socketOrigin(), {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
      withCredentials: true,
    });
  }
  return socketInstance;
}

export function useMagazineReviewSocket(issueId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!issueId) return;
    const socket = getSocket();
    const handleReviewUpdate = (event: { issueId?: string }) => {
      if (event.issueId !== issueId) return;
      void queryClient.invalidateQueries({ queryKey: ['magazine_issue'] });
    };

    socket.on('magazine:reviews_updated', handleReviewUpdate);
    return () => {
      socket.off('magazine:reviews_updated', handleReviewUpdate);
    };
  }, [queryClient, issueId]);
}

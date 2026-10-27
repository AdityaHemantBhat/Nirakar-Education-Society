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

/**
 * Keeps the circulars and the gatherings on screen in step with the
 * registry.
 *
 * When the office publishes, changes or withdraws something, the server
 * says so, and the pages that show it read it afresh. Nothing on the page
 * is rebuilt or re-laid-out; only the data behind it is brought up to
 * date, and the visitor is left where they were.
 */
export function useContentSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const refreshNotices = () => {
      queryClient.invalidateQueries({ queryKey: ['public_notices'] });
      queryClient.invalidateQueries({ queryKey: ['notice'] });
      queryClient.invalidateQueries({ queryKey: ['home_data'] });
    };

    const refreshEvents = () => {
      queryClient.invalidateQueries({ queryKey: ['public_events'] });
      queryClient.invalidateQueries({ queryKey: ['event'] });
      queryClient.invalidateQueries({ queryKey: ['home_data'] });
    };

    const refreshBatchPhotos = () => {
      queryClient.invalidateQueries({ queryKey: ['public_batch_photos'] });
    };

    const refreshMagazines = () => {
      queryClient.invalidateQueries({ queryKey: ['magazine_calendar'] });
      queryClient.invalidateQueries({ queryKey: ['magazine_issue'] });
      queryClient.invalidateQueries({ queryKey: ['home_data'] });
    };

    const refreshCommunityPosts = () => {
      queryClient.invalidateQueries({ queryKey: ['community_posts'] });
    };

    const refreshInstitutions = () => {
      void queryClient.invalidateQueries({ queryKey: ['institution'] });
    };

    socket.on('notices:updated', refreshNotices);
    socket.on('events:updated', refreshEvents);
    socket.on('batch_photos:updated', refreshBatchPhotos);
    socket.on('magazine:updated', refreshMagazines);
    socket.on('community-posts:updated', refreshCommunityPosts);
    socket.on('institutions:updated', refreshInstitutions);

    return () => {
      socket.off('notices:updated', refreshNotices);
      socket.off('events:updated', refreshEvents);
      socket.off('batch_photos:updated', refreshBatchPhotos);
      socket.off('magazine:updated', refreshMagazines);
      socket.off('community-posts:updated', refreshCommunityPosts);
      socket.off('institutions:updated', refreshInstitutions);
    };
  }, [queryClient]);
}

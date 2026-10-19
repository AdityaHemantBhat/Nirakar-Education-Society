import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
    });
  }
  return socketInstance;
}

/** Keeps every alumni directory and profile query consistent after a server-side change. */
export function useAlumniSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    const refreshAlumni = () => {
      queryClient.invalidateQueries({ queryKey: ['alumni_directory'] });
      queryClient.invalidateQueries({ queryKey: ['alumni_profile'] });
      queryClient.invalidateQueries({ queryKey: ['alumni_dashboard_profile'] });
    };

    socket.on('alumni:updated', refreshAlumni);
    return () => {
      socket.off('alumni:updated', refreshAlumni);
    };
  }, [queryClient]);
}

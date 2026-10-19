import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function useAdmissionsSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only initialize one client socket instance
    if (!socketInstance) {
      socketInstance = io({
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
    }

    const socket = socketInstance;

    const handleConfigUpdate = (newConfig: any) => {
      // Seamlessly update React Query cache in-place without jarring reload
      queryClient.setQueryData(['admissions_config'], newConfig);
      // Invalidate to ensure any related queries stay in harmony
      queryClient.invalidateQueries({ queryKey: ['admissions_config'] });
    };

    socket.on('admissions:config_updated', handleConfigUpdate);

    return () => {
      socket.off('admissions:config_updated', handleConfigUpdate);
    };
  }, [queryClient]);
}

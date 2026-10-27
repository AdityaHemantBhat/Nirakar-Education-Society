import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { socketOrigin } from '../lib/api.js';

let socketInstance: Socket | null = null;

export function useAdmissionsSocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Only initialize one client socket instance
    if (!socketInstance) {
      socketInstance = io(socketOrigin(), {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        withCredentials: true,
      });
    }

    const socket = socketInstance;

    const handleConfigUpdate = (newConfig: any) => {
      // Seamlessly update React Query cache in-place without jarring reload
      queryClient.setQueryData(['admissions_config'], newConfig);
      // Invalidate to ensure any related queries stay in harmony
      queryClient.invalidateQueries({ queryKey: ['admissions_config'] });
    };

    const handlePopupUpdate = (newPopup: any) => {
      queryClient.setQueryData(['homepage_popup'], newPopup);
      queryClient.invalidateQueries({ queryKey: ['homepage_popup'] });
    };

    socket.on('admissions:config_updated', handleConfigUpdate);
    socket.on('admissions:popup_updated', handlePopupUpdate);

    return () => {
      socket.off('admissions:config_updated', handleConfigUpdate);
      socket.off('admissions:popup_updated', handlePopupUpdate);
    };
  }, [queryClient]);
}

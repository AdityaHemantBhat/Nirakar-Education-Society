import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { socketOrigin } from '../lib/api.js';

let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(socketOrigin(), {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1500,
      withCredentials: true,
    });
  }
  return socketInstance;
}

/**
 * Real-time socket hook for the entire Faculty system.
 * Listens for live faculty updates, additions, and deletions,
 * and updates TanStack React Query caches and browser events in real-time.
 */
export function useFacultySocket() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();

    const handleFacultyUpdate = (eventPayload: any) => {
      // Invalidate all faculty queries so lists, cards, and detail pages update instantly
      queryClient.invalidateQueries({ queryKey: ['faculty_published'] });
      queryClient.invalidateQueries({ queryKey: ['faculty_single'] });
      queryClient.invalidateQueries({ queryKey: ['faculty_admin_list'] });
      queryClient.invalidateQueries({ queryKey: ['faculty_pending'] });
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['institution'] });

      // If specific payload is included, also update single profile cache in-place
      if (eventPayload?.data?.id) {
        queryClient.setQueryData(['faculty_single', eventPayload.data.id], (old: any) => {
          if (!old) return eventPayload.data;
          return { ...old, ...eventPayload.data };
        });
      }

      // Dispatch global window event for components that listen to local storage or window events
      window.dispatchEvent(new CustomEvent('nirakar_faculty_updated', { detail: eventPayload }));
    };

    const handleFacultyDelete = (eventPayload: any) => {
      queryClient.invalidateQueries({ queryKey: ['faculty_published'] });
      queryClient.invalidateQueries({ queryKey: ['faculty_single'] });
      queryClient.invalidateQueries({ queryKey: ['faculty_admin_list'] });
      queryClient.invalidateQueries({ queryKey: ['faculty_pending'] });
      queryClient.invalidateQueries({ queryKey: ['faculty'] });
      queryClient.invalidateQueries({ queryKey: ['institution'] });

      window.dispatchEvent(new CustomEvent('nirakar_faculty_deleted', { detail: eventPayload }));
    };

    const handleFacultyReorder = (eventPayload: { facultyIds?: string[] }) => {
      if (Array.isArray(eventPayload?.facultyIds)) {
        queryClient.setQueryData(['faculty_published'], (current: any[] | undefined) => {
          if (!current) return current;
          const byId = new Map(current.map((faculty) => [faculty.id, faculty]));
          const reordered = eventPayload.facultyIds!
            .map((id) => byId.get(id))
            .filter((faculty): faculty is (typeof current)[number] => Boolean(faculty));
          const includedIds = new Set(eventPayload.facultyIds);
          return [...reordered, ...current.filter((faculty) => !includedIds.has(faculty.id))];
        });
      }
      void queryClient.invalidateQueries({ queryKey: ['faculty_published'] });
    };

    socket.on('faculty:updated', handleFacultyUpdate);
    socket.on('faculty:deleted', handleFacultyDelete);
    socket.on('faculty:reordered', handleFacultyReorder);

    return () => {
      socket.off('faculty:updated', handleFacultyUpdate);
      socket.off('faculty:deleted', handleFacultyDelete);
      socket.off('faculty:reordered', handleFacultyReorder);
    };
  }, [queryClient]);
}

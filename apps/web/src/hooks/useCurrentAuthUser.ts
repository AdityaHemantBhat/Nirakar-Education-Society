import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export interface CurrentAuthUser {
  id: string;
  username: string;
  role: string;
  email?: string;
  facultyProfile?: {
    id: string;
    designation?: string | null;
    department?: string | null;
    publicContactToggles?: unknown;
  } | null;
  alumniProfile?: { firstName?: string | null; lastName?: string | null; username?: string | null } | null;
}

async function fetchCurrentUser(): Promise<CurrentAuthUser | null> {
  const fetchMe = () =>
    fetch('/api/v1/auth/me', {
      credentials: 'same-origin',
      cache: 'no-store',
    });

  let response = await fetchMe();
  if (response.status === 401) {
    const refresh = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (refresh.status === 401) {
      localStorage.removeItem('nirakar_auth_user');
      return null;
    }
    if (!refresh.ok) throw new Error('Could not refresh the current sign-in.');
    response = await fetchMe();
  }

  if (response.status === 401) {
    localStorage.removeItem('nirakar_auth_user');
    return null;
  }
  if (!response.ok) {
    throw new Error('Could not verify the current sign-in.');
  }

  const json = await response.json();
  return json.data as CurrentAuthUser;
}

export function useCurrentAuthUser() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['current-auth-user'],
    queryFn: fetchCurrentUser,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    const refreshAuth = () => {
      void queryClient.invalidateQueries({ queryKey: ['current-auth-user'] });
    };
    window.addEventListener('nirakar:auth-changed', refreshAuth);
    window.addEventListener('storage', refreshAuth);
    return () => {
      window.removeEventListener('nirakar:auth-changed', refreshAuth);
      window.removeEventListener('storage', refreshAuth);
    };
  }, [queryClient]);

  return query.data ?? null;
}

export function notifyAuthChanged() {
  window.dispatchEvent(new Event('nirakar:auth-changed'));
}

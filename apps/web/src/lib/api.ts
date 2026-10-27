const configuredOrigin = (import.meta.env.VITE_API_URL || '').trim();

/** The Render API origin used by the Cloudflare Pages build. */
export const apiOrigin = configuredOrigin.replace(/\/+$/, '');

function isApiPath(value: string) {
  return value.startsWith('/api/') || value.startsWith('/uploads/') || value.startsWith('/socket.io');
}

export function apiUrl(input: string | URL) {
  const value = input instanceof URL ? input.toString() : input;
  if (!apiOrigin) return value;
  if (/^https?:\/\//i.test(value)) {
    const parsed = new URL(value);
    if (typeof window !== 'undefined' && parsed.origin === window.location.origin && isApiPath(parsed.pathname)) {
      return `${apiOrigin}${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return value;
  }
  if (!isApiPath(value)) return value;
  return `${apiOrigin}${value}`;
}

export function socketOrigin() {
  if (apiOrigin) return apiOrigin;
  if (['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }
  return window.location.origin;
}

function rewriteApiUrls(value: unknown): unknown {
  if (typeof value === 'string' && isApiPath(value)) return apiUrl(value);
  if (Array.isArray(value)) return value.map(rewriteApiUrls);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewriteApiUrls(entry)]));
  }
  return value;
}

/**
 * Keeps the existing relative fetch calls working locally while sending API
 * calls and their cookies to Render in a split Cloudflare Pages deployment.
 */
export function installApiFetch() {
  if (!apiOrigin || typeof window === 'undefined') return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const value = input instanceof Request ? input.url : input instanceof URL ? input.toString() : input;
    if (typeof value !== 'string' || !isApiPath(new URL(value, window.location.origin).pathname)) {
      return originalFetch(input, init);
    }

    const requestInit: RequestInit = { ...init, credentials: init?.credentials === 'omit' ? 'omit' : 'include' };
    const request = input instanceof Request ? new Request(apiUrl(input.url), input) : apiUrl(value);
    const response = await originalFetch(request, requestInit);
    const json = response.json.bind(response);
    response.json = async () => rewriteApiUrls(await json());
    return response;
  };
}

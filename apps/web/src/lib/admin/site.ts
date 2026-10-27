/**
 * The address of the public website.
 *
 * The console and the public site are two different applications. In
 * development they run on two different ports, so a link from the console
 * to a public page has to be built rather than written as a bare path —
 * a bare path would land on the console's own address, which has no such
 * page.
 *
 * In production the site is served from the same origin as the API, so
 * the console's own address is the right one to use.
 */
export function getPublicSiteUrl(): string {
  const { hostname, origin, protocol } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:5000`;
  }
  return origin;
}

/**
 * Route Preloader for Shree Nirakar Web Application
 * Ensures that code-split page chunks are preloaded BEFORE the page transition
 * curtain unwinds, preventing any flash of the previous page.
 */

const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
  '/society': () => import('../pages/SocietyPage.js'),
  '/institutions': () => import('../pages/InstitutionsPage.js'),
  '/academics': () => import('../pages/AcademicsPage.js'),
  '/notices': () => import('../pages/NoticesPage.js'),
  '/events': () => import('../pages/EventsPage.js'),
  '/gallery': () => import('../pages/GalleryPage.js'),
  '/alumni': () => import('../pages/AlumniDirectoryNextPage.js'),
  '/batch-photos': () => import('../pages/BatchPhotosPage.js'),
  '/magazine': () => import('../pages/MagazineCalendarPage.js'),
  '/patrika': () => import('../pages/MagazineCalendarPage.js'),
  '/pass': () => import('../pages/SupporterPassPage.js'),
  '/admissions': () => import('../pages/AdmissionsPage.js'),
  '/faculty': () => import('../pages/FacultyPage.js'),
  '/library': () => import('../pages/LibraryPage.js'),
  '/results': () => import('../pages/ResultsPage.js'),
  '/contact': () => import('../pages/ContactPage.js'),
  '/privacy': () => import('../pages/PolicyPage.js'),
  '/terms': () => import('../pages/PolicyPage.js'),
  '/dpdp': () => import('../pages/PolicyPage.js'),
  '/data-rights': () => import('../pages/DataRightsPage.js'),
  '/grievance-redressal': () => import('../pages/GrievanceRedressalPage.js'),
};

const preloadedCache = new Set<string>();

export function preloadRouteChunk(href: string): Promise<unknown> | null {
  if (!href || !href.startsWith('/')) return null;

  try {
    const parsed = new URL(href, window.location.origin);
    const pathname = parsed.pathname;

    if (preloadedCache.has(pathname)) return null;

    // Direct match
    if (ROUTE_LOADERS[pathname]) {
      preloadedCache.add(pathname);
      return ROUTE_LOADERS[pathname]();
    }

    // Prefix match (e.g. /society/desk, /institutions/nirakar-high-school)
    const matchedKey = Object.keys(ROUTE_LOADERS).find(
      (key) => key !== '/' && pathname.startsWith(key)
    );

    if (matchedKey) {
      preloadedCache.add(pathname);
      return ROUTE_LOADERS[matchedKey]();
    }
  } catch {
    // Ignore invalid URLs
  }

  return null;
}

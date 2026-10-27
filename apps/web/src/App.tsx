import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';

// Core landing page is eagerly imported for instant critical-path rendering
import { HomePage } from './pages/HomePage.js';

// Route-level code splitting with React.lazy for secondary routes
const SocietyPage = lazy(() =>
  import('./pages/SocietyPage.js').then((m) => ({ default: m.SocietyPage }))
);
const InstitutionsPage = lazy(() =>
  import('./pages/InstitutionsPage.js').then((m) => ({ default: m.InstitutionsPage }))
);
const AcademicsPage = lazy(() =>
  import('./pages/AcademicsPage.js').then((m) => ({ default: m.AcademicsPage }))
);
const NoticesPage = lazy(() =>
  import('./pages/NoticesPage.js').then((m) => ({ default: m.NoticesPage }))
);
const NoticeDetailPage = lazy(() =>
  import('./pages/NoticeDetailPage.js').then((m) => ({ default: m.NoticeDetailPage }))
);
const EventsPage = lazy(() =>
  import('./pages/EventsPage.js').then((m) => ({ default: m.EventsPage }))
);
const EventDetailPage = lazy(() =>
  import('./pages/EventDetailPage.js').then((m) => ({ default: m.EventDetailPage }))
);
const GalleryPage = lazy(() =>
  import('./pages/GalleryPage.js').then((m) => ({ default: m.GalleryPage }))
);
const PolicyPage = lazy(() =>
  import('./pages/PolicyPage.js').then((m) => ({ default: m.PolicyPage }))
);
const DataRightsPage = lazy(() =>
  import('./pages/DataRightsPage.js').then((m) => ({ default: m.DataRightsPage }))
);
const GrievanceRedressalPage = lazy(() =>
  import('./pages/GrievanceRedressalPage.js').then((m) => ({ default: m.GrievanceRedressalPage }))
);
const SupporterPassPage = lazy(() =>
  import('./pages/SupporterPassPage.js').then((m) => ({ default: m.SupporterPassPage }))
);
const AlumniCommunityPage = lazy(() =>
  import('./pages/AlumniCommunityPage.js').then((m) => ({ default: m.AlumniCommunityPage }))
);
const AlumniDirectoryPage = lazy(() =>
  import('./pages/AlumniDirectoryNextPage.js').then((m) => ({ default: m.AlumniDirectoryNextPage }))
);
const AlumniProfilePage = lazy(() =>
  import('./pages/AlumniProfilePage.js').then((m) => ({ default: m.AlumniProfilePage }))
);
const AlumniDashboardPage = lazy(() =>
  import('./pages/AlumniDashboardPage.js').then((m) => ({ default: m.AlumniDashboardPage }))
);
const BatchPhotosPage = lazy(() =>
  import('./pages/BatchPhotosPage.js').then((m) => ({ default: m.BatchPhotosPage }))
);
const AlumniAuthPage = lazy(() =>
  import('./pages/AlumniAuthPage.js').then((m) => ({ default: m.AlumniAuthPage }))
);
const MagazineCalendarPage = lazy(() =>
  import('./pages/MagazineCalendarPage.js').then((m) => ({ default: m.MagazineCalendarPage }))
);
const MagazineReaderPage = lazy(() =>
  import('./pages/MagazineReaderPage.js').then((m) => ({ default: m.MagazineReaderPage }))
);
const InstitutionPage = lazy(() =>
  import('./pages/InstitutionPage.js').then((m) => ({ default: m.InstitutionPage }))
);
const ContactPage = lazy(() =>
  import('./pages/ContactPage.js').then((m) => ({ default: m.ContactPage }))
);
const AdmissionsPage = lazy(() =>
  import('./pages/AdmissionsPage.js').then((m) => ({ default: m.AdmissionsPage }))
);
const FacultyPage = lazy(() =>
  import('./pages/FacultyPage.js').then((m) => ({ default: m.FacultyPage }))
);
const FacultyDetailPage = lazy(() =>
  import('./pages/FacultyDetailPage.js').then((m) => ({ default: m.FacultyDetailPage }))
);
const FacultyAuthPage = lazy(() =>
  import('./pages/FacultyAuthPage.js').then((m) => ({ default: m.FacultyAuthPage }))
);
const FacultyDashboardPage = lazy(() =>
  import('./pages/FacultyDashboardPage.js').then((m) => ({ default: m.FacultyDashboardPage }))
);
const FacultyEditPage = lazy(() =>
  import('./pages/FacultyEditPage.js').then((m) => ({ default: m.FacultyEditPage }))
);
const AdminConsolePage = lazy(() =>
  import('./pages/AdminConsolePage.js').then((m) => ({ default: m.AdminConsolePage }))
);
const LibraryPage = lazy(() =>
  import('./pages/LibraryPage.js').then((m) => ({ default: m.LibraryPage }))
);
const LibraryReaderPage = lazy(() =>
  import('./pages/LibraryReaderPage.js').then((m) => ({ default: m.LibraryReaderPage }))
);
const ResultsPage = lazy(() =>
  import('./pages/ResultsPage.js').then((m) => ({ default: m.ResultsPage }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageFallback() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[#16247e] border-t-transparent animate-spin" />
    </div>
  );
}

import { SmoothScroll } from './components/SmoothScroll.js';
import { PageTransitionLayout } from './components/PageTransitionLayout.js';
import { useFacultySocket } from './hooks/useFacultySocket.js';
import { useContentSocket } from './hooks/useContentSocket.js';
import { AuthCaptchaProvider } from './components/AuthCaptcha.js';

function RouteMountTracker() {
  const location = useLocation();
  React.useLayoutEffect(() => {
    window.dispatchEvent(
      new CustomEvent('pageRouteMounted', {
        detail: { pathname: location.pathname },
      })
    );
  }, [location.pathname]);
  return null;
}

function AppContent() {
  useFacultySocket();
  useContentSocket();

  return (
    <BrowserRouter>
      <AuthCaptchaProvider>
        <SmoothScroll>
          <PageTransitionLayout>
            <Suspense fallback={<PageFallback />}>
              <RouteMountTracker />
              <Routes>
              {/* Core Home */}
                <Route path="/" element={<HomePage />} />

              {/* Society & Identity */}
              <Route path="/society" element={<SocietyPage />} />
              <Route path="/society/:section" element={<SocietyPage />} />

              {/* Campuses & Schools */}
              <Route path="/institutions" element={<InstitutionsPage />} />
              <Route path="/institutions/:slug" element={<InstitutionPage />} />

              {/* Academics & Circulars */}
              <Route path="/academics" element={<AcademicsPage />} />
              <Route path="/faculty" element={<FacultyPage />} />
              <Route path="/faculty-directory" element={<FacultyPage />} />
              <Route path="/faculty/login" element={<FacultyAuthPage initialMode="login" />} />
              <Route path="/faculty/register" element={<FacultyAuthPage initialMode="register" />} />
              <Route path="/faculty/dashboard" element={<FacultyDashboardPage />} />
              <Route path="/faculty/edit" element={<FacultyEditPage />} />
              <Route path="/faculty/edit/:id" element={<FacultyEditPage />} />
              <Route path="/faculty/:slug/edit" element={<FacultyEditPage />} />
              <Route path="/faculty/:slug" element={<FacultyDetailPage />} />
              <Route path="/notices" element={<NoticesPage />} />
              <Route path="/notices/:slug" element={<NoticeDetailPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/gallery" element={<GalleryPage />} />

              {/* Alumni Sanctuary & Batch Archive */}
              <Route path="/alumni" element={<AlumniDirectoryPage />} />
              <Route path="/alumni/community" element={<AlumniCommunityPage />} />
              <Route path="/alumni/login" element={<AlumniAuthPage initialMode="login" />} />
              <Route path="/account/login" element={<AlumniAuthPage initialMode="login" />} />
              <Route path="/alumni/register" element={<AlumniAuthPage initialMode="register" />} />
              <Route path="/alumni/dashboard" element={<AlumniDashboardPage />} />
              <Route path="/alumni/:username" element={<AlumniProfilePage />} />
              <Route path="/batch-photos" element={<BatchPhotosPage />} />
              <Route path="/alumni/batch-photos" element={<BatchPhotosPage />} />

              {/* Daily Magazine & Supporter Pass */}
              <Route path="/magazine" element={<MagazineCalendarPage />} />
              <Route path="/magazine/:id" element={<MagazineReaderPage />} />
              <Route path="/magazine/issue/:date" element={<MagazineReaderPage />} />
              <Route path="/patrika" element={<MagazineCalendarPage />} />
              <Route path="/patrika/:id" element={<MagazineReaderPage />} />
              <Route path="/patrika/issue/:date" element={<MagazineReaderPage />} />
              <Route path="/pass" element={<SupporterPassPage />} />

              {/* Admissions & Enrolment */}
              <Route path="/admissions" element={<AdmissionsPage />} />

              {/* Digital Library */}
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/library/:slug" element={<LibraryReaderPage />} />

              {/* Academic Results */}
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/home/home_results" element={<Navigate to="/results" replace />} />

              {/* Contact & Help */}
              <Route path="/contact" element={<ContactPage />} />

              {/* Legal & Compliance */}
              <Route path="/privacy" element={<PolicyPage />} />
              <Route path="/terms" element={<PolicyPage />} />
              <Route path="/dpdp" element={<PolicyPage />} />
              <Route path="/privacy-policy" element={<PolicyPage />} />
              <Route path="/privacy-notice" element={<PolicyPage />} />
              <Route path="/cookie-policy" element={<PolicyPage />} />
              <Route path="/data-rights" element={<DataRightsPage />} />
              <Route path="/grievance-redressal" element={<GrievanceRedressalPage />} />
              <Route path="/grievance-redressal/track" element={<GrievanceRedressalPage />} />
              <Route path="/grievance-policy" element={<GrievanceRedressalPage />} />

              {/* Administrative Governance & Verification Console */}
              <Route path="/admin" element={<AdminConsolePage />} />

              {/* Designed Fallback */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <span className="text-xs uppercase font-serif font-bold text-[#16247e] tracking-widest">
                      Notice
                    </span>
                    <h1 className="font-serif text-3xl font-bold text-ink">Page Not Found</h1>
                    <p className="text-sm text-stone-600 max-w-sm">
                      The campus resource or page you requested could not be located.
                    </p>
                    <a
                      href="/"
                      className="px-6 py-2.5 rounded-xl bg-[#16247e] text-white font-serif text-xs font-bold hover:bg-[#111b5e]"
                    >
                      Return to Home
                    </a>
                  </div>
                }
              />
              </Routes>
            </Suspense>
          </PageTransitionLayout>
        </SmoothScroll>
      </AuthCaptchaProvider>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

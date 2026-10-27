import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthCaptchaProvider } from './components/AuthCaptcha.js';

const AdminDataProvider = lazy(() =>
  import('./components/AdminDataProvider.js').then((m) => ({ default: m.AdminDataProvider }))
);
const AdminLayout = lazy(() =>
  import('./layouts/AdminLayout.js').then((m) => ({ default: m.AdminLayout }))
);
const AdminDashboard = lazy(() =>
  import('./pages/AdminDashboard.js').then((m) => ({ default: m.AdminDashboard }))
);
const MagazineManagerPage = lazy(() =>
  import('./pages/MagazineManagerPage.js').then((m) => ({ default: m.MagazineManagerPage }))
);
const LibraryManagerPage = lazy(() =>
  import('./pages/LibraryManagerPage.js').then((m) => ({ default: m.LibraryManagerPage }))
);
const AlumniManagerPage = lazy(() =>
  import('./pages/AlumniManagerPage.js').then((m) => ({ default: m.AlumniManagerPage }))
);
const FacultyManagerPage = lazy(() =>
  import('./pages/FacultyManagerPage.js').then((m) => ({ default: m.FacultyManagerPage }))
);
const FacultyPortalPage = lazy(() =>
  import('./pages/FacultyPortalPage.js').then((m) => ({ default: m.FacultyPortalPage }))
);
const FacultyMessagesPage = lazy(() =>
  import('./pages/FacultyMessagesPage.js').then((m) => ({ default: m.FacultyMessagesPage }))
);
const AdmissionsManagerPage = lazy(() =>
  import('./pages/AdmissionsManagerPage.js').then((m) => ({ default: m.AdmissionsManagerPage }))
);
const AdmissionDetailPage = lazy(() =>
  import('./pages/AdmissionDetailPage.js').then((m) => ({ default: m.AdmissionDetailPage }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/AdminLoginPage.js').then((m) => ({ default: m.AdminLoginPage }))
);
const FacultyLoginPage = lazy(() =>
  import('./pages/FacultyLoginPage.js').then((m) => ({ default: m.FacultyLoginPage }))
);
const ContentManagerPage = lazy(() =>
  import('./pages/ContentManagerPage.js').then((m) => ({ default: m.ContentManagerPage }))
);
const HeroSlidesManagerPage = lazy(() =>
  import('./pages/HeroSlidesManagerPage.js').then((m) => ({ default: m.HeroSlidesManagerPage }))
);
const BatchPhotosManagerPage = lazy(() =>
  import('./pages/BatchPhotosManagerPage.js').then((m) => ({ default: m.BatchPhotosManagerPage }))
);
const BatchPhotoEditorPage = lazy(() =>
  import('./pages/BatchPhotoEditorPage.js').then((m) => ({ default: m.BatchPhotoEditorPage }))
);
const AddFacultyPage = lazy(() =>
  import('./pages/AddFacultyPage.js').then((m) => ({ default: m.AddFacultyPage }))
);
const AuditLogPage = lazy(() =>
  import('./pages/AuditLogPage.js').then((m) => ({ default: m.AuditLogPage }))
);
const CommentsManagerPage = lazy(() =>
  import('./pages/CommentsManagerPage.js').then((m) => ({ default: m.CommentsManagerPage }))
);
const ConsoleSettingsPage = lazy(() =>
  import('./pages/ConsoleSettingsPage.js').then((m) => ({ default: m.ConsoleSettingsPage }))
);
const InstitutionContentPage = lazy(() =>
  import('./pages/InstitutionContentPage.js').then((m) => ({ default: m.InstitutionContentPage }))
);
const HomepagePopupManagerPage = lazy(() =>
  import('./pages/HomepagePopupManagerPage.js').then((m) => ({ default: m.HomepagePopupManagerPage }))
);
const ResultsManagerPage = lazy(() =>
  import('./pages/ResultsManagerPage.js').then((m) => ({ default: m.ResultsManagerPage }))
);
const GalleryManagerPage = lazy(() =>
  import('./pages/GalleryManagerPage.js').then((m) => ({ default: m.GalleryManagerPage }))
);
const PrivacyCasesPage = lazy(() =>
  import('./pages/PrivacyCasesPage.js').then((m) => ({ default: m.PrivacyCasesPage }))
);


export function App() {
  const basePath = import.meta.env.VITE_ADMIN_BASE_PATH || (import.meta.env.PROD ? '/admin' : '/');

  /**
   * Where the sign-in page lives.
   *
   * An administrator can move it from the settings, so the address is
   * read from the server rather than being fixed in the router. Until it
   * arrives, the usual `/login` is used, so the console still works.
   */
  const [loginPath, setLoginPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    fetch('/api/v1/settings/login-path')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled) return;
        const path = json?.data?.path;
        if (typeof path === 'string' && path) setLoginPath(path);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <BrowserRouter basename={basePath}>
      <AuthCaptchaProvider>
        <Suspense
          fallback={
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-brand-700 border-t-transparent animate-spin" />
            </div>
          }
        >
          <Routes>
            {/*
              The sign-in page lives at whichever address it has been
              given. The usual `/login` still works while the custom
              address is being fetched — otherwise a bookmark would break
              — but once it is known, `/login` sends the visitor on to the
              real address, so the old door stops being a door.
            */}
            {loginPath && loginPath !== 'login' ? (
              <>
                <Route path="/login" element={<Navigate to={`/${loginPath}`} replace />} />
                <Route path={`/${loginPath}`} element={<AdminLoginPage />} />
              </>
            ) : (
              <Route path="/login" element={<AdminLoginPage />} />
            )}

            <Route path="/faculty/login" element={<FacultyLoginPage />} />
            <Route
              path="/faculty/me"
              element={
                <AdminDataProvider>
                  <FacultyPortalPage />
                </AdminDataProvider>
              }
            />
            <Route
              path="/faculty/messages"
              element={
                <AdminDataProvider>
                  <FacultyMessagesPage scope="faculty" />
                </AdminDataProvider>
              }
            />

            {/* Authenticated Admin Management Shell */}
            <Route
              path="/"
              element={
                <AdminDataProvider>
                  <AdminLayout />
                </AdminDataProvider>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="admissions" element={<AdmissionsManagerPage />} />
              <Route path="admissions/:id" element={<AdmissionDetailPage />} />
              <Route path="magazines" element={<MagazineManagerPage />} />
              {/* The Media Library was the same page as the School
                  Magazine under a second name. The old address now sends
                  the administrator to the one page that remains. */}
              <Route path="media" element={<Navigate to="/magazines" replace />} />
              <Route path="library" element={<LibraryManagerPage />} />
              <Route path="alumni" element={<AlumniManagerPage />} />
              <Route path="activity-log" element={<AuditLogPage />} />
              <Route path="comments" element={<CommentsManagerPage />} />
              <Route path="settings" element={<ConsoleSettingsPage />} />
              <Route path="institutions" element={<InstitutionContentPage />} />
              <Route path="batch-photos" element={<BatchPhotosManagerPage />} />
              <Route path="batch-photos/new" element={<BatchPhotoEditorPage />} />
              <Route path="batch-photos/:id/edit" element={<BatchPhotoEditorPage />} />
              <Route path="faculty" element={<FacultyManagerPage />} />
              <Route path="faculty/add" element={<AddFacultyPage />} />
              <Route path="content" element={<ContentManagerPage />} />
              <Route path="home-slider" element={<HeroSlidesManagerPage />} />
              <Route path="homepage-popup" element={<HomepagePopupManagerPage />} />
              <Route path="academic-results" element={<ResultsManagerPage />} />
              <Route path="gallery" element={<GalleryManagerPage />} />
              <Route path="homepage-feature-cards" element={<Navigate to="/home-slider" replace />} />
              <Route path="messages" element={<FacultyMessagesPage />} />
              <Route path="privacy-cases" element={<PrivacyCasesPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthCaptchaProvider>
    </BrowserRouter>
  );
}

export default App;

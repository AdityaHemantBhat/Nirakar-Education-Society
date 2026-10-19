import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
const AccessSettingsPage = lazy(() =>
  import('./pages/AccessSettingsPage.js').then((m) => ({ default: m.AccessSettingsPage }))
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
const AdminLoginPage = lazy(() =>
  import('./pages/AdminLoginPage.js').then((m) => ({ default: m.AdminLoginPage }))
);
const FacultyLoginPage = lazy(() =>
  import('./pages/FacultyLoginPage.js').then((m) => ({ default: m.FacultyLoginPage }))
);
const ContentManagerPage = lazy(() =>
  import('./pages/ContentManagerPage.js').then((m) => ({ default: m.ContentManagerPage }))
);
const BatchPhotosManagerPage = lazy(() =>
  import('./pages/BatchPhotosManagerPage.js').then((m) => ({ default: m.BatchPhotosManagerPage }))
);
const AddFacultyPage = lazy(() =>
  import('./pages/AddFacultyPage.js').then((m) => ({ default: m.AddFacultyPage }))
);

export function App() {
  const basePath = process.env.NODE_ENV === 'production' ? '/admin' : '/';

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
            <Route path="/login" element={<AdminLoginPage />} />
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
              <Route path="magazines" element={<MagazineManagerPage />} />
              <Route path="access" element={<AccessSettingsPage />} />
              <Route path="alumni" element={<AlumniManagerPage />} />
              <Route path="batch-photos" element={<BatchPhotosManagerPage />} />
              <Route path="faculty" element={<FacultyManagerPage />} />
              <Route path="faculty/add" element={<AddFacultyPage />} />
              <Route path="media" element={<MagazineManagerPage />} />
              <Route path="content" element={<ContentManagerPage />} />
              <Route path="messages" element={<FacultyMessagesPage />} />
            </Route>
          </Routes>
        </Suspense>
      </AuthCaptchaProvider>
    </BrowserRouter>
  );
}

export default App;

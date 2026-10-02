import React, { useEffect, useState, useCallback } from 'react';
import LoadingScreen from './components/LoadingScreen';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout, PublicLayout } from './components/Layout';
const PublicHome = React.lazy(() => import('./pages/PublicHome'));
const Privacy = React.lazy(() => import('./pages/Privacy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Security = React.lazy(() => import('./pages/Security'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminStudents = React.lazy(() => import('./pages/AdminStudents'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const AdminLogin = React.lazy(() => import('./pages/AdminLogin'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const SuperDashboard = React.lazy(() => import('./pages/SuperDashboard'));

const StandaloneVerify = React.lazy(() => import('./pages/StandaloneVerify'));
const SchoolDataExplorer = React.lazy(() => import('./pages/SchoolDataExplorer'));
import SubscriptionGuard from './components/SubscriptionGuard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { seedDatabase, isAuthenticated, getUserSession, syncClerkUser, trackActivity } from './services/api';
import { ThemeProvider } from './components/ThemeContext';
import { LazyMotion, domAnimation } from 'framer-motion';

import { useUser, useClerk } from "@clerk/clerk-react";

import { useTranslation } from 'react-i18next';

// Auth Guard
const AdminGuard: React.FC<{ children: React.ReactNode, requireSuper?: boolean, ignoreOnboarding?: boolean }> = ({ children, requireSuper, ignoreOnboarding }) => {
  const { t } = useTranslation();
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [session, setSession] = useState(getUserSession());
  const [syncing, setSyncing] = useState(() => {
    const s = getUserSession();
    const isLegacy = s.role === 'super_admin' && s.isAuthenticated;
    return !isLegacy && !s.email;
  });
  const syncAttempted = React.useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setSyncing(false);
      return;
    }

    if (!user || syncAttempted.current) return;

    const currentSession = getUserSession();
    const isLegacy = currentSession.role === 'super_admin' && currentSession.isAuthenticated;

    if (!currentSession.email || (!isLegacy && !currentSession.schoolId)) {
      syncAttempted.current = true;
      setSyncing(true);
      syncClerkUser(user)
        .then(() => {
          const freshSession = getUserSession();
          setSession(freshSession);
          if (freshSession.email) trackActivity(freshSession.email);
        })
        .catch((err) => {
          console.error('Sync failed:', err);
        })
        .finally(() => {
          setSyncing(false);
        });
    } else {
      setSyncing(false);
      if (user?.primaryEmailAddress?.emailAddress) {
        trackActivity(user.primaryEmailAddress.emailAddress);
      }
    }
  }, [isLoaded, isSignedIn, user]);

  const isSuperAdmin = session.role === 'super_admin' && session.isAuthenticated;

  // 1. If route requires Super Admin role but user is NOT Super Admin
  if (requireSuper && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // 2. If authenticated via Clerk (school admins/users)
  if (isLoaded && isSignedIn && !syncing) {
    if (!session.hasOnboarded && !ignoreOnboarding && !isSuperAdmin) {
      return <Navigate to="/admin/onboarding" replace />;
    }

    if (session.schoolStatus === 'pending' && !isSuperAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
          <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl shadow-slate-200/50 text-center border border-slate-100">
            <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-8 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">{t('Activation Pending')}</h2>
            <p className="text-slate-600 font-bold mb-8 leading-relaxed">
              {t('Your school account is currently being reviewed. Please contact the platform administration to activate your system access.')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-qabas-purple text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-800 transition-all active:scale-[0.98]"
            >
              {t('Check Status')}
            </button>
            <button
              onClick={() => signOut(() => { window.location.href = '/#/admin/login'; })}
              className="mt-6 text-sm font-black text-slate-500 hover:text-qabas-purple transition-colors block w-full text-center"
            >
              Login to another account
            </button>
          </div>
        </div>
      );
    }

    return <AdminLayout>{children}</AdminLayout>;
  }

  // 3. Super Admin authenticated via local session
  if (isSuperAdmin) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  // 4. Loading state while Clerk is loading or syncing
  if (!isLoaded || syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 text-sm font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // 5. Not signed in -> redirect to login
  return <Navigate to="/admin/login" replace />;
};

const LoadingFallback = () => {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">{t('loading')}</p>
      </div>
    </div>
  );
};

const App = () => {
  const [appReady, setAppReady] = useState(false);
  const handleLoadingDone = useCallback(() => setAppReady(true), []);

  useEffect(() => {
    console.log('App Mounted - Version: 2026-03-26 PWA Safe Area & Verify Fix'); // Updated version string
    seedDatabase();
  }, []);

  return (
    <>
      {!appReady && <LoadingScreen onFinished={handleLoadingDone} />}
      <ThemeProvider>
        <LazyMotion features={domAnimation}>
          <HashRouter>
            <React.Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicLayout><PublicHome /></PublicLayout>} />
                <Route path="/verify" element={<PublicLayout><PublicHome /></PublicLayout>} />
                <Route path="/v/:id" element={<PublicLayout><StandaloneVerify /></PublicLayout>} />
                <Route path="/privacy" element={<PublicLayout><Privacy /></PublicLayout>} />
                <Route path="/terms" element={<PublicLayout><Terms /></PublicLayout>} />
                <Route path="/security" element={<PublicLayout><Security /></PublicLayout>} />

                {/* Auth Route */}
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route path="/admin/onboarding" element={
                  <AdminGuard ignoreOnboarding>
                    <Onboarding />
                  </AdminGuard>
                } />

                {/* Super Admin Routes */}
                <Route path="/super" element={
                  <AdminGuard requireSuper>
                    <SuperDashboard />
                  </AdminGuard>
                } />

                <Route path="/super/explorer" element={
                  <AdminGuard requireSuper>
                    <SchoolDataExplorer />
                  </AdminGuard>
                } />

                {/* Protected Admin Routes */}
                <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

                <Route path="/admin/dashboard" element={
                  <AdminGuard>
                    <SubscriptionGuard>
                      <AdminDashboard />
                    </SubscriptionGuard>
                  </AdminGuard>
                } />

                <Route path="/admin/students" element={
                  <AdminGuard>
                    <SubscriptionGuard>
                      <AdminStudents />
                    </SubscriptionGuard>
                  </AdminGuard>
                } />

                <Route path="/admin/settings" element={
                  <AdminGuard>
                    <SubscriptionGuard>
                      <AdminSettings />
                    </SubscriptionGuard>
                  </AdminGuard>
                } />



              </Routes>
            </React.Suspense>
          </HashRouter>
          <PWAInstallPrompt />
        </LazyMotion>
      </ThemeProvider>
    </>
  );
};

export default App;

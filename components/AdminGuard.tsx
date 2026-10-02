'use client';

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "@clerk/clerk-react";
import { useTranslation } from 'react-i18next';
import { getUserSession, syncClerkUser, trackActivity } from '../services/api';
import { AdminLayout } from './Layout';

interface AdminGuardProps {
  children: React.ReactNode;
  requireSuper?: boolean;
  ignoreOnboarding?: boolean;
}

const AdminGuard: React.FC<AdminGuardProps> = ({ children, requireSuper, ignoreOnboarding }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, user } = useUser();
  const [syncing, setSyncing] = useState(false);
  const [session, setSession] = useState(getUserSession());
  const syncAttempted = React.useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user || syncAttempted.current) return;

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
    } else if (isSignedIn && user?.primaryEmailAddress?.emailAddress) {
      trackActivity(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, isSignedIn, user]);

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

  const isLegacySuper = session.role === 'super_admin' && session.isAuthenticated;

  // Sign in check
  if (!isSignedIn && !isLegacySuper) {
    navigate('/admin/login');
    return null;
  }

  // Super admin checks
  if (requireSuper && !isLegacySuper) {
    navigate('/admin/dashboard');
    return null;
  }

  if (isLegacySuper && !requireSuper && !session.schoolId) {
    navigate('/super');
    return null;
  }

  // Onboarding check
  if (!isLegacySuper && !session.hasOnboarded && !ignoreOnboarding) {
    navigate('/admin/onboarding');
    return null;
  }

  // Pending check
  if (!isLegacySuper && session.schoolStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 shadow-xl shadow-slate-200/50 text-center border border-slate-100">
          <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-8 animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4" /><path d="m16.2 7.8 2.9-2.9" /><path d="M18 12h4" /><path d="m16.2 16.2 2.9 2.9" /><path d="M12 18v4" /><path d="m4.9 19.1 2.9-2.9" /><path d="M2 12h4" /><path d="m4.9 4.9 2.9 2.9" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3">{t('Activation Pending')}</h2>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {t('Your school account is currently being reviewed. Please contact the platform administration to activate your system access.')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-qabas-purple text-white py-4 rounded-2xl font-black shadow-lg shadow-purple-200 hover:bg-purple-800 transition-all active:scale-[0.98]"
          >
            {t('Check Status')}
          </button>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminGuard;

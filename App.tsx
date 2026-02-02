import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout, PublicLayout } from './components/Layout';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminSettings from './pages/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import SuperDashboard from './pages/SuperDashboard';
import AdminAttendance from './pages/AdminAttendance';
import SubscriptionGuard from './components/SubscriptionGuard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import { seedDatabase, isAuthenticated, getUserSession } from './services/mockBackend';

// Auth Guard
const AdminGuard: React.FC<{ children: React.ReactNode, requireSuper?: boolean }> = ({ children, requireSuper }) => {
  const session = getUserSession();

  if (!session.isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireSuper && session.role !== 'super_admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If person is super admin but trying to access school routes without context
  if (session.role === 'super_admin' && !requireSuper && !session.schoolId) {
    return <Navigate to="/super" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => {
  useEffect(() => {
    console.log('App Mounted - Version: 2026-02-02 Update 1'); // Deployment verification tag
    seedDatabase();
  }, []);

  return (
    <>
      <HashRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><PublicHome /></PublicLayout>} />
          <Route path="/verify" element={<PublicLayout><PublicHome /></PublicLayout>} />

          {/* Auth Route */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Super Admin Route */}
          <Route path="/super" element={
            <AdminGuard requireSuper>
              <SuperDashboard />
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

          <Route path="/admin/attendance" element={
            <AdminGuard>
              <SubscriptionGuard>
                <AdminAttendance />
              </SubscriptionGuard>
            </AdminGuard>
          } />

        </Routes>
      </HashRouter>
      <PWAInstallPrompt />
    </>
  );
};

export default App;

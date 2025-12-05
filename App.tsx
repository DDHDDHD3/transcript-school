import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout, PublicLayout } from './components/Layout';
import PublicHome from './pages/PublicHome';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminSettings from './pages/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import { seedDatabase, isAuthenticated } from './services/mockBackend';

// Auth Guard
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check auth state
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
};

const App = () => {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><PublicHome /></PublicLayout>} />
        <Route path="/verify" element={<PublicLayout><PublicHome /></PublicLayout>} />
        
        {/* Auth Route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
        
        <Route path="/admin/dashboard" element={
          <AdminGuard>
            <AdminDashboard />
          </AdminGuard>
        } />
        
        <Route path="/admin/students" element={
          <AdminGuard>
            <AdminStudents />
          </AdminGuard>
        } />

        <Route path="/admin/settings" element={
          <AdminGuard>
            <AdminSettings />
          </AdminGuard>
        } />

      </Routes>
    </HashRouter>
  );
};

export default App;
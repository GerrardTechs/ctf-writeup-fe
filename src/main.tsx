import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from '@/store/auth.store';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { WriteupFormPage } from '@/pages/writeup/WriteupFormPage';
import { WriteupDetailPage } from '@/pages/writeup/WriteupDetailPage';
import { WriteupEditPage } from '@/pages/writeup/WriteupEditPage';
import { SharePage } from '@/pages/SharePage';
import { LandingPage } from '@/pages/LandingPage';
import { useThemeStore } from '@/store/theme.store';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';
import { VerifyOtpPage } from '@/pages/auth/VerifyOtpPage';

import './index.css';

function App() {
  const { init: initAuth } = useAuthStore();
  const { init: initTheme } = useThemeStore();

  React.useEffect(() => {
    initAuth();
    initTheme();
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(224 71% 6%)',
            color: 'hsl(213 31% 91%)',
            border: '1px solid hsl(216 34% 17%)',
            fontSize: '13px',
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/writeup/new" element={
          <ProtectedRoute><WriteupFormPage /></ProtectedRoute>
        } />
        <Route path="/writeup/:id" element={
          <ProtectedRoute><WriteupDetailPage /></ProtectedRoute>
        } />
        <Route path="/writeup/:id/edit" element={
          <ProtectedRoute><WriteupEditPage /></ProtectedRoute>
        } />
        <Route path="/share/:token" element={<SharePage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
);
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

import './index.css';

function App() {
  const { init } = useAuthStore();
  const [ready, setReady] = React.useState(false);
  
  React.useEffect(() => {
    init();
    setReady(true);
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
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
);
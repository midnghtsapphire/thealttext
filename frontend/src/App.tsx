/**
 * TheAltText — Main App Component
 * Routes, authentication, and layout management.
 * A GlowStarLabs product by Audrey Evans.
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import AccessibilityMenu from './components/AccessibilityMenu';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import AnalyzePage from './pages/AnalyzePage';
import BulkUploadPage from './pages/BulkUploadPage';
import ScannerPage from './pages/ScannerPage';
import ReportsPage from './pages/ReportsPage';
import DeveloperPage from './pages/DeveloperPage';
import BillingPage from './pages/BillingPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user, isAuthenticated, login, register, logout, refreshUser } = useAuth();

  return (
    <AccessibilityProvider>
      <AccessibilityMenu />
      <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage mode="login" onLogin={login} onRegister={register} />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <AuthPage mode="register" onLogin={login} onRegister={register} />
          )
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <DashboardPage user={user} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analyze"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <AnalyzePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bulk"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <BulkUploadPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scanner"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <ScannerPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <ReportsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <DeveloperPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <BillingPage user={user} />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout user={user} onLogout={logout}>
              <SettingsPage user={user} onUpdate={refreshUser} />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AccessibilityProvider>
  );
}

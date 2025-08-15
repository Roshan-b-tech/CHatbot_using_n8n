import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { NhostProvider, useAuthenticationStatus } from '@nhost/react';
import { nhost } from './config/nhost';
import { apolloClient } from './config/apollo';
import { AuthForm } from './components/Auth/AuthForm';
import { EmailVerification } from './components/Auth/EmailVerification';
import Dashboard from './pages/Dashboard';
import { refreshTokenIfNeeded } from './utils/auth';
import { ThemeProvider } from './contexts/ThemeContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  // Helper function to get base URL
  const getBaseUrl = () => {
    return import.meta.env.VITE_APP_URL || 'https://chatbotwithn8n.netlify.app';
  };

  // Debug authentication state
  useEffect(() => {
    console.log('Authentication state changed:', { isAuthenticated, isLoading });

    // Check if there are any stored tokens
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('nhost.auth.accessToken');
      const refreshToken = localStorage.getItem('nhost.auth.refreshToken');
      console.log('Stored tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        isAuthenticated: nhost.auth.isAuthenticated()
      });
    }

    // If user just got authenticated, log the redirect
    if (isAuthenticated && !isLoading) {
      console.log('🚀 User authenticated! Redirecting to Dashboard...');
    }
  }, [isAuthenticated, isLoading]);

  // Set up periodic token refresh when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Setting up token refresh for authenticated user');

      // Refresh token every 10 minutes to prevent expiration
      const refreshInterval = setInterval(async () => {
        try {
          // Only refresh if still authenticated
          if (nhost.auth.isAuthenticated()) {
            console.log('Periodic token refresh triggered');
            await refreshTokenIfNeeded();
          }
        } catch (error) {
          console.error('Periodic token refresh failed:', error);
        }
      }, 10 * 60 * 1000); // 10 minutes

      // Also refresh token when tab becomes visible (user returns to app)
      const handleVisibilityChange = () => {
        if (!document.hidden && nhost.auth.isAuthenticated()) {
          console.log('Tab visibility change triggered token refresh');
          refreshTokenIfNeeded().catch(console.error);
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        console.log('Cleaning up token refresh for user');
        clearInterval(refreshInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/verify-email"
        element={isAuthenticated ? <Navigate to={`${getBaseUrl()}/dashboard`} replace /> : <EmailVerification />}
      />
      <Route
        path="/dashboard"
        element={isAuthenticated ? <Dashboard /> : <Navigate to={`${getBaseUrl()}/auth`} replace />}
      />
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to={`${getBaseUrl()}/dashboard`} replace /> : <AuthForm />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to={`${getBaseUrl()}/dashboard`} replace /> : <Navigate to={`${getBaseUrl()}/auth`} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <NhostProvider nhost={nhost}>
        <ApolloProvider client={apolloClient}>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ApolloProvider>
      </NhostProvider>
    </ThemeProvider>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import { useSignUpEmailPassword, useSignInEmailPassword, useAuthenticationStatus } from '@nhost/react';
import { MessageCircle, Mail, Lock, User, AlertCircle, Zap, CheckCircle } from 'lucide-react';
import { initializeBoltAuth } from '../../config/bolt';
import { nhost, boltConfig } from '../../config/nhost';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [useBolt, setUseBolt] = useState(boltConfig.enabled);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { isAuthenticated, isLoading: authLoading } = useAuthenticationStatus();

  const {
    signUpEmailPassword,
    isLoading: isSigningUp,
    error: signUpError
  } = useSignUpEmailPassword();

  const {
    signInEmailPassword,
    isLoading: isSigningIn,
    error: signInError
  } = useSignInEmailPassword();

  const isLoading = isSigningUp || isSigningIn;
  const error = signUpError || signInError;

  // Monitor authentication state changes
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log('User is now authenticated, should redirect to Dashboard');
      // The App.tsx will automatically show Dashboard when isAuthenticated is true
    }
  }, [isAuthenticated, authLoading]);

  // Force authentication state check after successful auth
  useEffect(() => {
    if (isSuccess) {
      // Force a check of the current authentication state
      const checkAuth = () => {
        const currentAuthState = nhost.auth.isAuthenticated();
        console.log('Current auth state after success:', currentAuthState);

        if (currentAuthState) {
          console.log('✅ User is authenticated, redirect should happen now');
        } else {
          console.log('⏳ Waiting for authentication state to update...');
        }
      };

      // Check immediately and after a short delay
      checkAuth();
      const timeoutId = setTimeout(checkAuth, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [isSuccess]);

  // Initialize Bolt authentication if enabled
  const boltAuth = useBolt ? initializeBoltAuth({
    nhost,
    boltApiKey: boltConfig.apiKey,
    boltWebhookUrl: boltConfig.webhookUrl,
  }) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        if (useBolt && boltAuth) {
          // Use Bolt authentication with webhook
          const result = await signUpEmailPassword(email, password, {
            displayName: displayName || undefined,
          });

          // Check if signup was successful
          if (result.error) {
            console.error('Signup failed:', result.error);
            // The error will be displayed by the useSignUpEmailPassword hook
            return;
          }

          // If signup successful, trigger Bolt webhook
          if (boltConfig.webhookUrl) {
            try {
              await fetch(boltConfig.webhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${boltConfig.apiKey || ''}`,
                },
                body: JSON.stringify({
                  action: 'sign_up',
                  email,
                  displayName,
                  userId: result.user?.id,
                  timestamp: new Date().toISOString(),
                }),
              });
              console.log('Bolt webhook called successfully for signup');
            } catch (webhookError) {
              console.warn('Bolt webhook call failed:', webhookError);
            }
          }

          // Signup successful - show success message
          console.log('Signup successful:', result.user);
          setIsSuccess(true);
          setSuccessMessage('Account created successfully! Redirecting to dashboard...');

          // Clear form
          setEmail('');
          setPassword('');
          setDisplayName('');

          // Wait a moment then check if user is authenticated
          setTimeout(() => {
            if (nhost.auth.isAuthenticated()) {
              console.log('User authenticated after signup, redirect should happen automatically');
            }
          }, 1000);
        } else {
          const result = await signUpEmailPassword(email, password, {
            displayName: displayName || undefined,
          });

          if (result.error) {
            console.error('Signup failed:', result.error);
            return;
          }

          console.log('Signup successful:', result.user);
          setIsSuccess(true);
          setSuccessMessage('Account created successfully! Redirecting to dashboard...');

          // Clear form
          setEmail('');
          setPassword('');
          setDisplayName('');
        }
      } else {
        if (useBolt && boltAuth) {
          // Use Bolt authentication with webhook
          const result = await signInEmailPassword(email, password);

          // Check if signin was successful
          if (result.error) {
            console.error('Signin failed:', result.error);
            // The error will be displayed by the useSignInEmailPassword hook
            return;
          }

          // If signin successful, trigger Bolt webhook
          if (boltConfig.webhookUrl) {
            try {
              await fetch(boltConfig.webhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${boltConfig.apiKey || ''}`,
                },
                body: JSON.stringify({
                  action: 'sign_in',
                  email,
                  userId: result.user?.id,
                  timestamp: new Date().toISOString(),
                }),
              });
              console.log('Bolt webhook called successfully for signin');
            } catch (webhookError) {
              console.warn('Bolt webhook call failed:', webhookError);
            }
          }

          // Signin successful - show success message
          console.log('Signin successful:', result.user);
          setIsSuccess(true);
          setSuccessMessage('Signed in successfully! Redirecting to dashboard...');

          // Clear form
          setEmail('');
          setPassword('');
        } else {
          const result = await signInEmailPassword(email, password);

          if (result.error) {
            console.error('Signin failed:', result.error);
            return;
          }

          console.log('Signin successful:', result.user);
          setIsSuccess(true);
          setSuccessMessage('Signed in successfully! Redirecting to dashboard...');

          // Clear form
          setEmail('');
          setPassword('');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  // Show success message if authentication was successful
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Success!</h2>
            <p className="text-gray-600 mb-6">{successMessage}</p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-blue-600">Redirecting...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-4 p-3 shadow-lg">
            <img
              src="/chatbotlogo.png"
              alt="AI Chatbot"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-ranade font-bold text-black mb-2">AI Chatbot</h1>
          <p className="text-gray-700 mt-2 font-ranade-medium">
            {isSignUp ? 'Create your account to get started' : 'Welcome back! Please sign in'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="displayName" className="block text-sm font-ranade-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your display name"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-ranade-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-ranade-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
            </div>



            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error.message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 font-ranade-semibold"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-700 font-ranade-medium"
            >
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"
              }
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}
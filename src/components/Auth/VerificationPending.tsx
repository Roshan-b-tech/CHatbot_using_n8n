import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { sendVerificationEmail, canResendVerification, getResendCountdown, clearVerificationData } from '../../utils/emailVerification';

interface VerificationPendingProps {
  userEmail: string;
  onBackToSignIn?: () => void;
}

export function VerificationPending({ userEmail, onBackToSignIn }: VerificationPendingProps) {
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [isProcessing, setIsProcessing] = useState(true);

  // Update countdown and resend availability
  useEffect(() => {
    const updateCountdown = () => {
      const remaining = getResendCountdown();
      setCountdown(remaining);
      setCanResend(canResendVerification());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Stop processing state after a short delay
    const processingTimer = setTimeout(() => {
      setIsProcessing(false);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(processingTimer);
    };
  }, []);

  const handleResendVerification = async () => {
    if (!canResend) return;
    setIsResending(true);
    setResendError('');
    setResendSuccess(false);

    try {
      const result = await sendVerificationEmail(userEmail);

      if (result.success) {
        setResendSuccess(true);
        // Clear success message after 5 seconds
        setTimeout(() => setResendSuccess(false), 5000);
      } else {
        setResendError(result.error || 'Failed to resend verification email.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setResendError('Failed to resend verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    // Clear verification data when going back
    clearVerificationData();

    if (onBackToSignIn) {
      onBackToSignIn();
    } else {
      navigate('/auth');
    }
  };

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
            Verify Your Email
          </p>
        </div>

        {/* Verification Pending Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Mail size={32} className="text-blue-600" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email</h2>

            {isProcessing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  <span className="text-sm">Processing your signup...</span>
                </div>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              {isProcessing ? 'We\'re sending a verification link to:' : 'We\'ve sent a verification link to:'}
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-800 font-medium break-all">{userEmail}</p>
            </div>

            <p className="text-gray-600 mb-6">
              {isProcessing
                ? 'Please wait while we process your signup and send the verification email...'
                : 'Click the link in your email to verify your account and start using the AI Chatbot.'
              }
            </p>

            {/* Spam Folder Instructions */}
            {!isProcessing && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  📧 Email not received?
                </h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Add verification emails to your contacts</li>
                  <li>• Wait a few minutes for delivery</li>
                  <li>• Use the resend button below if needed</li>
                </ul>
              </div>
            )}

            {/* Resend Section */}
            <div className="border-t pt-6 mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Didn't receive the email?
              </p>

              <button
                onClick={handleResendVerification}
                disabled={isResending || !canResend || isProcessing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 mb-3"
              >
                {isResending ? (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} className="animate-spin" />
                    Sending...
                  </div>
                ) : isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </div>
                ) : !canResend ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock size={16} />
                    Wait {countdown}s to resend
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={16} />
                    Resend Verification Email
                  </div>
                )}
              </button>

              {resendSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle size={16} />
                    <span className="text-sm">Verification email sent successfully!</span>
                  </div>
                </div>
              )}

              {resendError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <span className="text-sm">{resendError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Back to Sign In */}
            <button
              onClick={handleBackToSignIn}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
            >
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft size={16} />
                Back to Sign In
              </div>
            </button>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Having trouble? Check your spam folder or{' '}
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className="text-blue-600 hover:text-blue-700 underline"
            >
              contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

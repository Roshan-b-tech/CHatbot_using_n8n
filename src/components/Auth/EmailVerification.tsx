import React, { useState, useEffect } from 'react';
import { useAuthenticationStatus } from '@nhost/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { nhost } from '../../config/nhost';
import { sendVerificationEmail } from '../../utils/emailVerification';

export function EmailVerification() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
    const [errorMessage, setErrorMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    const { isAuthenticated } = useAuthenticationStatus();
    const [isVerifying, setIsVerifying] = useState(false);

    // Get token from URL params
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    useEffect(() => {
        // If user is already authenticated, redirect to dashboard
        if (isAuthenticated) {
            navigate('/dashboard');
            return;
        }

        // Check for verification errors in URL first
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');

        if (error) {
            if (error.includes('expired') || error.includes('invalid')) {
                setVerificationStatus('expired');
                setErrorMessage('Verification link has expired or is invalid. Please request a new one.');
            } else {
                setVerificationStatus('error');
                setErrorMessage('Verification failed: ' + error);
            }
            return;
        }

        // If no token, show error
        if (!token) {
            setVerificationStatus('error');
            setErrorMessage('No verification token found. Please check your email for the verification link.');
            return;
        }

        // Verify email with token
        const verifyEmailToken = async () => {
            try {
                setIsVerifying(true);

                // For Nhost v2, the verification happens automatically when the page loads
                // We just need to wait and check the authentication state
                // Wait a moment for Nhost to process the token
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Check if the user is now authenticated
                const isNowAuthenticated = nhost.auth.isAuthenticated();

                if (isNowAuthenticated) {
                    setVerificationStatus('success');
                    // Wait a moment then redirect to dashboard
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                } else {
                    // If still not authenticated, the token might be invalid
                    setVerificationStatus('error');
                    setErrorMessage('Verification failed. The link may be invalid or expired. Please request a new verification email.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setVerificationStatus('error');
                setErrorMessage('An unexpected error occurred. Please try again.');
            } finally {
                setIsVerifying(false);
            }
        };

        verifyEmailToken();
    }, [token, isAuthenticated, navigate]);

    const handleResendVerification = async () => {
        setIsResending(true);
        try {
            // Get email from localStorage or prompt user
            const userEmail = localStorage.getItem('pendingVerificationEmail');

            if (!userEmail) {
                setErrorMessage('Please enter your email address to resend verification.');
                return;
            }

            // Use utility function to resend verification email
            const result = await sendVerificationEmail(userEmail);

            if (result.success) {
                setErrorMessage('');
                alert('Verification email sent successfully! Please check your inbox.');
            } else {
                setErrorMessage(result.error || 'Failed to resend verification email.');
            }
        } catch (error) {
            console.error('Resend error:', error);
            setErrorMessage('Failed to resend verification email. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const renderContent = () => {
        switch (verificationStatus) {
            case 'verifying':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                            <Loader2 size={32} className="text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h2>
                        <p className="text-gray-600 mb-6">Please wait while we verify your email address...</p>
                    </div>
                );

            case 'success':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                            <CheckCircle size={32} className="text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Email Verified!</h2>
                        <p className="text-gray-600 mb-6">Your email has been successfully verified. Redirecting to dashboard...</p>
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-blue-600">Redirecting...</span>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                            <XCircle size={32} className="text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Verification Failed</h2>
                        <p className="text-gray-600 mb-6">{errorMessage}</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Back to Sign In
                            </button>
                            <button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isResending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        </div>
                    </div>
                );

            case 'expired':
                return (
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-6">
                            <AlertCircle size={32} className="text-yellow-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Link Expired</h2>
                        <p className="text-gray-600 mb-6">{errorMessage}</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/auth')}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Back to Sign In
                            </button>
                            <button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {isResending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
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
                        Email Verification
                    </p>
                </div>

                {/* Verification Content */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}

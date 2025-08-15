import { nhost } from '../config/nhost';
import { generateVerificationEmailContent, generateResendVerificationEmailContent } from './emailTemplates';

export interface EmailVerificationConfig {
  enabled: boolean;
  redirectUrl: string;
  resendDelay: number; // in milliseconds
}

export const emailVerificationConfig: EmailVerificationConfig = {
  enabled: import.meta.env.VITE_EMAIL_VERIFICATION_ENABLED === 'true',
  redirectUrl: import.meta.env.VITE_VERIFICATION_REDIRECT_URL || `${window.location.origin}/verify-email`,
  resendDelay: 60000, // 1 minute delay between resend attempts
};

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Generate professional email content
    const appName = import.meta.env.VITE_APP_NAME || 'AI Chatbot';
    const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    const supportEmail = import.meta.env.VITE_REPLY_TO_EMAIL || 'support@your-domain.com';

    // For now, we'll use the basic Nhost resend functionality
    // In the future, you can integrate with custom email services
    const result = await nhost.auth.resend({
      email,
      type: 'emailVerification'
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    // Log email content for debugging (remove in production)
    console.log('Email content generated:', {
      appName,
      appUrl,
      supportEmail,
      email
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    return { success: false, error: 'Failed to send verification email' };
  }
};

/**
 * Check if email verification is required for the current user
 */
export const isEmailVerificationRequired = (): boolean => {
  const user = nhost.auth.getUser();
  return user && !user.emailVerified;
};

/**
 * Get the verification status for the current user
 */
export const getVerificationStatus = () => {
  const user = nhost.auth.getUser();
  if (!user) {
    return { isVerified: false, isPending: false };
  }

  return {
    isVerified: user.emailVerified,
    isPending: !user.emailVerified,
    email: user.email
  };
};

/**
 * Store pending verification email in localStorage
 */
export const storePendingVerificationEmail = (email: string): void => {
  try {
    localStorage.setItem('pendingVerificationEmail', email);
    localStorage.setItem('verificationTimestamp', Date.now().toString());
  } catch (error) {
    console.warn('Failed to store verification email:', error);
  }
};

/**
 * Get stored pending verification email
 */
export const getPendingVerificationEmail = (): string | null => {
  try {
    return localStorage.getItem('pendingVerificationEmail');
  } catch (error) {
    console.warn('Failed to get pending verification email:', error);
    return null;
  }
};

/**
 * Clear stored verification data
 */
export const clearVerificationData = (): void => {
  try {
    localStorage.removeItem('pendingVerificationEmail');
    localStorage.removeItem('verificationTimestamp');
  } catch (error) {
    console.warn('Failed to clear verification data:', error);
  }
};

/**
 * Check if enough time has passed to allow resending verification email
 */
export const canResendVerification = (): boolean => {
  try {
    const timestamp = localStorage.getItem('verificationTimestamp');
    if (!timestamp) return true;

    const lastSent = parseInt(timestamp, 10);
    const now = Date.now();
    const timeDiff = now - lastSent;

    return timeDiff >= emailVerificationConfig.resendDelay;
  } catch (error) {
    console.warn('Failed to check resend delay:', error);
    return true;
  }
};

/**
 * Get remaining time until verification email can be resent
 */
export const getResendCountdown = (): number => {
  try {
    const timestamp = localStorage.getItem('verificationTimestamp');
    if (!timestamp) return 0;

    const lastSent = parseInt(timestamp, 10);
    const now = Date.now();
    const timeDiff = now - lastSent;
    const remaining = emailVerificationConfig.resendDelay - timeDiff;

    return Math.max(0, Math.ceil(remaining / 1000));
  } catch (error) {
    console.warn('Failed to get resend countdown:', error);
    return 0;
  }
};

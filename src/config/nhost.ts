import { NhostClient } from '@nhost/nhost-js';

// Clean up any invalid tokens on initialization
const cleanupInvalidTokens = () => {
  if (typeof window !== 'undefined') {
    try {
      // Clear any potentially invalid tokens
      localStorage.removeItem('nhost.auth.refreshToken');
      localStorage.removeItem('nhost.auth.accessToken');
      localStorage.removeItem('nhost.auth.user');
    } catch (error) {
      console.warn('Could not cleanup tokens:', error);
    }
  }
};

// Clean up on initialization
cleanupInvalidTokens();

// Use environment variables from .env file
const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'ivbsvrhjpzemziisixvk',
  region: import.meta.env.VITE_NHOST_REGION || 'ap-south-1',
  autoSignIn: false, // Disable auto sign-in to prevent token refresh issues
  autoRefreshToken: false, // Disable auto refresh to prevent errors on login form
  clientStorageType: 'localStorage',
  clientStorage: typeof window !== 'undefined' ? window.localStorage : undefined,
});

// Bolt configuration
export const boltConfig = {
  apiKey: import.meta.env.VITE_BOLT_API_KEY || '',
  webhookUrl: import.meta.env.VITE_BOLT_WEBHOOK_URL || '',
  enabled: import.meta.env.VITE_BOLT_ENABLED === 'true',
};

export { nhost };
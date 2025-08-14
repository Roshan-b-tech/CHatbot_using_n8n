import { nhost } from '../config/nhost';

/**
 * Utility functions for handling authentication and token refresh
 */

export const refreshTokenIfNeeded = async (): Promise<string | null> => {
    try {
        // Only proceed if user is authenticated
        if (!nhost.auth.isAuthenticated()) {
            return null;
        }

        // Get current access token
        let token = await nhost.auth.getAccessToken();

        // If we have a token, check if it's expired
        if (token) {
            // Try to decode the token to check expiration
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const currentTime = Math.floor(Date.now() / 1000);

                // If token expires in less than 5 minutes, refresh it
                if (payload.exp && payload.exp - currentTime < 300) {
                    await nhost.auth.refreshSession();
                    token = await nhost.auth.getAccessToken();
                }
            } catch (decodeError) {
                console.warn('Could not decode token, proceeding with current token');
            }
        } else {
            // No token, try to refresh session
            try {
                await nhost.auth.refreshSession();
                token = await nhost.auth.getAccessToken();
            } catch (refreshError) {
                console.error('Failed to refresh session:', refreshError);
            }
        }

        return token;
    } catch (error) {
        console.error('Error in refreshTokenIfNeeded:', error);
        return null;
    }
};

export const handleAuthError = async (error: any): Promise<boolean> => {
    // Only proceed if user is authenticated
    if (!nhost.auth.isAuthenticated()) {
        return false;
    }

    // Check if it's an authentication error
    if (error?.message?.includes('invalid-refresh-token') ||
        error?.extensions?.code === 'UNAUTHENTICATED' ||
        error?.status === 401) {

        try {
            // Try to refresh the session
            await nhost.auth.refreshSession();
            return true; // Successfully refreshed
        } catch (refreshError) {
            console.error('Failed to refresh authentication:', refreshError);
            // Sign out user if refresh fails
            await nhost.auth.signOut();
            return false; // Failed to refresh
        }
    }

    return false; // Not an auth error
};

export const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp ? payload.exp <= currentTime : true;
    } catch {
        return true; // If we can't decode, assume expired
    }
};

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
    // Only proceed if user is authenticated
    if (!nhost.auth.isAuthenticated()) {
        return { authorization: '' };
    }

    const token = await refreshTokenIfNeeded();
    return {
        authorization: token ? `Bearer ${token}` : '',
    };
};

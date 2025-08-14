import { NhostClient } from '@nhost/nhost-js';

// Bolt + Nhost integration configuration
export interface BoltAuthConfig {
    nhost: NhostClient;
    boltApiKey?: string;
    boltWebhookUrl?: string;
}

// Initialize Bolt authentication with Nhost
export const initializeBoltAuth = (config: BoltAuthConfig) => {
    const { nhost, boltApiKey, boltWebhookUrl } = config;

    // Bolt authentication methods
    const boltAuth = {
        // Sign in with Bolt
        signInWithBolt: async (email: string, password: string) => {
            try {
                // First authenticate with Nhost using the correct method
                const { error } = await nhost.auth.signInEmailPassword(email, password);
                if (error) throw error;

                // If successful, trigger Bolt webhook for additional processing
                if (boltWebhookUrl) {
                    try {
                        await fetch(boltWebhookUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${boltApiKey || ''}`,
                            },
                            body: JSON.stringify({
                                action: 'sign_in',
                                email,
                                userId: nhost.auth.getUser()?.id,
                                timestamp: new Date().toISOString(),
                            }),
                        });
                    } catch (webhookError) {
                        console.warn('Bolt webhook call failed, but authentication succeeded:', webhookError);
                        // Don't fail authentication if webhook fails
                    }
                }

                return { success: true };
            } catch (error) {
                console.error('Bolt sign in error:', error);
                throw error;
            }
        },

        // Sign up with Bolt
        signUpWithBolt: async (email: string, password: string, displayName?: string) => {
            try {
                // First create account with Nhost using the correct method
                const { error } = await nhost.auth.signUpEmailPassword(email, password, {
                    displayName: displayName || undefined,
                });
                if (error) throw error;

                // If successful, trigger Bolt webhook for additional processing
                if (boltWebhookUrl) {
                    try {
                        await fetch(boltWebhookUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${boltApiKey || ''}`,
                            },
                            body: JSON.stringify({
                                action: 'sign_up',
                                email,
                                displayName,
                                userId: nhost.auth.getUser()?.id,
                                timestamp: new Date().toISOString(),
                            }),
                        });
                    } catch (webhookError) {
                        console.warn('Bolt webhook call failed, but account creation succeeded:', webhookError);
                        // Don't fail account creation if webhook fails
                    }
                }

                return { success: true };
            } catch (error) {
                console.error('Bolt sign up error:', error);
                throw error;
            }
        },

        // Get Bolt user data
        getBoltUser: async () => {
            try {
                const user = nhost.auth.getUser();
                if (!user) return null;

                // Fetch additional Bolt user data if webhook is configured
                if (boltWebhookUrl) {
                    try {
                        const response = await fetch(`${boltWebhookUrl}/user/${user.id}`, {
                            headers: {
                                'Authorization': `Bearer ${boltApiKey || ''}`,
                            },
                        });

                        if (response.ok) {
                            const boltData = await response.json();
                            return { ...user, ...boltData };
                        }
                    } catch (webhookError) {
                        console.warn('Bolt user data fetch failed:', webhookError);
                        // Return basic user data if webhook fails
                    }
                }

                return user;
            } catch (error) {
                console.error('Error fetching Bolt user:', error);
                return nhost.auth.getUser();
            }
        },
    };

    return boltAuth;
};

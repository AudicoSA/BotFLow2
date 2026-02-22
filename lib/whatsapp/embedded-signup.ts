// Meta Embedded Signup Flow for WhatsApp Business API

import { WhatsAppClient } from './client';
import type {
    EmbeddedSignupConfig,
    EmbeddedSignupResponse,
    WABAInfo,
    PhoneNumberInfo,
    WhatsAppAccountCreate,
} from './types';

// Configuration for Embedded Signup
export const EMBEDDED_SIGNUP_CONFIG: EmbeddedSignupConfig = {
    app_id: process.env.NEXT_PUBLIC_META_APP_ID || '',
    config_id: process.env.NEXT_PUBLIC_META_CONFIG_ID || '',
    redirect_uri: process.env.NEXT_PUBLIC_WHATSAPP_REDIRECT_URI || '',
};

// Generate the Embedded Signup URL
export function generateEmbeddedSignupUrl(state?: string): string {
    const params = new URLSearchParams({
        client_id: EMBEDDED_SIGNUP_CONFIG.app_id,
        config_id: EMBEDDED_SIGNUP_CONFIG.config_id,
        redirect_uri: EMBEDDED_SIGNUP_CONFIG.redirect_uri,
        response_type: 'code',
        override_default_response_type: 'true',
        scope: 'whatsapp_business_management,whatsapp_business_messaging',
    });

    if (state) {
        params.set('state', state);
    }

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
}

// Initialize Embedded Signup in browser
export function initEmbeddedSignup(
    onSuccess: (response: EmbeddedSignupResponse) => void,
    onCancel: () => void,
    state?: string
): void {
    // Check if FB SDK is loaded
    if (typeof window === 'undefined' || !window.FB) {
        console.error('Facebook SDK not loaded');
        return;
    }

    window.FB.login(
        (response) => {
            if (response.authResponse) {
                onSuccess({
                    code: response.authResponse.code || '',
                    state,
                });
            } else {
                onCancel();
            }
        },
        {
            config_id: EMBEDDED_SIGNUP_CONFIG.config_id,
            response_type: 'code',
            override_default_response_type: true,
            scope: 'whatsapp_business_management,whatsapp_business_messaging',
            extras: {
                setup: {
                    // Pre-fill business information if available
                },
                featureType: '',
                sessionInfoVersion: 2,
            },
        }
    );
}

// Process the callback after Embedded Signup
export async function processEmbeddedSignupCallback(
    code: string,
    organizationId: string
): Promise<{
    account: WhatsAppAccountCreate;
    wabaInfo: WABAInfo;
    phoneNumber: PhoneNumberInfo;
}> {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;

    if (!appId || !appSecret) {
        throw new Error('Meta App credentials not configured');
    }

    // Exchange code for access token
    const tokenResponse = await WhatsAppClient.exchangeCodeForToken(
        code,
        appId,
        appSecret
    );

    // Create client with new token
    const client = new WhatsAppClient({
        accessToken: tokenResponse.access_token,
    });

    // Get shared WABAs
    const sharedWabas = await getSharedWABAs(tokenResponse.access_token);

    if (!sharedWabas.length) {
        throw new Error('No WhatsApp Business Accounts found');
    }

    // Use the first WABA (or allow user selection in full implementation)
    const wabaId = sharedWabas[0].id;
    const wabaInfo = await client.getWABAInfo(wabaId);

    // Get phone numbers
    const phoneNumbers = await client.getPhoneNumbers(wabaId);

    if (!phoneNumbers.data.length) {
        throw new Error('No phone numbers found for this WhatsApp Business Account');
    }

    const phoneNumber = phoneNumbers.data[0];

    // Subscribe to webhooks
    await client.subscribeToWebhooks(wabaId);

    // Generate channel ID
    const channelId = generateChannelId();

    // Create account data
    const account: WhatsAppAccountCreate = {
        organization_id: organizationId,
        phone_number: phoneNumber.display_phone_number,
        phone_number_id: phoneNumber.id,
        waba_id: wabaId,
        channel_id: channelId,
        display_name: phoneNumber.verified_name,
        access_token: tokenResponse.access_token,
        coexistence_mode: 'none',
    };

    return {
        account,
        wabaInfo,
        phoneNumber,
    };
}

// Get shared WABAs from user's business manager
async function getSharedWABAs(
    accessToken: string
): Promise<Array<{ id: string; name: string }>> {
    const response = await fetch(
        `https://graph.facebook.com/v18.0/me/businesses?access_token=${accessToken}`
    );

    if (!response.ok) {
        throw new Error('Failed to fetch business accounts');
    }

    const businesses = await response.json();

    // Get WABAs for each business
    const wabas: Array<{ id: string; name: string }> = [];

    for (const business of businesses.data || []) {
        const wabaResponse = await fetch(
            `https://graph.facebook.com/v18.0/${business.id}/owned_whatsapp_business_accounts?access_token=${accessToken}`
        );

        if (wabaResponse.ok) {
            const wabaData = await wabaResponse.json();
            wabas.push(...(wabaData.data || []));
        }
    }

    // Also check for directly shared WABAs
    const directWabaResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/whatsapp_business_accounts?access_token=${accessToken}`
    );

    if (directWabaResponse.ok) {
        const directWabas = await directWabaResponse.json();
        wabas.push(...(directWabas.data || []));
    }

    // Remove duplicates
    const uniqueWabas = wabas.filter(
        (waba, index, self) => self.findIndex((w) => w.id === waba.id) === index
    );

    return uniqueWabas;
}

// Generate unique channel ID
function generateChannelId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `wa_${timestamp}_${randomPart}`;
}

// Verify webhook signature from Meta
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    appSecret: string
): boolean {
    // Import crypto dynamically for edge compatibility
    const crypto = require('crypto');

    const expectedSignature = crypto
        .createHmac('sha256', appSecret)
        .update(payload)
        .digest('hex');

    return `sha256=${expectedSignature}` === signature;
}

// Handle webhook verification challenge
export function handleWebhookVerification(
    mode: string,
    token: string,
    challenge: string,
    verifyToken: string
): string | null {
    if (mode === 'subscribe' && token === verifyToken) {
        return challenge;
    }
    return null;
}

// Declare FB SDK types
declare global {
    interface Window {
        FB: {
            init: (options: {
                appId: string;
                cookie?: boolean;
                xfbml?: boolean;
                version: string;
            }) => void;
            login: (
                callback: (response: {
                    authResponse?: {
                        code?: string;
                        accessToken?: string;
                        userID?: string;
                    };
                    status?: string;
                }) => void,
                options?: {
                    config_id?: string;
                    response_type?: string;
                    override_default_response_type?: boolean;
                    scope?: string;
                    extras?: Record<string, unknown>;
                }
            ) => void;
        };
        fbAsyncInit: () => void;
    }
}

export {};

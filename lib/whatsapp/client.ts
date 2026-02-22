// WhatsApp Business Cloud API Client

import type {
    SendMessageRequest,
    SendMessageResponse,
    PhoneNumberInfo,
    WABAInfo,
    QRCodeData,
    OAuthTokenResponse,
    MediaContent,
    TemplateComponent,
} from './types';

const GRAPH_API_VERSION = 'v18.0';
const GRAPH_API_BASE_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

interface WhatsAppClientConfig {
    accessToken: string;
    phoneNumberId?: string;
    wabaId?: string;
}

export class WhatsAppClient {
    private accessToken: string;
    private phoneNumberId?: string;
    private wabaId?: string;

    constructor(config: WhatsAppClientConfig) {
        this.accessToken = config.accessToken;
        this.phoneNumberId = config.phoneNumberId;
        this.wabaId = config.wabaId;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = endpoint.startsWith('http')
            ? endpoint
            : `${GRAPH_API_BASE_URL}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new WhatsAppAPIError(
                error.error?.message || 'WhatsApp API request failed',
                error.error?.code || response.status,
                error.error
            );
        }

        return response.json();
    }

    // Exchange authorization code for access token
    static async exchangeCodeForToken(
        code: string,
        appId: string,
        appSecret: string
    ): Promise<OAuthTokenResponse> {
        const params = new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            code,
        });

        const response = await fetch(
            `${GRAPH_API_BASE_URL}/oauth/access_token?${params.toString()}`
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new WhatsAppAPIError(
                error.error?.message || 'Failed to exchange code for token',
                error.error?.code || response.status,
                error.error
            );
        }

        return response.json();
    }

    // Get WhatsApp Business Account info
    async getWABAInfo(wabaId: string): Promise<WABAInfo> {
        return this.request<WABAInfo>(`/${wabaId}`);
    }

    // Get phone numbers associated with WABA
    async getPhoneNumbers(wabaId: string): Promise<{ data: PhoneNumberInfo[] }> {
        return this.request<{ data: PhoneNumberInfo[] }>(
            `/${wabaId}/phone_numbers`
        );
    }

    // Get specific phone number info
    async getPhoneNumberInfo(phoneNumberId: string): Promise<PhoneNumberInfo> {
        return this.request<PhoneNumberInfo>(`/${phoneNumberId}`);
    }

    // Send a message
    async sendMessage(
        phoneNumberId: string,
        message: SendMessageRequest
    ): Promise<SendMessageResponse> {
        return this.request<SendMessageResponse>(`/${phoneNumberId}/messages`, {
            method: 'POST',
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                ...message,
            }),
        });
    }

    // Send a text message (convenience method)
    async sendTextMessage(
        phoneNumberId: string,
        to: string,
        text: string,
        previewUrl = false
    ): Promise<SendMessageResponse> {
        return this.sendMessage(phoneNumberId, {
            to,
            type: 'text',
            text: {
                body: text,
                preview_url: previewUrl,
            },
        });
    }

    // Send a template message
    async sendTemplateMessage(
        phoneNumberId: string,
        to: string,
        templateName: string,
        languageCode: string,
        components?: TemplateComponent[]
    ): Promise<SendMessageResponse> {
        return this.sendMessage(phoneNumberId, {
            to,
            type: 'template',
            template: {
                name: templateName,
                language: { code: languageCode },
                components,
            },
        });
    }

    // Upload media
    async uploadMedia(
        phoneNumberId: string,
        file: File | Blob,
        mimeType: string
    ): Promise<{ id: string }> {
        const formData = new FormData();
        formData.append('messaging_product', 'whatsapp');
        formData.append('file', file);
        formData.append('type', mimeType);

        const response = await fetch(
            `${GRAPH_API_BASE_URL}/${phoneNumberId}/media`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
                body: formData,
            }
        );

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new WhatsAppAPIError(
                error.error?.message || 'Failed to upload media',
                error.error?.code || response.status,
                error.error
            );
        }

        return response.json();
    }

    // Get media URL
    async getMediaUrl(mediaId: string): Promise<MediaContent> {
        return this.request<MediaContent>(`/${mediaId}`);
    }

    // Download media
    async downloadMedia(mediaUrl: string): Promise<Blob> {
        const response = await fetch(mediaUrl, {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        });

        if (!response.ok) {
            throw new WhatsAppAPIError(
                'Failed to download media',
                response.status
            );
        }

        return response.blob();
    }

    // Generate QR code for phone number
    async generateQRCode(
        phoneNumberId: string,
        prefilledMessage?: string
    ): Promise<QRCodeData> {
        const body: Record<string, string> = {
            messaging_product: 'whatsapp',
            prefilled_message: prefilledMessage || '',
        };

        const response = await this.request<{ data: QRCodeData[] }>(
            `/${phoneNumberId}/message_qrdls`,
            {
                method: 'POST',
                body: JSON.stringify(body),
            }
        );

        return response.data[0];
    }

    // Get existing QR codes
    async getQRCodes(phoneNumberId: string): Promise<QRCodeData[]> {
        const response = await this.request<{ data: QRCodeData[] }>(
            `/${phoneNumberId}/message_qrdls`
        );
        return response.data;
    }

    // Delete QR code
    async deleteQRCode(phoneNumberId: string, qrCodeId: string): Promise<void> {
        await this.request(`/${phoneNumberId}/message_qrdls`, {
            method: 'DELETE',
            body: JSON.stringify({ code: qrCodeId }),
        });
    }

    // Register phone number (for Embedded Signup)
    async registerPhoneNumber(
        phoneNumberId: string,
        pin: string
    ): Promise<{ success: boolean }> {
        return this.request<{ success: boolean }>(`/${phoneNumberId}/register`, {
            method: 'POST',
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                pin,
            }),
        });
    }

    // Request verification code
    async requestVerificationCode(
        phoneNumberId: string,
        codeMethod: 'SMS' | 'VOICE',
        language: string = 'en_US'
    ): Promise<{ success: boolean }> {
        return this.request<{ success: boolean }>(
            `/${phoneNumberId}/request_code`,
            {
                method: 'POST',
                body: JSON.stringify({
                    code_method: codeMethod,
                    language,
                }),
            }
        );
    }

    // Verify code
    async verifyCode(
        phoneNumberId: string,
        code: string
    ): Promise<{ success: boolean }> {
        return this.request<{ success: boolean }>(`/${phoneNumberId}/verify_code`, {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }

    // Subscribe to webhooks
    async subscribeToWebhooks(wabaId: string): Promise<{ success: boolean }> {
        return this.request<{ success: boolean }>(
            `/${wabaId}/subscribed_apps`,
            {
                method: 'POST',
            }
        );
    }

    // Get business profile
    async getBusinessProfile(phoneNumberId: string): Promise<{
        about?: string;
        address?: string;
        description?: string;
        email?: string;
        profile_picture_url?: string;
        websites?: string[];
        vertical?: string;
    }> {
        const response = await this.request<{
            data: Array<{
                about?: string;
                address?: string;
                description?: string;
                email?: string;
                profile_picture_url?: string;
                websites?: string[];
                vertical?: string;
            }>;
        }>(`/${phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`);
        return response.data[0] || {};
    }

    // Update business profile
    async updateBusinessProfile(
        phoneNumberId: string,
        profile: {
            about?: string;
            address?: string;
            description?: string;
            email?: string;
            websites?: string[];
            vertical?: string;
        }
    ): Promise<{ success: boolean }> {
        return this.request<{ success: boolean }>(
            `/${phoneNumberId}/whatsapp_business_profile`,
            {
                method: 'POST',
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    ...profile,
                }),
            }
        );
    }
}

// Custom error class for WhatsApp API errors
export class WhatsAppAPIError extends Error {
    constructor(
        message: string,
        public code: number,
        public details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'WhatsAppAPIError';
    }
}

// Create client from environment variables
export function createWhatsAppClient(
    accessToken?: string,
    phoneNumberId?: string,
    wabaId?: string
): WhatsAppClient {
    const token = accessToken || process.env.WHATSAPP_ACCESS_TOKEN;

    if (!token) {
        throw new Error('WhatsApp access token is required');
    }

    return new WhatsAppClient({
        accessToken: token,
        phoneNumberId: phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID,
        wabaId: wabaId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    });
}

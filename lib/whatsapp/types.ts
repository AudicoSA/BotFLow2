// WhatsApp Business API Types

// Connection and Account Types
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type CoexistenceMode = 'none' | 'enabled' | 'migrated';

export interface WhatsAppAccount {
    id: string;
    organization_id: string;
    phone_number: string;
    phone_number_id: string;
    waba_id: string; // WhatsApp Business Account ID
    channel_id: string;
    display_name: string;
    quality_rating: 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';
    connection_status: ConnectionStatus;
    coexistence_mode: CoexistenceMode;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
    last_synced_at?: string;
    created_at: string;
    updated_at: string;
}

export interface WhatsAppAccountCreate {
    organization_id: string;
    phone_number: string;
    phone_number_id: string;
    waba_id: string;
    channel_id: string;
    display_name: string;
    access_token: string;
    coexistence_mode?: CoexistenceMode;
}

// Meta Embedded Signup Types
export interface EmbeddedSignupConfig {
    app_id: string;
    config_id: string;
    redirect_uri: string;
    state?: string;
}

export interface EmbeddedSignupResponse {
    code: string;
    state?: string;
}

export interface OAuthTokenResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
}

export interface WABAInfo {
    id: string;
    name: string;
    currency: string;
    timezone_id: string;
    message_template_namespace: string;
}

export interface PhoneNumberInfo {
    id: string;
    verified_name: string;
    display_phone_number: string;
    quality_rating: 'GREEN' | 'YELLOW' | 'RED';
    code_verification_status: string;
    is_official_business_account: boolean;
    is_pin_enabled: boolean;
}

// QR Code Types
export interface QRCodeData {
    code: string;
    prefilled_message?: string;
    deep_link_url: string;
    qr_image_url: string;
}

export interface QRCodeResponse {
    data: QRCodeData[];
}

// Coexistence Mode Types
export interface CoexistenceStatus {
    is_coexistence_eligible: boolean;
    current_mode: CoexistenceMode;
    migration_status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
    business_app_linked: boolean;
}

export interface CoexistenceSetupRequest {
    phone_number_id: string;
    enable_coexistence: boolean;
}

// Message Types
export interface WhatsAppMessage {
    id: string;
    account_id: string;
    message_id: string;
    from: string;
    to: string;
    type: MessageType;
    content: MessageContent;
    status: MessageStatus;
    direction: 'inbound' | 'outbound';
    timestamp: string;
    created_at: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contacts' | 'template' | 'interactive' | 'reaction';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageContent {
    text?: TextContent;
    image?: MediaContent;
    video?: MediaContent;
    audio?: MediaContent;
    document?: DocumentContent;
    location?: LocationContent;
    contacts?: ContactContent[];
    template?: TemplateContent;
    interactive?: InteractiveContent;
    reaction?: ReactionContent;
}

export interface TextContent {
    body: string;
    preview_url?: boolean;
}

export interface MediaContent {
    id?: string;
    link?: string;
    caption?: string;
    mime_type?: string;
    sha256?: string;
    filename?: string;
}

export interface DocumentContent extends MediaContent {
    filename: string;
}

export interface LocationContent {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
}

export interface ContactContent {
    name: {
        formatted_name: string;
        first_name?: string;
        last_name?: string;
    };
    phones?: Array<{
        phone: string;
        type?: string;
    }>;
    emails?: Array<{
        email: string;
        type?: string;
    }>;
}

export interface TemplateContent {
    name: string;
    language: {
        code: string;
    };
    components?: TemplateComponent[];
}

export interface TemplateComponent {
    type: 'header' | 'body' | 'button';
    parameters?: TemplateParameter[];
}

export interface TemplateParameter {
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
    text?: string;
    currency?: {
        fallback_value: string;
        code: string;
        amount_1000: number;
    };
    date_time?: {
        fallback_value: string;
    };
    image?: MediaContent;
    document?: DocumentContent;
    video?: MediaContent;
}

export interface InteractiveContent {
    type: 'button' | 'list' | 'product' | 'product_list';
    header?: {
        type: 'text' | 'image' | 'video' | 'document';
        text?: string;
        image?: MediaContent;
        video?: MediaContent;
        document?: DocumentContent;
    };
    body: {
        text: string;
    };
    footer?: {
        text: string;
    };
    action: InteractiveAction;
}

export interface InteractiveAction {
    button?: string;
    buttons?: Array<{
        type: 'reply';
        reply: {
            id: string;
            title: string;
        };
    }>;
    sections?: Array<{
        title?: string;
        rows: Array<{
            id: string;
            title: string;
            description?: string;
        }>;
    }>;
}

export interface ReactionContent {
    message_id: string;
    emoji: string;
}

// Contact Types
export interface WhatsAppContact {
    id: string;
    account_id: string;
    wa_id: string;
    profile_name?: string;
    phone_number: string;
    is_business: boolean;
    last_message_at?: string;
    tags?: string[];
    custom_fields?: Record<string, string>;
    created_at: string;
    updated_at: string;
}

// Webhook Types
export interface WhatsAppWebhookPayload {
    object: 'whatsapp_business_account';
    entry: WebhookEntry[];
}

export interface WebhookEntry {
    id: string;
    changes: WebhookChange[];
}

export interface WebhookChange {
    value: WebhookValue;
    field: string;
}

export interface WebhookValue {
    messaging_product: 'whatsapp';
    metadata: {
        display_phone_number: string;
        phone_number_id: string;
    };
    contacts?: Array<{
        profile: {
            name: string;
        };
        wa_id: string;
    }>;
    messages?: WebhookMessage[];
    statuses?: WebhookStatus[];
    errors?: WebhookError[];
}

export interface WebhookMessage {
    from: string;
    id: string;
    timestamp: string;
    type: MessageType;
    text?: TextContent;
    image?: MediaContent;
    video?: MediaContent;
    audio?: MediaContent;
    document?: DocumentContent;
    location?: LocationContent;
    contacts?: ContactContent[];
    interactive?: {
        type: string;
        button_reply?: {
            id: string;
            title: string;
        };
        list_reply?: {
            id: string;
            title: string;
            description?: string;
        };
    };
    reaction?: ReactionContent;
    context?: {
        from: string;
        id: string;
    };
}

export interface WebhookStatus {
    id: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: string;
    recipient_id: string;
    conversation?: {
        id: string;
        origin: {
            type: 'business_initiated' | 'user_initiated' | 'referral_conversion';
        };
        expiration_timestamp?: string;
    };
    pricing?: {
        billable: boolean;
        pricing_model: string;
        category: string;
    };
    errors?: WebhookError[];
}

export interface WebhookError {
    code: number;
    title: string;
    message: string;
    error_data?: {
        details: string;
    };
}

// API Response Types
export interface SendMessageRequest {
    to: string;
    type: MessageType;
    text?: TextContent;
    image?: MediaContent;
    video?: MediaContent;
    audio?: MediaContent;
    document?: DocumentContent;
    location?: LocationContent;
    contacts?: ContactContent[];
    template?: TemplateContent;
    interactive?: InteractiveContent;
    reaction?: ReactionContent;
}

export interface SendMessageResponse {
    messaging_product: 'whatsapp';
    contacts: Array<{
        input: string;
        wa_id: string;
    }>;
    messages: Array<{
        id: string;
    }>;
}

// Sync Types
export interface SyncResult {
    contacts_synced: number;
    messages_synced: number;
    errors: string[];
    last_synced_at: string;
}

export interface ChatHistoryItem {
    contact: WhatsAppContact;
    last_message: WhatsAppMessage;
    unread_count: number;
}

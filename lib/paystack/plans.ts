// Subscription Plans Configuration

export interface PricingPlan {
    id: string;
    name: string;
    description: string;
    priceInCents: number; // Price in cents (R499 = 49900)
    displayPrice: string; // Formatted for display
    interval: 'monthly' | 'yearly';
    planCode?: string; // Paystack plan code (set after creating in Paystack)
    features: string[];
    popular?: boolean;
    isBundle?: boolean;
    perUser?: boolean;
}

// All amounts in cents (kobo for ZAR: 1 ZAR = 100 kobo/cents)
export const PRICING_PLANS: Record<string, PricingPlan> = {
    'ai-assistant': {
        id: 'ai-assistant',
        name: 'AI Assistant',
        description: 'GPT-4 powered conversations for your business',
        priceInCents: 49900, // R499
        displayPrice: 'R499',
        interval: 'monthly',
        planCode: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_AI_ASSISTANT,
        features: [
            'Unlimited AI conversations',
            'Custom knowledge base training',
            'Multi-channel support',
            'Context-aware responses',
            'Conversation history',
            'Basic analytics',
            'Email support (24hr response)',
        ],
    },
    'whatsapp-assistant': {
        id: 'whatsapp-assistant',
        name: 'WhatsApp Assistant',
        description: 'Automate your #1 customer channel',
        priceInCents: 49900, // R499
        displayPrice: 'R499',
        interval: 'monthly',
        planCode: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_WHATSAPP,
        popular: true,
        features: [
            'QR code instant setup',
            '5,000 messages included/month',
            'Automated response flows',
            'Booking & scheduling system',
            'Customer segmentation',
            'Advanced analytics',
            'Priority support (4hr response)',
        ],
    },
    'receipt-assistant': {
        id: 'receipt-assistant',
        name: 'Receipt Assistant',
        description: 'AI-powered expense tracking',
        priceInCents: 9900, // R99 per user
        displayPrice: 'R99',
        interval: 'monthly',
        planCode: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_RECEIPT,
        perUser: true,
        features: [
            'Unlimited receipt scans',
            'AI data extraction (OCR)',
            'Auto-categorization',
            'Export to CSV/PDF',
            'VAT-ready reports',
            'Email support',
        ],
    },
    bundle: {
        id: 'bundle',
        name: 'Full Bundle',
        description: 'Everything you need to automate',
        priceInCents: 89900, // R899
        displayPrice: 'R899',
        interval: 'monthly',
        planCode: process.env.NEXT_PUBLIC_PAYSTACK_PLAN_BUNDLE,
        isBundle: true,
        features: [
            'All AI Assistant features',
            'All WhatsApp features',
            'All Receipt features (1 user)',
            'Priority support (2hr response)',
            'Custom integrations',
            'Dedicated account manager',
            'Early access to new features',
        ],
    },
};

// Get plan by ID
export function getPlan(planId: string): PricingPlan | undefined {
    return PRICING_PLANS[planId];
}

// Get all plans as array
export function getAllPlans(): PricingPlan[] {
    return Object.values(PRICING_PLANS);
}

// Generate a unique transaction reference
export function generateTransactionReference(planId: string, userId?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const userPart = userId ? `-${userId.substring(0, 8)}` : '';
    return `BF-${planId}-${timestamp}${userPart}-${random}`;
}

// Parse transaction reference to extract plan ID
export function parseTransactionReference(reference: string): {
    planId: string;
    timestamp: number;
} | null {
    const match = reference.match(/^BF-([a-z-]+)-(\d+)/);
    if (!match) return null;
    return {
        planId: match[1],
        timestamp: parseInt(match[2], 10),
    };
}

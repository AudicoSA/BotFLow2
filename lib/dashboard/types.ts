// Dashboard Types

import type { ServiceType } from '@/lib/onboarding/types';

export interface ServiceStatus {
    service: ServiceType;
    isActive: boolean;
    isSetupComplete: boolean;
    setupProgress: number; // 0-100
    lastActivity?: string;
}

export interface UsageMetrics {
    // AI Assistant
    aiConversations: number;
    aiMessages: number;
    aiTokensUsed: number;

    // WhatsApp Assistant
    whatsappMessagesSent: number;
    whatsappMessagesReceived: number;
    whatsappActiveContacts: number;

    // Receipt Assistant
    receiptsProcessed: number;
    totalExpenseAmount: number;
    categoriesUsed: number;

    // Period info
    periodStart: string;
    periodEnd: string;
}

export interface BillingInfo {
    currentPlan: PlanType | null;
    planName: string;
    monthlyAmount: number;
    currency: string;
    billingCycle: 'monthly' | 'annual';
    nextBillingDate: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    trialEndsAt?: string;
    paymentMethod?: {
        type: 'card' | 'bank';
        last4: string;
        brand?: string;
    };
}

export type PlanType = 'ai-assistant' | 'whatsapp-assistant' | 'receipt-assistant' | 'bundle';

export interface OnboardingTask {
    id: string;
    title: string;
    description: string;
    service: ServiceType | 'general';
    isComplete: boolean;
    actionLabel: string;
    actionUrl: string;
    priority: number;
}

export interface QuickAction {
    id: string;
    label: string;
    description: string;
    icon: string;
    url: string;
    service: ServiceType;
    isPrimary?: boolean;
}

export interface DashboardData {
    organization: {
        id: string;
        name: string;
        createdAt: string;
    };
    services: ServiceStatus[];
    usage: UsageMetrics;
    billing: BillingInfo;
    onboardingTasks: OnboardingTask[];
    recentActivity: ActivityItem[];
}

export interface ActivityItem {
    id: string;
    type: 'message' | 'receipt' | 'conversation' | 'billing' | 'setup';
    title: string;
    description: string;
    timestamp: string;
    service: ServiceType | 'general';
    metadata?: Record<string, unknown>;
}

// Service tile configuration
export const SERVICE_TILES: Record<
    ServiceType,
    {
        name: string;
        description: string;
        icon: string;
        color: string;
        bgColor: string;
        textColor: string;
        primaryMetric: string;
        secondaryMetric: string;
        quickActions: QuickAction[];
    }
> = {
    'ai-assistant': {
        name: 'AI Assistant',
        description: 'GPT-4 powered conversations',
        icon: '🤖',
        color: 'violet',
        bgColor: 'bg-violet-50',
        textColor: 'text-violet-600',
        primaryMetric: 'conversations',
        secondaryMetric: 'messages',
        quickActions: [
            {
                id: 'start-chat',
                label: 'Start Chat',
                description: 'Begin a new conversation',
                icon: '💬',
                url: '/ai-assistant/chat',
                service: 'ai-assistant',
                isPrimary: true,
            },
            {
                id: 'view-history',
                label: 'View History',
                description: 'See past conversations',
                icon: '📜',
                url: '/ai-assistant/history',
                service: 'ai-assistant',
            },
            {
                id: 'manage-prompts',
                label: 'Manage Prompts',
                description: 'Configure AI behavior',
                icon: '⚙️',
                url: '/ai-assistant/prompts',
                service: 'ai-assistant',
            },
        ],
    },
    'whatsapp-assistant': {
        name: 'WhatsApp Assistant',
        description: 'Automate your #1 channel',
        icon: '💬',
        color: 'green',
        bgColor: 'bg-green-50',
        textColor: 'text-green-600',
        primaryMetric: 'messages sent',
        secondaryMetric: 'active contacts',
        quickActions: [
            {
                id: 'send-message',
                label: 'Send Message',
                description: 'Send a new message',
                icon: '📤',
                url: '/whatsapp/compose',
                service: 'whatsapp-assistant',
                isPrimary: true,
            },
            {
                id: 'view-contacts',
                label: 'Contacts',
                description: 'Manage contacts',
                icon: '👥',
                url: '/whatsapp/contacts',
                service: 'whatsapp-assistant',
            },
            {
                id: 'auto-responses',
                label: 'Auto Responses',
                description: 'Configure automations',
                icon: '🤖',
                url: '/whatsapp/automations',
                service: 'whatsapp-assistant',
            },
        ],
    },
    'receipt-assistant': {
        name: 'Receipt Assistant',
        description: 'AI expense tracking',
        icon: '🧾',
        color: 'amber',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        primaryMetric: 'receipts',
        secondaryMetric: 'total spent',
        quickActions: [
            {
                id: 'scan-receipt',
                label: 'Scan Receipt',
                description: 'Upload a new receipt',
                icon: '📸',
                url: '/receipts/scan',
                service: 'receipt-assistant',
                isPrimary: true,
            },
            {
                id: 'view-expenses',
                label: 'Expenses',
                description: 'View expense dashboard',
                icon: '📊',
                url: '/receipts/dashboard',
                service: 'receipt-assistant',
            },
            {
                id: 'export-report',
                label: 'Export',
                description: 'Export to CSV/PDF',
                icon: '📄',
                url: '/receipts/export',
                service: 'receipt-assistant',
            },
        ],
    },
};

// Plan pricing for display
export const PLAN_PRICING: Record<
    PlanType,
    { name: string; price: number; period: string }
> = {
    'ai-assistant': { name: 'AI Assistant', price: 499, period: '/month' },
    'whatsapp-assistant': { name: 'WhatsApp Assistant', price: 499, period: '/month' },
    'receipt-assistant': { name: 'Receipt Assistant', price: 99, period: '/user/month' },
    bundle: { name: 'Complete Bundle', price: 899, period: '/month' },
};

// Format currency in ZAR
export function formatCurrency(amount: number, currency = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-ZA', {
        month: 'short',
        day: 'numeric',
    });
}

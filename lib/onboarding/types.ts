// Onboarding Types

export type OnboardingStep =
    | 'welcome'
    | 'role'
    | 'use-case'
    | 'service-selection'
    | 'setup'
    | 'tour'
    | 'first-value'
    | 'complete';

export type UserRole =
    | 'business-owner'
    | 'marketing-manager'
    | 'customer-support'
    | 'operations'
    | 'developer'
    | 'other';

export type UseCase =
    | 'customer-support'
    | 'sales-leads'
    | 'bookings'
    | 'order-updates'
    | 'expense-tracking'
    | 'team-communication'
    | 'other';

export type ServiceType = 'ai-assistant' | 'whatsapp-assistant' | 'receipt-assistant';

export interface OnboardingState {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];

    // User selections
    role: UserRole | null;
    roleOther: string;
    useCases: UseCase[];
    useCaseOther: string;
    selectedServices: ServiceType[];

    // Setup progress
    businessName: string;
    businessIndustry: string;
    whatsappConnected: boolean;
    sampleDataLoaded: boolean;

    // Tour state
    tourCompleted: boolean;
    tourStep: number;

    // First value milestone
    firstMessageSent: boolean;
    firstReceiptScanned: boolean;
    firstAIConversation: boolean;

    // Timestamps
    startedAt: string | null;
    completedAt: string | null;
}

export interface OnboardingProgress {
    currentStepIndex: number;
    totalSteps: number;
    percentComplete: number;
    estimatedTimeRemaining: string;
}

export interface TourStep {
    id: string;
    target: string; // CSS selector
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right';
    action?: 'click' | 'input' | 'none';
    actionLabel?: string;
}

export const ROLE_OPTIONS: { value: UserRole; label: string; description: string; icon: string }[] = [
    {
        value: 'business-owner',
        label: 'Business Owner',
        description: 'I run my own business and want to automate customer interactions',
        icon: '👔',
    },
    {
        value: 'marketing-manager',
        label: 'Marketing Manager',
        description: 'I manage marketing campaigns and customer engagement',
        icon: '📈',
    },
    {
        value: 'customer-support',
        label: 'Customer Support',
        description: 'I handle customer inquiries and support tickets',
        icon: '🎧',
    },
    {
        value: 'operations',
        label: 'Operations',
        description: 'I manage day-to-day business operations',
        icon: '⚙️',
    },
    {
        value: 'developer',
        label: 'Developer/Technical',
        description: 'I build and integrate technical solutions',
        icon: '💻',
    },
    {
        value: 'other',
        label: 'Other',
        description: 'My role is different',
        icon: '✨',
    },
];

export const USE_CASE_OPTIONS: { value: UseCase; label: string; description: string; icon: string; services: ServiceType[] }[] = [
    {
        value: 'customer-support',
        label: 'Customer Support',
        description: 'Answer customer questions 24/7 automatically',
        icon: '💬',
        services: ['whatsapp-assistant', 'ai-assistant'],
    },
    {
        value: 'sales-leads',
        label: 'Sales & Lead Generation',
        description: 'Qualify leads and capture contact info',
        icon: '🎯',
        services: ['whatsapp-assistant', 'ai-assistant'],
    },
    {
        value: 'bookings',
        label: 'Appointments & Bookings',
        description: 'Let customers book appointments automatically',
        icon: '📅',
        services: ['whatsapp-assistant'],
    },
    {
        value: 'order-updates',
        label: 'Order Updates',
        description: 'Send order confirmations and delivery updates',
        icon: '📦',
        services: ['whatsapp-assistant'],
    },
    {
        value: 'expense-tracking',
        label: 'Expense Tracking',
        description: 'Scan receipts and track business expenses',
        icon: '🧾',
        services: ['receipt-assistant'],
    },
    {
        value: 'team-communication',
        label: 'Team Communication',
        description: 'Coordinate with team via automated messages',
        icon: '👥',
        services: ['whatsapp-assistant', 'ai-assistant'],
    },
    {
        value: 'other',
        label: 'Other Use Case',
        description: 'I have a different use case in mind',
        icon: '✨',
        services: ['ai-assistant', 'whatsapp-assistant', 'receipt-assistant'],
    },
];

export const SERVICE_OPTIONS: { id: ServiceType; name: string; description: string; icon: string; features: string[] }[] = [
    {
        id: 'ai-assistant',
        name: 'AI Assistant',
        description: 'GPT-4 powered conversations',
        icon: '🤖',
        features: ['Unlimited conversations', 'Custom knowledge base', 'Multi-channel support'],
    },
    {
        id: 'whatsapp-assistant',
        name: 'WhatsApp Assistant',
        description: 'Automate your #1 channel',
        icon: '💬',
        features: ['QR code setup', 'Automated responses', 'Booking system'],
    },
    {
        id: 'receipt-assistant',
        name: 'Receipt Assistant',
        description: 'AI expense tracking',
        icon: '🧾',
        features: ['OCR scanning', 'Auto-categorization', 'VAT reports'],
    },
];

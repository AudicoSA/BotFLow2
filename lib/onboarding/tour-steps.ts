// Interactive Tour Steps Configuration
import type { TourStep, ServiceType } from './types';

export const DASHBOARD_TOUR_STEPS: TourStep[] = [
    {
        id: 'welcome-dashboard',
        target: '[data-tour="dashboard-header"]',
        title: 'Welcome to Your Dashboard',
        content: 'This is your command center. Here you can see all your services at a glance and track your automation performance.',
        placement: 'bottom',
        action: 'none',
    },
    {
        id: 'service-tiles',
        target: '[data-tour="service-tiles"]',
        title: 'Your Services',
        content: 'Each tile shows a service you have access to. Click on any service to configure it or view detailed analytics.',
        placement: 'bottom',
        action: 'none',
    },
    {
        id: 'quick-actions',
        target: '[data-tour="quick-actions"]',
        title: 'Quick Actions',
        content: 'Use these shortcuts to perform common tasks like sending a test message or uploading a receipt.',
        placement: 'left',
        action: 'none',
    },
    {
        id: 'usage-stats',
        target: '[data-tour="usage-stats"]',
        title: 'Usage & Analytics',
        content: 'Track your usage here. See how many messages you\'ve sent, receipts processed, and AI conversations held.',
        placement: 'top',
        action: 'none',
    },
];

export const WHATSAPP_TOUR_STEPS: TourStep[] = [
    {
        id: 'whatsapp-connect',
        target: '[data-tour="whatsapp-qr"]',
        title: 'Connect Your WhatsApp',
        content: 'Scan this QR code with your WhatsApp Business app to connect. It only takes a few seconds!',
        placement: 'right',
        action: 'none',
    },
    {
        id: 'whatsapp-templates',
        target: '[data-tour="message-templates"]',
        title: 'Message Templates',
        content: 'Create and manage your automated message templates here. We\'ve pre-loaded some popular ones for you.',
        placement: 'bottom',
        action: 'none',
    },
    {
        id: 'whatsapp-test',
        target: '[data-tour="send-test"]',
        title: 'Send a Test Message',
        content: 'Try sending a test message to yourself to see how it works. This is your first-value milestone!',
        placement: 'bottom',
        action: 'click',
        actionLabel: 'Send Test Message',
    },
];

export const AI_ASSISTANT_TOUR_STEPS: TourStep[] = [
    {
        id: 'ai-chat',
        target: '[data-tour="ai-chat-input"]',
        title: 'Chat with Your AI',
        content: 'Type a message to start a conversation with your AI Assistant. Try asking it about your business!',
        placement: 'top',
        action: 'input',
        actionLabel: 'Type a message',
    },
    {
        id: 'ai-knowledge',
        target: '[data-tour="knowledge-base"]',
        title: 'Knowledge Base',
        content: 'Upload documents and FAQs here to train your AI. The more context you provide, the better it responds.',
        placement: 'left',
        action: 'none',
    },
    {
        id: 'ai-settings',
        target: '[data-tour="ai-settings"]',
        title: 'Customize Your AI',
        content: 'Adjust the tone, language, and behavior of your AI Assistant to match your brand.',
        placement: 'bottom',
        action: 'none',
    },
];

export const RECEIPT_TOUR_STEPS: TourStep[] = [
    {
        id: 'receipt-upload',
        target: '[data-tour="receipt-upload"]',
        title: 'Upload a Receipt',
        content: 'Take a photo or upload an image of any receipt. Our AI will extract all the details automatically.',
        placement: 'bottom',
        action: 'click',
        actionLabel: 'Upload Receipt',
    },
    {
        id: 'receipt-history',
        target: '[data-tour="receipt-history"]',
        title: 'Receipt History',
        content: 'View all your scanned receipts here. You can search, filter, and export them anytime.',
        placement: 'left',
        action: 'none',
    },
    {
        id: 'receipt-reports',
        target: '[data-tour="receipt-reports"]',
        title: 'Generate Reports',
        content: 'Create VAT-ready reports and expense summaries for your accountant with one click.',
        placement: 'bottom',
        action: 'none',
    },
];

export function getTourStepsForService(service: ServiceType): TourStep[] {
    switch (service) {
        case 'whatsapp-assistant':
            return WHATSAPP_TOUR_STEPS;
        case 'ai-assistant':
            return AI_ASSISTANT_TOUR_STEPS;
        case 'receipt-assistant':
            return RECEIPT_TOUR_STEPS;
        default:
            return [];
    }
}

export function getTourStepsForServices(services: ServiceType[]): TourStep[] {
    const steps: TourStep[] = [...DASHBOARD_TOUR_STEPS];

    for (const service of services) {
        steps.push(...getTourStepsForService(service));
    }

    return steps;
}

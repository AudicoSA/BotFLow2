'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardHeader, { DashboardWelcome } from '../components/dashboard/DashboardHeader';
import ServiceTile from '../components/dashboard/ServiceTile';
import UsageMetrics from '../components/dashboard/UsageMetrics';
import BillingCard from '../components/dashboard/BillingCard';
import OnboardingChecklist from '../components/dashboard/OnboardingChecklist';
import { useOnboardingStore } from '@/lib/onboarding/store';
import type { ServiceType } from '@/lib/onboarding/types';
import type {
    DashboardData,
    ServiceStatus,
    UsageMetrics as UsageMetricsType,
    BillingInfo,
    OnboardingTask,
} from '@/lib/dashboard/types';

// Mock data - in production this would come from API
const getMockDashboardData = (
    selectedServices: ServiceType[]
): DashboardData => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const services: ServiceStatus[] = [
        {
            service: 'ai-assistant',
            isActive: selectedServices.includes('ai-assistant'),
            isSetupComplete: selectedServices.includes('ai-assistant'),
            setupProgress: selectedServices.includes('ai-assistant') ? 100 : 0,
            lastActivity: '2 hours ago',
        },
        {
            service: 'whatsapp-assistant',
            isActive: selectedServices.includes('whatsapp-assistant'),
            isSetupComplete: false,
            setupProgress: 60,
            lastActivity: '5 minutes ago',
        },
        {
            service: 'receipt-assistant',
            isActive: selectedServices.includes('receipt-assistant'),
            isSetupComplete: selectedServices.includes('receipt-assistant'),
            setupProgress: selectedServices.includes('receipt-assistant') ? 100 : 0,
            lastActivity: '1 day ago',
        },
    ];

    const usage: UsageMetricsType = {
        aiConversations: 127,
        aiMessages: 1843,
        aiTokensUsed: 245000,
        whatsappMessagesSent: 892,
        whatsappMessagesReceived: 1203,
        whatsappActiveContacts: 156,
        receiptsProcessed: 47,
        totalExpenseAmount: 23450.75,
        categoriesUsed: 8,
        periodStart: startOfMonth.toISOString(),
        periodEnd: endOfMonth.toISOString(),
    };

    const billing: BillingInfo = {
        currentPlan: selectedServices.length > 1 ? 'bundle' : selectedServices[0] || null,
        planName: selectedServices.length > 1 ? 'Complete Bundle' : 'AI Assistant',
        monthlyAmount: selectedServices.length > 1 ? 899 : 499,
        currency: 'ZAR',
        billingCycle: 'monthly',
        nextBillingDate: new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            15
        ).toISOString(),
        status: 'trialing',
        trialEndsAt: new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 7
        ).toISOString(),
        paymentMethod: undefined,
    };

    const onboardingTasks: OnboardingTask[] = [
        {
            id: 'connect-whatsapp',
            title: 'Connect WhatsApp',
            description: 'Scan QR code to link your WhatsApp Business',
            service: 'whatsapp-assistant',
            isComplete: false,
            actionLabel: 'Connect',
            actionUrl: '/whatsapp/setup',
            priority: 1,
        },
        {
            id: 'send-first-message',
            title: 'Send your first WhatsApp message',
            description: 'Test your automated messaging',
            service: 'whatsapp-assistant',
            isComplete: false,
            actionLabel: 'Send',
            actionUrl: '/whatsapp/compose',
            priority: 2,
        },
        {
            id: 'upload-receipt',
            title: 'Upload your first receipt',
            description: 'Try our AI-powered receipt scanning',
            service: 'receipt-assistant',
            isComplete: selectedServices.includes('receipt-assistant'),
            actionLabel: 'Upload',
            actionUrl: '/receipts/scan',
            priority: 3,
        },
        {
            id: 'customize-ai',
            title: 'Customize your AI assistant',
            description: 'Configure responses and knowledge base',
            service: 'ai-assistant',
            isComplete: true,
            actionLabel: 'Configure',
            actionUrl: '/ai-assistant/settings',
            priority: 4,
        },
        {
            id: 'add-payment',
            title: 'Add payment method',
            description: 'Ensure uninterrupted service after trial',
            service: 'general',
            isComplete: false,
            actionLabel: 'Add',
            actionUrl: '/billing/payment-method',
            priority: 5,
        },
    ];

    return {
        organization: {
            id: 'org_123',
            name: 'My Business',
            createdAt: new Date().toISOString(),
        },
        services,
        usage,
        billing,
        onboardingTasks,
        recentActivity: [],
    };
};

export default function DashboardPage() {
    const { selectedServices, businessName, completedAt } = useOnboardingStore();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [showChecklist, setShowChecklist] = useState(true);

    useEffect(() => {
        // In production, fetch from API
        const data = getMockDashboardData(selectedServices);
        data.organization.name = businessName || 'My Business';
        setDashboardData(data);
    }, [selectedServices, businessName]);

    if (!dashboardData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-surf-cyan border-t-transparent" />
            </div>
        );
    }

    const getServiceUsage = (service: ServiceType) => {
        switch (service) {
            case 'ai-assistant':
                return {
                    primary: dashboardData.usage.aiConversations,
                    secondary: dashboardData.usage.aiMessages,
                };
            case 'whatsapp-assistant':
                return {
                    primary: dashboardData.usage.whatsappMessagesSent,
                    secondary: dashboardData.usage.whatsappActiveContacts,
                };
            case 'receipt-assistant':
                return {
                    primary: dashboardData.usage.receiptsProcessed,
                    secondary: dashboardData.usage.totalExpenseAmount,
                };
        }
    };

    const pendingTasks = dashboardData.onboardingTasks.filter(
        (t) => !t.isComplete
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <DashboardHeader
                organizationName={dashboardData.organization.name}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DashboardWelcome />

                {/* Onboarding Checklist */}
                {showChecklist && pendingTasks.length > 0 && (
                    <div className="mb-8">
                        <OnboardingChecklist
                            tasks={dashboardData.onboardingTasks}
                            onDismiss={() => setShowChecklist(false)}
                        />
                    </div>
                )}

                {/* Service Tiles */}
                <section className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Your Services
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dashboardData.services.map((status) => {
                            const usage = getServiceUsage(status.service);
                            return (
                                <ServiceTile
                                    key={status.service}
                                    service={status.service}
                                    status={status}
                                    primaryValue={usage.primary}
                                    secondaryValue={usage.secondary}
                                />
                            );
                        })}
                    </div>
                </section>

                {/* Usage & Billing Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Usage Metrics - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <UsageMetrics
                            metrics={dashboardData.usage}
                            showDetailed={true}
                        />
                    </div>

                    {/* Billing Card - Takes 1 column */}
                    <div>
                        <BillingCard billing={dashboardData.billing} />
                    </div>
                </div>
            </main>
        </div>
    );
}

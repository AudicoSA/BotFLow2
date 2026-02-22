import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
    DashboardData,
    ServiceStatus,
    UsageMetrics,
    BillingInfo,
    OnboardingTask,
} from '@/lib/dashboard/types';
import type { ServiceType } from '@/lib/onboarding/types';

interface AIConversation {
    id: string;
    created_at: string;
}

interface WhatsAppMessage {
    id: string;
    direction: string;
    contact_id: string;
    created_at: string;
}

interface ReceiptRecord {
    id: string;
    total: number;
    category: string;
    created_at: string;
}

// GET /api/dashboard - Get dashboard data for organization
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServerClient();

        // Fetch organization details
        const orgResult = await supabase
            .from('organizations')
            .select('id, name, created_at')
            .eq('id', organizationId)
            .single();

        // Fetch subscription data
        const subscriptionResult = await supabase
            .from('subscriptions')
            .select('*')
            .eq('organization_id', organizationId)
            .single();

        // Get current billing period
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Fetch usage data
        const aiUsageResult = await supabase
            .from<AIConversation>('ai_conversations')
            .select('id, created_at')
            .eq('organization_id', organizationId);

        const whatsappUsageResult = await supabase
            .from<WhatsAppMessage>('whatsapp_messages')
            .select('id, direction, contact_id, created_at')
            .eq('organization_id', organizationId);

        const receiptUsageResult = await supabase
            .from<ReceiptRecord>('receipts')
            .select('id, total, category, created_at')
            .eq('organization_id', organizationId)
            .eq('status', 'completed');

        // Filter by date range in memory
        const aiConversationsData = (aiUsageResult.data || []).filter((item) => {
            const date = new Date(item.created_at);
            return date >= startOfMonth && date <= endOfMonth;
        });

        const whatsappMessages = (whatsappUsageResult.data || []).filter((item) => {
            const date = new Date(item.created_at);
            return date >= startOfMonth && date <= endOfMonth;
        });

        const receipts = (receiptUsageResult.data || []).filter((item) => {
            const date = new Date(item.created_at);
            return date >= startOfMonth && date <= endOfMonth;
        });

        // Calculate metrics
        const aiConversationsCount = aiConversationsData.length;

        const whatsappSent = whatsappMessages.filter(
            (m) => m.direction === 'outbound'
        ).length;
        const whatsappReceived = whatsappMessages.filter(
            (m) => m.direction === 'inbound'
        ).length;

        const totalExpenses = receipts.reduce(
            (sum, r) => sum + (r.total || 0),
            0
        );
        const categoriesUsed = new Set(receipts.map((r) => r.category)).size;

        // Get WhatsApp account status
        const whatsappAccount = await supabase
            .from('whatsapp_accounts')
            .select('id, status, connected_at')
            .eq('organization_id', organizationId)
            .single();

        // Build service statuses
        const subscription = subscriptionResult.data as Record<string, unknown> | null;
        const planId = (subscription?.plan_id as string) || '';

        const services: ServiceStatus[] = [
            {
                service: 'ai-assistant' as ServiceType,
                isActive: planId.includes('ai') || planId === 'bundle',
                isSetupComplete: true,
                setupProgress: 100,
                lastActivity: aiConversationsData[0]?.created_at,
            },
            {
                service: 'whatsapp-assistant' as ServiceType,
                isActive: planId.includes('whatsapp') || planId === 'bundle',
                isSetupComplete: (whatsappAccount.data as Record<string, unknown>)?.status === 'connected',
                setupProgress: (whatsappAccount.data as Record<string, unknown>)?.status === 'connected' ? 100 : 60,
                lastActivity: (whatsappAccount.data as Record<string, unknown>)?.connected_at as string | undefined,
            },
            {
                service: 'receipt-assistant' as ServiceType,
                isActive: planId.includes('receipt') || planId === 'bundle',
                isSetupComplete: receipts.length > 0,
                setupProgress: receipts.length > 0 ? 100 : 0,
                lastActivity: receipts[0]?.created_at,
            },
        ];

        // Build usage metrics
        const usage: UsageMetrics = {
            aiConversations: aiConversationsCount,
            aiMessages: aiConversationsCount * 5,
            aiTokensUsed: aiConversationsCount * 1500,
            whatsappMessagesSent: whatsappSent,
            whatsappMessagesReceived: whatsappReceived,
            whatsappActiveContacts: new Set(
                whatsappMessages.map((m) => m.contact_id)
            ).size,
            receiptsProcessed: receipts.length,
            totalExpenseAmount: totalExpenses,
            categoriesUsed,
            periodStart: startOfMonth.toISOString(),
            periodEnd: endOfMonth.toISOString(),
        };

        // Build billing info
        const planIdValue = subscription?.plan_id as string | undefined;
        const billing: BillingInfo = {
            currentPlan: (planIdValue as BillingInfo['currentPlan']) || null,
            planName: (subscription?.plan_name as string) || 'No Plan',
            monthlyAmount: (subscription?.amount as number) || 0,
            currency: 'ZAR',
            billingCycle: (subscription?.billing_cycle as 'monthly' | 'annual') || 'monthly',
            nextBillingDate:
                (subscription?.next_billing_date as string) || endOfMonth.toISOString(),
            status: (subscription?.status as BillingInfo['status']) || 'canceled',
            trialEndsAt: subscription?.trial_ends_at as string | undefined,
            paymentMethod: subscription?.card_last4
                ? {
                      type: 'card' as const,
                      last4: subscription.card_last4 as string,
                      brand: subscription.card_brand as string | undefined,
                  }
                : undefined,
        };

        // Build onboarding tasks
        const whatsappData = whatsappAccount.data as Record<string, unknown> | null;
        const onboardingTasks: OnboardingTask[] = [
            {
                id: 'connect-whatsapp',
                title: 'Connect WhatsApp',
                description: 'Scan QR code to link your WhatsApp Business',
                service: 'whatsapp-assistant' as ServiceType,
                isComplete: whatsappData?.status === 'connected',
                actionLabel: 'Connect',
                actionUrl: '/whatsapp/setup',
                priority: 1,
            },
            {
                id: 'send-first-message',
                title: 'Send your first WhatsApp message',
                description: 'Test your automated messaging',
                service: 'whatsapp-assistant' as ServiceType,
                isComplete: whatsappSent > 0,
                actionLabel: 'Send',
                actionUrl: '/whatsapp/compose',
                priority: 2,
            },
            {
                id: 'upload-receipt',
                title: 'Upload your first receipt',
                description: 'Try our AI-powered receipt scanning',
                service: 'receipt-assistant' as ServiceType,
                isComplete: receipts.length > 0,
                actionLabel: 'Upload',
                actionUrl: '/receipts/scan',
                priority: 3,
            },
            {
                id: 'customize-ai',
                title: 'Customize your AI assistant',
                description: 'Configure responses and knowledge base',
                service: 'ai-assistant' as ServiceType,
                isComplete: aiConversationsCount > 0,
                actionLabel: 'Configure',
                actionUrl: '/ai-assistant/settings',
                priority: 4,
            },
            {
                id: 'add-payment',
                title: 'Add payment method',
                description: 'Ensure uninterrupted service after trial',
                service: 'general',
                isComplete: !!billing.paymentMethod,
                actionLabel: 'Add',
                actionUrl: '/billing/payment-method',
                priority: 5,
            },
        ];

        // Build response
        const orgData = orgResult.data as Record<string, unknown> | null;
        const dashboardData: DashboardData = {
            organization: {
                id: (orgData?.id as string) || organizationId,
                name: (orgData?.name as string) || 'My Business',
                createdAt: (orgData?.created_at as string) || now.toISOString(),
            },
            services,
            usage,
            billing,
            onboardingTasks,
            recentActivity: [],
        };

        return NextResponse.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        );
    }
}

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings,
    CreditCard,
    User,
    Bell,
    Shield,
    Building,
    ChevronRight,
    Loader2,
} from 'lucide-react';
import {
    CurrentPlanCard,
    PlanSelector,
    CancellationFlow,
    BillingHistory,
} from '@/app/components/subscriptions';
import type {
    Subscription,
    PlanId,
    PlanChangePreview,
    CancellationSurveyResponse,
    BillingHistoryItem,
    PaymentMethod,
} from '@/lib/subscriptions/types';

type SettingsTab = 'subscription' | 'profile' | 'notifications' | 'security' | 'organization';

const tabs = [
    { id: 'subscription' as const, label: 'Subscription & Billing', icon: CreditCard },
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'security' as const, label: 'Security', icon: Shield },
    { id: 'organization' as const, label: 'Organization', icon: Building },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('subscription');
    const [isLoading, setIsLoading] = useState(true);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

    // Modal states
    const [showPlanSelector, setShowPlanSelector] = useState(false);
    const [showCancellationFlow, setShowCancellationFlow] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadSubscriptionData();
    }, []);

    const loadSubscriptionData = async () => {
        setIsLoading(true);
        try {
            // Fetch subscription data
            const subResponse = await fetch('/api/subscriptions/current');
            if (subResponse.ok) {
                const data = await subResponse.json();
                setSubscription(data.subscription);
            }

            // Fetch billing history
            const historyResponse = await fetch('/api/billing/invoices?include_stats=false&limit=20');
            if (historyResponse.ok) {
                const data = await historyResponse.json();
                setBillingHistory(data.invoices || []);
            }

            // Fetch payment method
            const paymentResponse = await fetch('/api/billing/payment-methods');
            if (paymentResponse.ok) {
                const data = await paymentResponse.json();
                setPaymentMethod(data.payment_method);
            }
        } catch (error) {
            console.error('Error loading subscription data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlanChange = () => {
        setShowPlanSelector(true);
    };

    const handleCancelSubscription = () => {
        setShowCancellationFlow(true);
    };

    const handleSelectPlan = async (planId: PlanId, preview: PlanChangePreview) => {
        setShowPlanSelector(false);
        setIsProcessing(true);

        try {
            const response = await fetch('/api/subscriptions/change', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan_id: planId, preview }),
            });

            if (response.ok) {
                await loadSubscriptionData();
            }
        } catch (error) {
            console.error('Error changing plan:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmCancellation = async (response: CancellationSurveyResponse) => {
        setIsProcessing(true);

        try {
            const apiResponse = await fetch('/api/subscriptions/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(response),
            });

            if (apiResponse.ok) {
                setShowCancellationFlow(false);
                await loadSubscriptionData();
            }
        } catch (error) {
            console.error('Error canceling subscription:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReactivate = async () => {
        setIsProcessing(true);

        try {
            const response = await fetch('/api/subscriptions/reactivate', {
                method: 'POST',
            });

            if (response.ok) {
                await loadSubscriptionData();
            }
        } catch (error) {
            console.error('Error reactivating subscription:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadInvoice = async (invoiceId: string) => {
        try {
            const response = await fetch(`/api/billing/invoices/${invoiceId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.pdf_url) {
                    window.open(data.pdf_url, '_blank');
                }
            }
        } catch (error) {
            console.error('Error downloading invoice:', error);
        }
    };

    const handleUpdatePaymentMethod = async () => {
        try {
            const response = await fetch('/api/billing/payment-methods/update', {
                method: 'POST',
            });
            if (response.ok) {
                const data = await response.json();
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                }
            }
        } catch (error) {
            console.error('Error updating payment method:', error);
        }
    };

    const renderSubscriptionTab = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-surf-cyan animate-spin" />
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Current Plan */}
                <CurrentPlanCard
                    subscription={subscription}
                    onChangePlan={handlePlanChange}
                    onCancelSubscription={handleCancelSubscription}
                    onReactivate={handleReactivate}
                />

                {/* Billing History */}
                <BillingHistory
                    items={billingHistory}
                    paymentMethod={paymentMethod}
                    onDownloadInvoice={handleDownloadInvoice}
                    onUpdatePaymentMethod={handleUpdatePaymentMethod}
                />
            </div>
        );
    };

    const renderPlaceholderTab = (title: string) => (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500">
                This section is coming soon
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                    <p className="text-gray-500 mt-1">
                        Manage your subscription, billing, and account preferences
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Navigation */}
                    <nav className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                            isActive
                                                ? 'bg-surf-cyan/5 text-surf-cyan border-l-2 border-surf-cyan'
                                                : 'text-gray-600 hover:bg-gray-50 border-l-2 border-transparent'
                                        }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-surf-cyan' : 'text-gray-400'}`} />
                                        <span className="font-medium">{tab.label}</span>
                                        <ChevronRight className={`w-4 h-4 ml-auto ${isActive ? 'text-surf-cyan' : 'text-gray-300'}`} />
                                    </button>
                                );
                            })}
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === 'subscription' && renderSubscriptionTab()}
                                {activeTab === 'profile' && renderPlaceholderTab('Profile Settings')}
                                {activeTab === 'notifications' && renderPlaceholderTab('Notification Preferences')}
                                {activeTab === 'security' && renderPlaceholderTab('Security Settings')}
                                {activeTab === 'organization' && renderPlaceholderTab('Organization Settings')}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showPlanSelector && subscription && (
                    <PlanSelector
                        currentPlan={subscription.plan_id}
                        subscription={subscription}
                        onSelectPlan={handleSelectPlan}
                        onClose={() => setShowPlanSelector(false)}
                    />
                )}

                {showCancellationFlow && subscription && (
                    <CancellationFlow
                        subscription={subscription}
                        onCancel={handleConfirmCancellation}
                        onClose={() => setShowCancellationFlow(false)}
                    />
                )}
            </AnimatePresence>

            {/* Processing Overlay */}
            {isProcessing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 text-surf-cyan animate-spin" />
                        <p className="text-gray-600 font-medium">Processing...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    CreditCard,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    Sparkles,
} from 'lucide-react';
import type { BillingInfo } from '@/lib/dashboard/types';
import { formatCurrency, PLAN_PRICING } from '@/lib/dashboard/types';

interface BillingCardProps {
    billing: BillingInfo;
}

export default function BillingCard({ billing }: BillingCardProps) {
    const getStatusBadge = () => {
        switch (billing.status) {
            case 'active':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                    </span>
                );
            case 'trialing':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Sparkles className="w-3 h-3" />
                        Free Trial
                    </span>
                );
            case 'past_due':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <AlertCircle className="w-3 h-3" />
                        Past Due
                    </span>
                );
            case 'canceled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <Clock className="w-3 h-3" />
                        Canceled
                    </span>
                );
            default:
                return null;
        }
    };

    const daysUntilBilling = () => {
        const nextDate = new Date(billing.nextBillingDate);
        const today = new Date();
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const trialDaysRemaining = () => {
        if (!billing.trialEndsAt) return 0;
        const endDate = new Date(billing.trialEndsAt);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surf-cyan/10 flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-surf-cyan" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Billing & Subscription
                            </h2>
                            <p className="text-sm text-gray-500">
                                Manage your plan and payments
                            </p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Current Plan */}
                <div className="mb-6">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        Current Plan
                    </p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                            {billing.planName}
                        </span>
                        <span className="text-lg text-gray-500">
                            {formatCurrency(billing.monthlyAmount)}
                            <span className="text-sm">
                                /{billing.billingCycle === 'annual' ? 'year' : 'month'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* Trial Banner (if applicable) */}
                {billing.status === 'trialing' && billing.trialEndsAt && (
                    <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900">
                                    Free Trial Active
                                </p>
                                <p className="text-sm text-blue-700 mt-0.5">
                                    {trialDaysRemaining()} days remaining. Add a payment method
                                    to continue after trial.
                                </p>
                                <Link
                                    href="/billing/payment-method"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800 mt-2"
                                >
                                    Add Payment Method
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Past Due Warning */}
                {billing.status === 'past_due' && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-red-900">
                                    Payment Past Due
                                </p>
                                <p className="text-sm text-red-700 mt-0.5">
                                    Please update your payment method to avoid service
                                    interruption.
                                </p>
                                <Link
                                    href="/billing/update-payment"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-red-700 hover:text-red-800 mt-2"
                                >
                                    Update Payment Method
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing Details */}
                <div className="space-y-4">
                    {/* Next Billing Date */}
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Next Billing Date</span>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-900">
                                {new Date(billing.nextBillingDate).toLocaleDateString(
                                    'en-ZA',
                                    {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    }
                                )}
                            </p>
                            <p className="text-xs text-gray-500">
                                in {daysUntilBilling()} days
                            </p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    {billing.paymentMethod && (
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2 text-gray-600">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-sm">Payment Method</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {billing.paymentMethod.brand && (
                                    <span className="text-xs uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">
                                        {billing.paymentMethod.brand}
                                    </span>
                                )}
                                <span className="font-medium text-gray-900">
                                    •••• {billing.paymentMethod.last4}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Billing Cycle */}
                    <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">Billing Cycle</span>
                        </div>
                        <span className="font-medium text-gray-900 capitalize">
                            {billing.billingCycle}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap gap-3">
                    <Link
                        href="/billing"
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surf-cyan text-white font-medium text-sm hover:bg-surf-dark transition-colors"
                    >
                        Manage Subscription
                    </Link>
                    <Link
                        href="/billing/invoices"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                    >
                        View Invoices
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

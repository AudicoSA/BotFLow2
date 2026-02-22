'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    ArrowUpRight,
    Calendar,
    CreditCard,
    Users,
} from 'lucide-react';
import type { Subscription, Plan } from '@/lib/subscriptions/types';
import {
    formatPrice,
    getPlanById,
    getSubscriptionStatusLabel,
    getSubscriptionStatusColor,
} from '@/lib/subscriptions/types';

interface CurrentPlanCardProps {
    subscription: Subscription | null;
    onChangePlan?: () => void;
    onCancelSubscription?: () => void;
    onReactivate?: () => void;
}

export default function CurrentPlanCard({
    subscription,
    onChangePlan,
    onCancelSubscription,
    onReactivate,
}: CurrentPlanCardProps) {
    const plan = subscription ? getPlanById(subscription.plan_id) : getPlanById('free');
    const isActive = subscription?.status === 'active' || subscription?.status === 'trialing';
    const isCanceling = subscription?.cancel_at_period_end;

    const getStatusBadge = () => {
        if (!subscription) {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <Clock className="w-3 h-3" />
                    No Plan
                </span>
            );
        }

        const color = getSubscriptionStatusColor(subscription.status);
        const colorClasses: Record<string, string> = {
            green: 'bg-green-100 text-green-700',
            blue: 'bg-blue-100 text-blue-700',
            red: 'bg-red-100 text-red-700',
            gray: 'bg-gray-100 text-gray-600',
            yellow: 'bg-yellow-100 text-yellow-700',
            orange: 'bg-orange-100 text-orange-700',
        };

        const Icon = subscription.status === 'active' ? CheckCircle2 :
                     subscription.status === 'past_due' ? AlertCircle : Clock;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
                <Icon className="w-3 h-3" />
                {getSubscriptionStatusLabel(subscription.status)}
                {isCanceling && ' (Canceling)'}
            </span>
        );
    };

    const getDaysRemaining = () => {
        if (!subscription) return 0;

        const endDate = new Date(subscription.current_period_end);
        const now = new Date();
        const diffTime = endDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    const getTrialDaysRemaining = () => {
        if (!subscription?.trial_end) return 0;

        const trialEnd = new Date(subscription.trial_end);
        const now = new Date();
        const diffTime = trialEnd.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
            {/* Plan Header */}
            <div className={`p-6 bg-gradient-to-r from-${plan.color}-50 to-white border-b border-gray-100`}>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-${plan.color}-100 flex items-center justify-center text-3xl`}>
                            {plan.icon}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>
            </div>

            {/* Plan Details */}
            <div className="p-6">
                {/* Pricing */}
                <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                            {formatPrice(subscription?.amount || plan.price)}
                        </span>
                        <span className="text-gray-500">
                            /{subscription?.billing_interval || 'month'}
                        </span>
                    </div>
                    {subscription?.user_count && subscription.user_count > 1 && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {subscription.user_count} users
                        </p>
                    )}
                </div>

                {/* Trial Warning */}
                {subscription?.status === 'trialing' && (
                    <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-blue-900">
                                    Trial ends in {getTrialDaysRemaining()} days
                                </p>
                                <p className="text-sm text-blue-700 mt-0.5">
                                    Add a payment method to continue after your trial.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancellation Warning */}
                {isCanceling && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <div>
                                <p className="font-medium text-amber-900">
                                    Subscription ending
                                </p>
                                <p className="text-sm text-amber-700 mt-0.5">
                                    Your subscription will end on{' '}
                                    {new Date(subscription.current_period_end).toLocaleDateString('en-ZA', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing Cycle */}
                {subscription && isActive && !isCanceling && (
                    <div className="mb-6 flex items-center justify-between p-4 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    Next billing date
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(subscription.current_period_end).toLocaleDateString('en-ZA', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                        <span className="text-sm text-gray-500">
                            in {getDaysRemaining()} days
                        </span>
                    </div>
                )}

                {/* Features */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Included features
                    </h3>
                    <ul className="space-y-2">
                        {plan.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className={`w-4 h-4 text-${plan.color}-500`} />
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                    {(!subscription || subscription.plan_id === 'free') && (
                        <button
                            onClick={onChangePlan}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surf-cyan text-white font-medium text-sm hover:bg-surf-dark transition-colors"
                        >
                            Upgrade Plan
                            <ArrowUpRight className="w-4 h-4" />
                        </button>
                    )}
                    {subscription && subscription.plan_id !== 'free' && !isCanceling && (
                        <>
                            <button
                                onClick={onChangePlan}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-surf-cyan text-white font-medium text-sm hover:bg-surf-dark transition-colors"
                            >
                                Change Plan
                            </button>
                            <button
                                onClick={onCancelSubscription}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200 transition-colors"
                            >
                                Cancel Plan
                            </button>
                        </>
                    )}
                    {isCanceling && (
                        <button
                            onClick={onReactivate}
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors"
                        >
                            Reactivate Subscription
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

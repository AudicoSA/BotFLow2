'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    ArrowRight,
    ArrowDown,
    ArrowUp,
    Sparkles,
    X,
} from 'lucide-react';
import type { PlanId, Plan, Subscription, PlanChangePreview } from '@/lib/subscriptions/types';
import { PLANS, formatPrice, getPlanById } from '@/lib/subscriptions/types';

interface PlanSelectorProps {
    currentPlan: PlanId;
    subscription: Subscription | null;
    onSelectPlan: (planId: PlanId, preview: PlanChangePreview) => void;
    onClose: () => void;
}

export default function PlanSelector({
    currentPlan,
    subscription,
    onSelectPlan,
    onClose,
}: PlanSelectorProps) {
    const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
    const [isCalculating, setIsCalculating] = useState(false);

    const availablePlans = Object.values(PLANS).filter((p) => p.id !== 'free');

    const getChangeType = (planId: PlanId): 'upgrade' | 'downgrade' | 'current' => {
        if (planId === currentPlan) return 'current';

        const currentPlanData = getPlanById(currentPlan);
        const newPlanData = getPlanById(planId);

        return newPlanData.price > currentPlanData.price ? 'upgrade' : 'downgrade';
    };

    const calculateProration = (planId: PlanId): PlanChangePreview => {
        const currentPlanData = getPlanById(currentPlan);
        const newPlanData = getPlanById(planId);

        // Calculate days remaining in billing period
        let daysRemaining = 30;
        const totalDays = 30;

        if (subscription) {
            const now = new Date();
            const periodEnd = new Date(subscription.current_period_end);
            daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }

        const dailyCurrentRate = currentPlanData.price / totalDays;
        const dailyNewRate = newPlanData.price / totalDays;

        const currentCredit = Math.round(dailyCurrentRate * daysRemaining);
        const newCharge = Math.round(dailyNewRate * daysRemaining);
        const prorationAmount = newCharge - currentCredit;

        const changeType = getChangeType(planId);

        return {
            current_plan: currentPlan,
            new_plan: planId,
            proration_amount: prorationAmount,
            proration_date: new Date().toISOString(),
            new_amount: billingInterval === 'annual' ? newPlanData.priceAnnual : newPlanData.price,
            effective_date: changeType === 'upgrade' ? new Date().toISOString() : (subscription?.current_period_end || new Date().toISOString()),
            immediate: changeType === 'upgrade',
        };
    };

    const handleSelectPlan = async (planId: PlanId) => {
        if (planId === currentPlan) return;

        setSelectedPlan(planId);
        setIsCalculating(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        const preview = calculateProration(planId);
        setIsCalculating(false);

        onSelectPlan(planId, preview);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Change Plan</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Select a new plan. Changes will be prorated.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Billing Toggle */}
                <div className="px-6 pt-6 flex justify-center">
                    <div className="inline-flex items-center gap-2 p-1 bg-gray-100 rounded-xl">
                        <button
                            onClick={() => setBillingInterval('monthly')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                billingInterval === 'monthly'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingInterval('annual')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                                billingInterval === 'annual'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Annual
                            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                Save 20%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[60vh]">
                    {availablePlans.map((plan) => {
                        const changeType = getChangeType(plan.id);
                        const isSelected = selectedPlan === plan.id;
                        const isCurrent = plan.id === currentPlan;
                        const price = billingInterval === 'annual' ? plan.priceAnnual / 12 : plan.price;

                        return (
                            <motion.div
                                key={plan.id}
                                whileHover={{ scale: isCurrent ? 1 : 1.02 }}
                                className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
                                    isCurrent
                                        ? 'border-gray-200 bg-gray-50 cursor-default'
                                        : isSelected
                                        ? 'border-surf-cyan bg-surf-cyan/5'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => !isCurrent && handleSelectPlan(plan.id)}
                            >
                                {/* Popular Badge */}
                                {plan.popular && !isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-surf-cyan text-white">
                                            <Sparkles className="w-3 h-3" />
                                            Popular
                                        </span>
                                    </div>
                                )}

                                {/* Current Badge */}
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
                                            Current Plan
                                        </span>
                                    </div>
                                )}

                                {/* Plan Icon */}
                                <div className="text-3xl mb-3">{plan.icon}</div>

                                {/* Plan Name */}
                                <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{plan.description}</p>

                                {/* Price */}
                                <div className="mt-3 mb-4">
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatPrice(price)}
                                    </span>
                                    <span className="text-gray-500 text-sm">/mo</span>
                                    {billingInterval === 'annual' && (
                                        <p className="text-xs text-green-600 mt-0.5">
                                            Billed annually
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-1.5">
                                    {plan.features.slice(0, 4).map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-xs text-gray-600"
                                        >
                                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Change Type Indicator */}
                                {!isCurrent && (
                                    <div className="mt-4 pt-3 border-t border-gray-100">
                                        <div className={`flex items-center gap-1.5 text-xs font-medium ${
                                            changeType === 'upgrade' ? 'text-green-600' : 'text-amber-600'
                                        }`}>
                                            {changeType === 'upgrade' ? (
                                                <>
                                                    <ArrowUp className="w-3.5 h-3.5" />
                                                    Upgrade
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowDown className="w-3.5 h-3.5" />
                                                    Downgrade
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Loading State */}
                                {isSelected && isCalculating && (
                                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-surf-cyan border-t-transparent" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
}

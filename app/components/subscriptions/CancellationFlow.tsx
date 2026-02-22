'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    AlertTriangle,
    ChevronRight,
    Gift,
    Clock,
    ArrowLeft,
    Check,
    MessageSquare,
} from 'lucide-react';
import type { Subscription, CancellationSurveyResponse, CancellationReason } from '@/lib/subscriptions/types';
import { CANCELLATION_REASONS, getPlanById, formatPrice } from '@/lib/subscriptions/types';

interface CancellationFlowProps {
    subscription: Subscription;
    onCancel: (response: CancellationSurveyResponse) => Promise<void>;
    onClose: () => void;
}

type Step = 'reason' | 'feedback' | 'offer' | 'confirm';

export default function CancellationFlow({
    subscription,
    onCancel,
    onClose,
}: CancellationFlowProps) {
    const [step, setStep] = useState<Step>('reason');
    const [selectedReason, setSelectedReason] = useState<CancellationReason | null>(null);
    const [feedback, setFeedback] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [acceptedOffer, setAcceptedOffer] = useState(false);

    const plan = getPlanById(subscription.plan_id);
    const daysRemaining = Math.ceil(
        (new Date(subscription.current_period_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const handleReasonSelect = (reasonId: CancellationReason) => {
        setSelectedReason(reasonId);
        setStep('feedback');
    };

    const handleFeedbackSubmit = () => {
        // Show retention offer for certain reasons
        const offerableReasons = ['too_expensive', 'not_using_enough', 'missing_features'];
        if (selectedReason && offerableReasons.includes(selectedReason)) {
            setStep('offer');
        } else {
            setStep('confirm');
        }
    };

    const handleAcceptOffer = () => {
        setAcceptedOffer(true);
        // In real app, apply discount and close
        onClose();
    };

    const handleConfirmCancel = async () => {
        setIsProcessing(true);
        try {
            await onCancel({
                reason: selectedReason || 'other',
                feedback: feedback || undefined,
                would_recommend: undefined,
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'reason':
                return (
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                We&apos;re sorry to see you go
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Please let us know why you&apos;re canceling
                            </p>
                        </div>

                        <div className="space-y-2">
                            {CANCELLATION_REASONS.map((reason) => (
                                <button
                                    key={reason.value}
                                    onClick={() => handleReasonSelect(reason.value)}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left"
                                >
                                    <span className="text-xl">{reason.icon}</span>
                                    <span className="flex-1 font-medium text-gray-700">
                                        {reason.label}
                                    </span>
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'feedback':
                return (
                    <div className="p-6">
                        <button
                            onClick={() => setStep('reason')}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-surf-cyan/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="w-6 h-6 text-surf-cyan" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Help us improve
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Your feedback helps us build a better product
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Is there anything specific we could have done better?
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Share your thoughts... (optional)"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-surf-cyan focus:ring-2 focus:ring-surf-cyan/20 resize-none"
                                    rows={4}
                                />
                            </div>

                            <button
                                onClick={handleFeedbackSubmit}
                                className="w-full py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case 'offer':
                return (
                    <div className="p-6">
                        <button
                            onClick={() => setStep('feedback')}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Gift className="w-6 h-6 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Before you go...
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                We&apos;d like to offer you a special deal
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-surf-cyan/5 to-surf-cyan/10 rounded-2xl p-6 border border-surf-cyan/20 mb-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">
                                    Stay with us and get
                                </p>
                                <p className="text-4xl font-bold text-surf-cyan mb-1">
                                    50% OFF
                                </p>
                                <p className="text-sm text-gray-600">
                                    your next 3 months
                                </p>

                                <div className="mt-4 pt-4 border-t border-surf-cyan/20">
                                    <p className="text-sm text-gray-500">
                                        {plan.name} at{' '}
                                        <span className="line-through">
                                            {formatPrice(plan.price)}
                                        </span>{' '}
                                        <span className="font-bold text-gray-900">
                                            {formatPrice(Math.round(plan.price / 2))}
                                        </span>
                                        /month
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleAcceptOffer}
                                className="w-full py-3 rounded-xl bg-surf-cyan text-white font-medium hover:bg-surf-cyan/90 transition-colors flex items-center justify-center gap-2"
                            >
                                <Check className="w-5 h-5" />
                                Accept Offer & Stay
                            </button>
                            <button
                                onClick={() => setStep('confirm')}
                                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                No thanks, continue canceling
                            </button>
                        </div>
                    </div>
                );

            case 'confirm':
                return (
                    <div className="p-6">
                        <button
                            onClick={() => setStep(selectedReason && ['too_expensive', 'not_using_enough', 'missing_features'].includes(selectedReason) ? 'offer' : 'feedback')}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Confirm Cancellation
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                This action cannot be undone
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-700">
                                            Access until end of billing period
                                        </p>
                                        <p className="text-gray-500">
                                            You&apos;ll have access for {daysRemaining} more days until{' '}
                                            {new Date(subscription.current_period_end).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <p className="font-medium text-gray-700">
                                            Data retention
                                        </p>
                                        <p className="text-gray-500">
                                            Your data will be retained for 30 days after cancellation
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleConfirmCancel}
                                disabled={isProcessing}
                                className="w-full py-3 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm Cancellation'
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Keep My Subscription
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 text-gray-400 z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Progress Indicator */}
                <div className="px-6 pt-6">
                    <div className="flex gap-1">
                        {['reason', 'feedback', 'offer', 'confirm'].map((s, i) => {
                            const steps: Step[] = ['reason', 'feedback', 'offer', 'confirm'];
                            const currentIndex = steps.indexOf(step);
                            return (
                                <div
                                    key={s}
                                    className={`flex-1 h-1 rounded-full transition-colors ${
                                        i <= currentIndex ? 'bg-surf-cyan' : 'bg-gray-200'
                                    }`}
                                />
                            );
                        })}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}

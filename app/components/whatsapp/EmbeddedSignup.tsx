'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Building2,
    Phone,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ArrowRight,
    ExternalLink,
} from 'lucide-react';
import Script from 'next/script';
import { EMBEDDED_SIGNUP_CONFIG, initEmbeddedSignup } from '@/lib/whatsapp/embedded-signup';

interface EmbeddedSignupProps {
    organizationId: string;
    onSuccess: (accountId: string) => void;
    onCancel: () => void;
}

type SignupStep = 'loading' | 'ready' | 'signing-up' | 'processing' | 'success' | 'error';

export default function EmbeddedSignup({
    organizationId,
    onSuccess,
    onCancel,
}: EmbeddedSignupProps) {
    const [step, setStep] = useState<SignupStep>('loading');
    const [error, setError] = useState<string | null>(null);
    const [sdkReady, setSdkReady] = useState(false);
    const [accountInfo, setAccountInfo] = useState<{
        phone_number: string;
        display_name: string;
    } | null>(null);

    // Initialize FB SDK
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.fbAsyncInit = () => {
                window.FB.init({
                    appId: EMBEDDED_SIGNUP_CONFIG.app_id,
                    cookie: true,
                    xfbml: true,
                    version: 'v18.0',
                });
                setSdkReady(true);
                setStep('ready');
            };

            // Check if SDK already loaded
            if (window.FB) {
                setSdkReady(true);
                setStep('ready');
            }
        }
    }, []);

    // Handle signup initiation
    const handleStartSignup = useCallback(() => {
        if (!sdkReady) {
            setError('Facebook SDK not ready. Please refresh the page.');
            setStep('error');
            return;
        }

        setStep('signing-up');

        initEmbeddedSignup(
            async (response) => {
                setStep('processing');

                try {
                    // Send code to backend for processing
                    const result = await fetch('/api/whatsapp/embedded-signup/callback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            code: response.code,
                            organization_id: organizationId,
                        }),
                    });

                    if (!result.ok) {
                        const errorData = await result.json();
                        throw new Error(errorData.message || 'Failed to complete signup');
                    }

                    const data = await result.json();
                    setAccountInfo({
                        phone_number: data.account.phone_number,
                        display_name: data.account.display_name,
                    });
                    setStep('success');

                    // Redirect after showing success
                    setTimeout(() => {
                        onSuccess(data.account.id);
                    }, 2000);
                } catch (err) {
                    setError(
                        err instanceof Error ? err.message : 'Failed to complete signup'
                    );
                    setStep('error');
                }
            },
            () => {
                // User cancelled
                setStep('ready');
            },
            organizationId
        );
    }, [sdkReady, organizationId, onSuccess]);

    return (
        <>
            {/* Facebook SDK */}
            <Script
                src="https://connect.facebook.net/en_US/sdk.js"
                strategy="lazyOnload"
                onLoad={() => {
                    if (window.FB && !sdkReady) {
                        window.FB.init({
                            appId: EMBEDDED_SIGNUP_CONFIG.app_id,
                            cookie: true,
                            xfbml: true,
                            version: 'v18.0',
                        });
                        setSdkReady(true);
                        setStep('ready');
                    }
                }}
            />

            <div className="bg-white rounded-2xl shadow-xl max-w-lg mx-auto overflow-hidden">
                <AnimatePresence mode="wait">
                    {/* Loading SDK */}
                    {step === 'loading' && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-8 text-center"
                        >
                            <Loader2 className="w-12 h-12 text-surf animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Loading WhatsApp Business setup...</p>
                        </motion.div>
                    )}

                    {/* Ready to Start */}
                    {step === 'ready' && (
                        <motion.div
                            key="ready"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-8"
                        >
                            <div className="text-center mb-8">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Connect WhatsApp Business
                                </h2>
                                <p className="text-gray-600">
                                    Use your existing WhatsApp Business Account or create a new
                                    one through Meta Business Suite.
                                </p>
                            </div>

                            {/* Steps preview */}
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Building2 className="w-5 h-5 text-surf" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            1. Connect Business Account
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Log in with Facebook and select your business
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <Phone className="w-5 h-5 text-surf" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            2. Verify Phone Number
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Add or verify your WhatsApp Business number
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                        <CheckCircle2 className="w-5 h-5 text-surf" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            3. Start Messaging
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Your account will be ready to use immediately
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleStartSignup}
                                className="w-full py-4 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Continue with Facebook
                                <ExternalLink className="w-4 h-4" />
                            </button>

                            <button
                                onClick={onCancel}
                                className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium mt-3 transition-colors"
                            >
                                Cancel
                            </button>

                            <p className="text-xs text-gray-500 text-center mt-4">
                                By continuing, you agree to Meta&apos;s Terms of Service and
                                WhatsApp Business Terms
                            </p>
                        </motion.div>
                    )}

                    {/* Signing Up */}
                    {step === 'signing-up' && (
                        <motion.div
                            key="signing-up"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-[#1877F2]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg
                                    className="w-10 h-10 text-[#1877F2]"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Complete Setup in Facebook
                            </h2>
                            <p className="text-gray-600 mb-6">
                                A popup window should have opened. Please complete the setup
                                there.
                            </p>
                            <p className="text-sm text-gray-500">
                                Don&apos;t see the popup?{' '}
                                <button
                                    onClick={handleStartSignup}
                                    className="text-surf hover:underline"
                                >
                                    Click here to try again
                                </button>
                            </p>
                        </motion.div>
                    )}

                    {/* Processing */}
                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-8 text-center"
                        >
                            <Loader2 className="w-16 h-16 text-surf animate-spin mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Setting Up Your Account
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we configure your WhatsApp Business
                                integration...
                            </p>
                        </motion.div>
                    )}

                    {/* Success */}
                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="p-8 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', delay: 0.2 }}
                                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                WhatsApp Connected!
                            </h2>
                            {accountInfo && (
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900 font-medium">
                                            {accountInfo.phone_number}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-600">
                                            {accountInfo.display_name}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-center gap-2 text-surf">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-medium">Redirecting to dashboard...</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Error */}
                    {step === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="p-8 text-center"
                        >
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Setup Failed
                            </h2>
                            <p className="text-gray-600 mb-6">
                                {error || 'Something went wrong. Please try again.'}
                            </p>
                            <button
                                onClick={() => {
                                    setError(null);
                                    setStep('ready');
                                }}
                                className="w-full py-4 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                Try Again
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={onCancel}
                                className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium mt-3 transition-colors"
                            >
                                Cancel
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}

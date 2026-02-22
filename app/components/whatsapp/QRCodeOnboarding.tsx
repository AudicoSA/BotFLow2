'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    QrCode,
    Smartphone,
    CheckCircle2,
    RefreshCw,
    AlertCircle,
    ArrowRight,
    Loader2,
    MessageSquare,
    Shield,
    Zap,
} from 'lucide-react';

interface QRCodeOnboardingProps {
    phoneNumberId: string;
    onSuccess: (connected: boolean) => void;
    onCancel: () => void;
}

type OnboardingStep = 'intro' | 'qr-display' | 'scanning' | 'connecting' | 'success' | 'error';

interface QRCodeData {
    code: string;
    deep_link_url: string;
    qr_image_url: string;
}

export default function QRCodeOnboarding({
    phoneNumberId,
    onSuccess,
    onCancel,
}: QRCodeOnboardingProps) {
    const [step, setStep] = useState<OnboardingStep>('intro');
    const [qrCode, setQrCode] = useState<QRCodeData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(120); // 2 minutes expiry

    // Generate QR code
    const generateQRCode = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/whatsapp/qr-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number_id: phoneNumberId,
                    prefilled_message: 'Hi! I want to connect my WhatsApp to BotFlow.',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate QR code');
            }

            const data = await response.json();
            setQrCode(data);
            setStep('qr-display');
            setCountdown(120);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate QR code');
            setStep('error');
        } finally {
            setIsLoading(false);
        }
    }, [phoneNumberId]);

    // Countdown timer for QR expiry
    useEffect(() => {
        if (step !== 'qr-display' || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setStep('error');
                    setError('QR code expired. Please generate a new one.');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [step, countdown]);

    // Poll for connection status
    useEffect(() => {
        if (step !== 'qr-display' && step !== 'scanning') return;

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(
                    `/api/whatsapp/connection-status?phone_number_id=${phoneNumberId}`
                );
                const data = await response.json();

                if (data.status === 'connected') {
                    setStep('success');
                    setTimeout(() => onSuccess(true), 2000);
                } else if (data.status === 'scanning') {
                    setStep('scanning');
                } else if (data.status === 'connecting') {
                    setStep('connecting');
                }
            } catch {
                // Ignore polling errors
            }
        }, 3000);

        return () => clearInterval(pollInterval);
    }, [step, phoneNumberId, onSuccess]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl max-w-lg mx-auto overflow-hidden">
            <AnimatePresence mode="wait">
                {/* Intro Step */}
                {step === 'intro' && (
                    <motion.div
                        key="intro"
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
                                Connect WhatsApp
                            </h2>
                            <p className="text-gray-600">
                                Scan the QR code with your WhatsApp to connect your business
                                account.
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-surf/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Zap className="w-5 h-5 text-surf" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Instant Setup
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Connect in under 60 seconds with QR code scanning
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-surf/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-5 h-5 text-surf" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Secure & Private
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        End-to-end encryption keeps your messages safe
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-surf/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Smartphone className="w-5 h-5 text-surf" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">
                                        Keep Using Your Phone
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Coexistence mode lets you use WhatsApp Business App too
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={generateQRCode}
                            disabled={isLoading}
                            className="w-full py-4 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating QR Code...
                                </>
                            ) : (
                                <>
                                    Generate QR Code
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={onCancel}
                            className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium mt-3 transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}

                {/* QR Display Step */}
                {step === 'qr-display' && qrCode && (
                    <motion.div
                        key="qr-display"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                    >
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Scan QR Code
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Open WhatsApp on your phone and scan this code
                            </p>
                        </div>

                        {/* QR Code */}
                        <div className="relative bg-white p-4 rounded-2xl border-2 border-gray-100 mx-auto w-fit mb-6">
                            <div className="w-64 h-64 bg-gray-50 rounded-xl flex items-center justify-center">
                                {qrCode.qr_image_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={qrCode.qr_image_url}
                                        alt="WhatsApp QR Code"
                                        className="w-full h-full object-contain"
                                    />
                                ) : (
                                    <QrCode className="w-32 h-32 text-gray-400" />
                                )}
                            </div>

                            {/* Timer badge */}
                            <div
                                className={`absolute -top-3 -right-3 px-3 py-1 rounded-full text-sm font-medium ${
                                    countdown < 30
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-surf/10 text-surf'
                                }`}
                            >
                                {formatTime(countdown)}
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
                                How to scan:
                            </h3>
                            <ol className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-surf text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                        1
                                    </span>
                                    Open WhatsApp on your phone
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-surf text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                        2
                                    </span>
                                    Go to Settings → Linked Devices
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-5 h-5 bg-surf text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">
                                        3
                                    </span>
                                    Tap &quot;Link a Device&quot; and scan this code
                                </li>
                            </ol>
                        </div>

                        <button
                            onClick={generateQRCode}
                            className="w-full py-3 border border-gray-200 text-gray-700 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Generate New Code
                        </button>
                    </motion.div>
                )}

                {/* Scanning Step */}
                {step === 'scanning' && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-surf/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Smartphone className="w-10 h-10 text-surf animate-pulse" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            QR Code Detected
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Please confirm the connection on your phone...
                        </p>
                        <div className="flex items-center justify-center gap-2 text-surf">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Waiting for confirmation</span>
                        </div>
                    </motion.div>
                )}

                {/* Connecting Step */}
                {step === 'connecting' && (
                    <motion.div
                        key="connecting"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-surf/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Loader2 className="w-10 h-10 text-surf animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Connecting...
                        </h2>
                        <p className="text-gray-600">
                            Setting up your WhatsApp connection. This may take a moment.
                        </p>
                    </motion.div>
                )}

                {/* Success Step */}
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
                            Successfully Connected!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your WhatsApp is now connected to BotFlow. You can start sending
                            and receiving messages.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Redirecting to dashboard...</span>
                        </div>
                    </motion.div>
                )}

                {/* Error Step */}
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
                            Connection Failed
                        </h2>
                        <p className="text-gray-600 mb-6">
                            {error || 'Something went wrong. Please try again.'}
                        </p>
                        <button
                            onClick={() => {
                                setError(null);
                                setStep('intro');
                            }}
                            className="w-full py-4 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Try Again
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
    );
}

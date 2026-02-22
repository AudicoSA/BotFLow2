'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';

interface VerificationResult {
    success: boolean;
    data?: {
        reference: string;
        status: string;
        amount: number;
        plan?: { planId: string };
        customer?: { email: string };
    };
    error?: string;
}

function CallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
    const [result, setResult] = useState<VerificationResult | null>(null);

    useEffect(() => {
        if (!reference) {
            setStatus('failed');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch(`/api/checkout/verify?reference=${reference}`);
                const data: VerificationResult = await response.json();

                setResult(data);
                setStatus(data.success ? 'success' : 'failed');
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('failed');
            }
        };

        verifyPayment();
    }, [reference]);

    if (status === 'loading') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 text-surf animate-spin mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-dark-navy mb-2">Verifying Payment</h2>
                    <p className="text-gray-600">Please wait while we confirm your payment...</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[60vh] flex items-center justify-center"
            >
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-dark-navy mb-4">Payment Successful!</h2>
                    <p className="text-gray-600 mb-8">
                        Thank you for subscribing to BotFlow. Your account has been activated
                        and you can start using our services immediately.
                    </p>

                    {result?.data && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
                            <div className="text-sm text-gray-500 mb-1">Reference</div>
                            <div className="font-mono text-dark-navy">{result.data.reference}</div>
                            <div className="text-sm text-gray-500 mt-3 mb-1">Amount</div>
                            <div className="font-bold text-dark-navy">
                                R{(result.data.amount / 100).toFixed(2)}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group"
                        >
                            Go to Dashboard
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/"
                            className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="min-h-[60vh] flex items-center justify-center"
        >
            <div className="text-center max-w-md">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-3xl font-bold text-dark-navy mb-4">Payment Failed</h2>
                <p className="text-gray-600 mb-8">
                    {result?.error || 'We couldn\'t process your payment. Please try again or contact support.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-8 py-4 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Try Again
                    </button>
                    <Link
                        href="/pricing"
                        className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                        View Plans
                    </Link>
                </div>

                <p className="text-sm text-gray-500 mt-8">
                    Need help? Contact us at{' '}
                    <a href="mailto:support@botflow.co.za" className="text-surf hover:underline">
                        support@botflow.co.za
                    </a>
                </p>
            </div>
        </motion.div>
    );
}

export default function CheckoutCallbackPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="pt-24 pb-16 px-6">
                <Suspense fallback={
                    <div className="min-h-[60vh] flex items-center justify-center">
                        <Loader2 className="w-16 h-16 text-surf animate-spin" />
                    </div>
                }>
                    <CallbackContent />
                </Suspense>
            </div>
            <Footer />
        </main>
    );
}

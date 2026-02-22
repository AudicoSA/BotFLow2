'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MessageSquare, QrCode, Building2 } from 'lucide-react';
import Link from 'next/link';
import EmbeddedSignup from '../../components/whatsapp/EmbeddedSignup';
import QRCodeOnboarding from '../../components/whatsapp/QRCodeOnboarding';

type SetupMethod = 'choose' | 'embedded' | 'qr';

export default function WhatsAppSetupPage() {
    const [method, setMethod] = useState<SetupMethod>('choose');
    // In production, this would come from auth context
    const organizationId = 'demo-org-id';
    const phoneNumberId = 'demo-phone-id';

    const handleSuccess = (accountId: string | boolean) => {
        // Redirect to dashboard after successful setup
        if (typeof accountId === 'string') {
            window.location.href = `/dashboard/whatsapp?account=${accountId}`;
        } else {
            window.location.href = '/dashboard/whatsapp';
        }
    };

    const handleCancel = () => {
        setMethod('choose');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h1 className="font-bold text-gray-900">
                                    WhatsApp Setup
                                </h1>
                                <p className="text-sm text-gray-500">
                                    Connect your WhatsApp Business account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <AnimatePresence mode="wait">
                    {/* Choose Method */}
                    {method === 'choose' && (
                        <motion.div
                            key="choose"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="text-center mb-10">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                    How would you like to connect?
                                </h2>
                                <p className="text-lg text-gray-600">
                                    Choose the best method for your setup
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Embedded Signup Option */}
                                <button
                                    onClick={() => setMethod('embedded')}
                                    className="bg-white rounded-2xl p-8 text-left border-2 border-gray-200 hover:border-surf hover:shadow-lg transition-all group"
                                >
                                    <div className="w-16 h-16 bg-[#1877F2]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Building2 className="w-8 h-8 text-[#1877F2]" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        Meta Business Suite
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Connect through Facebook and set up a new WhatsApp
                                        Business Account or link an existing one.
                                    </p>
                                    <ul className="space-y-2 text-sm text-gray-500">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            Best for new businesses
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            Full API access
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            Template messages
                                        </li>
                                    </ul>
                                    <div className="mt-6 text-surf font-semibold group-hover:underline">
                                        Continue with Facebook →
                                    </div>
                                </button>

                                {/* QR Code Option */}
                                <button
                                    onClick={() => setMethod('qr')}
                                    className="bg-white rounded-2xl p-8 text-left border-2 border-gray-200 hover:border-surf hover:shadow-lg transition-all group"
                                >
                                    <div className="w-16 h-16 bg-surf/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <QrCode className="w-8 h-8 text-surf" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        QR Code Scan
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Scan a QR code with your WhatsApp Business App to
                                        connect quickly and keep using your phone.
                                    </p>
                                    <ul className="space-y-2 text-sm text-gray-500">
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            Quick setup (under 60s)
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            Coexistence mode
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                                            Keep using your phone
                                        </li>
                                    </ul>
                                    <div className="mt-6 text-surf font-semibold group-hover:underline">
                                        Scan QR Code →
                                    </div>
                                </button>
                            </div>

                            <div className="mt-8 text-center">
                                <Link
                                    href="/dashboard"
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Cancel and go back
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* Embedded Signup */}
                    {method === 'embedded' && (
                        <motion.div
                            key="embedded"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <EmbeddedSignup
                                organizationId={organizationId}
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                            />
                        </motion.div>
                    )}

                    {/* QR Code Onboarding */}
                    {method === 'qr' && (
                        <motion.div
                            key="qr"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <QRCodeOnboarding
                                phoneNumberId={phoneNumberId}
                                onSuccess={handleSuccess}
                                onCancel={handleCancel}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

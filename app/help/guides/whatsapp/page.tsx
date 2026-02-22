'use client';

import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import {
    ChevronLeft,
    Smartphone,
    CheckCircle,
    ArrowRight,
    QrCode,
    Settings,
    Play,
    Lightbulb,
    Clock,
    AlertCircle,
    MessageSquare,
    Shield
} from 'lucide-react';

const steps = [
    {
        number: 1,
        title: 'Navigate to WhatsApp Setup',
        description: 'From your dashboard, click on "WhatsApp Assistant" service tile, then select "Connect WhatsApp" to start the setup process.',
        tips: [
            'Have your WhatsApp Business App ready on your phone',
            'Make sure your phone has a stable internet connection',
        ],
        screenshot: '/images/guides/wa-step1.png',
    },
    {
        number: 2,
        title: 'Choose Connection Method',
        description: 'Select "QR Code Scanning" for instant setup, or "Meta Embedded Signup" for official API integration. QR scanning is recommended for quick start.',
        tips: [
            'QR Code: Best for testing and small businesses',
            'Meta Signup: Best for high-volume messaging',
            'Both methods preserve your existing chats',
        ],
        screenshot: '/images/guides/wa-step2.png',
    },
    {
        number: 3,
        title: 'Scan the QR Code',
        description: 'Open WhatsApp on your phone, go to Settings > Linked Devices > Link a Device, and scan the QR code displayed on screen.',
        tips: [
            'QR code refreshes every 60 seconds',
            'Make sure camera permissions are enabled',
            'Works with both WhatsApp and WhatsApp Business',
        ],
        screenshot: '/images/guides/wa-step3.png',
        highlight: true,
    },
    {
        number: 4,
        title: 'Verify Connection',
        description: 'Once scanned, BotFlow will verify the connection. You\'ll see a success message and your WhatsApp profile information.',
        tips: [
            'Connection takes 5-10 seconds',
            'Your chat history stays on your phone',
            'You can still use WhatsApp normally',
        ],
        screenshot: '/images/guides/wa-step4.png',
    },
    {
        number: 5,
        title: 'Configure Coexistence Mode',
        description: 'Enable Coexistence mode to keep using your WhatsApp Business App alongside BotFlow automation. This prevents message conflicts.',
        tips: [
            'Coexistence mode is recommended for most users',
            'Set which conversations BotFlow should handle',
            'Configure auto-response hours',
        ],
        screenshot: '/images/guides/wa-step5.png',
    },
    {
        number: 6,
        title: 'Send Your First Automated Message',
        description: 'Test the setup by sending a message to your WhatsApp number. Watch BotFlow respond automatically based on your AI configuration.',
        tips: [
            'Use a different phone to test',
            'Check response speed and accuracy',
            'Fine-tune AI responses as needed',
        ],
        screenshot: '/images/guides/wa-step6.png',
    },
];

export default function WhatsAppGuidePage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Header */}
            <section className="pt-32 pb-12 bg-gradient-to-br from-green-500 via-green-600 to-green-700">
                <div className="max-w-4xl mx-auto px-6">
                    <Link
                        href="/help"
                        className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Help Center
                    </Link>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                            <Smartphone className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <span className="text-white/70 text-sm">Getting Started Guide</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                WhatsApp QR Onboarding
                            </h1>
                        </div>
                    </div>

                    <p className="text-xl text-white/80 mb-6">
                        Connect your WhatsApp Business in under 3 minutes
                    </p>

                    <div className="flex items-center gap-6 text-white/70 text-sm">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            3 min read
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            6 steps
                        </span>
                        <span className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Secure connection
                        </span>
                    </div>
                </div>
            </section>

            {/* Prerequisites */}
            <section className="py-8 bg-white border-b">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-start gap-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-green-800 mb-1">What you need</h3>
                            <ul className="text-green-700 text-sm space-y-1">
                                <li>• A smartphone with WhatsApp Business App installed</li>
                                <li>• Stable internet connection on both phone and computer</li>
                                <li>• Active BotFlow subscription or free trial</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Tutorial CTA */}
            <section className="py-8 bg-gray-100">
                <div className="max-w-4xl mx-auto px-6">
                    <Link
                        href="/help/videos/whatsapp-qr"
                        className="flex items-center gap-6 p-6 bg-white rounded-xl border border-gray-200 hover:border-green-400 hover:shadow-lg transition-all group"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Play className="w-10 h-10 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 mb-1">
                                Prefer to watch? Check out the video tutorial
                            </h3>
                            <p className="text-gray-600">
                                2:34 minute walkthrough of the entire QR code connection process
                            </p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                    </Link>
                </div>
            </section>

            {/* Steps */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="space-y-16">
                        {steps.map((step, index) => (
                            <div key={step.number} className="relative">
                                {/* Step connector line */}
                                {index < steps.length - 1 && (
                                    <div className="absolute left-6 top-16 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2" />
                                )}

                                <div className="flex gap-6">
                                    {/* Step number */}
                                    <div className="relative z-10">
                                        <div className={`w-12 h-12 ${step.highlight ? 'bg-green-500' : 'bg-green-500'} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                                            {step.number}
                                        </div>
                                    </div>

                                    {/* Step content */}
                                    <div className="flex-1 pb-8">
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                            {step.title}
                                        </h2>
                                        <p className="text-gray-600 mb-6 text-lg">
                                            {step.description}
                                        </p>

                                        {/* Screenshot placeholder */}
                                        <div className={`bg-gray-100 rounded-xl border ${step.highlight ? 'border-green-300 ring-2 ring-green-100' : 'border-gray-200'} aspect-video mb-6 flex items-center justify-center relative overflow-hidden`}>
                                            {step.highlight && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent" />
                                            )}
                                            <div className="text-center text-gray-400 relative z-10">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                    {step.highlight ? (
                                                        <QrCode className="w-8 h-8 text-green-500" />
                                                    ) : (
                                                        <Play className="w-8 h-8" />
                                                    )}
                                                </div>
                                                <p className="text-sm">Screenshot: {step.title}</p>
                                            </div>
                                        </div>

                                        {/* Tips */}
                                        <div className="bg-green-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb className="w-5 h-5 text-green-600" />
                                                <span className="font-semibold text-green-800">Pro Tips</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {step.tips.map((tip, tipIndex) => (
                                                    <li key={tipIndex} className="flex items-start gap-2 text-gray-700">
                                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span>{tip}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Troubleshooting */}
            <section className="py-12 bg-white border-t">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Troubleshooting
                    </h2>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                QR code won&apos;t scan?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Make sure your camera is clean, you have good lighting, and you&apos;re holding your phone steady. Try refreshing the QR code if it&apos;s expired.
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Connection keeps dropping?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Ensure both your phone and computer have stable internet. Your phone must stay connected to WiFi or mobile data for the link to remain active.
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-2">
                                Messages not being automated?
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Check that your AI Assistant is configured and active. Verify the Coexistence settings to ensure BotFlow is handling the correct conversations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Next Steps */}
            <section className="py-12 bg-gray-50 border-t">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        What&apos;s Next?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            href="/help/guides/ai-assistant"
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-400 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                                    Configure AI Responses
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Train your AI to answer customer questions
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                        </Link>

                        <Link
                            href="/help/videos/first-message"
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-400 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <Play className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                                    Send Your First Message
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Video tutorial for automated messaging
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

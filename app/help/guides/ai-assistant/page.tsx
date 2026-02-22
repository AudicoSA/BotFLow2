'use client';

import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import {
    ChevronLeft,
    MessageSquare,
    CheckCircle,
    ArrowRight,
    Upload,
    Settings,
    Play,
    Lightbulb,
    Clock,
    AlertCircle
} from 'lucide-react';

const steps = [
    {
        number: 1,
        title: 'Access AI Assistant Settings',
        description: 'Navigate to your dashboard and click on "AI Assistant" from the service tiles, then select "Configure" to open the settings panel.',
        tips: [
            'Make sure you have an active subscription or are in your trial period',
            'You can access settings from the sidebar menu too',
        ],
        screenshot: '/images/guides/ai-step1.png',
    },
    {
        number: 2,
        title: 'Upload Your Business Knowledge',
        description: 'Click "Add Knowledge Source" to upload documents containing your business information. Supported formats include PDF, DOCX, TXT, and web URLs.',
        tips: [
            'Start with your FAQ document or product catalog',
            'You can add multiple knowledge sources',
            'The more context you provide, the better responses',
        ],
        screenshot: '/images/guides/ai-step2.png',
    },
    {
        number: 3,
        title: 'Customize Your AI Personality',
        description: 'Set your AI\'s name, personality traits, and response style. You can make it formal, friendly, or match your brand voice.',
        tips: [
            'Use your brand name for consistency',
            'Specify response length preferences',
            'Define which topics to avoid or escalate',
        ],
        screenshot: '/images/guides/ai-step3.png',
    },
    {
        number: 4,
        title: 'Configure Response Settings',
        description: 'Set confidence thresholds, fallback messages, and human handoff triggers. This ensures quality control over AI responses.',
        tips: [
            'Start with default settings and adjust as needed',
            'Enable "Review Mode" initially for quality assurance',
            'Set up email notifications for escalations',
        ],
        screenshot: '/images/guides/ai-step4.png',
    },
    {
        number: 5,
        title: 'Test Your AI Assistant',
        description: 'Use the built-in chat simulator to test responses before going live. Ask sample questions to verify accuracy.',
        tips: [
            'Test questions from your actual FAQ list',
            'Try edge cases to see how it handles uncertainty',
            'Refine knowledge sources based on test results',
        ],
        screenshot: '/images/guides/ai-step5.png',
    },
    {
        number: 6,
        title: 'Go Live!',
        description: 'Toggle the AI Assistant to "Active" status. It will now respond to customer inquiries across your connected channels.',
        tips: [
            'Monitor initial conversations closely',
            'Use the analytics dashboard to track performance',
            'Continuously improve with feedback',
        ],
        screenshot: '/images/guides/ai-step6.png',
    },
];

export default function AIAssistantGuidePage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Header */}
            <section className="pt-32 pb-12 bg-gradient-to-br from-surf-DEFAULT via-surf-dark to-surf-darker">
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
                            <MessageSquare className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <span className="text-white/70 text-sm">Getting Started Guide</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                AI Assistant Setup
                            </h1>
                        </div>
                    </div>

                    <p className="text-xl text-white/80 mb-6">
                        Configure your AI-powered customer assistant in just 5 minutes
                    </p>

                    <div className="flex items-center gap-6 text-white/70 text-sm">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            5 min read
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            6 steps
                        </span>
                    </div>
                </div>
            </section>

            {/* Prerequisites */}
            <section className="py-8 bg-white border-b">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800 mb-1">Before you start</h3>
                            <ul className="text-amber-700 text-sm space-y-1">
                                <li>• Make sure you have an active BotFlow subscription or free trial</li>
                                <li>• Prepare any documents containing your business information</li>
                                <li>• Have sample questions ready for testing</li>
                            </ul>
                        </div>
                    </div>
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
                                        <div className="w-12 h-12 bg-surf-DEFAULT text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
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
                                        <div className="bg-gray-100 rounded-xl border border-gray-200 aspect-video mb-6 flex items-center justify-center">
                                            <div className="text-center text-gray-400">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                    <Play className="w-8 h-8" />
                                                </div>
                                                <p className="text-sm">Screenshot: {step.title}</p>
                                            </div>
                                        </div>

                                        {/* Tips */}
                                        <div className="bg-surf-light/10 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb className="w-5 h-5 text-surf-DEFAULT" />
                                                <span className="font-semibold text-surf-darker">Pro Tips</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {step.tips.map((tip, tipIndex) => (
                                                    <li key={tipIndex} className="flex items-start gap-2 text-gray-700">
                                                        <CheckCircle className="w-4 h-4 text-surf-DEFAULT flex-shrink-0 mt-0.5" />
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

            {/* Next Steps */}
            <section className="py-12 bg-white border-t">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        What&apos;s Next?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            href="/help/guides/whatsapp"
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-surf-DEFAULT transition-colors group"
                        >
                            <div className="w-10 h-10 bg-surf-light/20 rounded-lg flex items-center justify-center">
                                <MessageSquare className="w-5 h-5 text-surf-DEFAULT" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-surf-DEFAULT">
                                    Connect WhatsApp
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Add AI responses to your WhatsApp Business
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-surf-DEFAULT" />
                        </Link>

                        <Link
                            href="/help/videos/ai-training"
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-surf-DEFAULT transition-colors group"
                        >
                            <div className="w-10 h-10 bg-surf-light/20 rounded-lg flex items-center justify-center">
                                <Play className="w-5 h-5 text-surf-DEFAULT" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-surf-DEFAULT">
                                    Watch Video Tutorial
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Advanced AI training techniques
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-surf-DEFAULT" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

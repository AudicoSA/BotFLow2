'use client';

import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import {
    ChevronLeft,
    Receipt,
    CheckCircle,
    ArrowRight,
    Camera,
    Upload,
    Play,
    Lightbulb,
    Clock,
    AlertCircle,
    Download,
    FolderOpen
} from 'lucide-react';

const steps = [
    {
        number: 1,
        title: 'Access Receipt Assistant',
        description: 'From your dashboard, click on "Receipt Assistant" service tile to open the receipt management interface.',
        tips: [
            'Use the quick access button in the sidebar',
            'You can also email receipts directly to your account',
        ],
        screenshot: '/images/guides/receipt-step1.png',
    },
    {
        number: 2,
        title: 'Upload Your First Receipt',
        description: 'Click "Add Receipt" and either drag & drop an image, take a photo with your camera, or upload from your device.',
        tips: [
            'Supported formats: JPG, PNG, PDF',
            'Best results with clear, well-lit images',
            'Upload multiple receipts at once',
        ],
        screenshot: '/images/guides/receipt-step2.png',
    },
    {
        number: 3,
        title: 'Review Extracted Data',
        description: 'Our AI-powered OCR extracts merchant name, date, total amount, and line items. Review the extracted data for accuracy.',
        tips: [
            'Click any field to edit if needed',
            'OCR accuracy is 95%+ on clear images',
            'System learns from your corrections',
        ],
        screenshot: '/images/guides/receipt-step3.png',
        highlight: true,
    },
    {
        number: 4,
        title: 'Categorize Your Expense',
        description: 'Select or create a category for the receipt. Categories help organize expenses for reporting and tax purposes.',
        tips: [
            'Common categories are pre-configured',
            'Create custom categories for your business',
            'AI will auto-suggest categories over time',
        ],
        screenshot: '/images/guides/receipt-step4.png',
    },
    {
        number: 5,
        title: 'Add Notes & Tags',
        description: 'Optionally add notes, project codes, or tags for better organization. This helps with searchability and reporting.',
        tips: [
            'Use tags for projects or clients',
            'Add notes about the purchase purpose',
            'Link receipts to specific team members',
        ],
        screenshot: '/images/guides/receipt-step5.png',
    },
    {
        number: 6,
        title: 'Export Your Data',
        description: 'Generate reports and export data to CSV or PDF. Use filters to select date ranges, categories, or specific expenses.',
        tips: [
            'Monthly reports ready for your accountant',
            'Compatible with QuickBooks, Xero, Excel',
            'Download PDF receipts with annotations',
        ],
        screenshot: '/images/guides/receipt-step6.png',
    },
];

export default function ReceiptsGuidePage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Header */}
            <section className="pt-32 pb-12 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600">
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
                            <Receipt className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <span className="text-white/70 text-sm">Getting Started Guide</span>
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                Receipt Scanning Setup
                            </h1>
                        </div>
                    </div>

                    <p className="text-xl text-white/80 mb-6">
                        Start organizing your business receipts automatically
                    </p>

                    <div className="flex items-center gap-6 text-white/70 text-sm">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            2 min read
                        </span>
                        <span className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            6 steps
                        </span>
                        <span className="flex items-center gap-2">
                            <Camera className="w-4 h-4" />
                            Photo or upload
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
                            <h3 className="font-semibold text-amber-800 mb-1">What you need</h3>
                            <ul className="text-amber-700 text-sm space-y-1">
                                <li>• Active BotFlow subscription with Receipt Assistant</li>
                                <li>• Receipts in image format (JPG, PNG, or PDF)</li>
                                <li>• Clear photos with good lighting work best</li>
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
                                        <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
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
                                        <div className={`bg-gray-100 rounded-xl border ${step.highlight ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200'} aspect-video mb-6 flex items-center justify-center relative overflow-hidden`}>
                                            {step.highlight && (
                                                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent" />
                                            )}
                                            <div className="text-center text-gray-400 relative z-10">
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                                                    {step.highlight ? (
                                                        <Receipt className="w-8 h-8 text-amber-500" />
                                                    ) : (
                                                        <Play className="w-8 h-8" />
                                                    )}
                                                </div>
                                                <p className="text-sm">Screenshot: {step.title}</p>
                                            </div>
                                        </div>

                                        {/* Tips */}
                                        <div className="bg-amber-50 rounded-xl p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Lightbulb className="w-5 h-5 text-amber-600" />
                                                <span className="font-semibold text-amber-800">Pro Tips</span>
                                            </div>
                                            <ul className="space-y-2">
                                                {step.tips.map((tip, tipIndex) => (
                                                    <li key={tipIndex} className="flex items-start gap-2 text-gray-700">
                                                        <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
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

            {/* Quick Features */}
            <section className="py-12 bg-white border-t">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        More Features
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-amber-50 rounded-xl">
                            <Camera className="w-8 h-8 text-amber-600 mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">Mobile Capture</h3>
                            <p className="text-gray-600 text-sm">
                                Take photos directly from your phone&apos;s camera
                            </p>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-xl">
                            <FolderOpen className="w-8 h-8 text-amber-600 mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">Auto-Categorize</h3>
                            <p className="text-gray-600 text-sm">
                                AI learns your expense patterns over time
                            </p>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-xl">
                            <Download className="w-8 h-8 text-amber-600 mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">Easy Export</h3>
                            <p className="text-gray-600 text-sm">
                                Generate reports for your accountant instantly
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
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-400 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Upload className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-amber-600">
                                    Bulk Upload
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    Learn to upload multiple receipts at once
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600" />
                        </Link>

                        <Link
                            href="/dashboard"
                            className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-400 transition-colors group"
                        >
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <Receipt className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover:text-amber-600">
                                    View Dashboard
                                </h3>
                                <p className="text-gray-600 text-sm">
                                    See your expense analytics and reports
                                </p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600" />
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

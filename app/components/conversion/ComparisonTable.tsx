'use client';

import { Check, X, Clock, Zap, TrendingUp, Calculator } from 'lucide-react';
import Link from 'next/link';

// Comparison data
const comparisons = {
    whatsapp: {
        title: 'WhatsApp Customer Support',
        subtitle: 'See how BotFlow compares to hiring support staff',
        icon: '📱',
        items: [
            {
                feature: 'Response time',
                manual: '30 min - 2 hours',
                botflow: 'Instant (<30 sec)',
                winner: 'botflow',
            },
            {
                feature: 'Availability',
                manual: 'Business hours only',
                botflow: '24/7/365',
                winner: 'botflow',
            },
            {
                feature: 'Messages handled/month',
                manual: '~2,000 per staff',
                botflow: 'Unlimited',
                winner: 'botflow',
            },
            {
                feature: 'Languages supported',
                manual: '1-2 per staff',
                botflow: '10+ languages',
                winner: 'botflow',
            },
            {
                feature: 'Consistency',
                manual: 'Varies by person',
                botflow: '100% consistent',
                winner: 'botflow',
            },
            {
                feature: 'Training time',
                manual: '2-4 weeks',
                botflow: '5 minutes',
                winner: 'botflow',
            },
        ],
        costs: {
            manual: {
                label: 'Hiring support staff',
                monthly: 15000,
                details: ['1 full-time employee', 'Training costs', 'Benefits & overhead', 'Office space'],
            },
            botflow: {
                label: 'BotFlow WhatsApp',
                monthly: 499,
                details: ['Unlimited messages', '24/7 availability', 'Instant setup', 'No overhead'],
            },
        },
        savings: {
            monthly: 14501,
            percentage: 97,
        },
    },
    receipts: {
        title: 'Receipt & Expense Management',
        subtitle: 'Compare manual bookkeeping vs automated receipt scanning',
        icon: '🧾',
        items: [
            {
                feature: 'Data entry time',
                manual: '5-10 min per receipt',
                botflow: '<30 seconds',
                winner: 'botflow',
            },
            {
                feature: 'Error rate',
                manual: '5-15% manual errors',
                botflow: '<2% OCR accuracy',
                winner: 'botflow',
            },
            {
                feature: 'Lost receipts',
                manual: 'Common problem',
                botflow: 'Digital backup',
                winner: 'botflow',
            },
            {
                feature: 'Categorization',
                manual: 'Manual sorting',
                botflow: 'Auto-categorize',
                winner: 'botflow',
            },
            {
                feature: 'Tax prep time',
                manual: '20+ hours/year',
                botflow: '2 hours/year',
                winner: 'botflow',
            },
            {
                feature: 'Export formats',
                manual: 'Re-type everything',
                botflow: 'CSV, PDF, direct sync',
                winner: 'botflow',
            },
        ],
        costs: {
            manual: {
                label: 'Part-time bookkeeper',
                monthly: 4000,
                details: ['10 hours/week', 'R100/hour rate', 'Still needs oversight', 'Delays in reporting'],
            },
            botflow: {
                label: 'BotFlow Receipt Assistant',
                monthly: 99,
                details: ['Unlimited scans', 'Instant processing', 'Auto-categorization', 'Export ready'],
            },
        },
        savings: {
            monthly: 3901,
            percentage: 98,
        },
    },
    ai: {
        title: 'AI Customer Assistant',
        subtitle: 'Your own AI support agent vs traditional support',
        icon: '🤖',
        items: [
            {
                feature: 'Knowledge updates',
                manual: 'Retrain staff',
                botflow: 'Upload documents',
                winner: 'botflow',
            },
            {
                feature: 'Scale capacity',
                manual: 'Hire more people',
                botflow: 'Instant scaling',
                winner: 'botflow',
            },
            {
                feature: 'Quality control',
                manual: 'Random audits',
                botflow: 'Every response logged',
                winner: 'botflow',
            },
            {
                feature: 'Multilingual',
                manual: 'Hire polyglots',
                botflow: 'Built-in translation',
                winner: 'botflow',
            },
            {
                feature: 'Complex queries',
                manual: 'Depends on expertise',
                botflow: 'GPT-4 powered',
                winner: 'botflow',
            },
            {
                feature: 'Integration',
                manual: 'Manual handoffs',
                botflow: 'API ready',
                winner: 'botflow',
            },
        ],
        costs: {
            manual: {
                label: 'Customer service team',
                monthly: 30000,
                details: ['2 full-time agents', 'Training & turnover', 'Management overhead', 'Software licenses'],
            },
            botflow: {
                label: 'BotFlow AI Assistant',
                monthly: 499,
                details: ['10,000 messages/mo', 'GPT-4 powered', 'Human handoff built-in', 'No overhead'],
            },
        },
        savings: {
            monthly: 29501,
            percentage: 98,
        },
    },
};

type ComparisonType = keyof typeof comparisons;

interface ComparisonTableProps {
    type?: ComparisonType;
    showCalculator?: boolean;
}

export default function ComparisonTable({ type = 'whatsapp', showCalculator = true }: ComparisonTableProps) {
    const data = comparisons[type];

    return (
        <section className="py-16 md:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-4xl mb-4 block">{data.icon}</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {data.title}
                    </h2>
                    <p className="text-xl text-gray-600">
                        {data.subtitle}
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-12">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
                        <div className="p-4 md:p-6 font-semibold text-gray-700">
                            Feature
                        </div>
                        <div className="p-4 md:p-6 text-center border-l border-gray-200">
                            <div className="font-semibold text-gray-500">Manual Process</div>
                            <div className="text-xs text-gray-400 mt-1">The old way</div>
                        </div>
                        <div className="p-4 md:p-6 text-center border-l border-gray-200 bg-surf-light/10">
                            <div className="font-semibold text-surf-darker">BotFlow</div>
                            <div className="text-xs text-surf-DEFAULT mt-1">The smart way</div>
                        </div>
                    </div>

                    {/* Table Body */}
                    {data.items.map((item, index) => (
                        <div
                            key={index}
                            className={`grid grid-cols-3 ${index < data.items.length - 1 ? 'border-b border-gray-100' : ''}`}
                        >
                            <div className="p-4 md:p-5 text-gray-700 font-medium text-sm md:text-base">
                                {item.feature}
                            </div>
                            <div className="p-4 md:p-5 text-center border-l border-gray-100 text-gray-500 text-sm md:text-base">
                                {item.manual}
                            </div>
                            <div className="p-4 md:p-5 text-center border-l border-gray-100 bg-surf-light/5 text-sm md:text-base">
                                <div className="flex items-center justify-center gap-2">
                                    {item.winner === 'botflow' && (
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                    )}
                                    <span className="text-gray-800 font-medium">{item.botflow}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cost Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {/* Manual Cost */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center gap-2 mb-4">
                            <X className="w-6 h-6 text-red-500" />
                            <h3 className="text-lg font-semibold text-gray-700">{data.costs.manual.label}</h3>
                        </div>
                        <div className="mb-4">
                            <span className="text-3xl font-bold text-gray-900">
                                R{data.costs.manual.monthly.toLocaleString()}
                            </span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <ul className="space-y-2">
                            {data.costs.manual.details.map((detail, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-600 text-sm">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* BotFlow Cost */}
                    <div className="bg-gradient-to-br from-surf-light/20 to-surf-DEFAULT/10 rounded-2xl p-6 border-2 border-surf-DEFAULT relative">
                        <div className="absolute -top-3 left-4 bg-surf-DEFAULT text-white text-xs font-semibold px-3 py-1 rounded-full">
                            RECOMMENDED
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <Check className="w-6 h-6 text-green-500" />
                            <h3 className="text-lg font-semibold text-gray-800">{data.costs.botflow.label}</h3>
                        </div>
                        <div className="mb-4">
                            <span className="text-3xl font-bold text-surf-darker">
                                R{data.costs.botflow.monthly.toLocaleString()}
                            </span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <ul className="space-y-2">
                            {data.costs.botflow.details.map((detail, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-700 text-sm">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {detail}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Savings Summary */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 md:p-8 border border-green-200 mb-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="text-center md:text-left">
                            <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                                <span className="font-semibold text-green-800">Your Potential Savings</span>
                            </div>
                            <div className="text-4xl md:text-5xl font-bold text-green-700">
                                R{data.savings.monthly.toLocaleString()}
                                <span className="text-lg font-normal text-green-600">/month</span>
                            </div>
                            <div className="text-green-600 mt-1">
                                That&apos;s R{(data.savings.monthly * 12).toLocaleString()} saved per year!
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center px-6 py-4 bg-white rounded-xl shadow-sm">
                                <div className="text-3xl font-bold text-green-600">{data.savings.percentage}%</div>
                                <div className="text-sm text-gray-500">Cost reduction</div>
                            </div>
                            <Link
                                href="/pricing"
                                className="px-6 py-3 bg-surf-DEFAULT hover:bg-surf-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                            >
                                Start Saving Today
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ROI Calculator CTA */}
                {showCalculator && (
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-gray-600 text-sm">
                            <Calculator className="w-4 h-4" />
                            <span>Want to calculate your exact savings?</span>
                            <Link href="/roi-calculator" className="text-surf-DEFAULT font-medium hover:underline">
                                Try our ROI Calculator
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

// Compact comparison for embedding
export function ComparisonHighlight({ type = 'whatsapp' }: { type?: ComparisonType }) {
    const data = comparisons[type];

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{data.icon}</span>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    Save {data.savings.percentage}%
                </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{data.title}</h3>
            <div className="flex items-end gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">R{data.costs.botflow.monthly}</span>
                <span className="text-gray-500 line-through text-sm">R{data.costs.manual.monthly}</span>
                <span className="text-gray-400 text-sm">/mo</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Save R{data.savings.monthly.toLocaleString()}/month</span>
            </div>
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const plans = [
    {
        name: 'AI Assistant',
        description: 'GPT-4 powered conversations',
        price: '499',
        features: [
            'Unlimited AI conversations',
            'Custom knowledge base',
            'Multi-channel support',
            'Context-aware responses',
            'Conversation history',
            'Basic analytics'
        ],
        cta: 'Start Free Trial',
        featured: false
    },
    {
        name: 'WhatsApp Assistant',
        description: 'Automate your #1 channel',
        price: '499',
        features: [
            'QR code instant setup',
            '5,000 messages/month',
            'Automated responses',
            'Booking & scheduling',
            'Customer segmentation',
            'Advanced analytics'
        ],
        cta: 'Start Free Trial',
        featured: true
    },
    {
        name: 'Receipt Assistant',
        description: 'AI-powered expense tracking',
        price: '99',
        priceNote: '/user',
        features: [
            'Unlimited receipt scans',
            'AI data extraction',
            'Auto-categorization',
            'Export CSV/PDF',
            'VAT-ready reports',
            'Multi-user support'
        ],
        cta: 'Start Free Trial',
        featured: false
    },
    {
        name: 'Full Bundle',
        description: 'Everything you need',
        price: '899',
        originalPrice: '1,097',
        savings: 'Save R198/mo',
        features: [
            'All AI Assistant features',
            'All WhatsApp features',
            'All Receipt features',
            'Priority support',
            'Custom integrations',
            'Dedicated account manager'
        ],
        cta: 'Get the Bundle',
        featured: false,
        bundle: true
    }
];

export default function Pricing() {
    return (
        <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surf/10 text-surf-dark mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium text-sm">Simple, Transparent Pricing</span>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
                        Choose Your Plan
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Start with any service and upgrade anytime. All plans include a 14-day free trial.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white rounded-3xl p-6 ${
                                plan.featured
                                    ? 'border-2 border-surf shadow-2xl shadow-surf/20 scale-105 lg:scale-110 z-10'
                                    : plan.bundle
                                    ? 'border-2 border-ocean-deep shadow-xl'
                                    : 'border border-gray-200 shadow-lg'
                            }`}
                        >
                            {plan.featured && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-surf text-white rounded-full text-sm font-semibold whitespace-nowrap">
                                    Most Popular
                                </div>
                            )}

                            {plan.savings && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-ocean-deep to-surf-dark text-white rounded-full text-sm font-semibold whitespace-nowrap">
                                    {plan.savings}
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                <p className="text-gray-500 text-sm">{plan.description}</p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-gray-600 text-xl font-semibold">R</span>
                                    <span className="text-4xl font-extrabold">{plan.price}</span>
                                    <span className="text-gray-600">/mo{plan.priceNote || ''}</span>
                                </div>
                                {plan.originalPrice && (
                                    <div className="text-gray-400 line-through text-sm mt-1">
                                        R{plan.originalPrice}/month
                                    </div>
                                )}
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 text-sm">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Link
                                href="#cta"
                                className={`block text-center py-3 px-6 rounded-xl font-semibold transition-all ${
                                    plan.featured
                                        ? 'bg-surf hover:bg-surf-dark text-white hover:shadow-xl hover:-translate-y-1'
                                        : plan.bundle
                                        ? 'bg-gradient-to-r from-ocean-deep to-surf-dark text-white hover:shadow-xl hover:-translate-y-1'
                                        : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                                }`}
                            >
                                {plan.cta}
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Money-back guarantee */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <p className="text-gray-500 text-sm">
                        All plans include a <span className="font-semibold text-green-600">14-day free trial</span> and{' '}
                        <span className="font-semibold text-green-600">30-day money-back guarantee</span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

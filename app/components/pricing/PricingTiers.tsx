'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Bot, MessageSquare, Receipt, Layers, ArrowRight } from 'lucide-react';

const plans = [
    {
        id: 'ai-assistant',
        icon: Bot,
        name: 'AI Assistant',
        description: 'GPT-4 powered conversations for your business',
        price: '499',
        period: '/month',
        features: [
            'Unlimited AI conversations',
            'Custom knowledge base training',
            'Multi-channel support (web, email)',
            'Context-aware responses',
            'Full conversation history',
            'Basic analytics dashboard',
            'Email support (24hr response)',
        ],
        cta: 'Start Free Trial',
        ctaLink: '/checkout?plan=ai-assistant',
        featured: false,
        color: 'violet',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600',
    },
    {
        id: 'whatsapp-assistant',
        icon: MessageSquare,
        name: 'WhatsApp Assistant',
        description: 'Automate your #1 customer channel',
        price: '499',
        period: '/month',
        features: [
            'QR code instant setup',
            '5,000 messages included/month',
            'Automated response flows',
            'Booking & scheduling system',
            'Customer segmentation',
            'Advanced analytics',
            'Priority support (4hr response)',
            'WhatsApp Business API included',
        ],
        cta: 'Start Free Trial',
        ctaLink: '/checkout?plan=whatsapp-assistant',
        featured: true,
        color: 'green',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
    },
    {
        id: 'receipt-assistant',
        icon: Receipt,
        name: 'Receipt Assistant',
        description: 'AI-powered expense tracking',
        price: '99',
        period: '/user/month',
        features: [
            'Unlimited receipt scans',
            'AI data extraction (OCR)',
            'Auto-categorization',
            'Export to CSV/PDF',
            'VAT-ready reports',
            'Multi-user collaboration',
            'Email support',
            'Minimum 1 user',
        ],
        cta: 'Start Free Trial',
        ctaLink: '/checkout?plan=receipt-assistant',
        featured: false,
        color: 'amber',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600',
    },
    {
        id: 'bundle',
        icon: Layers,
        name: 'Full Bundle',
        description: 'Everything you need to automate',
        price: '899',
        period: '/month',
        originalPrice: '1,097',
        savings: 'Save R198/mo',
        features: [
            'All AI Assistant features',
            'All WhatsApp Assistant features',
            'All Receipt Assistant features (1 user)',
            'Priority support (2hr response)',
            'Custom integrations',
            'Dedicated account manager',
            'Quarterly business reviews',
            'Early access to new features',
        ],
        cta: 'Get the Bundle',
        ctaLink: '/checkout?plan=bundle',
        featured: false,
        bundle: true,
        color: 'ocean',
        iconBg: 'bg-surf-light/50',
        iconColor: 'text-ocean-deep',
    },
];

export default function PricingTiers() {
    return (
        <section className="py-16 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative bg-white rounded-3xl p-6 flex flex-col ${
                                    plan.featured
                                        ? 'border-2 border-green-500 shadow-2xl shadow-green-500/20 lg:scale-105 z-10'
                                        : plan.bundle
                                        ? 'border-2 border-ocean-deep shadow-xl'
                                        : 'border border-gray-200 shadow-lg hover:shadow-xl transition-shadow'
                                }`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-green-500 text-white rounded-full text-sm font-semibold whitespace-nowrap">
                                        Most Popular
                                    </div>
                                )}

                                {plan.savings && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-ocean-deep to-surf-dark text-white rounded-full text-sm font-semibold whitespace-nowrap">
                                        {plan.savings}
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center mb-4`}>
                                    <Icon className={`w-7 h-7 ${plan.iconColor}`} />
                                </div>

                                {/* Header */}
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-dark-navy">{plan.name}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-gray-600 text-xl font-semibold">R</span>
                                        <span className="text-4xl font-extrabold text-dark-navy">{plan.price}</span>
                                        <span className="text-gray-500">{plan.period}</span>
                                    </div>
                                    {plan.originalPrice && (
                                        <div className="text-gray-400 line-through text-sm mt-1">
                                            R{plan.originalPrice}/month
                                        </div>
                                    )}
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-700 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link
                                    href={plan.ctaLink}
                                    className={`flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold transition-all group ${
                                        plan.featured
                                            ? 'bg-green-500 hover:bg-green-600 text-white hover:shadow-xl hover:-translate-y-1'
                                            : plan.bundle
                                            ? 'bg-gradient-to-r from-ocean-deep to-surf-dark text-white hover:shadow-xl hover:-translate-y-1'
                                            : 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                                    }`}
                                >
                                    {plan.cta}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Trust badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-wrap justify-center gap-8 mt-12 text-sm text-gray-500"
                >
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>POPIA Compliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>ZA Data Hosting</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Paystack Secure Payments</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        <span>Cancel Anytime</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

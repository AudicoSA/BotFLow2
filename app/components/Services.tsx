'use client';

import { motion } from 'framer-motion';
import { Bot, MessageSquare, Receipt, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const services = [
    {
        id: 'ai-assistant',
        icon: Bot,
        name: 'AI Assistant',
        tagline: 'Your 24/7 intelligent business partner',
        description: 'GPT-4 powered AI that handles customer queries, generates responses, and manages complex conversations automatically.',
        price: 'R499',
        features: [
            'Natural language understanding',
            'Context-aware responses',
            'Custom training on your data',
            'Multi-channel support'
        ],
        color: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-50',
        borderColor: 'border-violet-200',
        iconBg: 'bg-violet-100',
        iconColor: 'text-violet-600'
    },
    {
        id: 'whatsapp-assistant',
        icon: MessageSquare,
        name: 'WhatsApp Assistant',
        tagline: 'Automate your most important channel',
        description: 'Connect your WhatsApp Business instantly with QR code onboarding. Automate messages, bookings, and customer support.',
        price: 'R499',
        features: [
            'QR code instant setup',
            'Automated responses',
            'Booking & scheduling',
            'Customer segmentation'
        ],
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        popular: true
    },
    {
        id: 'receipt-assistant',
        icon: Receipt,
        name: 'Receipt Assistant',
        tagline: 'Turn receipts into insights',
        description: 'Snap photos of receipts and let AI extract all the data. Perfect for expense tracking, bookkeeping, and VAT claims.',
        price: 'R99',
        priceNote: '/user',
        features: [
            'OCR scanning accuracy',
            'Automatic categorization',
            'Export to CSV/PDF',
            'VAT-ready reports'
        ],
        color: 'from-amber-500 to-orange-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-600'
    }
];

export default function Services() {
    return (
        <section id="services" className="py-24 bg-gradient-to-b from-white to-surf-light/10 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-0 w-96 h-96 bg-surf-light/20 rounded-full blur-3xl -translate-x-1/2"></div>
                <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-sunset-pink/20 rounded-full blur-3xl translate-x-1/2"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surf/10 text-surf-dark mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium text-sm">Three Powerful Solutions</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 text-dark-navy">
                        Choose Your <span className="gradient-text">Automation</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Each service is designed to solve specific business challenges.
                        Use them individually or combine for maximum impact.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, index) => {
                        const Icon = service.icon;
                        return (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`relative group ${service.bgColor} rounded-3xl p-8 border ${service.borderColor} hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
                            >
                                {service.popular && (
                                    <div className="absolute -top-3 right-6 px-4 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-full shadow-lg">
                                        Most Popular
                                    </div>
                                )}

                                {/* Icon */}
                                <div className={`w-16 h-16 rounded-2xl ${service.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                    <Icon className={`w-8 h-8 ${service.iconColor}`} />
                                </div>

                                {/* Content */}
                                <h3 className="text-2xl font-bold text-dark-navy mb-2">{service.name}</h3>
                                <p className="text-gray-500 text-sm mb-4">{service.tagline}</p>
                                <p className="text-gray-600 mb-6">{service.description}</p>

                                {/* Price */}
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-3xl font-bold text-dark-navy">{service.price}</span>
                                    <span className="text-gray-500">/month{service.priceNote || ''}</span>
                                </div>

                                {/* Features */}
                                <ul className="space-y-3 mb-8">
                                    {service.features.map((feature, i) => (
                                        <li key={i} className="flex items-center gap-3 text-gray-700">
                                            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <Link
                                    href="#cta"
                                    className={`flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${service.color} hover:shadow-lg transition-all group`}
                                >
                                    Get Started
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Bundle Offer Banner */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 relative"
                >
                    <div className="bg-gradient-to-r from-ocean-deep to-surf-dark rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div>
                                <div className="inline-block px-4 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
                                    Save R198/month
                                </div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-3">
                                    Get All Three for R899/month
                                </h3>
                                <p className="text-white/80 text-lg max-w-xl">
                                    The complete automation bundle. AI Assistant + WhatsApp + Receipt processing at one unbeatable price.
                                </p>
                            </div>
                            <Link
                                href="#cta"
                                className="flex-shrink-0 px-8 py-4 bg-white text-ocean-deep rounded-full font-bold text-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 group"
                            >
                                Get the Bundle
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

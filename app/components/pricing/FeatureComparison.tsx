'use client';

import { motion } from 'framer-motion';
import { Check, X, Minus } from 'lucide-react';

type FeatureValue = boolean | string | 'partial';

interface Feature {
    name: string;
    tooltip?: string;
    aiAssistant: FeatureValue;
    whatsapp: FeatureValue;
    receipt: FeatureValue;
    bundle: FeatureValue;
}

interface FeatureCategory {
    category: string;
    features: Feature[];
}

const featureCategories: FeatureCategory[] = [
    {
        category: 'Core Features',
        features: [
            { name: 'AI-powered responses', aiAssistant: true, whatsapp: true, receipt: false, bundle: true },
            { name: 'WhatsApp integration', aiAssistant: false, whatsapp: true, receipt: false, bundle: true },
            { name: 'Receipt OCR scanning', aiAssistant: false, whatsapp: false, receipt: true, bundle: true },
            { name: 'Custom knowledge base', aiAssistant: true, whatsapp: 'partial', receipt: false, bundle: true },
            { name: 'Conversation history', aiAssistant: true, whatsapp: true, receipt: false, bundle: true },
        ],
    },
    {
        category: 'Messaging & Channels',
        features: [
            { name: 'WhatsApp Business API', aiAssistant: false, whatsapp: true, receipt: false, bundle: true },
            { name: 'QR code onboarding', aiAssistant: false, whatsapp: true, receipt: false, bundle: true },
            { name: 'Messages included', aiAssistant: 'Unlimited', whatsapp: '5,000/mo', receipt: '-', bundle: '5,000/mo' },
            { name: 'Web chat widget', aiAssistant: true, whatsapp: false, receipt: false, bundle: true },
            { name: 'Email integration', aiAssistant: true, whatsapp: false, receipt: false, bundle: true },
        ],
    },
    {
        category: 'Automation & Workflows',
        features: [
            { name: 'Automated responses', aiAssistant: true, whatsapp: true, receipt: false, bundle: true },
            { name: 'Booking & scheduling', aiAssistant: false, whatsapp: true, receipt: false, bundle: true },
            { name: 'Customer segmentation', aiAssistant: false, whatsapp: true, receipt: false, bundle: true },
            { name: 'Auto-categorization', aiAssistant: false, whatsapp: false, receipt: true, bundle: true },
            { name: 'Custom workflows', aiAssistant: 'partial', whatsapp: true, receipt: false, bundle: true },
        ],
    },
    {
        category: 'Reports & Analytics',
        features: [
            { name: 'Basic analytics', aiAssistant: true, whatsapp: true, receipt: true, bundle: true },
            { name: 'Advanced analytics', aiAssistant: false, whatsapp: true, receipt: false, bundle: true },
            { name: 'VAT-ready reports', aiAssistant: false, whatsapp: false, receipt: true, bundle: true },
            { name: 'Export to CSV/PDF', aiAssistant: true, whatsapp: true, receipt: true, bundle: true },
            { name: 'Quarterly reviews', aiAssistant: false, whatsapp: false, receipt: false, bundle: true },
        ],
    },
    {
        category: 'Support & Services',
        features: [
            { name: 'Email support', aiAssistant: true, whatsapp: true, receipt: true, bundle: true },
            { name: 'Response time', aiAssistant: '24hr', whatsapp: '4hr', receipt: '24hr', bundle: '2hr' },
            { name: 'Phone support', aiAssistant: false, whatsapp: false, receipt: false, bundle: true },
            { name: 'Dedicated account manager', aiAssistant: false, whatsapp: false, receipt: false, bundle: true },
            { name: 'Custom integrations', aiAssistant: false, whatsapp: false, receipt: false, bundle: true },
        ],
    },
];

const plans = [
    { id: 'aiAssistant', name: 'AI Assistant', price: 'R499/mo' },
    { id: 'whatsapp', name: 'WhatsApp', price: 'R499/mo' },
    { id: 'receipt', name: 'Receipt', price: 'R99/user' },
    { id: 'bundle', name: 'Bundle', price: 'R899/mo', highlighted: true },
];

function FeatureCell({ value }: { value: FeatureValue }) {
    if (value === true) {
        return (
            <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600" />
                </div>
            </div>
        );
    }
    if (value === false) {
        return (
            <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-400" />
                </div>
            </div>
        );
    }
    if (value === 'partial') {
        return (
            <div className="flex justify-center">
                <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Minus className="w-4 h-4 text-yellow-600" />
                </div>
            </div>
        );
    }
    return (
        <div className="text-center text-sm font-medium text-gray-700">{value}</div>
    );
}

export default function FeatureComparison() {
    return (
        <section className="py-20 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-navy mb-4">
                        Compare All Features
                    </h2>
                    <p className="text-xl text-gray-600">
                        See exactly what you get with each plan
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
                >
                    {/* Header */}
                    <div className="grid grid-cols-5 border-b border-gray-200 bg-gray-50">
                        <div className="p-4 font-semibold text-gray-700">Features</div>
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`p-4 text-center ${
                                    plan.highlighted ? 'bg-surf-light/20' : ''
                                }`}
                            >
                                <div className="font-bold text-dark-navy">{plan.name}</div>
                                <div className="text-sm text-gray-500">{plan.price}</div>
                            </div>
                        ))}
                    </div>

                    {/* Feature rows */}
                    {featureCategories.map((category, catIndex) => (
                        <div key={catIndex}>
                            {/* Category header */}
                            <div className="grid grid-cols-5 bg-surf-light/10 border-b border-gray-200">
                                <div className="col-span-5 p-3 font-semibold text-surf-dark text-sm uppercase tracking-wider">
                                    {category.category}
                                </div>
                            </div>

                            {/* Features in category */}
                            {category.features.map((feature, featureIndex) => (
                                <div
                                    key={featureIndex}
                                    className="grid grid-cols-5 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="p-4 text-gray-700 text-sm">{feature.name}</div>
                                    <div className="p-4">
                                        <FeatureCell value={feature.aiAssistant} />
                                    </div>
                                    <div className="p-4">
                                        <FeatureCell value={feature.whatsapp} />
                                    </div>
                                    <div className="p-4">
                                        <FeatureCell value={feature.receipt} />
                                    </div>
                                    <div className={`p-4 ${plans[3].highlighted ? 'bg-surf-light/10' : ''}`}>
                                        <FeatureCell value={feature.bundle} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>

                {/* Mobile note */}
                <p className="text-center text-sm text-gray-500 mt-6 md:hidden">
                    Scroll horizontally to see all plans
                </p>
            </div>
        </section>
    );
}

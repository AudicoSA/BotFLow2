'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
    category: 'general' | 'billing' | 'sa-specific' | 'technical';
}

const faqs: FAQItem[] = [
    // SA-Specific Concerns
    {
        question: 'Is BotFlow available for South African businesses?',
        answer: 'Yes! BotFlow is built specifically for South African businesses. We offer local payment processing through Paystack (supporting EFT, card payments, and mobile money), our servers are hosted locally for fast performance, and our support team operates in SA business hours.',
        category: 'sa-specific',
    },
    {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major South African payment methods through Paystack: Visa, Mastercard, Instant EFT, and mobile money. All prices are in South African Rand (ZAR) with no currency conversion fees.',
        category: 'sa-specific',
    },
    {
        question: 'Is my data stored in South Africa?',
        answer: 'Yes, we prioritize data sovereignty. Your business data is stored on servers located in South Africa, ensuring compliance with POPIA (Protection of Personal Information Act) and giving you peace of mind about data privacy and fast access speeds.',
        category: 'sa-specific',
    },
    {
        question: 'Do you comply with POPIA regulations?',
        answer: 'Absolutely. BotFlow is fully POPIA compliant. We have implemented appropriate security measures, data processing agreements, and give you full control over your data. You can export or delete your data at any time.',
        category: 'sa-specific',
    },
    {
        question: 'What happens during load shedding?',
        answer: 'Our cloud infrastructure has multiple redundancies and backup power systems. Your BotFlow services continue running 24/7 regardless of local load shedding. Your customers will always be able to reach your WhatsApp bot, even during Stage 6.',
        category: 'sa-specific',
    },
    {
        question: 'Can I get an invoice for tax purposes?',
        answer: 'Yes! We provide proper tax invoices with VAT for all subscriptions. Invoices are automatically generated monthly and can be downloaded from your dashboard. They include all the information needed for your accountant and SARS submissions.',
        category: 'sa-specific',
    },
    // Billing & Plans
    {
        question: 'How does the 14-day free trial work?',
        answer: 'You get full access to all features during your 14-day trial with no credit card required. At the end of the trial, you can choose to subscribe or your account will simply become inactive. We\'ll never charge you without your explicit consent.',
        category: 'billing',
    },
    {
        question: 'Can I switch between plans?',
        answer: 'Yes, you can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged the prorated difference immediately. When downgrading, the new rate applies from your next billing cycle.',
        category: 'billing',
    },
    {
        question: 'What\'s your refund policy?',
        answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied within the first 30 days of your paid subscription, contact us for a full refund - no questions asked.',
        category: 'billing',
    },
    {
        question: 'Are there any hidden fees?',
        answer: 'No hidden fees, ever. The price you see is the price you pay. WhatsApp message costs are included in your plan (up to your monthly limit). If you exceed limits, we\'ll notify you before any additional charges.',
        category: 'billing',
    },
    {
        question: 'How does Receipt Assistant pricing work?',
        answer: 'Receipt Assistant is priced per user at R99/month. Each user can scan unlimited receipts. If you have a team of 5 people using receipt scanning, it would be R495/month. The Bundle includes 1 user, with additional users at R99 each.',
        category: 'billing',
    },
    // General Questions
    {
        question: 'How quickly can I get started?',
        answer: 'Most customers are up and running in under 5 minutes! Our WhatsApp QR code onboarding lets you connect your existing WhatsApp Business number instantly. The AI Assistant and Receipt features are ready to use immediately after signup.',
        category: 'general',
    },
    {
        question: 'Do I need technical skills to use BotFlow?',
        answer: 'Not at all! BotFlow is designed for business owners, not developers. Our visual interface makes it easy to set up automated responses, and our pre-built templates get you started quickly. If you can use WhatsApp, you can use BotFlow.',
        category: 'general',
    },
    {
        question: 'Can I use my existing WhatsApp Business number?',
        answer: 'Yes! We use WhatsApp\'s Coexistence mode, which means you can connect your existing WhatsApp Business number without losing your chat history or contacts. You continue using the WhatsApp app while BotFlow handles automated responses.',
        category: 'general',
    },
    // Technical Questions
    {
        question: 'What languages does the AI Assistant support?',
        answer: 'Our AI Assistant supports all 11 official South African languages, plus many international languages. It can automatically detect and respond in the language your customer uses, making it perfect for SA\'s diverse market.',
        category: 'technical',
    },
    {
        question: 'How accurate is the Receipt OCR?',
        answer: 'Our AI-powered OCR achieves over 95% accuracy on standard receipts. It can extract merchant name, date, amounts, and individual line items. For handwritten or damaged receipts, you can easily make corrections in the app.',
        category: 'technical',
    },
    {
        question: 'What integrations are available?',
        answer: 'We integrate with popular SA business tools including Xero, Sage, Google Calendar, Shopify, WooCommerce, and many more. Enterprise customers can also request custom integrations through our API.',
        category: 'technical',
    },
];

const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'sa-specific', label: 'South Africa' },
    { id: 'billing', label: 'Billing & Plans' },
    { id: 'general', label: 'General' },
    { id: 'technical', label: 'Technical' },
];

export default function PricingFAQ() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const filteredFaqs = activeCategory === 'all'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    return (
        <section className="py-20 px-6 bg-white">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surf/10 text-surf-dark mb-6">
                        <HelpCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Frequently Asked Questions</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-navy mb-4">
                        Got Questions? We&apos;ve Got Answers
                    </h2>
                    <p className="text-xl text-gray-600">
                        Everything you need to know about BotFlow pricing and services
                    </p>
                </motion.div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveCategory(cat.id);
                                setOpenIndex(null);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                activeCategory === cat.id
                                    ? 'bg-surf text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    {filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-surf/50 transition-colors"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-4 flex items-center justify-between text-left"
                            >
                                <span className="font-semibold text-dark-navy pr-4">{faq.question}</span>
                                <motion.div
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="px-6 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </motion.div>

                {/* Still have questions? */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mt-12 p-8 bg-gray-50 rounded-2xl"
                >
                    <h3 className="text-xl font-bold text-dark-navy mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-4">
                        Our SA-based team is here to help during business hours
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:support@botflow.co.za"
                            className="px-6 py-3 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold transition-all"
                        >
                            Email Support
                        </a>
                        <a
                            href="https://wa.me/27100000000"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-xl font-semibold transition-all"
                        >
                            WhatsApp Us
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Sparkles, PartyPopper } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';
import Confetti from '../Confetti';

export default function CompleteStep() {
    const { businessName, selectedServices, completeOnboarding, startedAt, completedAt } =
        useOnboardingStore();

    // Calculate time taken
    const getTimeTaken = () => {
        if (!startedAt) return 'a few minutes';
        const start = new Date(startedAt);
        const end = completedAt ? new Date(completedAt) : new Date();
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'less than a minute';
        if (diffMins === 1) return '1 minute';
        return `${diffMins} minutes`;
    };

    const nextSteps = [
        {
            title: 'Explore your dashboard',
            description: 'View your services and start automating',
            href: '/dashboard',
        },
        {
            title: 'Customize your templates',
            description: 'Edit message templates to match your brand',
            href: '/dashboard/templates',
        },
        {
            title: 'Invite your team',
            description: 'Add team members to collaborate',
            href: '/dashboard/team',
        },
    ];

    return (
        <div className="max-w-2xl mx-auto text-center">
            <Confetti />

            {/* Success Icon */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8"
            >
                <PartyPopper className="w-12 h-12 text-green-600" />
            </motion.div>

            {/* Heading */}
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold text-dark-navy mb-4"
            >
                You&apos;re All Set!
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-600 mb-8"
            >
                {businessName
                    ? `${businessName} is ready to automate with BotFlow`
                    : 'Your BotFlow account is ready to go'}
            </motion.p>

            {/* Summary */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
            >
                <div className="flex items-center justify-center gap-2 text-surf-dark mb-4">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">Setup Complete in {getTimeTaken()}</span>
                </div>

                <div className="space-y-3">
                    {selectedServices.map((service) => (
                        <div
                            key={service}
                            className="flex items-center gap-3 justify-center text-gray-700"
                        >
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span>
                                {service.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
            >
                <h3 className="font-semibold text-dark-navy mb-4">What&apos;s Next?</h3>
                <div className="space-y-3">
                    {nextSteps.map((step, index) => (
                        <Link
                            key={index}
                            href={step.href}
                            onClick={() => completeOnboarding()}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-surf/5 hover:border-surf border-2 border-transparent transition-all group"
                        >
                            <div className="text-left">
                                <div className="font-medium text-dark-navy">{step.title}</div>
                                <div className="text-sm text-gray-500">{step.description}</div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-surf group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <Link
                    href="/dashboard"
                    onClick={() => completeOnboarding()}
                    className="inline-flex items-center gap-2 px-10 py-4 bg-surf hover:bg-surf-dark text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 group"
                >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </motion.div>
        </div>
    );
}

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Clock, Sparkles, CheckCircle } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';
import Image from 'next/image';

const benefits = [
    'Connect your WhatsApp in 2 minutes',
    'Pre-loaded templates ready to use',
    'Send your first message today',
];

export default function WelcomeStep() {
    const { nextStep } = useOnboardingStore();

    return (
        <div className="text-center max-w-2xl mx-auto">
            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="relative w-48 h-12 mx-auto">
                    <Image
                        src="/logo.png"
                        alt="BotFlow"
                        fill
                        className="object-contain"
                    />
                </div>
            </motion.div>

            {/* Welcome Badge */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surf/10 text-surf-dark mb-6"
            >
                <Sparkles className="w-4 h-4" />
                <span className="font-medium text-sm">Welcome to BotFlow</span>
            </motion.div>

            {/* Heading */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-dark-navy mb-6"
            >
                Let&apos;s Get You{' '}
                <span className="gradient-text">Up and Running</span>
            </motion.h1>

            {/* Description */}
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-gray-600 mb-8"
            >
                This quick setup will personalize BotFlow for your business.
                It only takes about 5 minutes.
            </motion.p>

            {/* Time Estimate */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 text-gray-500 mb-8"
            >
                <Clock className="w-5 h-5" />
                <span>About 5 minutes</span>
            </motion.div>

            {/* Benefits */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-10"
            >
                <h3 className="font-semibold text-dark-navy mb-4">
                    What you&apos;ll accomplish:
                </h3>
                <ul className="space-y-3">
                    {benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            {benefit}
                        </li>
                    ))}
                </ul>
            </motion.div>

            {/* CTA */}
            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                onClick={nextStep}
                className="px-10 py-4 bg-surf hover:bg-surf-dark text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto group"
            >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm text-gray-400 mt-6"
            >
                You can always change these settings later
            </motion.p>
        </div>
    );
}

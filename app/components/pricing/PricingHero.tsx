'use client';

import { motion } from 'framer-motion';
import { Sparkles, Shield, Clock } from 'lucide-react';

const guarantees = [
    { icon: Clock, text: '14-day free trial' },
    { icon: Shield, text: '30-day money-back guarantee' },
    { icon: Sparkles, text: 'No credit card required' },
];

export default function PricingHero() {
    return (
        <section className="pt-32 pb-16 px-6 bg-gradient-to-b from-surf-light/10 to-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-surf/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-sunset-pink/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surf/10 text-surf-dark mb-6">
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium text-sm">Simple, Transparent Pricing</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-dark-navy mb-6 leading-tight">
                        Choose the Right Plan for{' '}
                        <span className="gradient-text">Your Business</span>
                    </h1>

                    <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                        Start with any service and scale as you grow. All plans include local SA support
                        and are priced in South African Rand.
                    </p>

                    {/* Guarantees */}
                    <div className="flex flex-wrap justify-center gap-6">
                        {guarantees.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="flex items-center gap-2 text-gray-700"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <Icon className="w-4 h-4 text-green-600" />
                                    </div>
                                    <span className="font-medium">{item.text}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Zap, Shield, Clock } from 'lucide-react';

const benefits = [
    { icon: Zap, text: 'Setup in 5 minutes' },
    { icon: Shield, text: '30-day money-back guarantee' },
    { icon: Clock, text: '14-day free trial' },
    { icon: CheckCircle, text: 'No credit card required' },
];

export default function PricingCTA() {
    return (
        <section className="py-20 px-6 bg-gradient-to-br from-ocean-deep via-surf-dark to-ocean-deep relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-surf/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-surf-light/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                        Ready to Transform Your Business?
                    </h2>
                    <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                        Join 500+ South African businesses already saving hours every week with BotFlow automation.
                    </p>

                    {/* Benefits row */}
                    <div className="flex flex-wrap justify-center gap-6 mb-10">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-2 text-white/90"
                                >
                                    <Icon className="w-5 h-5 text-surf-light" />
                                    <span className="text-sm font-medium">{benefit.text}</span>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/signup"
                            className="px-10 py-4 bg-white text-ocean-deep rounded-full font-bold text-lg hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-2 group"
                        >
                            Start Your Free Trial
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/#services"
                            className="px-10 py-4 border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all"
                        >
                            Learn More
                        </Link>
                    </div>

                    {/* Trust text */}
                    <p className="text-white/60 text-sm mt-8">
                        Trusted by businesses across Johannesburg, Cape Town, Durban, and all of South Africa
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

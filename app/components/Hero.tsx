'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ArrowRight, CheckCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    const benefits = [
        'No credit card required',
        '14-day free trial',
        'Setup in under 5 minutes'
    ];

    return (
        <section className="relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-16">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-full"
                    poster="/hero-wave-new.jpg"
                >
                    <source src="/waves.mp4" type="video/mp4" />
                </video>
                {/* Overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-navy/70 via-dark-navy/50 to-dark-navy/70 backdrop-blur-[2px]"></div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 z-10 relative">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md">
                            <span className="text-surf-light font-medium text-sm tracking-wide uppercase">
                                Built for South African Businesses
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-shadow-lg">
                            Automate Your Business with{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-surf-light to-white">
                                AI-Powered Tools
                            </span>
                        </h1>

                        <p className="text-xl text-gray-200 mb-8 font-light leading-relaxed max-w-xl mx-auto">
                            AI Assistant, WhatsApp automation, and Receipt processing -
                            all in one platform. Save hours every day and delight your customers.
                        </p>

                        {/* Benefits */}
                        <div className="flex flex-wrap justify-center gap-4 mb-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2 text-white/90">
                                    <CheckCircle className="w-5 h-5 text-surf-light" />
                                    <span className="text-sm font-medium">{benefit}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="#cta"
                                className="px-8 py-4 bg-surf hover:bg-surf-dark text-white rounded-full font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-surf/50 flex items-center gap-2 group animate-pulse-glow"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <button
                                onClick={() => setIsVideoPlaying(true)}
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3 group"
                            >
                                <div className="w-10 h-10 rounded-full bg-white text-surf-dark flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play fill="currentColor" className="w-5 h-5 ml-0.5" />
                                </div>
                                Watch Demo
                            </button>
                        </div>

                        {/* Floating Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="mt-12 inline-flex items-center gap-3 bg-white rounded-xl shadow-xl p-4 border border-gray-100"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-gray-500">Average setup time</p>
                                <p className="text-xl font-bold text-dark-navy">Under 5 min</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70"
            >
                <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                </div>
            </motion.div>

            {/* Video Modal */}
            <AnimatePresence>
                {isVideoPlaying && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsVideoPlaying(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-4xl mx-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setIsVideoPlaying(false)}
                                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-8 h-8" />
                            </button>
                            <div className="rounded-2xl overflow-hidden shadow-2xl">
                                <video
                                    className="w-full"
                                    autoPlay
                                    controls
                                >
                                    <source src="/BotFlow__WhatsApp_Automation.mp4" type="video/mp4" />
                                </video>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}

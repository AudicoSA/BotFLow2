'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function CallToAction() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // TODO: Connect to backend/email service
        console.log('Signup:', formData);

        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', company: '' });
    };

    const benefits = [
        '14-day free trial',
        'No credit card required',
        'Cancel anytime',
        'Setup in 5 minutes'
    ];

    return (
        <section id="cta" className="py-24 px-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-ocean-deep via-surf-dark to-ocean-deep"></div>
            <div className="absolute inset-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-surf/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-surf-light/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6">
                        Ready to Automate Your Business?
                    </h2>
                    <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                        Join 500+ South African businesses saving hours every week with BotFlow automation.
                    </p>

                    {/* Benefits */}
                    <div className="flex flex-wrap justify-center gap-6 mb-12">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-white/90">
                                <CheckCircle className="w-5 h-5 text-surf-light" />
                                <span className="text-sm font-medium">{benefit}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/20"
                >
                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 rounded-xl text-lg bg-white/90 focus:bg-white focus:outline-none focus:ring-4 focus:ring-surf/30 transition-all"
                                />
                                <input
                                    type="email"
                                    placeholder="Work email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-6 py-4 rounded-xl text-lg bg-white/90 focus:bg-white focus:outline-none focus:ring-4 focus:ring-surf/30 transition-all"
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input
                                    type="tel"
                                    placeholder="WhatsApp number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-6 py-4 rounded-xl text-lg bg-white/90 focus:bg-white focus:outline-none focus:ring-4 focus:ring-surf/30 transition-all"
                                />
                                <input
                                    type="text"
                                    placeholder="Company name"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    className="w-full px-6 py-4 rounded-xl text-lg bg-white/90 focus:bg-white focus:outline-none focus:ring-4 focus:ring-surf/30 transition-all"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 px-8 rounded-xl font-bold text-lg bg-surf hover:bg-surf-light text-white hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Starting your trial...
                                    </>
                                ) : (
                                    <>
                                        Start Your Free Trial
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-3">You&apos;re all set!</h3>
                            <p className="text-white/80 text-lg mb-6">
                                Check your email for login instructions. Your free trial starts now!
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-surf-light hover:text-white transition-colors underline"
                            >
                                Register another account
                            </button>
                        </div>
                    )}

                    <p className="text-white/60 text-sm text-center mt-6">
                        By signing up, you agree to our{' '}
                        <a href="/terms" className="text-surf-light hover:text-white underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-surf-light hover:text-white underline">Privacy Policy</a>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}

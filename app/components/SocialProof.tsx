'use client';

import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, Clock, Zap } from 'lucide-react';

const testimonials = [
    {
        name: 'Thabo Mokoena',
        role: 'Owner, Mokoena Auto Repairs',
        location: 'Johannesburg',
        image: '/testimonials/thabo.jpg',
        quote: 'BotFlow handles 80% of our customer queries on WhatsApp. My team can now focus on actual repairs instead of answering the same questions all day.',
        metric: '80% less time on queries',
        rating: 5
    },
    {
        name: 'Naledi Khumalo',
        role: 'Founder, Fresh Feast Catering',
        location: 'Cape Town',
        image: '/testimonials/naledi.jpg',
        quote: 'The Receipt Assistant alone saves me 4 hours every week on bookkeeping. Everything is organized and ready for my accountant.',
        metric: '4 hours saved weekly',
        rating: 5
    },
    {
        name: 'Pieter van der Berg',
        role: 'Director, Berg Properties',
        location: 'Pretoria',
        image: '/testimonials/pieter.jpg',
        quote: 'Setup took 5 minutes with the QR code. Now we have AI-powered responses for property enquiries 24/7. Enquiry response time went from hours to seconds.',
        metric: '5 min setup',
        rating: 5
    }
];

const stats = [
    {
        icon: Users,
        value: '500+',
        label: 'SA Businesses',
        description: 'Trust BotFlow daily'
    },
    {
        icon: TrendingUp,
        value: '85%',
        label: 'Time Saved',
        description: 'On repetitive tasks'
    },
    {
        icon: Clock,
        value: '<5 min',
        label: 'Setup Time',
        description: 'To first automation'
    },
    {
        icon: Zap,
        value: '24/7',
        label: 'Availability',
        description: 'Never miss a message'
    }
];

const logos = [
    'Takealot', 'Pick n Pay', 'Woolworths', 'Dischem', 'Checkers', 'Game'
];

export default function SocialProof() {
    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Stats Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20"
                >
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surf-light/30 mb-4">
                                    <Icon className="w-7 h-7 text-surf-dark" />
                                </div>
                                <div className="text-4xl font-bold text-dark-navy mb-1">{stat.value}</div>
                                <div className="font-semibold text-gray-800">{stat.label}</div>
                                <div className="text-sm text-gray-500">{stat.description}</div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Testimonials */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-dark-navy mb-4">
                            Loved by SA Business Owners
                        </h2>
                        <p className="text-xl text-gray-600">
                            Join hundreds of businesses already automating with BotFlow
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-white to-surf-light/10 rounded-3xl p-8 border border-surf-light/30 hover:shadow-xl transition-all duration-300"
                            >
                                {/* Quote Icon */}
                                <Quote className="w-10 h-10 text-surf-light mb-4" />

                                {/* Quote */}
                                <p className="text-gray-700 mb-6 leading-relaxed">
                                    &ldquo;{testimonial.quote}&rdquo;
                                </p>

                                {/* Metric Badge */}
                                <div className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium text-sm mb-6">
                                    {testimonial.metric}
                                </div>

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-surf to-surf-dark flex items-center justify-center text-white font-bold text-lg">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-dark-navy">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                        <div className="text-xs text-gray-400">{testimonial.location}</div>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex gap-1 mt-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Trust Logos */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center"
                >
                    <p className="text-gray-500 text-sm mb-8">
                        Trusted by businesses across South Africa
                    </p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {logos.map((logo, index) => (
                            <div key={index} className="text-xl font-bold text-gray-400 hover:text-surf-dark transition-colors">
                                {logo}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

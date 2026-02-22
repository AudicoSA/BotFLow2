'use client';

import { motion } from 'framer-motion';
import {
    Zap,
    Shield,
    Clock,
    Smartphone,
    BarChart3,
    Puzzle,
    Globe,
    HeadphonesIcon
} from 'lucide-react';

const features = [
    {
        icon: Zap,
        title: '5-Minute Setup',
        description: 'QR code onboarding means you\'re live in minutes, not days. No technical skills required.'
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Bank-level encryption, POPIA compliant, and your data never leaves South African servers.'
    },
    {
        icon: Clock,
        title: '24/7 Automation',
        description: 'Your AI assistants work around the clock, handling queries even while you sleep.'
    },
    {
        icon: Smartphone,
        title: 'Mobile-First',
        description: 'Built for the way South Africans communicate. WhatsApp-native with full mobile support.'
    },
    {
        icon: BarChart3,
        title: 'Real-Time Analytics',
        description: 'Track conversations, measure satisfaction, and optimize your automation with actionable insights.'
    },
    {
        icon: Puzzle,
        title: 'Seamless Integrations',
        description: 'Connect to your CRM, calendar, accounting software, and e-commerce platforms easily.'
    },
    {
        icon: Globe,
        title: 'Multi-Language',
        description: 'Support customers in English, Afrikaans, Zulu, and other South African languages.'
    },
    {
        icon: HeadphonesIcon,
        title: 'Local Support',
        description: 'SA-based support team available during business hours. Real people, real help.'
    }
];

export default function Features() {
    return (
        <section id="features" className="py-24 px-6 bg-sand-DEFAULT/30 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-surf-light/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-sunset-pink/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-4xl lg:text-5xl font-extrabold text-dark-navy">
                        Why Choose <span className="text-surf-DEFAULT">BotFlow</span>?
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Built specifically for South African businesses. Local expertise, global capabilities.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="group p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-xl hover:shadow-surf-light/20 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surf-DEFAULT to-surf-dark flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-dark-navy group-hover:text-surf-dark transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Briefcase, Loader2 } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';

const INDUSTRIES = [
    'Retail / E-commerce',
    'Professional Services',
    'Healthcare',
    'Hospitality / Food',
    'Automotive',
    'Real Estate',
    'Education',
    'Beauty / Wellness',
    'Construction',
    'Other',
];

export default function SetupStep() {
    const { businessName, businessIndustry, setBusinessInfo, nextStep, canProceed, setSampleDataLoaded } =
        useOnboardingStore();

    const [name, setName] = useState(businessName);
    const [industry, setIndustry] = useState(businessIndustry);
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        setBusinessInfo(name, industry);
        setIsLoading(true);

        // Simulate loading sample data
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSampleDataLoaded(true);
        setIsLoading(false);

        nextStep();
    };

    const isValid = name.trim().length > 0;

    return (
        <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-dark-navy mb-4"
                >
                    Tell Us About Your Business
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-600"
                >
                    We&apos;ll set up templates and examples tailored to you
                </motion.p>
            </div>

            {/* Form */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 space-y-6"
            >
                {/* Business Name */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Building2 className="w-4 h-4" />
                        Business Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Mokoena Auto Repairs"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none transition-all text-lg"
                    />
                </div>

                {/* Industry */}
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="w-4 h-4" />
                        Industry
                    </label>
                    <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none transition-all text-lg bg-white"
                    >
                        <option value="">Select your industry</option>
                        {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind}>
                                {ind}
                            </option>
                        ))}
                    </select>
                </div>

                {/* What happens next */}
                <div className="bg-surf-light/20 rounded-xl p-4">
                    <h4 className="font-medium text-dark-navy mb-2">
                        What happens next:
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• We&apos;ll create message templates for your industry</li>
                        <li>• Pre-populate sample data so you can explore</li>
                        <li>• Set up your dashboard with relevant widgets</li>
                    </ul>
                </div>
            </motion.div>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-8"
            >
                <button
                    onClick={handleContinue}
                    disabled={!isValid || isLoading}
                    className="px-10 py-4 bg-surf hover:bg-surf-dark text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Setting up...
                        </>
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { USE_CASE_OPTIONS, type UseCase } from '@/lib/onboarding/types';

export default function UseCaseStep() {
    const { useCases, useCaseOther, toggleUseCase, setUseCaseOther, nextStep, canProceed } =
        useOnboardingStore();
    const [otherText, setOtherText] = useState(useCaseOther);

    const handleToggle = (useCase: UseCase) => {
        toggleUseCase(useCase);
    };

    const handleContinue = () => {
        if (useCases.includes('other') && otherText.trim()) {
            setUseCaseOther(otherText);
        }
        nextStep();
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-dark-navy mb-4"
                >
                    What do you want to automate?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-600"
                >
                    Select all that apply - we&apos;ll recommend the best services for you
                </motion.p>
            </div>

            {/* Use Case Options */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                {USE_CASE_OPTIONS.map((option, index) => {
                    const isSelected = useCases.includes(option.value);
                    return (
                        <motion.button
                            key={option.value}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            onClick={() => handleToggle(option.value)}
                            className={`relative p-6 rounded-2xl text-left transition-all border-2 ${
                                isSelected
                                    ? 'border-surf bg-surf/5 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-surf/50 hover:shadow-md'
                            }`}
                        >
                            {/* Checkbox */}
                            <div
                                className={`absolute top-4 right-4 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                        ? 'bg-surf border-surf'
                                        : 'border-gray-300 bg-white'
                                }`}
                            >
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>

                            {/* Icon */}
                            <span className="text-3xl mb-3 block">{option.icon}</span>

                            {/* Content */}
                            <h3 className="font-bold text-dark-navy mb-1">{option.label}</h3>
                            <p className="text-sm text-gray-500 mb-3">{option.description}</p>

                            {/* Recommended Services */}
                            <div className="flex flex-wrap gap-2">
                                {option.services.map((service) => (
                                    <span
                                        key={service}
                                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                                    >
                                        {service.replace('-assistant', '')}
                                    </span>
                                ))}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Other Input */}
            {useCases.includes('other') && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8"
                >
                    <input
                        type="text"
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        placeholder="Tell us about your use case..."
                        className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none transition-all text-lg"
                    />
                </motion.div>
            )}

            {/* Selection Count */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mb-6"
            >
                <span className="text-sm text-gray-500">
                    {useCases.length === 0
                        ? 'Select at least one use case'
                        : `${useCases.length} use case${useCases.length > 1 ? 's' : ''} selected`}
                </span>
            </motion.div>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
            >
                <button
                    onClick={handleContinue}
                    disabled={!canProceed()}
                    className="px-10 py-4 bg-surf hover:bg-surf-dark text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    );
}

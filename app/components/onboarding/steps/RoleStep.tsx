'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { ROLE_OPTIONS, type UserRole } from '@/lib/onboarding/types';

export default function RoleStep() {
    const { role, roleOther, setRole, nextStep, canProceed } = useOnboardingStore();
    const [otherText, setOtherText] = useState(roleOther);

    const handleSelect = (selectedRole: UserRole) => {
        setRole(selectedRole, selectedRole === 'other' ? otherText : '');
    };

    const handleContinue = () => {
        if (role === 'other' && otherText.trim()) {
            setRole(role, otherText);
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
                    What best describes your role?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-600"
                >
                    This helps us personalize your experience
                </motion.p>
            </div>

            {/* Role Options Grid */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                {ROLE_OPTIONS.map((option, index) => (
                    <motion.button
                        key={option.value}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                        onClick={() => handleSelect(option.value)}
                        className={`relative p-6 rounded-2xl text-left transition-all border-2 ${
                            role === option.value
                                ? 'border-surf bg-surf/5 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-surf/50 hover:shadow-md'
                        }`}
                    >
                        {/* Selected Indicator */}
                        {role === option.value && (
                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-surf flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}

                        {/* Icon */}
                        <span className="text-3xl mb-3 block">{option.icon}</span>

                        {/* Content */}
                        <h3 className="font-bold text-dark-navy mb-1">{option.label}</h3>
                        <p className="text-sm text-gray-500">{option.description}</p>
                    </motion.button>
                ))}
            </div>

            {/* Other Role Input */}
            {role === 'other' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8"
                >
                    <input
                        type="text"
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        placeholder="Please describe your role..."
                        className="w-full px-6 py-4 rounded-xl border-2 border-gray-200 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none transition-all text-lg"
                    />
                </motion.div>
            )}

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
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

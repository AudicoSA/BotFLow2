'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { SERVICE_OPTIONS, USE_CASE_OPTIONS, type ServiceType } from '@/lib/onboarding/types';

export default function ServiceSelectionStep() {
    const { useCases, selectedServices, toggleService, nextStep, canProceed } =
        useOnboardingStore();

    // Auto-select recommended services based on use cases (only on mount)
    useEffect(() => {
        const autoSelectServices = () => {
            const currentServices = useOnboardingStore.getState().selectedServices;
            const currentUseCases = useOnboardingStore.getState().useCases;

            if (currentServices.length === 0) {
                const recommendedServices = new Set<ServiceType>();

                for (const useCase of currentUseCases) {
                    const option = USE_CASE_OPTIONS.find((o) => o.value === useCase);
                    if (option) {
                        for (const service of option.services) {
                            recommendedServices.add(service);
                        }
                    }
                }

                // Auto-toggle recommended services
                for (const service of recommendedServices) {
                    useOnboardingStore.getState().toggleService(service);
                }
            }
        };

        autoSelectServices();
    }, []);

    const getRecommendedServices = (): ServiceType[] => {
        const recommended = new Set<ServiceType>();
        for (const useCase of useCases) {
            const option = USE_CASE_OPTIONS.find((o) => o.value === useCase);
            if (option) {
                for (const service of option.services) {
                    recommended.add(service);
                }
            }
        }
        return Array.from(recommended);
    };

    const recommendedServices = getRecommendedServices();

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-dark-navy mb-4"
                >
                    Choose Your Services
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-600"
                >
                    Based on your needs, we recommend these services
                </motion.p>
            </div>

            {/* Service Options */}
            <div className="space-y-4 mb-8">
                {SERVICE_OPTIONS.map((service, index) => {
                    const isSelected = selectedServices.includes(service.id);
                    const isRecommended = recommendedServices.includes(service.id);

                    return (
                        <motion.button
                            key={service.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1 }}
                            onClick={() => toggleService(service.id)}
                            className={`relative w-full p-6 rounded-2xl text-left transition-all border-2 ${
                                isSelected
                                    ? 'border-surf bg-surf/5 shadow-lg'
                                    : 'border-gray-200 bg-white hover:border-surf/50 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Checkbox */}
                                <div
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                                        isSelected
                                            ? 'bg-surf border-surf'
                                            : 'border-gray-300 bg-white'
                                    }`}
                                >
                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                </div>

                                {/* Icon */}
                                <span className="text-4xl">{service.icon}</span>

                                {/* Content */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-dark-navy text-lg">
                                            {service.name}
                                        </h3>
                                        {isRecommended && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                <Sparkles className="w-3 h-3" />
                                                Recommended
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-gray-500 mb-3">{service.description}</p>

                                    {/* Features */}
                                    <div className="flex flex-wrap gap-2">
                                        {service.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Selection Summary */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-xl p-4 border border-gray-200 mb-8"
            >
                <div className="flex items-center justify-between">
                    <span className="text-gray-600">Selected services:</span>
                    <span className="font-semibold text-dark-navy">
                        {selectedServices.length === 0
                            ? 'None selected'
                            : selectedServices.length === 3
                            ? 'Full Bundle'
                            : `${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''}`}
                    </span>
                </div>
            </motion.div>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center"
            >
                <button
                    onClick={nextStep}
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

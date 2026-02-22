'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, SkipForward, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';
import { DASHBOARD_TOUR_STEPS } from '@/lib/onboarding/tour-steps';

export default function TourStep() {
    const { selectedServices, tourStep, setTourStep, completeTour, nextStep } = useOnboardingStore();
    const [showTour, setShowTour] = useState(false);

    const tourSteps = DASHBOARD_TOUR_STEPS;

    const handleStartTour = () => {
        setShowTour(true);
        setTourStep(0);
    };

    const handleSkipTour = () => {
        completeTour();
        nextStep();
    };

    const handleNextTourStep = () => {
        if (tourStep < tourSteps.length - 1) {
            setTourStep(tourStep + 1);
        } else {
            completeTour();
            nextStep();
        }
    };

    const handlePrevTourStep = () => {
        if (tourStep > 0) {
            setTourStep(tourStep - 1);
        }
    };

    if (!showTour) {
        return (
            <div className="max-w-2xl mx-auto text-center">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="w-20 h-20 rounded-full bg-surf-light/30 flex items-center justify-center mx-auto mb-6">
                        <Play className="w-10 h-10 text-surf-dark" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-dark-navy mb-4">
                        Quick Product Tour
                    </h2>
                    <p className="text-lg text-gray-600">
                        Take a 2-minute tour to learn how to use BotFlow effectively
                    </p>
                </motion.div>

                {/* Tour Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-10"
                >
                    <h3 className="font-semibold text-dark-navy mb-4">
                        You&apos;ll learn how to:
                    </h3>
                    <ul className="space-y-3 text-left">
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            Navigate your dashboard
                        </li>
                        {selectedServices.includes('whatsapp-assistant') && (
                            <li className="flex items-center gap-3 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                Connect your WhatsApp
                            </li>
                        )}
                        {selectedServices.includes('ai-assistant') && (
                            <li className="flex items-center gap-3 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                Chat with your AI Assistant
                            </li>
                        )}
                        {selectedServices.includes('receipt-assistant') && (
                            <li className="flex items-center gap-3 text-gray-700">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                Scan your first receipt
                            </li>
                        )}
                        <li className="flex items-center gap-3 text-gray-700">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            Use quick actions
                        </li>
                    </ul>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                    <button
                        onClick={handleStartTour}
                        className="px-10 py-4 bg-surf hover:bg-surf-dark text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 justify-center group"
                    >
                        <Play className="w-5 h-5" />
                        Start Tour
                    </button>
                    <button
                        onClick={handleSkipTour}
                        className="px-10 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full font-bold text-lg transition-all flex items-center gap-2 justify-center"
                    >
                        <SkipForward className="w-5 h-5" />
                        Skip for Now
                    </button>
                </motion.div>
            </div>
        );
    }

    // Interactive Tour View
    const currentStep = tourSteps[tourStep];

    return (
        <div className="max-w-4xl mx-auto">
            {/* Mock Dashboard for Tour */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            >
                {/* Mock Header */}
                <div className="bg-dark-navy p-4 flex items-center justify-between" data-tour="dashboard-header">
                    <div className="text-white font-bold">BotFlow Dashboard</div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surf"></div>
                    </div>
                </div>

                {/* Mock Content */}
                <div className="p-6">
                    {/* Service Tiles */}
                    <div className="grid grid-cols-3 gap-4 mb-6" data-tour="service-tiles">
                        {selectedServices.map((service) => (
                            <div
                                key={service}
                                className="p-4 rounded-xl bg-gradient-to-br from-surf-light/20 to-surf/10 border border-surf-light/30"
                            >
                                <div className="text-2xl mb-2">
                                    {service === 'ai-assistant' && '🤖'}
                                    {service === 'whatsapp-assistant' && '💬'}
                                    {service === 'receipt-assistant' && '🧾'}
                                </div>
                                <div className="font-semibold text-dark-navy text-sm">
                                    {service.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mb-6" data-tour="quick-actions">
                        <button className="px-4 py-2 bg-surf text-white rounded-lg text-sm">
                            Send Message
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                            Upload Receipt
                        </button>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
                            Start Chat
                        </button>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-3 gap-4" data-tour="usage-stats">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-2xl font-bold text-dark-navy">0</div>
                            <div className="text-sm text-gray-500">Messages Sent</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-2xl font-bold text-dark-navy">0</div>
                            <div className="text-sm text-gray-500">Receipts Scanned</div>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <div className="text-2xl font-bold text-dark-navy">0</div>
                            <div className="text-sm text-gray-500">AI Conversations</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tour Tooltip */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={tourStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-dark-navy text-white rounded-2xl p-6 shadow-xl"
                >
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-surf flex items-center justify-center flex-shrink-0 font-bold">
                            {tourStep + 1}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">{currentStep.title}</h3>
                            <p className="text-gray-300">{currentStep.content}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                        <div className="text-sm text-gray-400">
                            Step {tourStep + 1} of {tourSteps.length}
                        </div>
                        <div className="flex gap-2">
                            {tourStep > 0 && (
                                <button
                                    onClick={handlePrevTourStep}
                                    className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                            )}
                            <button
                                onClick={handleNextTourStep}
                                className="px-4 py-2 bg-surf hover:bg-surf-dark rounded-lg flex items-center gap-1 font-medium"
                            >
                                {tourStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingStore } from '@/lib/onboarding/store';
import WelcomeStep from './steps/WelcomeStep';
import RoleStep from './steps/RoleStep';
import UseCaseStep from './steps/UseCaseStep';
import ServiceSelectionStep from './steps/ServiceSelectionStep';
import SetupStep from './steps/SetupStep';
import TourStep from './steps/TourStep';
import FirstValueStep from './steps/FirstValueStep';
import CompleteStep from './steps/CompleteStep';
import OnboardingProgress from './OnboardingProgress';

export default function OnboardingWizard() {
    const { currentStep } = useOnboardingStore();

    const renderStep = () => {
        switch (currentStep) {
            case 'welcome':
                return <WelcomeStep />;
            case 'role':
                return <RoleStep />;
            case 'use-case':
                return <UseCaseStep />;
            case 'service-selection':
                return <ServiceSelectionStep />;
            case 'setup':
                return <SetupStep />;
            case 'tour':
                return <TourStep />;
            case 'first-value':
                return <FirstValueStep />;
            case 'complete':
                return <CompleteStep />;
            default:
                return <WelcomeStep />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-surf-light/20 via-white to-sunset-pink/10 flex flex-col">
            {/* Progress Bar */}
            {currentStep !== 'welcome' && currentStep !== 'complete' && (
                <OnboardingProgress />
            )}

            {/* Step Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-4xl"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

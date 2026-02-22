'use client';

import { useOnboardingStore } from '@/lib/onboarding/store';
import { Clock, ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const STEP_LABELS = {
    welcome: 'Welcome',
    role: 'Your Role',
    'use-case': 'Use Cases',
    'service-selection': 'Services',
    setup: 'Setup',
    tour: 'Tour',
    'first-value': 'First Win',
    complete: 'Complete',
};

export default function OnboardingProgress() {
    const { currentStep, getProgress, prevStep } = useOnboardingStore();
    const progress = getProgress();

    const canGoBack = currentStep !== 'welcome' && currentStep !== 'complete';

    return (
        <header className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                {/* Logo and Back */}
                <div className="flex items-center gap-4">
                    {canGoBack && (
                        <button
                            onClick={prevStep}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            aria-label="Go back"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}
                    <Link href="/" className="flex items-center">
                        <div className="relative w-32 h-8">
                            <Image
                                src="/logo.png"
                                alt="BotFlow"
                                fill
                                className="object-contain object-left"
                            />
                        </div>
                    </Link>
                </div>

                {/* Step Indicator */}
                <div className="hidden md:flex items-center gap-2 text-sm">
                    <span className="font-medium text-dark-navy">
                        {STEP_LABELS[currentStep]}
                    </span>
                    <span className="text-gray-400">
                        Step {progress.currentStepIndex + 1} of {progress.totalSteps}
                    </span>
                </div>

                {/* Time Estimate */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{progress.estimatedTimeRemaining}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto mt-4">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-surf to-surf-dark rounded-full transition-all duration-500"
                        style={{ width: `${progress.percentComplete}%` }}
                    />
                </div>
            </div>
        </header>
    );
}

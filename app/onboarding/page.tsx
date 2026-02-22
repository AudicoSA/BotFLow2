'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import { useOnboardingStore } from '@/lib/onboarding/store';

export default function OnboardingPage() {
    const router = useRouter();
    const { currentStep, completedAt } = useOnboardingStore();

    useEffect(() => {
        // If onboarding is already complete, redirect to dashboard
        if (completedAt) {
            router.push('/dashboard');
        }
    }, [completedAt, router]);

    // Don't render if already completed
    if (completedAt) {
        return null;
    }

    return <OnboardingWizard />;
}

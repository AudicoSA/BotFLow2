// Onboarding State Management with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
    OnboardingState,
    OnboardingStep,
    UserRole,
    UseCase,
    ServiceType,
    OnboardingProgress,
} from './types';

const STEP_ORDER: OnboardingStep[] = [
    'welcome',
    'role',
    'use-case',
    'service-selection',
    'setup',
    'tour',
    'first-value',
    'complete',
];

interface OnboardingStore extends OnboardingState {
    // Actions
    setCurrentStep: (step: OnboardingStep) => void;
    nextStep: () => void;
    prevStep: () => void;
    completeStep: (step: OnboardingStep) => void;

    // User selection actions
    setRole: (role: UserRole, other?: string) => void;
    toggleUseCase: (useCase: UseCase) => void;
    setUseCaseOther: (text: string) => void;
    toggleService: (service: ServiceType) => void;

    // Setup actions
    setBusinessInfo: (name: string, industry: string) => void;
    setWhatsappConnected: (connected: boolean) => void;
    setSampleDataLoaded: (loaded: boolean) => void;

    // Tour actions
    setTourStep: (step: number) => void;
    completeTour: () => void;

    // Milestone actions
    markFirstMessage: () => void;
    markFirstReceipt: () => void;
    markFirstAIConversation: () => void;
    completeOnboarding: () => void;

    // Utility
    getProgress: () => OnboardingProgress;
    reset: () => void;
    canProceed: () => boolean;
}

const initialState: OnboardingState = {
    currentStep: 'welcome',
    completedSteps: [],
    role: null,
    roleOther: '',
    useCases: [],
    useCaseOther: '',
    selectedServices: [],
    businessName: '',
    businessIndustry: '',
    whatsappConnected: false,
    sampleDataLoaded: false,
    tourCompleted: false,
    tourStep: 0,
    firstMessageSent: false,
    firstReceiptScanned: false,
    firstAIConversation: false,
    startedAt: null,
    completedAt: null,
};

export const useOnboardingStore = create<OnboardingStore>()(
    persist(
        (set, get) => ({
            ...initialState,

            setCurrentStep: (step) => set({ currentStep: step }),

            nextStep: () => {
                const { currentStep, completedSteps } = get();
                const currentIndex = STEP_ORDER.indexOf(currentStep);

                if (currentIndex < STEP_ORDER.length - 1) {
                    const newCompletedSteps = completedSteps.includes(currentStep)
                        ? completedSteps
                        : [...completedSteps, currentStep];

                    set({
                        currentStep: STEP_ORDER[currentIndex + 1],
                        completedSteps: newCompletedSteps,
                    });
                }
            },

            prevStep: () => {
                const { currentStep } = get();
                const currentIndex = STEP_ORDER.indexOf(currentStep);

                if (currentIndex > 0) {
                    set({ currentStep: STEP_ORDER[currentIndex - 1] });
                }
            },

            completeStep: (step) => {
                const { completedSteps } = get();
                if (!completedSteps.includes(step)) {
                    set({ completedSteps: [...completedSteps, step] });
                }
            },

            setRole: (role, other = '') => {
                set({
                    role,
                    roleOther: other,
                    startedAt: get().startedAt || new Date().toISOString(),
                });
            },

            toggleUseCase: (useCase) => {
                const { useCases } = get();
                const newUseCases = useCases.includes(useCase)
                    ? useCases.filter((uc) => uc !== useCase)
                    : [...useCases, useCase];
                set({ useCases: newUseCases });
            },

            setUseCaseOther: (text) => set({ useCaseOther: text }),

            toggleService: (service) => {
                const { selectedServices } = get();
                const newServices = selectedServices.includes(service)
                    ? selectedServices.filter((s) => s !== service)
                    : [...selectedServices, service];
                set({ selectedServices: newServices });
            },

            setBusinessInfo: (name, industry) => {
                set({ businessName: name, businessIndustry: industry });
            },

            setWhatsappConnected: (connected) => set({ whatsappConnected: connected }),

            setSampleDataLoaded: (loaded) => set({ sampleDataLoaded: loaded }),

            setTourStep: (step) => set({ tourStep: step }),

            completeTour: () => set({ tourCompleted: true }),

            markFirstMessage: () => set({ firstMessageSent: true }),

            markFirstReceipt: () => set({ firstReceiptScanned: true }),

            markFirstAIConversation: () => set({ firstAIConversation: true }),

            completeOnboarding: () => {
                set({
                    completedAt: new Date().toISOString(),
                    currentStep: 'complete',
                    completedSteps: [...STEP_ORDER],
                });
            },

            getProgress: () => {
                const { currentStep, completedSteps } = get();
                const currentIndex = STEP_ORDER.indexOf(currentStep);
                const totalSteps = STEP_ORDER.length - 1; // Exclude 'complete'

                const percentComplete = Math.round((completedSteps.length / totalSteps) * 100);

                // Estimate time: ~1 min per step
                const stepsRemaining = totalSteps - completedSteps.length;
                const estimatedTimeRemaining =
                    stepsRemaining <= 0
                        ? 'Done!'
                        : stepsRemaining === 1
                        ? 'Less than 1 minute'
                        : `About ${stepsRemaining} minutes`;

                return {
                    currentStepIndex: currentIndex,
                    totalSteps,
                    percentComplete,
                    estimatedTimeRemaining,
                };
            },

            canProceed: () => {
                const state = get();
                const { currentStep } = state;

                switch (currentStep) {
                    case 'welcome':
                        return true;
                    case 'role':
                        return state.role !== null;
                    case 'use-case':
                        return state.useCases.length > 0;
                    case 'service-selection':
                        return state.selectedServices.length > 0;
                    case 'setup':
                        return state.businessName.trim().length > 0;
                    case 'tour':
                        return true; // Can skip tour
                    case 'first-value':
                        return (
                            state.firstMessageSent ||
                            state.firstReceiptScanned ||
                            state.firstAIConversation
                        );
                    default:
                        return true;
                }
            },

            reset: () => set(initialState),
        }),
        {
            name: 'botflow-onboarding',
            partialize: (state) => ({
                currentStep: state.currentStep,
                completedSteps: state.completedSteps,
                role: state.role,
                roleOther: state.roleOther,
                useCases: state.useCases,
                useCaseOther: state.useCaseOther,
                selectedServices: state.selectedServices,
                businessName: state.businessName,
                businessIndustry: state.businessIndustry,
                tourCompleted: state.tourCompleted,
                firstMessageSent: state.firstMessageSent,
                firstReceiptScanned: state.firstReceiptScanned,
                firstAIConversation: state.firstAIConversation,
                startedAt: state.startedAt,
                completedAt: state.completedAt,
            }),
        }
    )
);

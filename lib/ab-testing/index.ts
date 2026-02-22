// A/B Testing Infrastructure
// Simple client-side A/B testing with analytics integration

export type VariantId = string;
export type ExperimentId = string;

export interface Experiment {
    id: ExperimentId;
    name: string;
    variants: {
        id: VariantId;
        name: string;
        weight: number; // 0-100
    }[];
    enabled: boolean;
}

export interface ExperimentAssignment {
    experimentId: ExperimentId;
    variantId: VariantId;
    timestamp: number;
}

// Active experiments configuration
export const experiments: Record<ExperimentId, Experiment> = {
    'pricing-layout': {
        id: 'pricing-layout',
        name: 'Pricing Page Layout',
        variants: [
            { id: 'control', name: 'Original Layout', weight: 50 },
            { id: 'compact', name: 'Compact Cards', weight: 50 },
        ],
        enabled: true,
    },
    'pricing-cta-copy': {
        id: 'pricing-cta-copy',
        name: 'Pricing CTA Copy',
        variants: [
            { id: 'control', name: 'Start Free Trial', weight: 33 },
            { id: 'variant-a', name: 'Get Started Free', weight: 33 },
            { id: 'variant-b', name: 'Try Free for 14 Days', weight: 34 },
        ],
        enabled: true,
    },
    'hero-headline': {
        id: 'hero-headline',
        name: 'Hero Headline',
        variants: [
            { id: 'control', name: 'Original', weight: 50 },
            { id: 'benefit-focused', name: 'Benefit Focused', weight: 50 },
        ],
        enabled: true,
    },
    'social-proof-style': {
        id: 'social-proof-style',
        name: 'Social Proof Display',
        variants: [
            { id: 'control', name: 'Logo Grid', weight: 50 },
            { id: 'testimonial-cards', name: 'Testimonial Cards', weight: 50 },
        ],
        enabled: true,
    },
};

// Storage key for assignments
const STORAGE_KEY = 'ab_experiments';

/**
 * Get all current experiment assignments from storage
 */
function getStoredAssignments(): Record<ExperimentId, ExperimentAssignment> {
    if (typeof window === 'undefined') return {};

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Save assignments to storage
 */
function saveAssignments(assignments: Record<ExperimentId, ExperimentAssignment>): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch {
        // Storage might be full or unavailable
    }
}

/**
 * Select a variant based on weights
 */
function selectVariant(experiment: Experiment): VariantId {
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const variant of experiment.variants) {
        cumulative += variant.weight;
        if (random < cumulative) {
            return variant.id;
        }
    }

    // Fallback to first variant
    return experiment.variants[0].id;
}

/**
 * Get the assigned variant for an experiment
 * Creates a new assignment if one doesn't exist
 */
export function getVariant(experimentId: ExperimentId): VariantId {
    const experiment = experiments[experimentId];

    if (!experiment || !experiment.enabled) {
        return 'control';
    }

    const assignments = getStoredAssignments();

    // Return existing assignment
    if (assignments[experimentId]) {
        return assignments[experimentId].variantId;
    }

    // Create new assignment
    const variantId = selectVariant(experiment);
    const assignment: ExperimentAssignment = {
        experimentId,
        variantId,
        timestamp: Date.now(),
    };

    assignments[experimentId] = assignment;
    saveAssignments(assignments);

    // Track assignment in analytics
    trackExperimentAssignment(experimentId, variantId);

    return variantId;
}

/**
 * Track experiment assignment in analytics
 */
function trackExperimentAssignment(experimentId: ExperimentId, variantId: VariantId): void {
    if (typeof window === 'undefined') return;

    const posthog = (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog;
    if (posthog) {
        posthog.capture('$experiment_started', {
            $experiment_id: experimentId,
            $experiment_variant: variantId,
        });
    }
}

/**
 * Track a conversion event for an experiment
 */
export function trackConversion(experimentId: ExperimentId, conversionType: string): void {
    if (typeof window === 'undefined') return;

    const assignments = getStoredAssignments();
    const assignment = assignments[experimentId];

    if (!assignment) return;

    const posthog = (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog;
    if (posthog) {
        posthog.capture('experiment_conversion', {
            experiment_id: experimentId,
            variant_id: assignment.variantId,
            conversion_type: conversionType,
        });
    }
}

/**
 * Force a specific variant (for testing/preview)
 */
export function forceVariant(experimentId: ExperimentId, variantId: VariantId): void {
    const assignments = getStoredAssignments();

    assignments[experimentId] = {
        experimentId,
        variantId,
        timestamp: Date.now(),
    };

    saveAssignments(assignments);
}

/**
 * Reset all experiment assignments
 */
export function resetExperiments(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get all current assignments (for debugging)
 */
export function getAllAssignments(): Record<ExperimentId, ExperimentAssignment> {
    return getStoredAssignments();
}

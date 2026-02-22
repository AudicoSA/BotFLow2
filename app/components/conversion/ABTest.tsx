'use client';

import { useState, useEffect, ReactNode } from 'react';
import { getVariant, type ExperimentId, type VariantId } from '@/lib/ab-testing';

interface ABTestProps {
    experimentId: ExperimentId;
    children: Record<VariantId, ReactNode>;
    fallback?: ReactNode;
}

/**
 * A/B Test component that renders the appropriate variant
 *
 * Usage:
 * <ABTest experimentId="pricing-cta-copy">
 *   {{
 *     'control': <Button>Start Free Trial</Button>,
 *     'variant-a': <Button>Get Started Free</Button>,
 *     'variant-b': <Button>Try Free for 14 Days</Button>,
 *   }}
 * </ABTest>
 */
export default function ABTest({ experimentId, children, fallback }: ABTestProps) {
    const [variantId, setVariantId] = useState<VariantId | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const variant = getVariant(experimentId);
        setVariantId(variant);
    }, [experimentId]);

    // Server-side or initial render: show fallback or control
    if (!mounted || !variantId) {
        if (fallback) return <>{fallback}</>;
        // Default to control variant
        return <>{children['control'] || null}</>;
    }

    // Render the assigned variant
    const content = children[variantId];

    // Fallback to control if variant not found
    if (!content) {
        return <>{children['control'] || null}</>;
    }

    return <>{content}</>;
}

/**
 * Hook to get the current variant for an experiment
 */
export function useABTest(experimentId: ExperimentId): VariantId {
    const [variantId, setVariantId] = useState<VariantId>('control');

    useEffect(() => {
        const variant = getVariant(experimentId);
        setVariantId(variant);
    }, [experimentId]);

    return variantId;
}

/**
 * CTA Copy variants for easy use
 */
export const ctaCopyVariants = {
    'control': 'Start Free Trial',
    'variant-a': 'Get Started Free',
    'variant-b': 'Try Free for 14 Days',
} as const;

/**
 * Get CTA text based on experiment
 */
export function useCTACopy(): string {
    const variant = useABTest('pricing-cta-copy');
    return ctaCopyVariants[variant as keyof typeof ctaCopyVariants] || ctaCopyVariants.control;
}

// PostHog Analytics Client
import type { ActivationEvent, ProductEvent, EventProperties } from './types';

// PostHog configuration
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

interface PostHogClient {
    capture: (event: string, properties?: EventProperties) => void;
    identify: (userId: string, properties?: Record<string, unknown>) => void;
    reset: () => void;
    isEnabled: () => boolean;
}

class PostHogAnalytics implements PostHogClient {
    private enabled: boolean;
    private userId: string | null = null;
    private organizationId: string | null = null;

    constructor() {
        this.enabled = !!POSTHOG_API_KEY;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    identify(userId: string, properties?: Record<string, unknown>): void {
        if (!this.enabled) return;

        this.userId = userId;

        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { identify: (id: string, props?: Record<string, unknown>) => void } }).posthog) {
            (window as unknown as { posthog: { identify: (id: string, props?: Record<string, unknown>) => void } }).posthog.identify(userId, properties);
        }
    }

    setOrganization(organizationId: string): void {
        this.organizationId = organizationId;

        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { group: (type: string, id: string) => void } }).posthog) {
            (window as unknown as { posthog: { group: (type: string, id: string) => void } }).posthog.group('organization', organizationId);
        }
    }

    capture(event: string, properties?: EventProperties): void {
        if (!this.enabled) return;

        const enrichedProperties = {
            ...properties,
            userId: properties?.userId || this.userId,
            organizationId: properties?.organizationId || this.organizationId,
            timestamp: new Date().toISOString(),
        };

        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog) {
            (window as unknown as { posthog: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog.capture(event, enrichedProperties);
        }
    }

    reset(): void {
        this.userId = null;
        this.organizationId = null;

        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { reset: () => void } }).posthog) {
            (window as unknown as { posthog: { reset: () => void } }).posthog.reset();
        }
    }

    // Activation Events
    trackActivation(event: ActivationEvent, properties?: EventProperties): void {
        this.capture(`activation_${event}`, {
            ...properties,
            eventCategory: 'activation',
        });
    }

    // Product Events
    trackProduct(event: ProductEvent, properties?: EventProperties): void {
        this.capture(`product_${event}`, {
            ...properties,
            eventCategory: 'product',
        });
    }

    // Revenue Events
    trackRevenue(amount: number, planId: string, properties?: EventProperties): void {
        this.capture('revenue', {
            ...properties,
            amount,
            planId,
            currency: 'ZAR',
            eventCategory: 'revenue',
        });
    }

    // Feature Usage
    trackFeatureUsage(feature: string, properties?: EventProperties): void {
        this.capture('feature_used', {
            ...properties,
            feature,
            eventCategory: 'engagement',
        });
    }

    // Page Views
    trackPageView(path: string, properties?: EventProperties): void {
        this.capture('$pageview', {
            ...properties,
            $current_url: path,
        });
    }
}

// Singleton instance
export const posthog = new PostHogAnalytics();

// Convenience functions
export function trackActivation(event: ActivationEvent, properties?: EventProperties): void {
    posthog.trackActivation(event, properties);
}

export function trackProduct(event: ProductEvent, properties?: EventProperties): void {
    posthog.trackProduct(event, properties);
}

export function trackRevenue(amount: number, planId: string, properties?: EventProperties): void {
    posthog.trackRevenue(amount, planId, properties);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
    posthog.identify(userId, properties);
}

export function setOrganization(organizationId: string): void {
    posthog.setOrganization(organizationId);
}

export function resetAnalytics(): void {
    posthog.reset();
}

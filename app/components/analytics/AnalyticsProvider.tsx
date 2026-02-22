'use client';

import { useEffect, useCallback, createContext, useContext, ReactNode, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import type { ActivationEvent, ProductEvent, EventProperties } from '@/lib/analytics/types';

// PostHog configuration
const POSTHOG_API_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

// Sentry configuration
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

interface AnalyticsContextType {
    trackEvent: (event: string, properties?: EventProperties) => void;
    trackActivation: (event: ActivationEvent, properties?: EventProperties) => void;
    trackProduct: (event: ProductEvent, properties?: EventProperties) => void;
    identifyUser: (userId: string, properties?: Record<string, unknown>) => void;
    setOrganization: (organizationId: string) => void;
    captureError: (error: Error, context?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export function useAnalytics(): AnalyticsContextType {
    const context = useContext(AnalyticsContext);
    if (!context) {
        throw new Error('useAnalytics must be used within AnalyticsProvider');
    }
    return context;
}

interface AnalyticsProviderProps {
    children: ReactNode;
}

// Internal component that uses useSearchParams (requires Suspense boundary)
function AnalyticsPageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Track page views
    useEffect(() => {
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');

        // PostHog page view
        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { capture: (event: string, properties: Record<string, unknown>) => void } }).posthog) {
            (window as unknown as { posthog: { capture: (event: string, properties: Record<string, unknown>) => void } }).posthog.capture('$pageview', {
                $current_url: url,
            });
        }
    }, [pathname, searchParams]);

    return null;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
    const trackEvent = useCallback((event: string, properties?: EventProperties) => {
        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { capture: (event: string, properties?: EventProperties) => void } }).posthog) {
            (window as unknown as { posthog: { capture: (event: string, properties?: EventProperties) => void } }).posthog.capture(event, {
                ...properties,
                timestamp: new Date().toISOString(),
            });
        }
    }, []);

    const trackActivation = useCallback((event: ActivationEvent, properties?: EventProperties) => {
        trackEvent(`activation_${event}`, {
            ...properties,
            eventCategory: 'activation',
        });
    }, [trackEvent]);

    const trackProduct = useCallback((event: ProductEvent, properties?: EventProperties) => {
        trackEvent(`product_${event}`, {
            ...properties,
            eventCategory: 'product',
        });
    }, [trackEvent]);

    const identifyUser = useCallback((userId: string, properties?: Record<string, unknown>) => {
        // PostHog identify
        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { identify: (id: string, properties?: Record<string, unknown>) => void } }).posthog) {
            (window as unknown as { posthog: { identify: (id: string, properties?: Record<string, unknown>) => void } }).posthog.identify(userId, properties);
        }

        // Sentry set user
        if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { setUser: (user: { id: string }) => void } }).Sentry) {
            (window as unknown as { Sentry: { setUser: (user: { id: string }) => void } }).Sentry.setUser({ id: userId, ...properties });
        }
    }, []);

    const setOrganization = useCallback((organizationId: string) => {
        // PostHog group
        if (typeof window !== 'undefined' && (window as unknown as { posthog?: { group: (type: string, id: string) => void } }).posthog) {
            (window as unknown as { posthog: { group: (type: string, id: string) => void } }).posthog.group('organization', organizationId);
        }

        // Sentry tag
        if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { configureScope: (callback: (scope: { setTag: (key: string, value: string) => void }) => void) => void } }).Sentry) {
            (window as unknown as { Sentry: { configureScope: (callback: (scope: { setTag: (key: string, value: string) => void }) => void) => void } }).Sentry.configureScope((scope: { setTag: (key: string, value: string) => void }) => {
                scope.setTag('organization_id', organizationId);
            });
        }
    }, []);

    const captureError = useCallback((error: Error, context?: Record<string, unknown>) => {
        // Sentry capture
        if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (error: Error, options: { extra?: Record<string, unknown> }) => void } }).Sentry) {
            (window as unknown as { Sentry: { captureException: (error: Error, options: { extra?: Record<string, unknown> }) => void } }).Sentry.captureException(error, {
                extra: context,
            });
        } else {
            console.error('Error captured:', error, context);
        }
    }, []);

    const contextValue: AnalyticsContextType = {
        trackEvent,
        trackActivation,
        trackProduct,
        identifyUser,
        setOrganization,
        captureError,
    };

    return (
        <AnalyticsContext.Provider value={contextValue}>
            {/* PostHog Script */}
            {POSTHOG_API_KEY && (
                <Script
                    id="posthog-init"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                            posthog.init('${POSTHOG_API_KEY}', {
                                api_host: '${POSTHOG_HOST}',
                                capture_pageview: false,
                                capture_pageleave: true,
                                persistence: 'localStorage',
                            });
                        `,
                    }}
                />
            )}

            {/* Sentry Script */}
            {SENTRY_DSN && (
                <Script
                    id="sentry-init"
                    src="https://browser.sentry-cdn.com/7.91.0/bundle.min.js"
                    strategy="afterInteractive"
                    onLoad={() => {
                        if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { init: (options: { dsn: string; environment: string; tracesSampleRate: number }) => void } }).Sentry) {
                            (window as unknown as { Sentry: { init: (options: { dsn: string; environment: string; tracesSampleRate: number }) => void } }).Sentry.init({
                                dsn: SENTRY_DSN,
                                environment: process.env.NODE_ENV,
                                tracesSampleRate: 0.1,
                            });
                        }
                    }}
                />
            )}

            {/* Page tracker with Suspense boundary for useSearchParams */}
            <Suspense fallback={null}>
                <AnalyticsPageTracker />
            </Suspense>

            {children}
        </AnalyticsContext.Provider>
    );
}

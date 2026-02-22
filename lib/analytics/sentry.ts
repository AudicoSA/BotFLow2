// Sentry Error Tracking

interface SentryScope {
    setUser: (user: { id: string; email?: string } | null) => void;
    setTag: (key: string, value: string) => void;
    setExtra: (key: string, value: unknown) => void;
}

interface SentryClient {
    captureException: (error: Error, context?: Record<string, unknown>) => string;
    captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => string;
    setUser: (user: { id: string; email?: string } | null) => void;
    configureScope: (callback: (scope: SentryScope) => void) => void;
}

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';

class SentryErrorTracking implements SentryClient {
    private enabled: boolean;
    private userId: string | null = null;
    private organizationId: string | null = null;

    constructor() {
        this.enabled = !!SENTRY_DSN;
    }

    isEnabled(): boolean {
        return this.enabled;
    }

    private getSentry(): { captureException: (error: Error, context?: Record<string, unknown>) => string; captureMessage: (message: string, level?: string) => string; setUser: (user: { id: string; email?: string } | null) => void; configureScope: (callback: (scope: SentryScope) => void) => void } | null {
        if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { captureException: (error: Error, context?: Record<string, unknown>) => string; captureMessage: (message: string, level?: string) => string; setUser: (user: { id: string; email?: string } | null) => void; configureScope: (callback: (scope: SentryScope) => void) => void } }).Sentry) {
            return (window as unknown as { Sentry: { captureException: (error: Error, context?: Record<string, unknown>) => string; captureMessage: (message: string, level?: string) => string; setUser: (user: { id: string; email?: string } | null) => void; configureScope: (callback: (scope: SentryScope) => void) => void } }).Sentry;
        }
        return null;
    }

    captureException(error: Error, context?: Record<string, unknown>): string {
        if (!this.enabled) {
            console.error('Sentry not enabled, logging error:', error);
            return '';
        }

        const sentry = this.getSentry();
        if (sentry) {
            return sentry.captureException(error, {
                extra: {
                    ...context,
                    userId: this.userId,
                    organizationId: this.organizationId,
                },
            });
        }

        console.error('Error captured:', error, context);
        return '';
    }

    captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): string {
        if (!this.enabled) {
            console.log(`[${level}] ${message}`);
            return '';
        }

        const sentry = this.getSentry();
        if (sentry) {
            return sentry.captureMessage(message, level);
        }

        console.log(`[${level}] ${message}`);
        return '';
    }

    setUser(user: { id: string; email?: string } | null): void {
        this.userId = user?.id || null;

        const sentry = this.getSentry();
        if (sentry) {
            sentry.setUser(user);
        }
    }

    setOrganization(organizationId: string): void {
        this.organizationId = organizationId;

        const sentry = this.getSentry();
        if (sentry) {
            sentry.configureScope((scope: SentryScope) => {
                scope.setTag('organization_id', organizationId);
            });
        }
    }

    configureScope(callback: (scope: SentryScope) => void): void {
        const sentry = this.getSentry();
        if (sentry) {
            sentry.configureScope(callback);
        }
    }

    // Breadcrumb tracking
    addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
        if (typeof window !== 'undefined' && (window as unknown as { Sentry?: { addBreadcrumb: (breadcrumb: { message: string; category: string; data?: Record<string, unknown>; timestamp: number }) => void } }).Sentry) {
            (window as unknown as { Sentry: { addBreadcrumb: (breadcrumb: { message: string; category: string; data?: Record<string, unknown>; timestamp: number }) => void } }).Sentry.addBreadcrumb({
                message,
                category,
                data,
                timestamp: Date.now() / 1000,
            });
        }
    }
}

// Singleton instance
export const sentry = new SentryErrorTracking();

// Convenience functions
export function captureException(error: Error, context?: Record<string, unknown>): string {
    return sentry.captureException(error, context);
}

export function captureMessage(message: string, level?: 'info' | 'warning' | 'error'): string {
    return sentry.captureMessage(message, level);
}

export function setSentryUser(user: { id: string; email?: string } | null): void {
    sentry.setUser(user);
}

export function setSentryOrganization(organizationId: string): void {
    sentry.setOrganization(organizationId);
}

export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>): void {
    sentry.addBreadcrumb(message, category, data);
}

// Error boundary helper
export function withErrorBoundary<T extends (...args: unknown[]) => unknown>(
    fn: T,
    context?: Record<string, unknown>
): T {
    return ((...args: unknown[]) => {
        try {
            const result = fn(...args);
            if (result instanceof Promise) {
                return result.catch((error: Error) => {
                    captureException(error, { ...context, args });
                    throw error;
                });
            }
            return result;
        } catch (error) {
            captureException(error as Error, { ...context, args });
            throw error;
        }
    }) as T;
}

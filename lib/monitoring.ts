/**
 * Monitoring and Alerting Configuration for BotFlow
 * Integrates with various monitoring services
 */

// Environment configuration
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
const PAGERDUTY_ROUTING_KEY = process.env.PAGERDUTY_ROUTING_KEY || '';
const OPSGENIE_API_KEY = process.env.OPSGENIE_API_KEY || '';
const SENTRY_DSN = process.env.SENTRY_DSN || '';

export type AlertSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface Alert {
    title: string;
    message: string;
    severity: AlertSeverity;
    source: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

export interface HealthCheckResult {
    service: string;
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    lastChecked: Date;
    message?: string;
}

// Alert thresholds configuration
export const ALERT_THRESHOLDS = {
    // Response time thresholds (milliseconds)
    responseTime: {
        warning: 1000,  // 1 second
        critical: 3000, // 3 seconds
    },
    // Error rate thresholds (percentage)
    errorRate: {
        warning: 1,     // 1%
        critical: 5,    // 5%
    },
    // CPU usage thresholds (percentage)
    cpuUsage: {
        warning: 70,
        critical: 90,
    },
    // Memory usage thresholds (percentage)
    memoryUsage: {
        warning: 75,
        critical: 90,
    },
    // Concurrent users threshold
    concurrentUsers: {
        warning: 400,
        critical: 480,
    },
    // Payment failure rate (percentage)
    paymentFailureRate: {
        warning: 2,
        critical: 5,
    },
};

// Health check endpoints
export const HEALTH_CHECK_ENDPOINTS = [
    { name: 'API Server', url: '/api/health', critical: true },
    { name: 'Database', url: '/api/health/ready', critical: true },
    { name: 'AI Assistant', url: '/api/ai-assistant/models', critical: false },
    { name: 'WhatsApp Service', url: '/api/whatsapp/connection-status', critical: false },
    { name: 'Payment Gateway', url: '/api/billing/jobs', critical: true },
];

/**
 * Send alert to Slack
 */
export async function sendSlackAlert(alert: Alert): Promise<boolean> {
    if (!SLACK_WEBHOOK_URL) return false;

    const color = {
        critical: '#dc2626',
        error: '#f97316',
        warning: '#eab308',
        info: '#3b82f6',
    }[alert.severity];

    const payload = {
        attachments: [{
            color,
            title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
            text: alert.message,
            fields: [
                { title: 'Source', value: alert.source, short: true },
                { title: 'Time', value: alert.timestamp.toISOString(), short: true },
            ],
            footer: 'BotFlow Monitoring',
        }],
    };

    try {
        const response = await fetch(SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to send Slack alert:', error);
        return false;
    }
}

/**
 * Send alert to Discord
 */
export async function sendDiscordAlert(alert: Alert): Promise<boolean> {
    if (!DISCORD_WEBHOOK_URL) return false;

    const color = {
        critical: 0xdc2626,
        error: 0xf97316,
        warning: 0xeab308,
        info: 0x3b82f6,
    }[alert.severity];

    const payload = {
        embeds: [{
            title: `[${alert.severity.toUpperCase()}] ${alert.title}`,
            description: alert.message,
            color,
            fields: [
                { name: 'Source', value: alert.source, inline: true },
                { name: 'Time', value: alert.timestamp.toISOString(), inline: true },
            ],
            footer: { text: 'BotFlow Monitoring' },
        }],
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to send Discord alert:', error);
        return false;
    }
}

/**
 * Send alert to PagerDuty
 */
export async function sendPagerDutyAlert(alert: Alert): Promise<boolean> {
    if (!PAGERDUTY_ROUTING_KEY) return false;

    const severity = {
        critical: 'critical',
        error: 'error',
        warning: 'warning',
        info: 'info',
    }[alert.severity];

    const payload = {
        routing_key: PAGERDUTY_ROUTING_KEY,
        event_action: 'trigger',
        dedup_key: `botflow-${alert.source}-${Date.now()}`,
        payload: {
            summary: `[BotFlow] ${alert.title}`,
            source: alert.source,
            severity,
            timestamp: alert.timestamp.toISOString(),
            custom_details: {
                message: alert.message,
                ...alert.metadata,
            },
        },
    };

    try {
        const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to send PagerDuty alert:', error);
        return false;
    }
}

/**
 * Send alert to OpsGenie
 */
export async function sendOpsGenieAlert(alert: Alert): Promise<boolean> {
    if (!OPSGENIE_API_KEY) return false;

    const priority = {
        critical: 'P1',
        error: 'P2',
        warning: 'P3',
        info: 'P4',
    }[alert.severity];

    const payload = {
        message: alert.title,
        description: alert.message,
        priority,
        source: alert.source,
        tags: ['botflow', alert.severity],
        details: alert.metadata,
    };

    try {
        const response = await fetch('https://api.opsgenie.com/v2/alerts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `GenieKey ${OPSGENIE_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });
        return response.ok;
    } catch (error) {
        console.error('Failed to send OpsGenie alert:', error);
        return false;
    }
}

/**
 * Send alert to all configured channels
 */
export async function sendAlert(alert: Alert): Promise<void> {
    const promises: Promise<boolean>[] = [];

    // Always try to send to all configured channels
    promises.push(sendSlackAlert(alert));
    promises.push(sendDiscordAlert(alert));

    // Only send critical/error alerts to PagerDuty/OpsGenie
    if (alert.severity === 'critical' || alert.severity === 'error') {
        promises.push(sendPagerDutyAlert(alert));
        promises.push(sendOpsGenieAlert(alert));
    }

    await Promise.allSettled(promises);
}

/**
 * Run health checks on all endpoints
 */
export async function runHealthChecks(baseUrl: string): Promise<HealthCheckResult[]> {
    const results: HealthCheckResult[] = [];

    for (const endpoint of HEALTH_CHECK_ENDPOINTS) {
        const start = Date.now();
        try {
            const response = await fetch(`${baseUrl}${endpoint.url}`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            const latency = Date.now() - start;

            results.push({
                service: endpoint.name,
                status: response.ok ? 'healthy' : 'degraded',
                latency,
                lastChecked: new Date(),
                message: response.ok ? undefined : `HTTP ${response.status}`,
            });

            // Alert if critical service is down
            if (!response.ok && endpoint.critical) {
                await sendAlert({
                    title: `${endpoint.name} Service Degraded`,
                    message: `Health check failed with status ${response.status}`,
                    severity: 'error',
                    source: 'health-check',
                    timestamp: new Date(),
                });
            }
        } catch (error) {
            const latency = Date.now() - start;
            results.push({
                service: endpoint.name,
                status: 'down',
                latency,
                lastChecked: new Date(),
                message: error instanceof Error ? error.message : 'Unknown error',
            });

            // Alert if critical service is down
            if (endpoint.critical) {
                await sendAlert({
                    title: `${endpoint.name} Service Down`,
                    message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'critical',
                    source: 'health-check',
                    timestamp: new Date(),
                });
            }
        }
    }

    return results;
}

/**
 * Initialize Sentry error tracking
 */
export function initSentry(): void {
    if (!SENTRY_DSN) {
        console.warn('Sentry DSN not configured - error tracking disabled');
        return;
    }

    // Sentry initialization would go here
    // This is a placeholder for the actual Sentry SDK initialization
    console.log('Sentry initialized with DSN:', SENTRY_DSN.substring(0, 20) + '...');
}

/**
 * Monitoring metrics collection
 */
export interface MetricsSnapshot {
    timestamp: Date;
    responseTime: {
        avg: number;
        p50: number;
        p95: number;
        p99: number;
    };
    errorRate: number;
    requestsPerSecond: number;
    activeUsers: number;
    cpuUsage: number;
    memoryUsage: number;
}

/**
 * Check metrics against thresholds and trigger alerts
 */
export async function checkMetricsThresholds(metrics: MetricsSnapshot): Promise<void> {
    const alerts: Alert[] = [];

    // Response time checks
    if (metrics.responseTime.p95 > ALERT_THRESHOLDS.responseTime.critical) {
        alerts.push({
            title: 'Critical Response Time',
            message: `P95 response time is ${metrics.responseTime.p95}ms (threshold: ${ALERT_THRESHOLDS.responseTime.critical}ms)`,
            severity: 'critical',
            source: 'metrics',
            timestamp: new Date(),
            metadata: { responseTime: metrics.responseTime },
        });
    } else if (metrics.responseTime.p95 > ALERT_THRESHOLDS.responseTime.warning) {
        alerts.push({
            title: 'High Response Time',
            message: `P95 response time is ${metrics.responseTime.p95}ms (threshold: ${ALERT_THRESHOLDS.responseTime.warning}ms)`,
            severity: 'warning',
            source: 'metrics',
            timestamp: new Date(),
        });
    }

    // Error rate checks
    if (metrics.errorRate > ALERT_THRESHOLDS.errorRate.critical) {
        alerts.push({
            title: 'Critical Error Rate',
            message: `Error rate is ${metrics.errorRate}% (threshold: ${ALERT_THRESHOLDS.errorRate.critical}%)`,
            severity: 'critical',
            source: 'metrics',
            timestamp: new Date(),
        });
    } else if (metrics.errorRate > ALERT_THRESHOLDS.errorRate.warning) {
        alerts.push({
            title: 'High Error Rate',
            message: `Error rate is ${metrics.errorRate}% (threshold: ${ALERT_THRESHOLDS.errorRate.warning}%)`,
            severity: 'warning',
            source: 'metrics',
            timestamp: new Date(),
        });
    }

    // Concurrent users check
    if (metrics.activeUsers > ALERT_THRESHOLDS.concurrentUsers.critical) {
        alerts.push({
            title: 'Approaching User Capacity',
            message: `${metrics.activeUsers} concurrent users (threshold: ${ALERT_THRESHOLDS.concurrentUsers.critical})`,
            severity: 'critical',
            source: 'metrics',
            timestamp: new Date(),
        });
    } else if (metrics.activeUsers > ALERT_THRESHOLDS.concurrentUsers.warning) {
        alerts.push({
            title: 'High User Load',
            message: `${metrics.activeUsers} concurrent users (threshold: ${ALERT_THRESHOLDS.concurrentUsers.warning})`,
            severity: 'warning',
            source: 'metrics',
            timestamp: new Date(),
        });
    }

    // Send all alerts
    for (const alert of alerts) {
        await sendAlert(alert);
    }
}

const monitoring = {
    sendAlert,
    runHealthChecks,
    checkMetricsThresholds,
    initSentry,
    ALERT_THRESHOLDS,
    HEALTH_CHECK_ENDPOINTS,
};

export default monitoring;

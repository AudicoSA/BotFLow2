/**
 * Load Testing Script for BotFlow
 * Target: 100-500 concurrent users
 *
 * Usage with k6:
 *   k6 run scripts/load-test.k6.js
 *
 * Or with Artillery:
 *   artillery run scripts/load-test.yml
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiLatency = new Trend('api_latency');
const pageLoadTime = new Trend('page_load_time');
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');

// Configuration
export const options = {
    scenarios: {
        smoke_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 10 },
                { duration: '2m', target: 50 },
                { duration: '3m', target: 100 },
                { duration: '5m', target: 100 },
                { duration: '2m', target: 200 },
                { duration: '5m', target: 200 },
                { duration: '2m', target: 500 },
                { duration: '5m', target: 500 },
                { duration: '3m', target: 0 },
            ],
            gracefulRampDown: '30s',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.05'],
        errors: ['rate<0.1'],
        api_latency: ['p(99)<3000'],
    },
};

const BASE_URL = __ENV.BASE_URL || 'https://botflow.co.za';
const API_URL = __ENV.API_URL || 'https://api.botflow.co.za';

const TEST_USERS = [
    { email: 'loadtest1@example.com', password: 'LoadTest123!' },
    { email: 'loadtest2@example.com', password: 'LoadTest123!' },
    { email: 'loadtest3@example.com', password: 'LoadTest123!' },
    { email: 'loadtest4@example.com', password: 'LoadTest123!' },
    { email: 'loadtest5@example.com', password: 'LoadTest123!' },
];

export default function () {
    const user = TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];

    group('Landing Page', () => {
        const start = Date.now();
        const res = http.get(`${BASE_URL}/`);
        pageLoadTime.add(Date.now() - start);

        check(res, {
            'landing page status is 200': (r) => r.status === 200,
            'landing page has content': (r) => r.body && r.body.length > 0,
        }) || errorRate.add(1);

        sleep(1);
    });

    group('Pricing Page', () => {
        const res = http.get(`${BASE_URL}/pricing`);

        check(res, {
            'pricing page status is 200': (r) => r.status === 200,
        }) || errorRate.add(1);

        sleep(0.5);
    });

    group('Authentication Flow', () => {
        const start = Date.now();
        const loginRes = http.post(`${API_URL}/api/auth/login`, JSON.stringify({
            email: user.email,
            password: user.password,
        }), {
            headers: { 'Content-Type': 'application/json' },
        });
        apiLatency.add(Date.now() - start);

        let loginSuccess = false;
        try {
            const body = JSON.parse(loginRes.body);
            loginSuccess = check(loginRes, {
                'login status is 200': (r) => r.status === 200,
                'login returns token': () => body.token || body.accessToken,
            });
        } catch (e) {
            loginSuccess = false;
        }

        if (loginSuccess) {
            successfulLogins.add(1);
            const body = JSON.parse(loginRes.body);
            const token = body.token || body.accessToken;

            group('Dashboard Access', () => {
                const dashRes = http.get(`${API_URL}/api/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                check(dashRes, {
                    'dashboard access successful': (r) => r.status === 200,
                }) || errorRate.add(1);
            });

            group('AI Assistant API', () => {
                const chatStart = Date.now();
                const chatRes = http.post(`${API_URL}/api/ai-assistant/chat`, JSON.stringify({
                    message: 'Hello, this is a load test message',
                    conversationId: null,
                }), {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: '30s',
                });
                apiLatency.add(Date.now() - chatStart);

                check(chatRes, {
                    'chat API responds': (r) => r.status === 200 || r.status === 201,
                }) || errorRate.add(1);
            });

            group('Usage Metrics', () => {
                const usageRes = http.get(`${API_URL}/api/billing/usage`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                check(usageRes, {
                    'usage API responds': (r) => r.status === 200,
                }) || errorRate.add(1);
            });
        } else {
            failedLogins.add(1);
            errorRate.add(1);
        }

        sleep(2);
    });

    group('Checkout Flow', () => {
        const checkoutRes = http.post(`${API_URL}/api/checkout`, JSON.stringify({
            plan: 'ai_assistant',
            billingCycle: 'monthly',
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

        check(checkoutRes, {
            'checkout initiates': (r) => r.status === 200 || r.status === 302,
        }) || errorRate.add(1);

        sleep(1);
    });

    group('Health Checks', () => {
        const healthRes = http.get(`${API_URL}/api/health`);
        const liveRes = http.get(`${API_URL}/api/health/live`);
        const readyRes = http.get(`${API_URL}/api/health/ready`);

        check(healthRes, { 'health check passes': (r) => r.status === 200 });
        check(liveRes, { 'liveness check passes': (r) => r.status === 200 });
        check(readyRes, { 'readiness check passes': (r) => r.status === 200 });

        sleep(0.5);
    });

    sleep(Math.random() * 3 + 1);
}

export function handleSummary(data) {
    const metrics = data.metrics || {};
    const httpReqs = metrics.http_reqs || { values: {} };
    const httpReqFailed = metrics.http_req_failed || { values: {} };
    const httpReqDuration = metrics.http_req_duration || { values: {} };
    const vusMax = metrics.vus_max || { values: {} };

    const summary = `
===============================
LOAD TEST SUMMARY - BOTFLOW
===============================
Total Requests: ${httpReqs.values.count || 0}
Success Rate: ${(100 - (httpReqFailed.values.rate || 0) * 100).toFixed(2)}%
Avg Response Time: ${(httpReqDuration.values.avg || 0).toFixed(2)}ms
P95 Response Time: ${(httpReqDuration.values['p(95)'] || 0).toFixed(2)}ms
P99 Response Time: ${(httpReqDuration.values['p(99)'] || 0).toFixed(2)}ms
Max VUs: ${vusMax.values.max || 0}
===============================
`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>BotFlow Load Test Results</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        h1 { color: #0ea5e9; }
        .metric { background: #f0f9ff; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .metric h3 { margin: 0 0 10px 0; color: #0369a1; }
        .value { font-size: 2em; font-weight: bold; color: #0c4a6e; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; }
    </style>
</head>
<body>
    <h1>BotFlow Load Test Results</h1>
    <p>Generated: ${new Date().toISOString()}</p>
    <div class="grid">
        <div class="metric">
            <h3>Total Requests</h3>
            <div class="value">${httpReqs.values.count || 0}</div>
        </div>
        <div class="metric">
            <h3>Success Rate</h3>
            <div class="value">${(100 - (httpReqFailed.values.rate || 0) * 100).toFixed(2)}%</div>
        </div>
        <div class="metric">
            <h3>Avg Response Time</h3>
            <div class="value">${(httpReqDuration.values.avg || 0).toFixed(2)}ms</div>
        </div>
        <div class="metric">
            <h3>P95 Response Time</h3>
            <div class="value">${(httpReqDuration.values['p(95)'] || 0).toFixed(2)}ms</div>
        </div>
    </div>
    <pre>${JSON.stringify(data, null, 2)}</pre>
</body>
</html>
`;

    return {
        'stdout': summary,
        'load-test-results.json': JSON.stringify(data, null, 2),
        'load-test-results.html': html,
    };
}

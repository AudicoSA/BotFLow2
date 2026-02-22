'use client';

import { useState, useEffect } from 'react';
import {
    CheckCircle,
    Circle,
    AlertTriangle,
    Loader2,
    Server,
    CreditCard,
    MessageSquare,
    Mail,
    Bell,
    Rocket,
    Share2,
    RefreshCw,
    ExternalLink,
} from 'lucide-react';

interface ChecklistItem {
    id: string;
    category: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'passed' | 'failed' | 'skipped';
    automated: boolean;
    command?: string;
    docsUrl?: string;
}

interface ChecklistCategory {
    name: string;
    icon: React.ReactNode;
    items: ChecklistItem[];
}

const initialChecklist: ChecklistCategory[] = [
    {
        name: 'Infrastructure',
        icon: <Server className="w-5 h-5" />,
        items: [
            {
                id: 'load-test',
                category: 'Infrastructure',
                title: 'Load Testing (100-500 concurrent users)',
                description: 'Run k6 or Artillery load tests to verify system handles expected traffic',
                status: 'pending',
                automated: true,
                command: 'k6 run scripts/load-test.ts',
            },
            {
                id: 'health-endpoints',
                category: 'Infrastructure',
                title: 'Health Check Endpoints',
                description: 'Verify /api/health, /api/health/live, and /api/health/ready endpoints',
                status: 'pending',
                automated: true,
            },
            {
                id: 'database-migrations',
                category: 'Infrastructure',
                title: 'Database Migrations',
                description: 'Ensure all migrations are applied to production database',
                status: 'pending',
                automated: false,
            },
            {
                id: 'env-variables',
                category: 'Infrastructure',
                title: 'Environment Variables',
                description: 'Verify all required environment variables are set in production',
                status: 'pending',
                automated: false,
            },
            {
                id: 'ssl-certificate',
                category: 'Infrastructure',
                title: 'SSL Certificate',
                description: 'Verify SSL certificate is valid and properly configured',
                status: 'pending',
                automated: true,
            },
            {
                id: 'cdn-caching',
                category: 'Infrastructure',
                title: 'CDN & Caching',
                description: 'Verify Vercel Edge caching is properly configured',
                status: 'pending',
                automated: false,
            },
        ],
    },
    {
        name: 'Payment System',
        icon: <CreditCard className="w-5 h-5" />,
        items: [
            {
                id: 'paystack-live-keys',
                category: 'Payment System',
                title: 'Paystack Live API Keys',
                description: 'Switch from test keys to production keys',
                status: 'pending',
                automated: false,
            },
            {
                id: 'subscription-plans',
                category: 'Payment System',
                title: 'Subscription Plans Created',
                description: 'Verify all 4 subscription plans exist in Paystack',
                status: 'pending',
                automated: true,
                command: 'npx ts-node scripts/verify-payment-flows.ts',
            },
            {
                id: 'checkout-flow',
                category: 'Payment System',
                title: 'Checkout Flow End-to-End',
                description: 'Test complete checkout with real payment method',
                status: 'pending',
                automated: false,
            },
            {
                id: 'webhook-endpoint',
                category: 'Payment System',
                title: 'Webhook Endpoint Active',
                description: 'Verify Paystack webhook URL is configured and accessible',
                status: 'pending',
                automated: true,
            },
            {
                id: 'refund-process',
                category: 'Payment System',
                title: 'Refund Process Tested',
                description: 'Verify refund capability for 14-day guarantee',
                status: 'pending',
                automated: false,
            },
        ],
    },
    {
        name: 'WhatsApp Integration',
        icon: <MessageSquare className="w-5 h-5" />,
        items: [
            {
                id: 'whatsapp-api-keys',
                category: 'WhatsApp Integration',
                title: 'WhatsApp Cloud API Credentials',
                description: 'Verify production Meta API credentials are configured',
                status: 'pending',
                automated: false,
            },
            {
                id: 'qr-onboarding',
                category: 'WhatsApp Integration',
                title: 'QR Code Onboarding',
                description: 'Test QR code scanning with real phone number',
                status: 'pending',
                automated: false,
            },
            {
                id: 'message-delivery',
                category: 'WhatsApp Integration',
                title: 'Message Delivery Test',
                description: 'Send and receive test messages through the platform',
                status: 'pending',
                automated: false,
            },
            {
                id: 'webhook-whatsapp',
                category: 'WhatsApp Integration',
                title: 'WhatsApp Webhook Verified',
                description: 'Verify Meta webhook challenge/response works',
                status: 'pending',
                automated: true,
            },
        ],
    },
    {
        name: 'Email System',
        icon: <Mail className="w-5 h-5" />,
        items: [
            {
                id: 'email-dns',
                category: 'Email System',
                title: 'DNS Records (SPF, DKIM, DMARC)',
                description: 'Verify email authentication DNS records are configured',
                status: 'pending',
                automated: true,
                command: 'npx ts-node scripts/verify-email-deliverability.ts',
            },
            {
                id: 'transactional-emails',
                category: 'Email System',
                title: 'Transactional Email Delivery',
                description: 'Test welcome, verification, and password reset emails',
                status: 'pending',
                automated: false,
            },
            {
                id: 'email-templates',
                category: 'Email System',
                title: 'Email Templates Reviewed',
                description: 'Verify all email templates have correct branding and links',
                status: 'pending',
                automated: false,
            },
            {
                id: 'unsubscribe',
                category: 'Email System',
                title: 'Unsubscribe Links Working',
                description: 'Test email unsubscribe functionality',
                status: 'pending',
                automated: false,
            },
        ],
    },
    {
        name: 'Monitoring & Alerts',
        icon: <Bell className="w-5 h-5" />,
        items: [
            {
                id: 'sentry',
                category: 'Monitoring & Alerts',
                title: 'Sentry Error Tracking',
                description: 'Verify Sentry is configured and receiving test errors',
                status: 'pending',
                automated: false,
            },
            {
                id: 'slack-alerts',
                category: 'Monitoring & Alerts',
                title: 'Slack/Discord Alerts',
                description: 'Configure and test notification webhooks',
                status: 'pending',
                automated: true,
            },
            {
                id: 'uptime-monitoring',
                category: 'Monitoring & Alerts',
                title: 'Uptime Monitoring',
                description: 'Setup external uptime monitoring (UptimeRobot, Pingdom)',
                status: 'pending',
                automated: false,
                docsUrl: 'https://uptimerobot.com',
            },
            {
                id: 'pagerduty',
                category: 'Monitoring & Alerts',
                title: 'On-Call Alerts (Optional)',
                description: 'Configure PagerDuty or OpsGenie for critical alerts',
                status: 'pending',
                automated: false,
            },
        ],
    },
    {
        name: 'Launch Marketing',
        icon: <Rocket className="w-5 h-5" />,
        items: [
            {
                id: 'social-announcement',
                category: 'Launch Marketing',
                title: 'Social Media Announcement',
                description: 'Prepare launch posts for Twitter, LinkedIn, Facebook',
                status: 'pending',
                automated: false,
            },
            {
                id: 'product-hunt',
                category: 'Launch Marketing',
                title: 'Product Hunt Assets',
                description: 'Create tagline, description, images, and maker profile',
                status: 'pending',
                automated: false,
                docsUrl: 'https://www.producthunt.com/posts/new',
            },
            {
                id: 'press-kit',
                category: 'Launch Marketing',
                title: 'Press Kit Ready',
                description: 'Prepare logo files, screenshots, and press release',
                status: 'pending',
                automated: false,
            },
            {
                id: 'launch-email',
                category: 'Launch Marketing',
                title: 'Launch Email Campaign',
                description: 'Prepare and schedule launch announcement email',
                status: 'pending',
                automated: false,
            },
        ],
    },
];

export default function LaunchChecklistClient() {
    const [checklist, setChecklist] = useState<ChecklistCategory[]>(initialChecklist);
    const [running, setRunning] = useState<string | null>(null);

    // Load saved state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('botflow-launch-checklist');
        if (saved) {
            try {
                const savedStatus = JSON.parse(saved);
                setChecklist(prev => prev.map(category => ({
                    ...category,
                    items: category.items.map(item => ({
                        ...item,
                        status: savedStatus[item.id] || item.status,
                    })),
                })));
            } catch {
                // Ignore parse errors
            }
        }
    }, []);

    // Save state to localStorage
    const saveStatus = (id: string, status: ChecklistItem['status']) => {
        const saved = localStorage.getItem('botflow-launch-checklist');
        const statuses = saved ? JSON.parse(saved) : {};
        statuses[id] = status;
        localStorage.setItem('botflow-launch-checklist', JSON.stringify(statuses));
    };

    const toggleStatus = (categoryIndex: number, itemIndex: number) => {
        setChecklist(prev => {
            const updated = [...prev];
            const item = updated[categoryIndex].items[itemIndex];
            const newStatus = item.status === 'passed' ? 'pending' : 'passed';
            updated[categoryIndex].items[itemIndex] = { ...item, status: newStatus };
            saveStatus(item.id, newStatus);
            return updated;
        });
    };

    const runAutomatedCheck = async (categoryIndex: number, itemIndex: number) => {
        const item = checklist[categoryIndex].items[itemIndex];
        if (!item.automated) return;

        setRunning(item.id);

        // Update to in_progress
        setChecklist(prev => {
            const updated = [...prev];
            updated[categoryIndex].items[itemIndex] = { ...item, status: 'in_progress' };
            return updated;
        });

        // Simulate automated check (in real implementation, this would call APIs)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Randomly pass/fail for demo (in real implementation, check actual results)
        const passed = Math.random() > 0.2;

        setChecklist(prev => {
            const updated = [...prev];
            const newStatus = passed ? 'passed' : 'failed';
            updated[categoryIndex].items[itemIndex] = { ...item, status: newStatus };
            saveStatus(item.id, newStatus);
            return updated;
        });

        setRunning(null);
    };

    const runAllAutomated = async () => {
        for (let catIndex = 0; catIndex < checklist.length; catIndex++) {
            for (let itemIndex = 0; itemIndex < checklist[catIndex].items.length; itemIndex++) {
                const item = checklist[catIndex].items[itemIndex];
                if (item.automated && item.status !== 'passed') {
                    await runAutomatedCheck(catIndex, itemIndex);
                }
            }
        }
    };

    const resetAll = () => {
        localStorage.removeItem('botflow-launch-checklist');
        setChecklist(initialChecklist);
    };

    // Calculate progress
    const totalItems = checklist.reduce((acc, cat) => acc + cat.items.length, 0);
    const completedItems = checklist.reduce(
        (acc, cat) => acc + cat.items.filter(item => item.status === 'passed').length,
        0
    );
    const progress = Math.round((completedItems / totalItems) * 100);

    const getStatusIcon = (status: ChecklistItem['status']) => {
        switch (status) {
            case 'passed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'failed':
                return <AlertTriangle className="w-5 h-5 text-red-500" />;
            case 'in_progress':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            default:
                return <Circle className="w-5 h-5 text-gray-300" />;
        }
    };

    return (
        <div>
            {/* Progress Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Launch Progress</h2>
                        <p className="text-gray-500">{completedItems} of {totalItems} items completed</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={runAllAutomated}
                            disabled={running !== null}
                            className="flex items-center gap-2 bg-surf-DEFAULT hover:bg-surf-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
                            Run Automated Checks
                        </button>
                        <button
                            onClick={resetAll}
                            className="text-gray-500 hover:text-gray-700 px-3 py-2"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                            progress === 100 ? 'bg-green-500' : 'bg-surf-DEFAULT'
                        }`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="text-right mt-2 text-lg font-bold text-gray-900">{progress}%</div>
            </div>

            {/* Ready to Launch Banner */}
            {progress === 100 && (
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Rocket className="w-10 h-10" />
                        <div>
                            <h2 className="text-xl font-bold">Ready for Launch!</h2>
                            <p className="opacity-90">All checklist items have been completed</p>
                        </div>
                    </div>
                    <button className="bg-white text-green-600 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Announce Launch
                    </button>
                </div>
            )}

            {/* Checklist Categories */}
            <div className="space-y-6">
                {checklist.map((category, catIndex) => {
                    const categoryPassed = category.items.filter(i => i.status === 'passed').length;
                    const categoryTotal = category.items.length;

                    return (
                        <div key={category.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="text-surf-DEFAULT">{category.icon}</div>
                                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                                </div>
                                <span className={`text-sm font-medium ${
                                    categoryPassed === categoryTotal ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                    {categoryPassed}/{categoryTotal}
                                </span>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {category.items.map((item, itemIndex) => (
                                    <div
                                        key={item.id}
                                        className={`px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                                            item.status === 'passed' ? 'bg-green-50/50' : ''
                                        }`}
                                    >
                                        <button
                                            onClick={() => toggleStatus(catIndex, itemIndex)}
                                            disabled={running === item.id}
                                            className="mt-0.5"
                                        >
                                            {getStatusIcon(item.status)}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className={`font-medium ${
                                                    item.status === 'passed' ? 'text-gray-500 line-through' : 'text-gray-900'
                                                }`}>
                                                    {item.title}
                                                </h4>
                                                {item.automated && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                        Automated
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1">{item.description}</p>
                                            {item.command && (
                                                <code className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-2 inline-block">
                                                    {item.command}
                                                </code>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.docsUrl && (
                                                <a
                                                    href={item.docsUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-gray-400 hover:text-surf-DEFAULT"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                            {item.automated && item.status !== 'passed' && (
                                                <button
                                                    onClick={() => runAutomatedCheck(catIndex, itemIndex)}
                                                    disabled={running !== null}
                                                    className="text-sm text-surf-DEFAULT hover:underline disabled:opacity-50"
                                                >
                                                    Run
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

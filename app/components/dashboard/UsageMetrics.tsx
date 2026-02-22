'use client';

import { motion } from 'framer-motion';
import {
    MessageSquare,
    Bot,
    Receipt,
    TrendingUp,
    Calendar,
    Users,
} from 'lucide-react';
import type { UsageMetrics as UsageMetricsType } from '@/lib/dashboard/types';
import { formatCurrency } from '@/lib/dashboard/types';

interface UsageMetricsProps {
    metrics: UsageMetricsType;
    showDetailed?: boolean;
}

export default function UsageMetrics({
    metrics,
    showDetailed = false,
}: UsageMetricsProps) {
    const periodLabel = `${new Date(metrics.periodStart).toLocaleDateString('en-ZA', {
        month: 'short',
        day: 'numeric',
    })} - ${new Date(metrics.periodEnd).toLocaleDateString('en-ZA', {
        month: 'short',
        day: 'numeric',
    })}`;

    const summaryMetrics = [
        {
            label: 'AI Conversations',
            value: metrics.aiConversations,
            icon: Bot,
            color: 'violet',
            change: '+12%',
            positive: true,
        },
        {
            label: 'WhatsApp Messages',
            value: metrics.whatsappMessagesSent + metrics.whatsappMessagesReceived,
            icon: MessageSquare,
            color: 'green',
            change: '+8%',
            positive: true,
        },
        {
            label: 'Receipts Processed',
            value: metrics.receiptsProcessed,
            icon: Receipt,
            color: 'amber',
            change: '+24%',
            positive: true,
        },
        {
            label: 'Total Expenses',
            value: formatCurrency(metrics.totalExpenseAmount),
            icon: TrendingUp,
            color: 'blue',
            isText: true,
        },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Usage Overview
                    </h2>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {periodLabel}
                    </p>
                </div>
                <button className="text-sm text-surf-cyan hover:text-surf-dark font-medium">
                    View Details
                </button>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryMetrics.map((metric, index) => {
                    const Icon = metric.icon;
                    const bgColor = `bg-${metric.color}-50`;
                    const textColor = `text-${metric.color}-600`;

                    return (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                        metric.color === 'violet'
                                            ? 'bg-violet-100'
                                            : metric.color === 'green'
                                            ? 'bg-green-100'
                                            : metric.color === 'amber'
                                            ? 'bg-amber-100'
                                            : 'bg-blue-100'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 ${
                                            metric.color === 'violet'
                                                ? 'text-violet-600'
                                                : metric.color === 'green'
                                                ? 'text-green-600'
                                                : metric.color === 'amber'
                                                ? 'text-amber-600'
                                                : 'text-blue-600'
                                        }`}
                                    />
                                </div>
                                {metric.change && (
                                    <span
                                        className={`text-xs font-medium ${
                                            metric.positive
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}
                                    >
                                        {metric.change}
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold text-gray-900">
                                {metric.isText
                                    ? metric.value
                                    : (metric.value as number).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {metric.label}
                            </p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Detailed Breakdown (if enabled) */}
            {showDetailed && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                        Detailed Breakdown
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* AI Assistant Details */}
                        <div className="p-4 rounded-xl bg-violet-50">
                            <h4 className="text-sm font-medium text-violet-700 mb-3 flex items-center gap-2">
                                <Bot className="w-4 h-4" />
                                AI Assistant
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Conversations</span>
                                    <span className="font-medium text-gray-900">
                                        {metrics.aiConversations.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Messages</span>
                                    <span className="font-medium text-gray-900">
                                        {metrics.aiMessages.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tokens Used</span>
                                    <span className="font-medium text-gray-900">
                                        {metrics.aiTokensUsed.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* WhatsApp Details */}
                        <div className="p-4 rounded-xl bg-green-50">
                            <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                WhatsApp
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Sent</span>
                                    <span className="font-medium text-gray-900">
                                        {metrics.whatsappMessagesSent.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Received</span>
                                    <span className="font-medium text-gray-900">
                                        {metrics.whatsappMessagesReceived.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Active Contacts</span>
                                    <span className="font-medium text-gray-900 flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {metrics.whatsappActiveContacts.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Details */}
                        <div className="p-4 rounded-xl bg-amber-50">
                            <h4 className="text-sm font-medium text-amber-700 mb-3 flex items-center gap-2">
                                <Receipt className="w-4 h-4" />
                                Receipts
                            </h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Processed</span>
                                    <span className="font-medium text-gray-900">
                                        {metrics.receiptsProcessed.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Total Spent</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(metrics.totalExpenseAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Categories</span>
                                    <span className="font-medium text-gray-900">
                                        {metrics.categoriesUsed}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

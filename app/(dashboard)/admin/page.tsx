'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    DollarSign,
    Users,
    TrendingUp,
    TrendingDown,
    Activity,
    BarChart3,
    PieChart,
    RefreshCw,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Zap,
    Target,
    AlertCircle,
} from 'lucide-react';
import type {
    SaaSMetrics,
    MRRBreakdown,
    ChurnAnalysis,
    ActivationFunnel,
    DailyMetrics,
} from '@/lib/analytics/types';

interface AdminDashboardData {
    metrics: SaaSMetrics;
    mrr: MRRBreakdown;
    churn: ChurnAnalysis;
    funnel: ActivationFunnel;
    daily: DailyMetrics[];
    generatedAt: string;
}

function formatCurrency(cents: number): string {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR',
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

function formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-ZA').format(value);
}

export default function AdminDashboard() {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/admin/metrics');
            if (!response.ok) {
                throw new Error('Failed to fetch metrics');
            }
            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load metrics');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-surf-cyan animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading metrics...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-900 font-medium mb-2">Failed to load metrics</p>
                    <p className="text-gray-500 mb-4">{error}</p>
                    <button
                        onClick={fetchMetrics}
                        className="px-4 py-2 bg-surf-cyan text-white rounded-lg hover:bg-surf-dark transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const { metrics, mrr, churn, funnel, daily } = data;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 mt-1">
                            Key SaaS metrics and analytics
                        </p>
                    </div>
                    <button
                        onClick={fetchMetrics}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* MRR */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            {mrr.newMRR > 0 && (
                                <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <ArrowUpRight className="w-3 h-3" />
                                    +{formatCurrency(mrr.newMRR)}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Monthly Recurring Revenue</p>
                        <p className="text-3xl font-bold text-gray-900">{formatCurrency(metrics.mrr)}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            ARR: {formatCurrency(metrics.arr)}
                        </p>
                    </motion.div>

                    {/* Active Subscriptions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Active Subscriptions</p>
                        <p className="text-3xl font-bold text-gray-900">{formatNumber(metrics.activeSubscriptions)}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            ARPU: {formatCurrency(metrics.arpu)}/mo
                        </p>
                    </motion.div>

                    {/* Churn Rate */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                {churn.trend === 'down' ? (
                                    <TrendingDown className="w-6 h-6 text-amber-600" />
                                ) : (
                                    <TrendingUp className="w-6 h-6 text-amber-600" />
                                )}
                            </div>
                            <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                                churn.trend === 'down'
                                    ? 'text-green-600 bg-green-50'
                                    : churn.trend === 'up'
                                    ? 'text-red-600 bg-red-50'
                                    : 'text-gray-600 bg-gray-50'
                            }`}>
                                {churn.trend === 'down' ? (
                                    <ArrowDownRight className="w-3 h-3" />
                                ) : churn.trend === 'up' ? (
                                    <ArrowUpRight className="w-3 h-3" />
                                ) : null}
                                {churn.trend === 'stable' ? 'Stable' : `vs ${formatPercentage(churn.previousMonth)}`}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Monthly Churn Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{formatPercentage(metrics.churnRate)}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Churned MRR: {formatCurrency(mrr.churnedMRR)}
                        </p>
                    </motion.div>

                    {/* Activation Rate */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-violet-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Activation Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{formatPercentage(metrics.activationRate)}</p>
                        <p className="text-xs text-gray-400 mt-2">
                            Trial Conversion: {formatPercentage(metrics.trialConversionRate)}
                        </p>
                    </motion.div>
                </div>

                {/* Secondary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Users */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.totalUsers)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Active Users */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Activity className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Users (30d)</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.activeUsers)}</p>
                            </div>
                        </div>
                    </div>

                    {/* LTV */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Target className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Est. Lifetime Value</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.ltv)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* MRR by Plan */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <PieChart className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">MRR by Plan</h2>
                                <p className="text-sm text-gray-500">Revenue distribution</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {mrr.byPlan.map((plan) => (
                                <div key={plan.planId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-surf-cyan" />
                                        <div>
                                            <p className="font-medium text-gray-900">{plan.planName}</p>
                                            <p className="text-sm text-gray-500">{plan.count} subscribers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-gray-900">{formatCurrency(plan.mrr)}</p>
                                        <p className="text-sm text-gray-500">
                                            {mrr.total > 0 ? formatPercentage((plan.mrr / mrr.total) * 100) : '0%'}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {mrr.byPlan.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No subscription data yet</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Activation Funnel */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="w-5 h-5 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Activation Funnel</h2>
                                <p className="text-sm text-gray-500">Last 30 days</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { label: 'Signups', value: funnel.signup, color: 'bg-blue-500' },
                                { label: 'Started Onboarding', value: funnel.onboardingStarted, color: 'bg-cyan-500' },
                                { label: 'First Action', value: funnel.firstAction, color: 'bg-green-500' },
                                { label: 'Subscribed', value: funnel.subscribed, color: 'bg-violet-500' },
                                { label: 'Retained 30d', value: funnel.retained30Days, color: 'bg-amber-500' },
                            ].map((step, index) => {
                                const maxValue = funnel.signup || 1;
                                const percentage = (step.value / maxValue) * 100;

                                return (
                                    <div key={step.label}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-gray-600">{step.label}</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {formatNumber(step.value)}
                                                {index > 0 && funnel.signup > 0 && (
                                                    <span className="text-gray-400 ml-1">
                                                        ({formatPercentage((step.value / funnel.signup) * 100)})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${step.color} rounded-full transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Churn Analysis */}
                {churn.byReason.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-gray-900">Churn Reasons</h2>
                                <p className="text-sm text-gray-500">Why customers are leaving</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {churn.byReason.map((reason) => (
                                <div key={reason.reason} className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 capitalize mb-1">
                                        {reason.reason.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">{reason.count}</p>
                                    <p className="text-xs text-gray-400">{formatPercentage(reason.percentage)}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Daily Metrics Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Daily Metrics</h2>
                            <p className="text-sm text-gray-500">Last 30 days activity</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="flex items-end gap-1 h-40">
                                {daily.slice(-30).map((day, index) => {
                                    const maxSignups = Math.max(...daily.map(d => d.signups), 1);
                                    const height = (day.signups / maxSignups) * 100;

                                    return (
                                        <div
                                            key={day.date}
                                            className="flex-1 flex flex-col items-center"
                                            title={`${day.date}: ${day.signups} signups, ${formatCurrency(day.revenue)} revenue`}
                                        >
                                            <div
                                                className="w-full bg-surf-cyan/80 hover:bg-surf-cyan rounded-t transition-colors"
                                                style={{ height: `${Math.max(height, 4)}%` }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex justify-between mt-2 text-xs text-gray-400">
                                <span>{daily[0]?.date}</span>
                                <span>{daily[daily.length - 1]?.date}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-surf-cyan" />
                            <span className="text-sm text-gray-600">Signups</span>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="mt-8 text-center text-sm text-gray-400">
                    <p className="flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        Last updated: {new Date(data.generatedAt).toLocaleString()}
                    </p>
                </div>
            </div>
        </div>
    );
}

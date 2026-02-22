'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import type { ServiceType } from '@/lib/onboarding/types';
import type { ServiceStatus, QuickAction } from '@/lib/dashboard/types';
import { SERVICE_TILES, formatCurrency } from '@/lib/dashboard/types';

interface ServiceTileProps {
    service: ServiceType;
    status: ServiceStatus;
    primaryValue: number;
    secondaryValue: number | string;
    onQuickAction?: (action: QuickAction) => void;
}

export default function ServiceTile({
    service,
    status,
    primaryValue,
    secondaryValue,
    onQuickAction,
}: ServiceTileProps) {
    const config = SERVICE_TILES[service];

    const getStatusBadge = () => {
        if (!status.isActive) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    <Clock className="w-3 h-3" />
                    Not Active
                </span>
            );
        }

        if (!status.isSetupComplete) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <AlertCircle className="w-3 h-3" />
                    Setup Needed
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3" />
                Active
            </span>
        );
    };

    const formatSecondaryValue = () => {
        if (typeof secondaryValue === 'number') {
            if (service === 'receipt-assistant') {
                return formatCurrency(secondaryValue);
            }
            return secondaryValue.toLocaleString();
        }
        return secondaryValue;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden ${
                !status.isActive ? 'opacity-75' : ''
            }`}
        >
            {/* Top color accent */}
            <div className={`h-1.5 ${config.bgColor.replace('50', '400')}`} />

            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center text-2xl`}
                        >
                            {config.icon}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">
                                {config.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                                {config.description}
                            </p>
                        </div>
                    </div>
                    {getStatusBadge()}
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-5">
                    <div className={`p-3 rounded-xl ${config.bgColor}`}>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {config.primaryMetric}
                        </p>
                        <p className={`text-2xl font-bold ${config.textColor}`}>
                            {primaryValue.toLocaleString()}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-50">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                            {config.secondaryMetric}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                            {formatSecondaryValue()}
                        </p>
                    </div>
                </div>

                {/* Setup Progress (if incomplete) */}
                {status.isActive && !status.isSetupComplete && (
                    <div className="mb-5">
                        <div className="flex items-center justify-between text-sm mb-1.5">
                            <span className="text-gray-600">Setup Progress</span>
                            <span className={`font-medium ${config.textColor}`}>
                                {status.setupProgress}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${status.setupProgress}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className={`h-full ${config.bgColor.replace('50', '400')}`}
                            />
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-2">
                    {config.quickActions.slice(0, 3).map((action) => (
                        <Link
                            key={action.id}
                            href={status.isActive ? action.url : `/checkout?plan=${service}`}
                            className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                                action.isPrimary
                                    ? `${config.bgColor} hover:shadow-md`
                                    : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                            onClick={() => onQuickAction?.(action)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-lg">{action.icon}</span>
                                <div>
                                    <p
                                        className={`font-medium text-sm ${
                                            action.isPrimary
                                                ? config.textColor
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {status.isActive ? action.label : 'Activate Service'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {status.isActive ? action.description : 'Start your free trial'}
                                    </p>
                                </div>
                            </div>
                            <ArrowRight
                                className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                                    action.isPrimary ? config.textColor : 'text-gray-400'
                                }`}
                            />
                        </Link>
                    ))}
                </div>

                {/* Last Activity */}
                {status.lastActivity && status.isActive && (
                    <p className="text-xs text-gray-400 mt-4 text-center">
                        Last activity: {status.lastActivity}
                    </p>
                )}
            </div>
        </motion.div>
    );
}

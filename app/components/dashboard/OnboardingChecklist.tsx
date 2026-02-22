'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    CheckCircle2,
    Circle,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Sparkles,
    X,
} from 'lucide-react';
import type { OnboardingTask } from '@/lib/dashboard/types';
import type { ServiceType } from '@/lib/onboarding/types';
import { SERVICE_TILES } from '@/lib/dashboard/types';

interface OnboardingChecklistProps {
    tasks: OnboardingTask[];
    onDismiss?: () => void;
}

export default function OnboardingChecklist({
    tasks,
    onDismiss,
}: OnboardingChecklistProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    const completedTasks = tasks.filter((t) => t.isComplete);
    const pendingTasks = tasks.filter((t) => !t.isComplete);
    const progress = Math.round((completedTasks.length / tasks.length) * 100);

    // Don't show if all tasks are complete
    if (completedTasks.length === tasks.length) {
        return null;
    }

    // Sort pending tasks by priority
    const sortedPendingTasks = [...pendingTasks].sort(
        (a, b) => a.priority - b.priority
    );

    const getServiceIcon = (service: ServiceType | 'general') => {
        if (service === 'general') return '✨';
        return SERVICE_TILES[service]?.icon || '📦';
    };

    const getServiceColor = (service: ServiceType | 'general') => {
        if (service === 'general') return 'bg-gray-100 text-gray-600';
        const config = SERVICE_TILES[service];
        return `${config.bgColor} ${config.textColor}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-surf-cyan/5 via-white to-sunset-pink/5 rounded-2xl border border-surf-cyan/20 overflow-hidden"
        >
            {/* Header */}
            <div
                className="p-4 sm:p-5 cursor-pointer hover:bg-surf-cyan/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surf-cyan/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-surf-cyan" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">
                                Complete Your Setup
                            </h2>
                            <p className="text-sm text-gray-500">
                                {completedTasks.length} of {tasks.length} tasks complete
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Progress Circle */}
                        <div className="relative w-12 h-12">
                            <svg className="w-12 h-12 -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-gray-200"
                                />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={`${progress * 1.26} 126`}
                                    className="text-surf-cyan transition-all duration-500"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-surf-cyan">
                                {progress}%
                            </span>
                        </div>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5" />
                            ) : (
                                <ChevronDown className="w-5 h-5" />
                            )}
                        </button>
                        {onDismiss && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDismiss();
                                }}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-surf-cyan to-surf-dark"
                    />
                </div>
            </div>

            {/* Task List */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100"
                    >
                        <div className="p-4 sm:p-5 space-y-3">
                            {/* Pending Tasks */}
                            {sortedPendingTasks.map((task, index) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link
                                        href={task.actionUrl}
                                        className="group flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:border-surf-cyan/30 hover:shadow-sm transition-all"
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${getServiceColor(
                                                task.service
                                            )}`}
                                        >
                                            <span className="text-sm">
                                                {getServiceIcon(task.service)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm">
                                                {task.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {task.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-surf-cyan font-medium hidden sm:inline">
                                                {task.actionLabel}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-surf-cyan group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Completed Tasks (collapsed by default) */}
                            {completedTasks.length > 0 && (
                                <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                                        Completed
                                    </p>
                                    <div className="space-y-2">
                                        {completedTasks.slice(0, 2).map((task) => (
                                            <div
                                                key={task.id}
                                                className="flex items-center gap-3 p-2 rounded-lg opacity-60"
                                            >
                                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                <span className="text-sm text-gray-500 line-through">
                                                    {task.title}
                                                </span>
                                            </div>
                                        ))}
                                        {completedTasks.length > 2 && (
                                            <p className="text-xs text-gray-400 pl-8">
                                                +{completedTasks.length - 2} more completed
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

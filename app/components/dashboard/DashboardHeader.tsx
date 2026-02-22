'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Bell, Settings, HelpCircle, User } from 'lucide-react';

interface DashboardHeaderProps {
    organizationName: string;
    userName?: string;
}

export default function DashboardHeader({
    organizationName,
    userName,
}: DashboardHeaderProps) {
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <header className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo & Org Name */}
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-surf-cyan to-surf-dark flex items-center justify-center">
                                <span className="text-white font-bold text-sm">B</span>
                            </div>
                            <span className="font-semibold text-gray-900 hidden sm:inline">
                                BotFlow
                            </span>
                        </Link>
                        <div className="hidden sm:block h-6 w-px bg-gray-200" />
                        <span className="text-sm text-gray-600 hidden sm:inline">
                            {organizationName}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link
                            href="/help"
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <HelpCircle className="w-5 h-5" />
                        </Link>
                        <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <Link
                            href="/settings"
                            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </Link>
                        <div className="h-6 w-px bg-gray-200 mx-1" />
                        <Link
                            href="/account"
                            className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-surf-cyan/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-surf-cyan" />
                            </div>
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                                {userName || 'Account'}
                            </span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}

export function DashboardWelcome({
    userName,
}: {
    userName?: string;
}) {
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
        >
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {greeting()}
                {userName && (
                    <span className="text-surf-cyan">, {userName}</span>
                )}
            </h1>
            <p className="text-gray-500 mt-1">
                Here&apos;s what&apos;s happening with your services today.
            </p>
        </motion.div>
    );
}

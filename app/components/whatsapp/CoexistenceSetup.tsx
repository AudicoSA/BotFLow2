'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Smartphone,
    Cloud,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Info,
    Loader2,
    MessageSquare,
    RefreshCw,
} from 'lucide-react';
import {
    COEXISTENCE_INSTRUCTIONS,
    MIGRATION_CHECKLIST,
    formatMigrationStatus,
} from '@/lib/whatsapp/coexistence';
import type { CoexistenceStatus, CoexistenceMode } from '@/lib/whatsapp/types';

interface CoexistenceSetupProps {
    phoneNumberId: string;
    currentStatus: CoexistenceStatus;
    onModeChange: (mode: CoexistenceMode) => void;
    onClose: () => void;
}

type SetupStep = 'overview' | 'coexistence' | 'migration-checklist' | 'migrating' | 'complete';

export default function CoexistenceSetup({
    phoneNumberId,
    currentStatus,
    onModeChange,
    onClose,
}: CoexistenceSetupProps) {
    const [step, setStep] = useState<SetupStep>('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    const statusInfo = formatMigrationStatus(currentStatus);

    const handleEnableCoexistence = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/whatsapp/coexistence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number_id: phoneNumberId,
                    action: 'enable',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to enable coexistence mode');
            }

            onModeChange('enabled');
            setStep('complete');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartMigration = () => {
        setStep('migration-checklist');
    };

    const handleCompleteMigration = async () => {
        setIsLoading(true);
        setError(null);
        setStep('migrating');

        try {
            const response = await fetch('/api/whatsapp/coexistence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone_number_id: phoneNumberId,
                    action: 'migrate',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to complete migration');
            }

            onModeChange('migrated');
            setStep('complete');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setStep('migration-checklist');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleChecklistItem = (id: string) => {
        setCheckedItems((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const requiredItemsChecked = MIGRATION_CHECKLIST.filter((item) => item.required).every(
        (item) => checkedItems.has(item.id)
    );

    return (
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl mx-auto overflow-hidden">
            <AnimatePresence mode="wait">
                {/* Overview Step */}
                {step === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                WhatsApp Connection Mode
                            </h2>
                            <p className="text-gray-600">
                                Choose how you want to use WhatsApp with BotFlow
                            </p>
                        </div>

                        {/* Current Status */}
                        <div
                            className={`p-4 rounded-xl mb-8 flex items-center gap-3 ${
                                statusInfo.color === 'green'
                                    ? 'bg-green-50 border border-green-200'
                                    : statusInfo.color === 'yellow'
                                    ? 'bg-yellow-50 border border-yellow-200'
                                    : 'bg-gray-50 border border-gray-200'
                            }`}
                        >
                            <Info
                                className={`w-5 h-5 flex-shrink-0 ${
                                    statusInfo.color === 'green'
                                        ? 'text-green-600'
                                        : statusInfo.color === 'yellow'
                                        ? 'text-yellow-600'
                                        : 'text-gray-500'
                                }`}
                            />
                            <div>
                                <span className="font-medium text-gray-900">
                                    Current Status:
                                </span>{' '}
                                <span className="text-gray-700">{statusInfo.label}</span>
                                <p className="text-sm text-gray-600 mt-1">
                                    {statusInfo.description}
                                </p>
                            </div>
                        </div>

                        {/* Options */}
                        <div className="space-y-4 mb-8">
                            {/* Coexistence Option */}
                            <button
                                onClick={() => setStep('coexistence')}
                                className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-surf transition-colors text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-surf/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Smartphone className="w-6 h-6 text-surf" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                Coexistence Mode
                                            </h3>
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                Recommended
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mt-1">
                                            Keep using WhatsApp Business App on your phone while
                                            BotFlow handles automated responses.
                                        </p>
                                        <div className="flex items-center gap-2 text-surf mt-3 group-hover:translate-x-1 transition-transform">
                                            <span className="font-medium">Learn more</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </button>

                            {/* Full Migration Option */}
                            <button
                                onClick={handleStartMigration}
                                className="w-full p-6 rounded-xl border-2 border-gray-200 hover:border-surf transition-colors text-left group"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-ocean/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Cloud className="w-6 h-6 text-ocean" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 text-lg">
                                            Full Cloud Migration
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            Migrate completely to the Cloud API for advanced
                                            features. WhatsApp Business App will no longer work
                                            with this number.
                                        </p>
                                        <div className="flex items-center gap-2 text-ocean mt-3 group-hover:translate-x-1 transition-transform">
                                            <span className="font-medium">Start migration</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                        >
                            Close
                        </button>
                    </motion.div>
                )}

                {/* Coexistence Info Step */}
                {step === 'coexistence' && (
                    <motion.div
                        key="coexistence"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-surf/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Smartphone className="w-8 h-8 text-surf" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Coexistence Mode
                            </h2>
                            <p className="text-gray-600">
                                The best of both worlds - use your phone and BotFlow together
                            </p>
                        </div>

                        {/* Benefits */}
                        <div className="space-y-4 mb-8">
                            {COEXISTENCE_INSTRUCTIONS.map((instruction) => (
                                <div
                                    key={instruction.step}
                                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                                >
                                    <div className="w-8 h-8 bg-surf text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                        {instruction.step}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            {instruction.title}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {instruction.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleEnableCoexistence}
                            disabled={isLoading}
                            className="w-full py-4 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Enabling...
                                </>
                            ) : (
                                <>
                                    Enable Coexistence Mode
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => setStep('overview')}
                            className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium mt-3 transition-colors"
                        >
                            Back
                        </button>
                    </motion.div>
                )}

                {/* Migration Checklist Step */}
                {step === 'migration-checklist' && (
                    <motion.div
                        key="migration-checklist"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-8"
                    >
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Cloud className="w-8 h-8 text-ocean" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Migration Checklist
                            </h2>
                            <p className="text-gray-600">
                                Complete these steps before migrating to Cloud API
                            </p>
                        </div>

                        {/* Warning */}
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-yellow-800">
                                        Important: This action cannot be undone
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        After migration, you won&apos;t be able to use WhatsApp
                                        Business App with this number.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-3 mb-8">
                            {MIGRATION_CHECKLIST.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => toggleChecklistItem(item.id)}
                                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                        checkedItems.has(item.id)
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                                checkedItems.has(item.id)
                                                    ? 'bg-green-500 border-green-500'
                                                    : 'border-gray-300'
                                            }`}
                                        >
                                            {checkedItems.has(item.id) && (
                                                <CheckCircle2 className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {item.title}
                                                </h3>
                                                {item.required && (
                                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                                        Required
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                <p className="text-red-700">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleCompleteMigration}
                            disabled={!requiredItemsChecked || isLoading}
                            className="w-full py-4 bg-ocean hover:bg-ocean/90 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Complete Migration
                            <ArrowRight className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setStep('overview')}
                            className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium mt-3 transition-colors"
                        >
                            Back
                        </button>
                    </motion.div>
                )}

                {/* Migrating Step */}
                {step === 'migrating' && (
                    <motion.div
                        key="migrating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 text-center"
                    >
                        <div className="w-20 h-20 bg-ocean/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <RefreshCw className="w-10 h-10 text-ocean animate-spin" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Migrating to Cloud API
                        </h2>
                        <p className="text-gray-600">
                            Please wait while we complete the migration. This may take a few
                            moments...
                        </p>
                    </motion.div>
                )}

                {/* Complete Step */}
                {step === 'complete' && (
                    <motion.div
                        key="complete"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            Setup Complete!
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Your WhatsApp connection has been configured successfully.
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-3">
                            <MessageSquare className="w-6 h-6 text-green-600" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">
                                    Ready to send messages
                                </p>
                                <p className="text-sm text-gray-600">
                                    Your WhatsApp integration is now active
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

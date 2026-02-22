'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

type DeletionScope = 'full' | 'ai' | 'whatsapp' | 'receipt';

interface FormData {
    email: string;
    confirmEmail: string;
    scope: DeletionScope;
    reason: string;
    confirmUnderstand: boolean;
    confirmIrreversible: boolean;
}

export default function DataDeletionForm() {
    const [formData, setFormData] = useState<FormData>({
        email: '',
        confirmEmail: '',
        scope: 'full',
        reason: '',
        confirmUnderstand: false,
        confirmIrreversible: false,
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Validation
        if (formData.email !== formData.confirmEmail) {
            setErrorMessage('Email addresses do not match');
            return;
        }

        if (!formData.confirmUnderstand || !formData.confirmIrreversible) {
            setErrorMessage('Please confirm both checkboxes to proceed');
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch('/api/data-deletion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    scope: formData.scope,
                    reason: formData.reason,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to submit request');
            }

            setStatus('success');
        } catch (error) {
            setStatus('error');
            setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
        }
    };

    if (status === 'success') {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Submitted Successfully</h3>
                <p className="text-gray-600 mb-4">
                    We&apos;ve received your data deletion request. You will receive a confirmation email
                    at <strong>{formData.email}</strong> within 48 hours.
                </p>
                <p className="text-gray-500 text-sm">
                    Reference: DDR-{Date.now().toString(36).toUpperCase()}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Email Address <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-surf-DEFAULT focus:border-transparent"
                    placeholder="your@email.com"
                />
            </div>

            {/* Confirm Email */}
            <div>
                <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Email Address <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="confirmEmail"
                    required
                    value={formData.confirmEmail}
                    onChange={(e) => setFormData({ ...formData, confirmEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-surf-DEFAULT focus:border-transparent"
                    placeholder="your@email.com"
                />
            </div>

            {/* Deletion Scope */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would you like to delete? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="scope"
                            value="full"
                            checked={formData.scope === 'full'}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value as DeletionScope })}
                            className="text-surf-DEFAULT focus:ring-surf-DEFAULT"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Full Account Deletion</span>
                            <p className="text-sm text-gray-500">Delete all data and close my account</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="scope"
                            value="ai"
                            checked={formData.scope === 'ai'}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value as DeletionScope })}
                            className="text-surf-DEFAULT focus:ring-surf-DEFAULT"
                        />
                        <div>
                            <span className="font-medium text-gray-900">AI Assistant Data Only</span>
                            <p className="text-sm text-gray-500">Delete conversation history and AI-related data</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="scope"
                            value="whatsapp"
                            checked={formData.scope === 'whatsapp'}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value as DeletionScope })}
                            className="text-surf-DEFAULT focus:ring-surf-DEFAULT"
                        />
                        <div>
                            <span className="font-medium text-gray-900">WhatsApp Assistant Data Only</span>
                            <p className="text-sm text-gray-500">Delete WhatsApp configurations and message logs</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="radio"
                            name="scope"
                            value="receipt"
                            checked={formData.scope === 'receipt'}
                            onChange={(e) => setFormData({ ...formData, scope: e.target.value as DeletionScope })}
                            className="text-surf-DEFAULT focus:ring-surf-DEFAULT"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Receipt Assistant Data Only</span>
                            <p className="text-sm text-gray-500">Delete receipt scans and extracted data</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Reason (Optional) */}
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for deletion (optional)
                </label>
                <textarea
                    id="reason"
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-surf-DEFAULT focus:border-transparent"
                    placeholder="Help us improve by sharing why you're requesting deletion..."
                />
            </div>

            {/* Confirmations */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.confirmUnderstand}
                        onChange={(e) => setFormData({ ...formData, confirmUnderstand: e.target.checked })}
                        className="mt-1 text-surf-DEFAULT focus:ring-surf-DEFAULT rounded"
                    />
                    <span className="text-sm text-gray-700">
                        I understand that some data may be retained for legal and regulatory compliance purposes.
                    </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.confirmIrreversible}
                        onChange={(e) => setFormData({ ...formData, confirmIrreversible: e.target.checked })}
                        className="mt-1 text-surf-DEFAULT focus:ring-surf-DEFAULT rounded"
                    />
                    <span className="text-sm text-gray-700">
                        I understand that this action is <strong>irreversible</strong> and my data cannot be recovered once deleted.
                    </span>
                </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-5 h-5" />
                    <span>{errorMessage}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {status === 'loading' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting Request...
                    </>
                ) : (
                    'Submit Deletion Request'
                )}
            </button>

            <p className="text-xs text-gray-500 text-center">
                By submitting this form, you confirm that you are the account holder or authorized representative.
                We may contact you to verify your identity before processing the request.
            </p>
        </form>
    );
}

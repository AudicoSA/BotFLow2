'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Receipt,
    Download,
    ExternalLink,
    Check,
    Clock,
    AlertCircle,
    XCircle,
    ChevronDown,
    ChevronUp,
    FileText,
    Calendar,
    CreditCard,
} from 'lucide-react';
import type { BillingHistoryItem, PaymentMethod } from '@/lib/subscriptions/types';
import { formatPrice } from '@/lib/subscriptions/types';

interface BillingHistoryProps {
    items: BillingHistoryItem[];
    paymentMethod: PaymentMethod | null;
    onDownloadInvoice: (invoiceId: string) => Promise<void>;
    onUpdatePaymentMethod: () => void;
}

const statusConfig = {
    paid: {
        icon: Check,
        label: 'Paid',
        color: 'text-green-600',
        bg: 'bg-green-100',
    },
    pending: {
        icon: Clock,
        label: 'Pending',
        color: 'text-amber-600',
        bg: 'bg-amber-100',
    },
    failed: {
        icon: AlertCircle,
        label: 'Failed',
        color: 'text-red-600',
        bg: 'bg-red-100',
    },
    refunded: {
        icon: XCircle,
        label: 'Refunded',
        color: 'text-gray-600',
        bg: 'bg-gray-100',
    },
};

export default function BillingHistory({
    items,
    paymentMethod,
    onDownloadInvoice,
    onUpdatePaymentMethod,
}: BillingHistoryProps) {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const displayedItems = showAll ? items : items.slice(0, 5);

    const handleDownload = async (invoiceId: string) => {
        setDownloadingId(invoiceId);
        try {
            await onDownloadInvoice(invoiceId);
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                            <Receipt className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900">Billing History</h2>
                            <p className="text-sm text-gray-500">
                                {items.length} invoice{items.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            {paymentMethod && (
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {paymentMethod.brand} •••• {paymentMethod.last4}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Expires {paymentMethod.exp_month}/{paymentMethod.exp_year}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onUpdatePaymentMethod}
                            className="text-sm text-surf-cyan font-medium hover:text-surf-cyan/80"
                        >
                            Update
                        </button>
                    </div>
                </div>
            )}

            {/* Invoice List */}
            {items.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">No invoices yet</h3>
                    <p className="text-sm text-gray-500">
                        Your billing history will appear here
                    </p>
                </div>
            ) : (
                <div className="divide-y divide-gray-100">
                    {displayedItems.map((item, index) => {
                        const status = statusConfig[item.status];
                        const isExpanded = expandedItem === item.id;
                        const StatusIcon = status.icon;

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Date */}
                                        <div className="w-20 flex-shrink-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatDate(item.date)}
                                            </p>
                                        </div>

                                        {/* Description */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 truncate">
                                                {item.description}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Invoice #{item.invoice_number}
                                            </p>
                                        </div>

                                        {/* Amount */}
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">
                                                {formatPrice(item.amount)}
                                            </p>
                                        </div>

                                        {/* Status */}
                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${status.bg}`}>
                                            <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                                            <span className={`text-xs font-medium ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Expand/Collapse */}
                                        <div className="text-gray-400">
                                            {isExpanded ? (
                                                <ChevronUp className="w-5 h-5" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 pt-4 border-t border-gray-100"
                                        >
                                            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                                <div>
                                                    <p className="text-gray-500">Billing Period</p>
                                                    <p className="font-medium text-gray-900">
                                                        {item.period_start && item.period_end
                                                            ? `${formatDate(item.period_start)} - ${formatDate(item.period_end)}`
                                                            : 'N/A'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Payment Method</p>
                                                    <p className="font-medium text-gray-900">
                                                        {item.payment_method || 'Card'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDownload(item.id);
                                                    }}
                                                    disabled={downloadingId === item.id}
                                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                >
                                                    {downloadingId === item.id ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-600 border-t-transparent" />
                                                    ) : (
                                                        <Download className="w-4 h-4" />
                                                    )}
                                                    Download PDF
                                                </button>
                                                {item.pdf_url && (
                                                    <a
                                                        href={item.pdf_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                        View Online
                                                    </a>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Show More Button */}
            {items.length > 5 && (
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full py-2 text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors flex items-center justify-center gap-1"
                    >
                        {showAll ? (
                            <>
                                Show Less
                                <ChevronUp className="w-4 h-4" />
                            </>
                        ) : (
                            <>
                                Show All ({items.length - 5} more)
                                <ChevronDown className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}

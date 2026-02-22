'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface HelpTooltipProps {
    id: string;
    title: string;
    content: string;
    learnMoreUrl?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    children?: ReactNode;
    showIcon?: boolean;
    iconSize?: 'sm' | 'md' | 'lg';
}

export default function HelpTooltip({
    id,
    title,
    content,
    learnMoreUrl,
    position = 'top',
    children,
    showIcon = true,
    iconSize = 'md',
}: HelpTooltipProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // Check if this tooltip was dismissed before
    useEffect(() => {
        const dismissedTooltips = localStorage.getItem('dismissedTooltips');
        if (dismissedTooltips) {
            const parsed = JSON.parse(dismissedTooltips);
            if (parsed.includes(id)) {
                setDismissed(true);
            }
        }
    }, [id]);

    // Close tooltip when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleDismiss = () => {
        setIsOpen(false);
        setDismissed(true);

        // Save to localStorage
        const dismissedTooltips = localStorage.getItem('dismissedTooltips');
        const parsed = dismissedTooltips ? JSON.parse(dismissedTooltips) : [];
        if (!parsed.includes(id)) {
            parsed.push(id);
            localStorage.setItem('dismissedTooltips', JSON.stringify(parsed));
        }
    };

    const iconSizes = {
        sm: 'w-3.5 h-3.5',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    const positionStyles = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    const arrowStyles = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-800',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-800',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-800',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-800',
    };

    if (dismissed && !children) {
        return null;
    }

    return (
        <div className="relative inline-flex items-center">
            {children}

            {showIcon && (
                <button
                    ref={triggerRef}
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseEnter={() => setIsOpen(true)}
                    className="ml-1 text-gray-400 hover:text-surf-DEFAULT focus:outline-none focus:ring-2 focus:ring-surf-light focus:ring-offset-1 rounded-full transition-colors"
                    aria-label={`Help: ${title}`}
                >
                    <HelpCircle className={iconSizes[iconSize]} />
                </button>
            )}

            {isOpen && (
                <div
                    ref={tooltipRef}
                    className={`absolute z-50 ${positionStyles[position]} w-72 animate-in fade-in-0 zoom-in-95`}
                    role="tooltip"
                >
                    <div className="bg-gray-800 text-white rounded-lg shadow-xl p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-white">{title}</h4>
                            <button
                                onClick={handleDismiss}
                                className="text-gray-400 hover:text-white -mt-1 -mr-1 p-1"
                                aria-label="Dismiss tooltip"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className="text-gray-300 text-sm leading-relaxed">
                            {content}
                        </p>

                        {learnMoreUrl && (
                            <Link
                                href={learnMoreUrl}
                                className="inline-flex items-center gap-1 text-surf-light hover:text-white text-sm mt-3 font-medium"
                            >
                                Learn more <ExternalLink className="w-3 h-3" />
                            </Link>
                        )}
                    </div>

                    {/* Arrow */}
                    <div
                        className={`absolute w-0 h-0 border-4 border-transparent ${arrowStyles[position]}`}
                    />
                </div>
            )}
        </div>
    );
}

// Contextual help content library
export const helpContent = {
    // AI Assistant
    'ai-knowledge-sources': {
        title: 'Knowledge Sources',
        content: 'Upload documents, paste text, or provide URLs that contain information about your business. The AI uses this to answer customer questions accurately.',
        learnMoreUrl: '/help/guides/ai-assistant#knowledge',
    },
    'ai-confidence-threshold': {
        title: 'Confidence Threshold',
        content: 'Set how confident the AI must be before responding automatically. Lower values mean more automated responses, higher values route more to humans.',
        learnMoreUrl: '/help/guides/ai-assistant#settings',
    },
    'ai-system-prompt': {
        title: 'System Prompt',
        content: 'Define your AI\'s personality, tone, and behavior rules. This shapes how it interacts with customers.',
        learnMoreUrl: '/help/guides/ai-assistant#personality',
    },

    // WhatsApp
    'whatsapp-qr-code': {
        title: 'QR Code Connection',
        content: 'Scan this QR code with WhatsApp on your phone to connect your account. Go to Settings > Linked Devices > Link a Device.',
        learnMoreUrl: '/help/guides/whatsapp#qr-setup',
    },
    'whatsapp-coexistence': {
        title: 'Coexistence Mode',
        content: 'Keep using WhatsApp Business App while BotFlow handles automated responses. Your conversations won\'t conflict.',
        learnMoreUrl: '/help/guides/whatsapp#coexistence',
    },
    'whatsapp-auto-response': {
        title: 'Auto-Response Hours',
        content: 'Set when BotFlow should automatically respond to messages. Outside these hours, messages are queued for manual reply.',
        learnMoreUrl: '/help/guides/whatsapp#auto-response',
    },

    // Receipts
    'receipt-ocr': {
        title: 'OCR Scanning',
        content: 'Our AI-powered OCR extracts merchant, date, amount, and items from your receipt images. Works with photos, scans, and PDFs.',
        learnMoreUrl: '/help/guides/receipts#ocr',
    },
    'receipt-categories': {
        title: 'Expense Categories',
        content: 'Organize receipts by category for better reporting. The AI learns your patterns and auto-suggests categories over time.',
        learnMoreUrl: '/help/guides/receipts#categories',
    },
    'receipt-export': {
        title: 'Export Options',
        content: 'Download your expense data in CSV or PDF format. Compatible with QuickBooks, Xero, and other accounting software.',
        learnMoreUrl: '/help/guides/receipts#export',
    },

    // Billing
    'billing-usage': {
        title: 'Usage Tracking',
        content: 'Monitor your message count, API calls, and receipt scans. Usage resets monthly on your billing date.',
        learnMoreUrl: '/help#billing',
    },
    'billing-proration': {
        title: 'Prorated Billing',
        content: 'When you upgrade, you\'re charged the difference for the remaining billing period. Downgrades take effect at the next billing cycle.',
        learnMoreUrl: '/help#billing',
    },
};

// Helper component for labeled inputs with help
interface HelpLabelProps {
    htmlFor: string;
    label: string;
    helpId: keyof typeof helpContent;
    required?: boolean;
}

export function HelpLabel({ htmlFor, label, helpId, required }: HelpLabelProps) {
    const help = helpContent[helpId];

    return (
        <label htmlFor={htmlFor} className="flex items-center text-sm font-medium text-gray-700 mb-1">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
            <HelpTooltip
                id={helpId}
                title={help.title}
                content={help.content}
                learnMoreUrl={help.learnMoreUrl}
                iconSize="sm"
            />
        </label>
    );
}

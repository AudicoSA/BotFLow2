'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Gift, Clock, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface ExitIntentPopupProps {
    offerCode?: string;
    discountPercent?: number;
    expiresInMinutes?: number;
}

export default function ExitIntentPopup({
    offerCode = 'STAYWITHUS',
    discountPercent = 20,
    expiresInMinutes = 15,
}: ExitIntentPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasShown, setHasShown] = useState(false);
    const [timeLeft, setTimeLeft] = useState(expiresInMinutes * 60);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // Check if popup was already shown in this session
    useEffect(() => {
        const shown = sessionStorage.getItem('exitPopupShown');
        const dismissed = localStorage.getItem('exitPopupDismissed');
        if (shown || dismissed) {
            setHasShown(true);
        }
    }, []);

    // Exit intent detection
    const handleMouseLeave = useCallback((e: MouseEvent) => {
        // Only trigger when mouse moves to top of viewport (exit intent)
        if (e.clientY <= 5 && !hasShown && !isVisible) {
            setIsVisible(true);
            setHasShown(true);
            sessionStorage.setItem('exitPopupShown', 'true');

            // Track event
            if (typeof window !== 'undefined' && (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog) {
                (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog?.capture('exit_intent_popup_shown', {
                    offerCode,
                    discountPercent,
                });
            }
        }
    }, [hasShown, isVisible, offerCode, discountPercent]);

    // Mobile: detect scroll up pattern (user scrolling back up)
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let scrollUpCount = 0;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // User is scrolling up
            if (currentScrollY < lastScrollY && currentScrollY < 200) {
                scrollUpCount++;
                // Trigger after consistent upward scroll near top
                if (scrollUpCount >= 3 && !hasShown && !isVisible) {
                    setIsVisible(true);
                    setHasShown(true);
                    sessionStorage.setItem('exitPopupShown', 'true');
                }
            } else {
                scrollUpCount = 0;
            }

            lastScrollY = currentScrollY;
        };

        // Only on mobile
        if (window.innerWidth < 768) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [hasShown, isVisible]);

    // Desktop: mouse leave detection
    useEffect(() => {
        if (window.innerWidth >= 768) {
            document.addEventListener('mouseleave', handleMouseLeave);
            return () => document.removeEventListener('mouseleave', handleMouseLeave);
        }
    }, [handleMouseLeave]);

    // Countdown timer
    useEffect(() => {
        if (!isVisible || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [isVisible, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleClose = () => {
        setIsVisible(false);
        // Track dismissal
        if (typeof window !== 'undefined' && (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog) {
            (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog?.capture('exit_intent_popup_closed');
        }
    };

    const handleDismissPermanently = () => {
        setIsVisible(false);
        localStorage.setItem('exitPopupDismissed', 'true');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || isSubmitting) return;

        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsSubmitted(true);
        setIsSubmitting(false);

        // Track conversion
        if (typeof window !== 'undefined' && (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog) {
            (window as { posthog?: { capture: (event: string, props?: Record<string, unknown>) => void } }).posthog?.capture('exit_intent_email_captured', {
                offerCode,
                discountPercent,
            });
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Popup */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
                    aria-label="Close popup"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header with gradient */}
                <div className="bg-gradient-to-br from-surf-DEFAULT via-surf-dark to-surf-darker px-6 py-8 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Gift className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Wait! Don&apos;t Leave Empty-Handed
                    </h2>
                    <p className="text-white/80">
                        Get an exclusive offer just for you
                    </p>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                    {!isSubmitted ? (
                        <>
                            {/* Offer highlight */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-amber-500" />
                                        <span className="font-bold text-amber-800">Special Offer</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-amber-700 text-sm">
                                        <Clock className="w-4 h-4" />
                                        <span>Expires in {formatTime(timeLeft)}</span>
                                    </div>
                                </div>
                                <p className="text-2xl font-bold text-amber-900">
                                    {discountPercent}% OFF your first 3 months
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="text-sm text-amber-700">Use code:</span>
                                    <code className="bg-amber-200 text-amber-900 px-2 py-1 rounded font-mono font-bold">
                                        {offerCode}
                                    </code>
                                </div>
                            </div>

                            {/* Email capture form */}
                            <form onSubmit={handleSubmit}>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter your email to claim this offer:
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-surf-light focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-3 bg-surf-DEFAULT hover:bg-surf-dark disabled:bg-gray-300 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
                                    >
                                        {isSubmitting ? 'Sending...' : 'Claim Offer'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>

                            {/* Alternative CTA */}
                            <div className="mt-6 text-center">
                                <Link
                                    href="/pricing"
                                    className="text-surf-DEFAULT hover:text-surf-dark font-medium hover:underline"
                                    onClick={handleClose}
                                >
                                    Or start your free trial now (no code needed)
                                </Link>
                            </div>
                        </>
                    ) : (
                        /* Success state */
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Offer Sent!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Check your inbox for your exclusive {discountPercent}% discount code.
                            </p>
                            <Link
                                href="/pricing"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-surf-DEFAULT hover:bg-surf-dark text-white font-semibold rounded-xl transition-colors"
                                onClick={handleClose}
                            >
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 text-center">
                    <button
                        onClick={handleDismissPermanently}
                        className="text-gray-400 text-sm hover:text-gray-600"
                    >
                        No thanks, I&apos;ll pay full price
                    </button>
                </div>
            </div>
        </div>
    );
}

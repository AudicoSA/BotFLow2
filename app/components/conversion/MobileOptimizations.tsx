'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, X, Smartphone, Zap } from 'lucide-react';

/**
 * Mobile-optimized sticky CTA bar
 * Shows at bottom of screen on mobile devices
 */
export function MobileStickyBar() {
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Only show on mobile
        if (window.innerWidth >= 768) return;

        // Check if dismissed
        const dismissed = sessionStorage.getItem('mobileStickyDismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }

        // Show after scrolling past hero
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const heroHeight = 600; // Approximate hero height

            if (scrollY > heroHeight && !isDismissed) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isDismissed]);

    const handleDismiss = () => {
        setIsDismissed(true);
        setIsVisible(false);
        sessionStorage.setItem('mobileStickyDismissed', 'true');
    };

    if (!isVisible || isDismissed) return null;

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg animate-in slide-in-from-bottom duration-300 safe-area-bottom">
            <div className="flex items-center gap-3 p-3">
                <button
                    onClick={handleDismiss}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">Start your free trial</div>
                    <div className="text-xs text-gray-500">14 days free, no card required</div>
                </div>

                <Link
                    href="/pricing"
                    className="flex-shrink-0 px-4 py-2.5 bg-surf-DEFAULT hover:bg-surf-dark text-white text-sm font-semibold rounded-lg flex items-center gap-1.5"
                >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}

/**
 * Mobile-optimized quick action buttons
 * Floating action button for key actions
 */
export function MobileQuickActions() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="md:hidden fixed bottom-20 right-4 z-30">
            {/* Expanded actions */}
            {isExpanded && (
                <div className="absolute bottom-14 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <Link
                        href="/pricing"
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                    >
                        <Zap className="w-5 h-5 text-surf-DEFAULT" />
                        <span className="text-sm font-medium">View Pricing</span>
                    </Link>
                    <Link
                        href="/help"
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                        <Smartphone className="w-5 h-5 text-surf-DEFAULT" />
                        <span className="text-sm font-medium">Get Help</span>
                    </Link>
                </div>
            )}

            {/* FAB */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                    isExpanded
                        ? 'bg-gray-800 rotate-45'
                        : 'bg-surf-DEFAULT hover:bg-surf-dark'
                }`}
            >
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
            </button>
        </div>
    );
}

/**
 * Mobile-optimized touch targets
 * Utility classes and hooks for touch-friendly UI
 */
export const mobileStyles = {
    // Minimum 44px touch targets (Apple HIG)
    touchTarget: 'min-h-[44px] min-w-[44px]',

    // Larger tap areas
    tapArea: 'p-3 -m-3',

    // Mobile-friendly button
    button: 'py-3 px-6 text-base min-h-[48px]',

    // Safe area padding
    safeAreaTop: 'pt-[env(safe-area-inset-top)]',
    safeAreaBottom: 'pb-[env(safe-area-inset-bottom)]',
    safeAreaX: 'px-[max(16px,env(safe-area-inset-left))]',

    // Prevent text selection on interactive elements
    noSelect: 'select-none',

    // Smooth scrolling on iOS
    smoothScroll: '-webkit-overflow-scrolling-touch overflow-auto',

    // Hide on mobile
    hideMobile: 'hidden md:block',

    // Show only on mobile
    showMobile: 'md:hidden',
};

/**
 * Hook to detect mobile device
 */
export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

/**
 * Hook to detect touch device
 */
export function useIsTouchDevice(): boolean {
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    return isTouch;
}

/**
 * Mobile-first viewport meta helper
 * Ensures proper viewport settings
 */
export function MobileViewportMeta() {
    useEffect(() => {
        // Prevent zoom on input focus (iOS)
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute(
                'content',
                'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
            );
        }

        // Handle iOS safe areas
        document.documentElement.style.setProperty(
            '--sat',
            'env(safe-area-inset-top)'
        );
        document.documentElement.style.setProperty(
            '--sab',
            'env(safe-area-inset-bottom)'
        );
    }, []);

    return null;
}

/**
 * Mobile swipe-to-dismiss wrapper
 */
interface SwipeToDismissProps {
    children: React.ReactNode;
    onDismiss: () => void;
    threshold?: number;
}

export function SwipeToDismiss({ children, onDismiss, threshold = 100 }: SwipeToDismissProps) {
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientY);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchEnd - touchStart;
        const isSwipeDown = distance > threshold;

        if (isSwipeDown) {
            onDismiss();
        }

        setTouchStart(null);
        setTouchEnd(null);
    };

    return (
        <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {children}
        </div>
    );
}

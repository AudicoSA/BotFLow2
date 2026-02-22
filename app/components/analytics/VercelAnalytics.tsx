'use client';

import { useEffect } from 'react';

// Vercel Analytics wrapper component
// This component provides a placeholder for Vercel Analytics integration
// When deployed on Vercel with the packages installed, analytics will be tracked automatically
// The actual @vercel/analytics and @vercel/speed-insights packages should be installed:
// npm install @vercel/analytics @vercel/speed-insights
export function VercelAnalytics() {
    useEffect(() => {
        // Vercel automatically injects analytics when deployed
        // This component ensures the build succeeds before packages are installed
        if (process.env.NODE_ENV === 'development') {
            console.debug('[Analytics] Vercel Analytics placeholder loaded');
        }
    }, []);

    // This is a placeholder component
    // Replace with actual Analytics and SpeedInsights components after installing:
    // npm install @vercel/analytics @vercel/speed-insights
    //
    // Then update this file to:
    // import { Analytics } from '@vercel/analytics/react';
    // import { SpeedInsights } from '@vercel/speed-insights/next';
    // return <><Analytics /><SpeedInsights /></>;
    return null;
}

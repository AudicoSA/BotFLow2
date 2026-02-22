import { NextRequest, NextResponse } from 'next/server';
import {
    getSaaSMetrics,
    calculateMRR,
    calculateChurnRate,
    calculateActivationFunnel,
    getDailyMetrics,
    getUserActivity,
} from '@/lib/analytics/metrics';

// GET /api/admin/metrics - Get all SaaS metrics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const metric = searchParams.get('metric');
        const days = parseInt(searchParams.get('days') || '30', 10);

        // Return specific metric if requested
        switch (metric) {
            case 'mrr':
                const mrrData = await calculateMRR();
                return NextResponse.json({ mrr: mrrData });

            case 'churn':
                const churnData = await calculateChurnRate();
                return NextResponse.json({ churn: churnData });

            case 'funnel':
                const funnelData = await calculateActivationFunnel();
                return NextResponse.json({ funnel: funnelData });

            case 'daily':
                const dailyData = await getDailyMetrics(days);
                return NextResponse.json({ daily: dailyData });

            case 'activity':
                const activityData = await getUserActivity();
                return NextResponse.json({ activity: activityData });

            default:
                // Return all metrics
                const [metrics, mrr, churn, funnel, daily, activity] = await Promise.all([
                    getSaaSMetrics(),
                    calculateMRR(),
                    calculateChurnRate(),
                    calculateActivationFunnel(),
                    getDailyMetrics(days),
                    getUserActivity(),
                ]);

                return NextResponse.json({
                    metrics,
                    mrr,
                    churn,
                    funnel,
                    daily,
                    activity,
                    generatedAt: new Date().toISOString(),
                });
        }
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        return NextResponse.json(
            { error: 'Failed to fetch metrics' },
            { status: 500 }
        );
    }
}

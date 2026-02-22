import { NextResponse } from 'next/server';
import { runHealthChecks } from '@/lib/monitoring';

// GET /api/monitoring/health-check - Run health checks on all services
export async function GET() {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.botflow.co.za';
        const results = await runHealthChecks(baseUrl);

        const allHealthy = results.every(r => r.status === 'healthy');
        const anyCriticalDown = results.some(r => r.status === 'down');

        return NextResponse.json({
            status: allHealthy ? 'healthy' : anyCriticalDown ? 'unhealthy' : 'degraded',
            timestamp: new Date().toISOString(),
            services: results,
            summary: {
                total: results.length,
                healthy: results.filter(r => r.status === 'healthy').length,
                degraded: results.filter(r => r.status === 'degraded').length,
                down: results.filter(r => r.status === 'down').length,
            },
        }, {
            status: allHealthy ? 200 : anyCriticalDown ? 503 : 200,
        });
    } catch (error) {
        console.error('Error running health checks:', error);
        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Failed to run health checks',
        }, { status: 500 });
    }
}

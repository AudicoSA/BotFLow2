import { NextRequest, NextResponse } from 'next/server';
import { sendAlert, type Alert } from '@/lib/monitoring';

// POST /api/monitoring/alerts - Send a custom alert
export async function POST(request: NextRequest) {
    try {
        // Check for admin authentication
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.title || !body.message || !body.severity) {
            return NextResponse.json(
                { error: 'Missing required fields: title, message, severity' },
                { status: 400 }
            );
        }

        // Validate severity
        const validSeverities = ['critical', 'error', 'warning', 'info'];
        if (!validSeverities.includes(body.severity)) {
            return NextResponse.json(
                { error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}` },
                { status: 400 }
            );
        }

        const alert: Alert = {
            title: body.title,
            message: body.message,
            severity: body.severity,
            source: body.source || 'api',
            timestamp: new Date(),
            metadata: body.metadata,
        };

        await sendAlert(alert);

        return NextResponse.json({
            success: true,
            message: 'Alert sent successfully',
        });
    } catch (error) {
        console.error('Error sending alert:', error);
        return NextResponse.json(
            { error: 'Failed to send alert' },
            { status: 500 }
        );
    }
}

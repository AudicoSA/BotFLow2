import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';

interface AnalyticsEvent {
    id: string;
    event_type: string;
    user_id?: string;
    organization_id?: string;
    properties: Record<string, unknown>;
    created_at: string;
}

// GET /api/admin/events - Get recent analytics events
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const eventType = searchParams.get('type');

        const supabase = getSupabaseServerClient();

        // Build query - using simple eq filter if event type specified
        let query = supabase
            .from('analytics_events')
            .select('*')
            .limit(limit);

        if (eventType) {
            query = query.eq('event_type', eventType);
        }

        const { data: events, error } = await query;

        if (error && error.message !== 'No rows found') {
            throw error;
        }

        // Group events by type for summary
        const eventSummary: Record<string, number> = {};
        for (const event of (events || []) as AnalyticsEvent[]) {
            eventSummary[event.event_type] = (eventSummary[event.event_type] || 0) + 1;
        }

        return NextResponse.json({
            events: events || [],
            summary: eventSummary,
            total: (events || []).length,
        });
    } catch (error) {
        console.error('Error fetching analytics events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

// POST /api/admin/events - Track an analytics event (server-side)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { event_type, user_id, organization_id, properties } = body;

        if (!event_type) {
            return NextResponse.json(
                { error: 'event_type is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServerClient();

        const { data, error } = await supabase
            .from('analytics_events')
            .insert({
                event_type,
                user_id,
                organization_id,
                properties: properties || {},
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw error;
        }

        return NextResponse.json({ event: data });
    } catch (error) {
        console.error('Error tracking event:', error);
        return NextResponse.json(
            { error: 'Failed to track event' },
            { status: 500 }
        );
    }
}

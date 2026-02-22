import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';

interface User {
    id: string;
    email: string;
    name?: string;
    created_at: string;
    last_sign_in?: string;
}

interface Subscription {
    plan_id: string;
    status: string;
    organization_id: string;
}

// Helper to check if date is after target
function isAfterDate(dateStr: string | undefined, target: Date): boolean {
    if (!dateStr) return false;
    return new Date(dateStr) >= target;
}

// GET /api/admin/users - Get user statistics and list
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50', 10);
        const offset = parseInt(searchParams.get('offset') || '0', 10);

        const supabase = getSupabaseServerClient();

        // Get all users
        const { data: allUsersData, error } = await supabase
            .from('users')
            .select('*');

        if (error && error.message !== 'No rows found') {
            throw error;
        }

        const allUsers = (allUsersData || []) as User[];
        const totalUsers = allUsers.length;

        // Sort by created_at descending and apply pagination
        const sortedUsers = [...allUsers].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        const paginatedUsers = sortedUsers.slice(offset, offset + limit);

        // Get subscription data for users
        const { data: membershipsData } = await supabase
            .from('organization_members')
            .select('user_id, organization_id');

        const memberships = (membershipsData || []) as Array<{ user_id: string; organization_id: string }>;

        const { data: subscriptionsData } = await supabase
            .from('subscriptions')
            .select('organization_id, plan_id, status');

        const subscriptions = (subscriptionsData || []) as Subscription[];
        const subscriptionsByOrg: Record<string, Subscription> = {};
        for (const sub of subscriptions) {
            subscriptionsByOrg[sub.organization_id] = sub;
        }

        // Enrich users with subscription data
        const enrichedUsers = paginatedUsers.map(user => {
            const membership = memberships.find(m => m.user_id === user.id);
            const subscription = membership ? subscriptionsByOrg[membership.organization_id] : null;

            return {
                ...user,
                subscription: subscription ? {
                    planId: subscription.plan_id,
                    status: subscription.status,
                } : null,
            };
        });

        // Calculate statistics using JavaScript filtering
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsersLast30Days = allUsers.filter(u => isAfterDate(u.created_at, thirtyDaysAgo));

        // Get sessions for active users calculation
        const { data: sessionsData } = await supabase
            .from('user_sessions')
            .select('user_id, last_active_at');

        const sessions = (sessionsData || []) as Array<{ user_id: string; last_active_at?: string }>;
        const activeSessions = sessions.filter(s => isAfterDate(s.last_active_at, thirtyDaysAgo));
        const uniqueActiveUsers = new Set(activeSessions.map(s => s.user_id));

        // Count users with active subscriptions
        const usersWithActiveSubscription = allUsers.filter(user => {
            const membership = memberships.find(m => m.user_id === user.id);
            const subscription = membership ? subscriptionsByOrg[membership.organization_id] : null;
            return subscription && subscription.status === 'active';
        });

        const stats = {
            total: totalUsers,
            newLast30Days: newUsersLast30Days.length,
            activeLast30Days: uniqueActiveUsers.size,
            withSubscription: usersWithActiveSubscription.length,
        };

        return NextResponse.json({
            users: enrichedUsers,
            stats,
            pagination: {
                limit,
                offset,
                total: totalUsers,
            },
        });
    } catch (error) {
        console.error('Error fetching admin users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

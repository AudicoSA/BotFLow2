// SaaS Metrics Calculator
import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
    SaaSMetrics,
    MRRBreakdown,
    ChurnAnalysis,
    ActivationFunnel,
    DailyMetrics,
    UserActivity,
} from './types';
import { PLANS } from '@/lib/subscriptions/types';

// Helper to filter by date
function isAfterDate(dateStr: string, threshold: Date): boolean {
    return new Date(dateStr) >= threshold;
}

function isBeforeDate(dateStr: string, threshold: Date): boolean {
    return new Date(dateStr) < threshold;
}

function isBetweenDates(dateStr: string, start: Date, end: Date): boolean {
    const date = new Date(dateStr);
    return date >= start && date < end;
}

// Calculate MRR from subscriptions
export async function calculateMRR(): Promise<MRRBreakdown> {
    const supabase = getSupabaseServerClient();

    // Get all active subscriptions
    const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

    const subs = (subscriptions || []) as Array<{
        plan_id: string;
        amount?: number;
        billing_interval?: string;
        created_at?: string;
    }>;

    const byPlan: MRRBreakdown['byPlan'] = [];
    let totalMRR = 0;

    // Group by plan
    const planCounts: Record<string, { count: number; mrr: number }> = {};

    for (const sub of subs) {
        const planId = sub.plan_id;
        const plan = PLANS[planId as keyof typeof PLANS];
        const monthlyAmount = sub.billing_interval === 'annual'
            ? Math.round((sub.amount || plan?.price || 0) / 12)
            : (sub.amount || plan?.price || 0);

        if (!planCounts[planId]) {
            planCounts[planId] = { count: 0, mrr: 0 };
        }
        planCounts[planId].count++;
        planCounts[planId].mrr += monthlyAmount;
        totalMRR += monthlyAmount;
    }

    for (const [planId, data] of Object.entries(planCounts)) {
        const plan = PLANS[planId as keyof typeof PLANS];
        byPlan.push({
            planId,
            planName: plan?.name || planId,
            count: data.count,
            mrr: data.mrr,
        });
    }

    // Get new MRR (subscriptions created this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newSubs = subs.filter(sub => sub.created_at && isAfterDate(sub.created_at, startOfMonth));

    let newMRR = 0;
    for (const sub of newSubs) {
        const plan = PLANS[sub.plan_id as keyof typeof PLANS];
        const monthlyAmount = sub.billing_interval === 'annual'
            ? Math.round((sub.amount || plan?.price || 0) / 12)
            : (sub.amount || plan?.price || 0);
        newMRR += monthlyAmount;
    }

    // Get churned MRR (subscriptions canceled this month)
    const { data: canceledSubs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'canceled');

    const churnedThisMonth = ((canceledSubs || []) as Array<{
        plan_id: string;
        amount?: number;
        billing_interval?: string;
        canceled_at?: string;
    }>).filter(sub => sub.canceled_at && isAfterDate(sub.canceled_at, startOfMonth));

    let churnedMRR = 0;
    for (const sub of churnedThisMonth) {
        const plan = PLANS[sub.plan_id as keyof typeof PLANS];
        const monthlyAmount = sub.billing_interval === 'annual'
            ? Math.round((sub.amount || plan?.price || 0) / 12)
            : (sub.amount || plan?.price || 0);
        churnedMRR += monthlyAmount;
    }

    return {
        total: totalMRR,
        byPlan,
        newMRR,
        expansionMRR: 0,
        contractionMRR: 0,
        churnedMRR,
    };
}

// Calculate churn rate
export async function calculateChurnRate(): Promise<ChurnAnalysis> {
    const supabase = getSupabaseServerClient();

    // Get current month dates
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Get all subscriptions
    const { data: allSubsData } = await supabase
        .from('subscriptions')
        .select('*');

    const allSubs = (allSubsData || []) as Array<{
        id: string;
        status: string;
        created_at: string;
        canceled_at?: string;
    }>;

    // Count subscriptions at start of current month
    const startingSubs = allSubs.filter(sub =>
        (sub.status === 'active' || sub.status === 'trialing') &&
        isBeforeDate(sub.created_at, startOfCurrentMonth)
    ).length;

    // Count churned this month
    const churnedThisMonth = allSubs.filter(sub =>
        sub.status === 'canceled' &&
        sub.canceled_at &&
        isAfterDate(sub.canceled_at, startOfCurrentMonth)
    ).length;

    // Calculate current month churn rate
    const currentMonthRate = startingSubs > 0 ? (churnedThisMonth / startingSubs) * 100 : 0;

    // Count previous month churn
    const prevStartingSubs = allSubs.filter(sub =>
        isBeforeDate(sub.created_at, startOfPreviousMonth)
    ).length;

    const churnedPrevMonth = allSubs.filter(sub =>
        sub.status === 'canceled' &&
        sub.canceled_at &&
        isBetweenDates(sub.canceled_at, startOfPreviousMonth, endOfPreviousMonth)
    ).length;

    const prevMonthRate = prevStartingSubs > 0 ? (churnedPrevMonth / prevStartingSubs) * 100 : 0;

    // Get churn by reason
    const { data: cancellationReasons } = await supabase
        .from('cancellation_surveys')
        .select('*');

    const recentCancellations = ((cancellationReasons || []) as Array<{ reason: string; created_at: string }>)
        .filter(survey => isAfterDate(survey.created_at, startOfCurrentMonth));

    const reasonCounts: Record<string, number> = {};
    for (const survey of recentCancellations) {
        reasonCounts[survey.reason] = (reasonCounts[survey.reason] || 0) + 1;
    }

    const totalReasons = Object.values(reasonCounts).reduce((a, b) => a + b, 0);
    const byReason = Object.entries(reasonCounts).map(([reason, count]) => ({
        reason,
        count,
        percentage: totalReasons > 0 ? (count / totalReasons) * 100 : 0,
    }));

    return {
        currentMonth: currentMonthRate,
        previousMonth: prevMonthRate,
        trend: currentMonthRate > prevMonthRate ? 'up' : currentMonthRate < prevMonthRate ? 'down' : 'stable',
        byReason,
    };
}

// Calculate activation funnel
export async function calculateActivationFunnel(): Promise<ActivationFunnel> {
    const supabase = getSupabaseServerClient();

    // Last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Signups
    const { data: usersData } = await supabase
        .from('users')
        .select('*');

    const recentSignups = ((usersData || []) as Array<{ id: string; created_at: string }>)
        .filter(user => isAfterDate(user.created_at, thirtyDaysAgo));

    const signups = recentSignups.length;

    // Onboarding started
    const { data: onboardingData } = await supabase
        .from('onboarding_progress')
        .select('*');

    const recentOnboarding = ((onboardingData || []) as Array<{ user_id: string; created_at: string }>)
        .filter(ob => isAfterDate(ob.created_at, thirtyDaysAgo));

    const onboardingStarted = recentOnboarding.length;

    // First action (AI conversations)
    const { data: aiData } = await supabase
        .from('ai_conversations')
        .select('*');

    const recentAI = ((aiData || []) as Array<{ organization_id: string; created_at: string }>)
        .filter(conv => isAfterDate(conv.created_at, thirtyDaysAgo));

    const { data: receiptsData } = await supabase
        .from('receipts')
        .select('*');

    const recentReceipts = ((receiptsData || []) as Array<{ organization_id: string; created_at: string }>)
        .filter(r => isAfterDate(r.created_at, thirtyDaysAgo));

    const uniqueOrgs = new Set([
        ...recentAI.map(a => a.organization_id),
        ...recentReceipts.map(r => r.organization_id),
    ]);

    const firstAction = uniqueOrgs.size;

    // Subscribed
    const { data: subsData } = await supabase
        .from('subscriptions')
        .select('*')
        .neq('plan_id', 'free');

    const recentSubs = ((subsData || []) as Array<{ id: string; created_at: string }>)
        .filter(sub => isAfterDate(sub.created_at, thirtyDaysAgo));

    const subscribed = recentSubs.length;

    // Retained 30 days
    const { data: retainedData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

    const retained = ((retainedData || []) as Array<{ id: string; created_at: string }>)
        .filter(sub => isBeforeDate(sub.created_at, thirtyDaysAgo));

    const retained30Days = retained.length;

    return {
        signup: signups,
        onboardingStarted,
        firstAction,
        subscribed,
        retained30Days,
    };
}

// Get all SaaS metrics
export async function getSaaSMetrics(): Promise<SaaSMetrics> {
    const supabase = getSupabaseServerClient();

    // Get MRR
    const mrrData = await calculateMRR();
    const mrr = mrrData.total;
    const arr = mrr * 12;

    // Get subscription counts
    const { data: activeSubsData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'active');

    const activeSubscriptions = (activeSubsData || []).length;

    // Get user counts
    const { data: totalUsersData } = await supabase
        .from('users')
        .select('*');

    const totalUsers = (totalUsersData || []).length;

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select('*');

    const recentSessions = ((sessionsData || []) as Array<{ user_id: string; last_active_at: string }>)
        .filter(s => s.last_active_at && isAfterDate(s.last_active_at, thirtyDaysAgo));

    const uniqueActiveUsers = new Set(recentSessions.map(s => s.user_id));
    const activeUsers = uniqueActiveUsers.size;

    // Churn rate
    const churnData = await calculateChurnRate();
    const churnRate = churnData.currentMonth;

    // Activation rate
    const funnel = await calculateActivationFunnel();
    const activationRate = funnel.signup > 0 ? (funnel.firstAction / funnel.signup) * 100 : 0;

    // Trial conversion rate
    const { data: allSubsData } = await supabase
        .from('subscriptions')
        .select('*');

    const allSubs = (allSubsData || []) as Array<{ status: string; trial_end?: string }>;
    const trialing = allSubs.filter(s => s.status === 'trialing').length;
    const converted = allSubs.filter(s => s.status === 'active' && s.trial_end).length;
    const totalTrials = trialing + converted;
    const trialConversionRate = totalTrials > 0 ? (converted / totalTrials) * 100 : 0;

    // ARPU
    const arpu = activeSubscriptions > 0 ? Math.round(mrr / activeSubscriptions) : 0;

    // LTV estimate
    const monthlyChurnRate = churnRate / 100;
    const ltv = monthlyChurnRate > 0 ? Math.round(arpu / monthlyChurnRate) : arpu * 24;

    return {
        mrr,
        arr,
        activeSubscriptions,
        totalUsers,
        activeUsers,
        churnRate,
        activationRate,
        trialConversionRate,
        arpu,
        ltv,
    };
}

// Get daily metrics for charts
export async function getDailyMetrics(days: number = 30): Promise<DailyMetrics[]> {
    const supabase = getSupabaseServerClient();
    const metrics: DailyMetrics[] = [];

    // Fetch all data upfront
    const { data: usersData } = await supabase.from('users').select('*');
    const { data: aiData } = await supabase.from('ai_conversations').select('*');
    const { data: invoicesData } = await supabase.from('invoices').select('*');
    const { data: subsData } = await supabase.from('subscriptions').select('*');

    const users = (usersData || []) as Array<{ id: string; created_at: string }>;
    const conversations = (aiData || []) as Array<{ id: string; created_at: string }>;
    const invoices = (invoicesData || []) as Array<{ amount: number; status: string; paid_at?: string }>;
    const subs = (subsData || []) as Array<{ id: string; status: string; canceled_at?: string }>;

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Signups
        const daySignups = users.filter(u => isBetweenDates(u.created_at, date, nextDate)).length;

        // Activations
        const dayActivations = conversations.filter(c => isBetweenDates(c.created_at, date, nextDate)).length;

        // Revenue
        const dayRevenue = invoices
            .filter(inv => inv.status === 'paid' && inv.paid_at && isBetweenDates(inv.paid_at, date, nextDate))
            .reduce((sum, inv) => sum + inv.amount, 0);

        // Churn
        const dayChurn = subs
            .filter(sub => sub.status === 'canceled' && sub.canceled_at && isBetweenDates(sub.canceled_at, date, nextDate))
            .length;

        metrics.push({
            date: date.toISOString().split('T')[0],
            signups: daySignups,
            activations: dayActivations,
            revenue: dayRevenue,
            churn: dayChurn,
        });
    }

    return metrics;
}

// Get user activity data
export async function getUserActivity(): Promise<UserActivity> {
    const supabase = getSupabaseServerClient();
    const dailyActiveUsers: number[] = [];
    const weeklyActiveUsers: number[] = [];
    const monthlyActiveUsers: number[] = [];
    const dates: string[] = [];

    // Fetch session data once
    const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select('*');

    const sessions = (sessionsData || []) as Array<{ user_id: string; last_active_at: string }>;

    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        dates.push(date.toISOString().split('T')[0]);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // DAU
        const dauSessions = sessions.filter(s =>
            s.last_active_at && isBetweenDates(s.last_active_at, date, nextDate)
        );
        const uniqueDAU = new Set(dauSessions.map(s => s.user_id));
        dailyActiveUsers.push(uniqueDAU.size);

        // WAU
        const weekAgo = new Date(date);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const wauSessions = sessions.filter(s =>
            s.last_active_at && isBetweenDates(s.last_active_at, weekAgo, nextDate)
        );
        const uniqueWAU = new Set(wauSessions.map(s => s.user_id));
        weeklyActiveUsers.push(uniqueWAU.size);

        // MAU
        const monthAgo = new Date(date);
        monthAgo.setDate(monthAgo.getDate() - 30);
        const mauSessions = sessions.filter(s =>
            s.last_active_at && isBetweenDates(s.last_active_at, monthAgo, nextDate)
        );
        const uniqueMAU = new Set(mauSessions.map(s => s.user_id));
        monthlyActiveUsers.push(uniqueMAU.size);
    }

    return {
        dailyActiveUsers,
        weeklyActiveUsers,
        monthlyActiveUsers,
        dates,
    };
}

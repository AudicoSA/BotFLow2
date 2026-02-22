// Usage Tracking for Billing

import { getSupabaseServerClient } from '@/lib/supabase/client';
import { MODEL_CONFIGS, type AIModel, type UsageRecord, type UsageSummary } from './types';

/**
 * Record usage for a chat interaction
 */
export async function recordUsage(
    data: {
        organization_id: string;
        user_id: string;
        conversation_id: string;
        model: AIModel;
        input_tokens: number;
        output_tokens: number;
    }
): Promise<UsageRecord> {
    const supabase = getSupabaseServerClient();

    const config = MODEL_CONFIGS[data.model];
    const costCents = calculateCost(
        data.model,
        data.input_tokens,
        data.output_tokens
    );

    const result = await supabase
        .from<UsageRecord>('ai_usage_records')
        .insert({
            organization_id: data.organization_id,
            user_id: data.user_id,
            conversation_id: data.conversation_id,
            model: data.model,
            input_tokens: data.input_tokens,
            output_tokens: data.output_tokens,
            total_tokens: data.input_tokens + data.output_tokens,
            cost_cents: costCents,
            created_at: new Date().toISOString(),
        } as Partial<UsageRecord>)
        .select()
        .single();

    if (result.error || !result.data) {
        throw new Error(`Failed to record usage: ${result.error?.message || 'Unknown error'}`);
    }

    return result.data;
}

/**
 * Calculate cost in cents for token usage
 */
export function calculateCost(
    model: AIModel,
    inputTokens: number,
    outputTokens: number
): number {
    const config = MODEL_CONFIGS[model];
    const inputCost = (inputTokens / 1_000_000) * config.inputPricePerMillion;
    const outputCost = (outputTokens / 1_000_000) * config.outputPricePerMillion;
    return Math.ceil(inputCost + outputCost);
}

/**
 * Get usage records for an organization
 */
export async function getUsageRecords(
    organizationId: string,
    options: {
        startDate?: string;
        endDate?: string;
        userId?: string;
        model?: AIModel;
        limit?: number;
    } = {}
): Promise<UsageRecord[]> {
    const supabase = getSupabaseServerClient();

    return new Promise((resolve) => {
        let query = supabase
            .from<UsageRecord>('ai_usage_records')
            .select('*')
            .eq('organization_id', organizationId);

        if (options.userId) {
            query = query.eq('user_id', options.userId);
        }

        if (options.model) {
            query = query.eq('model', options.model);
        }

        query
            .order('created_at', { ascending: false })
            .limit(options.limit || 100)
            .then((result) => {
                if (result.error || !result.data) {
                    console.error('Error fetching usage records:', result.error);
                    resolve([]);
                } else {
                    resolve(result.data);
                }
            });
    });
}

/**
 * Get usage summary for an organization
 */
export async function getUsageSummary(
    organizationId: string,
    periodStart: string,
    periodEnd: string
): Promise<UsageSummary> {
    const records = await getUsageRecords(organizationId, {
        startDate: periodStart,
        endDate: periodEnd,
        limit: 10000,
    });

    // Filter by date range
    const filteredRecords = records.filter((r) => {
        const date = new Date(r.created_at);
        return date >= new Date(periodStart) && date <= new Date(periodEnd);
    });

    // Calculate totals
    const summary: UsageSummary = {
        organization_id: organizationId,
        period_start: periodStart,
        period_end: periodEnd,
        total_conversations: new Set(filteredRecords.map((r) => r.conversation_id)).size,
        total_messages: filteredRecords.length,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_tokens: 0,
        total_cost_cents: 0,
        by_model: {} as UsageSummary['by_model'],
    };

    // Initialize model stats
    const models: AIModel[] = ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-3.5-turbo'];
    for (const model of models) {
        summary.by_model[model] = {
            conversations: 0,
            messages: 0,
            input_tokens: 0,
            output_tokens: 0,
            cost_cents: 0,
        };
    }

    // Aggregate data
    const conversationsByModel: Record<AIModel, Set<string>> = {
        'gpt-4': new Set(),
        'gpt-4-turbo': new Set(),
        'gpt-4o': new Set(),
        'gpt-3.5-turbo': new Set(),
    };

    for (const record of filteredRecords) {
        summary.total_input_tokens += record.input_tokens;
        summary.total_output_tokens += record.output_tokens;
        summary.total_tokens += record.total_tokens;
        summary.total_cost_cents += record.cost_cents;

        const modelStats = summary.by_model[record.model];
        if (modelStats) {
            modelStats.messages += 1;
            modelStats.input_tokens += record.input_tokens;
            modelStats.output_tokens += record.output_tokens;
            modelStats.cost_cents += record.cost_cents;
            conversationsByModel[record.model].add(record.conversation_id);
        }
    }

    // Set conversation counts
    for (const model of models) {
        summary.by_model[model].conversations = conversationsByModel[model].size;
    }

    return summary;
}

/**
 * Get current month usage for an organization
 */
export async function getCurrentMonthUsage(
    organizationId: string
): Promise<UsageSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    return getUsageSummary(
        organizationId,
        startOfMonth.toISOString(),
        endOfMonth.toISOString()
    );
}

/**
 * Check if organization is within usage limits
 */
export async function checkUsageLimits(
    organizationId: string,
    limits: {
        maxTokensPerMonth?: number;
        maxCostCentsPerMonth?: number;
        maxConversationsPerMonth?: number;
    }
): Promise<{
    withinLimits: boolean;
    usage: UsageSummary;
    exceeded: string[];
}> {
    const usage = await getCurrentMonthUsage(organizationId);
    const exceeded: string[] = [];

    if (limits.maxTokensPerMonth && usage.total_tokens > limits.maxTokensPerMonth) {
        exceeded.push('tokens');
    }

    if (limits.maxCostCentsPerMonth && usage.total_cost_cents > limits.maxCostCentsPerMonth) {
        exceeded.push('cost');
    }

    if (limits.maxConversationsPerMonth && usage.total_conversations > limits.maxConversationsPerMonth) {
        exceeded.push('conversations');
    }

    return {
        withinLimits: exceeded.length === 0,
        usage,
        exceeded,
    };
}

/**
 * Get daily usage breakdown
 */
export async function getDailyUsage(
    organizationId: string,
    days: number = 30
): Promise<Array<{
    date: string;
    tokens: number;
    cost_cents: number;
    messages: number;
}>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const records = await getUsageRecords(organizationId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 10000,
    });

    // Group by date
    const dailyMap = new Map<string, { tokens: number; cost_cents: number; messages: number }>();

    for (const record of records) {
        const date = record.created_at.split('T')[0];
        const existing = dailyMap.get(date) || { tokens: 0, cost_cents: 0, messages: 0 };
        existing.tokens += record.total_tokens;
        existing.cost_cents += record.cost_cents;
        existing.messages += 1;
        dailyMap.set(date, existing);
    }

    // Convert to array and sort
    return Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get usage by user
 */
export async function getUsageByUser(
    organizationId: string,
    periodStart: string,
    periodEnd: string
): Promise<Array<{
    user_id: string;
    total_tokens: number;
    total_cost_cents: number;
    message_count: number;
    conversation_count: number;
}>> {
    const records = await getUsageRecords(organizationId, {
        startDate: periodStart,
        endDate: periodEnd,
        limit: 10000,
    });

    // Filter by date range
    const filteredRecords = records.filter((r) => {
        const date = new Date(r.created_at);
        return date >= new Date(periodStart) && date <= new Date(periodEnd);
    });

    // Group by user
    const userMap = new Map<string, {
        total_tokens: number;
        total_cost_cents: number;
        message_count: number;
        conversations: Set<string>;
    }>();

    for (const record of filteredRecords) {
        const existing = userMap.get(record.user_id) || {
            total_tokens: 0,
            total_cost_cents: 0,
            message_count: 0,
            conversations: new Set<string>(),
        };
        existing.total_tokens += record.total_tokens;
        existing.total_cost_cents += record.cost_cents;
        existing.message_count += 1;
        existing.conversations.add(record.conversation_id);
        userMap.set(record.user_id, existing);
    }

    // Convert to array
    return Array.from(userMap.entries()).map(([user_id, data]) => ({
        user_id,
        total_tokens: data.total_tokens,
        total_cost_cents: data.total_cost_cents,
        message_count: data.message_count,
        conversation_count: data.conversations.size,
    }));
}

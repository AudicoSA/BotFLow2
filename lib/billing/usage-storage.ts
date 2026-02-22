// Usage Record Storage

import { getSupabaseServerClient } from '@/lib/supabase/client';
import {
    getCurrentBillingPeriod,
    getBillingPeriodForDate,
    USAGE_PRICING,
    getUsageTypeService,
} from './types';
import type {
    UsageRecord,
    UsageRecordCreate,
    UsageSummary,
    UsageBreakdown,
    UsageType,
    ServiceType,
} from './types';
import { generateSecureToken } from '@/lib/auth/password';

/**
 * Record a usage event
 */
export async function recordUsage(data: UsageRecordCreate): Promise<UsageRecord> {
    const supabase = getSupabaseServerClient();
    const billingPeriod = getCurrentBillingPeriod();
    const pricing = USAGE_PRICING[data.usage_type];

    const record: Partial<UsageRecord> = {
        id: generateSecureToken(16),
        organization_id: data.organization_id,
        user_id: data.user_id || null,
        usage_type: data.usage_type,
        quantity: data.quantity,
        unit_price: pricing.unit_price * 100, // Store in cents
        total_amount: Math.round(data.quantity * pricing.unit_price * 100),
        metadata: data.metadata || {},
        billing_period: billingPeriod.period_key,
        created_at: new Date().toISOString(),
    };

    const result = await supabase
        .from<UsageRecord>('usage_records')
        .insert(record)
        .select()
        .single();

    if (!result.data) {
        throw new Error('Failed to record usage');
    }

    return result.data;
}

/**
 * Record multiple usage events in batch
 */
export async function recordUsageBatch(
    records: UsageRecordCreate[]
): Promise<UsageRecord[]> {
    const supabase = getSupabaseServerClient();
    const billingPeriod = getCurrentBillingPeriod();

    const recordsToInsert = records.map((data) => {
        const pricing = USAGE_PRICING[data.usage_type];
        return {
            id: generateSecureToken(16),
            organization_id: data.organization_id,
            user_id: data.user_id || null,
            usage_type: data.usage_type,
            quantity: data.quantity,
            unit_price: pricing.unit_price * 100,
            total_amount: Math.round(data.quantity * pricing.unit_price * 100),
            metadata: data.metadata || {},
            billing_period: billingPeriod.period_key,
            created_at: new Date().toISOString(),
        };
    });

    const result = await supabase
        .from<UsageRecord>('usage_records')
        .insert(recordsToInsert)
        .select();

    return result.data || [];
}

/**
 * Get usage records for an organization in a billing period
 */
export async function getUsageRecords(
    organizationId: string,
    billingPeriod?: string
): Promise<UsageRecord[]> {
    const supabase = getSupabaseServerClient();
    const period = billingPeriod || getCurrentBillingPeriod().period_key;

    const result = await supabase
        .from<UsageRecord>('usage_records')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('billing_period', period)
        .order('created_at', { ascending: false });

    return result.data || [];
}

/**
 * Get aggregated usage by type for an organization
 */
export async function getUsageByType(
    organizationId: string,
    billingPeriod?: string
): Promise<Map<UsageType, number>> {
    const records = await getUsageRecords(organizationId, billingPeriod);
    const usageMap = new Map<UsageType, number>();

    for (const record of records) {
        const current = usageMap.get(record.usage_type) || 0;
        usageMap.set(record.usage_type, current + record.quantity);
    }

    return usageMap;
}

/**
 * Get usage summary for an organization
 */
export async function getUsageSummary(
    organizationId: string,
    billingPeriod?: string
): Promise<UsageSummary> {
    const period = billingPeriod || getCurrentBillingPeriod().period_key;
    const usageByType = await getUsageByType(organizationId, period);

    // Group by service
    const serviceUsage = new Map<ServiceType, UsageBreakdown[]>();

    for (const [usageType, quantity] of usageByType) {
        const service = getUsageTypeService(usageType);
        const pricing = USAGE_PRICING[usageType];
        const total = Math.round(quantity * pricing.unit_price * 100);

        const breakdown: UsageBreakdown = {
            usage_type: usageType,
            quantity,
            unit_price: pricing.unit_price * 100,
            total,
            description: pricing.description,
        };

        const existing = serviceUsage.get(service) || [];
        existing.push(breakdown);
        serviceUsage.set(service, existing);
    }

    // Build summary
    const services = Array.from(serviceUsage.entries()).map(([service, usage]) => ({
        service,
        usage,
        subtotal: usage.reduce((sum, u) => sum + u.total, 0),
    }));

    const total_amount = services.reduce((sum, s) => sum + s.subtotal, 0);

    return {
        organization_id: organizationId,
        billing_period: period,
        services,
        total_amount,
        currency: 'ZAR',
    };
}

/**
 * Get usage count for a specific type
 */
export async function getUsageCount(
    organizationId: string,
    usageType: UsageType,
    billingPeriod?: string
): Promise<number> {
    const usageByType = await getUsageByType(organizationId, billingPeriod);
    return usageByType.get(usageType) || 0;
}

/**
 * Check if organization has exceeded included usage
 */
export async function checkUsageLimit(
    organizationId: string,
    usageType: UsageType
): Promise<{ exceeded: boolean; used: number; limit: number; overage: number }> {
    const pricing = USAGE_PRICING[usageType];
    const used = await getUsageCount(organizationId, usageType);
    const limit = pricing.included_in_plan;

    // -1 means unlimited
    if (limit === -1) {
        return { exceeded: false, used, limit: -1, overage: 0 };
    }

    const exceeded = used > limit;
    const overage = exceeded ? used - limit : 0;

    return { exceeded, used, limit, overage };
}

/**
 * Get total billable amount for usage (overage charges only)
 */
export async function calculateOverageCharges(
    organizationId: string,
    billingPeriod?: string
): Promise<{ charges: Map<UsageType, number>; total: number }> {
    const usageByType = await getUsageByType(organizationId, billingPeriod);
    const charges = new Map<UsageType, number>();
    let total = 0;

    for (const [usageType, quantity] of usageByType) {
        const pricing = USAGE_PRICING[usageType];

        // Skip if unlimited
        if (pricing.included_in_plan === -1) continue;

        // Calculate overage
        const overage = Math.max(0, quantity - pricing.included_in_plan);
        if (overage > 0) {
            const charge = Math.round(overage * pricing.overage_price * 100);
            charges.set(usageType, charge);
            total += charge;
        }
    }

    return { charges, total };
}

/**
 * Get daily usage breakdown
 */
export async function getDailyUsage(
    organizationId: string,
    billingPeriod?: string
): Promise<Map<string, Map<UsageType, number>>> {
    const records = await getUsageRecords(organizationId, billingPeriod);
    const dailyUsage = new Map<string, Map<UsageType, number>>();

    for (const record of records) {
        const date = record.created_at.split('T')[0];
        let dayUsage = dailyUsage.get(date);

        if (!dayUsage) {
            dayUsage = new Map();
            dailyUsage.set(date, dayUsage);
        }

        const current = dayUsage.get(record.usage_type) || 0;
        dayUsage.set(record.usage_type, current + record.quantity);
    }

    return dailyUsage;
}

/**
 * Delete usage records for a billing period (admin only)
 */
export async function deleteUsageRecords(
    organizationId: string,
    billingPeriod: string
): Promise<void> {
    const supabase = getSupabaseServerClient();

    await supabase
        .from<UsageRecord>('usage_records')
        .delete()
        .eq('organization_id', organizationId)
        .eq('billing_period', billingPeriod);
}

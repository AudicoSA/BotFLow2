// Receipt Storage and Management

import { getSupabaseServerClient } from '@/lib/supabase/client';
import { suggestCategory } from './types';
import type {
    Receipt,
    ReceiptCreate,
    ReceiptUpdate,
    ExpenseCategory,
    ExpenseSummary,
    OCRExtractedData,
} from './types';

/**
 * Create a new receipt
 */
export async function createReceipt(data: ReceiptCreate): Promise<Receipt> {
    const supabase = getSupabaseServerClient();

    const receiptData: Partial<Receipt> = {
        organization_id: data.organization_id,
        user_id: data.user_id,
        image_url: data.image_url,
        status: 'pending',
        merchant_name: data.merchant_name || 'Unknown Merchant',
        date: data.date || new Date().toISOString().split('T')[0],
        total: data.total || 0,
        currency: 'ZAR',
        category: data.category || 'other',
        notes: data.notes,
        tags: data.tags,
        is_reimbursable: data.is_reimbursable || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const result = await supabase
        .from<Receipt>('receipts')
        .insert(receiptData)
        .select()
        .single();

    if (result.error || !result.data) {
        throw new Error(`Failed to create receipt: ${result.error?.message || 'Unknown error'}`);
    }

    return result.data;
}

/**
 * Get a receipt by ID
 */
export async function getReceipt(receiptId: string): Promise<Receipt | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Receipt>('receipts')
        .select('*')
        .eq('id', receiptId)
        .single();

    if (result.error || !result.data) {
        return null;
    }

    return result.data;
}

/**
 * Get receipts for an organization
 */
export async function getOrganizationReceipts(
    organizationId: string,
    options: {
        userId?: string;
        category?: ExpenseCategory;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    } = {}
): Promise<Receipt[]> {
    const supabase = getSupabaseServerClient();

    return new Promise((resolve) => {
        let query = supabase
            .from<Receipt>('receipts')
            .select('*')
            .eq('organization_id', organizationId);

        if (options.userId) {
            query = query.eq('user_id', options.userId);
        }

        if (options.category) {
            query = query.eq('category', options.category);
        }

        query
            .order('date', { ascending: false })
            .limit(options.limit || 50)
            .then((result) => {
                if (result.error || !result.data) {
                    console.error('Error fetching receipts:', result.error);
                    resolve([]);
                } else {
                    // Apply date filters client-side if needed
                    let receipts = result.data;
                    if (options.startDate) {
                        receipts = receipts.filter(
                            (r) => r.date >= options.startDate!
                        );
                    }
                    if (options.endDate) {
                        receipts = receipts.filter(
                            (r) => r.date <= options.endDate!
                        );
                    }
                    resolve(receipts);
                }
            });
    });
}

/**
 * Update a receipt
 */
export async function updateReceipt(
    receiptId: string,
    updates: ReceiptUpdate
): Promise<Receipt | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Receipt>('receipts')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', receiptId)
        .select()
        .single();

    if (result.error || !result.data) {
        console.error('Error updating receipt:', result.error);
        return null;
    }

    return result.data;
}

/**
 * Update receipt with OCR data
 */
export async function updateReceiptWithOCRData(
    receiptId: string,
    ocrData: OCRExtractedData
): Promise<Receipt | null> {
    const updates: ReceiptUpdate = {
        merchant_name: ocrData.merchant_name,
        merchant_address: ocrData.merchant_address,
        date: ocrData.date,
        time: ocrData.time,
        subtotal: ocrData.subtotal,
        tax: ocrData.tax,
        tip: ocrData.tip,
        total: ocrData.total,
        payment_method: ocrData.payment_method,
        items: ocrData.items,
    };

    // Suggest category based on merchant
    if (ocrData.merchant_name) {
        updates.category = suggestCategory(ocrData.merchant_name);
    }

    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Receipt>('receipts')
        .update({
            ...updates,
            status: 'completed',
            ocr_data: ocrData as unknown as Receipt['ocr_data'],
            updated_at: new Date().toISOString(),
        } as Partial<Receipt>)
        .eq('id', receiptId)
        .select()
        .single();

    if (result.error || !result.data) {
        console.error('Error updating receipt with OCR:', result.error);
        return null;
    }

    return result.data;
}

/**
 * Update receipt status
 */
export async function updateReceiptStatus(
    receiptId: string,
    status: Receipt['status']
): Promise<void> {
    const supabase = getSupabaseServerClient();

    await supabase
        .from('receipts')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', receiptId);
}

/**
 * Delete a receipt
 */
export async function deleteReceipt(receiptId: string): Promise<void> {
    const supabase = getSupabaseServerClient();

    await supabase.from('receipts').delete().eq('id', receiptId);
}

/**
 * Get expense summary for an organization
 */
export async function getExpenseSummary(
    organizationId: string,
    periodStart: string,
    periodEnd: string
): Promise<ExpenseSummary> {
    const receipts = await getOrganizationReceipts(organizationId, {
        startDate: periodStart,
        endDate: periodEnd,
        limit: 10000,
    });

    const summary: ExpenseSummary = {
        organization_id: organizationId,
        period_start: periodStart,
        period_end: periodEnd,
        total_receipts: receipts.length,
        total_amount: 0,
        by_category: {} as ExpenseSummary['by_category'],
        by_month: [],
        top_merchants: [],
        average_receipt: 0,
    };

    // Initialize categories
    const categories: ExpenseCategory[] = [
        'food_dining', 'groceries', 'transportation', 'utilities',
        'entertainment', 'shopping', 'healthcare', 'travel',
        'office_supplies', 'software', 'professional_services', 'other',
    ];

    for (const cat of categories) {
        summary.by_category[cat] = { count: 0, total: 0, percentage: 0 };
    }

    // Aggregate data
    const monthMap = new Map<string, { count: number; total: number }>();
    const merchantMap = new Map<string, { count: number; total: number }>();

    for (const receipt of receipts) {
        // Total amount
        summary.total_amount += receipt.total;

        // By category
        const catStats = summary.by_category[receipt.category];
        if (catStats) {
            catStats.count += 1;
            catStats.total += receipt.total;
        }

        // By month
        const month = receipt.date.slice(0, 7); // YYYY-MM
        const monthStats = monthMap.get(month) || { count: 0, total: 0 };
        monthStats.count += 1;
        monthStats.total += receipt.total;
        monthMap.set(month, monthStats);

        // By merchant
        const merchantName = receipt.merchant_name.toLowerCase();
        const merchantStats = merchantMap.get(merchantName) || { count: 0, total: 0 };
        merchantStats.count += 1;
        merchantStats.total += receipt.total;
        merchantMap.set(merchantName, merchantStats);
    }

    // Calculate percentages
    for (const cat of categories) {
        const catStats = summary.by_category[cat];
        catStats.percentage =
            summary.total_amount > 0
                ? (catStats.total / summary.total_amount) * 100
                : 0;
    }

    // Convert month map to array
    summary.by_month = Array.from(monthMap.entries())
        .map(([month, stats]) => ({ month, ...stats }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // Get top merchants
    summary.top_merchants = Array.from(merchantMap.entries())
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    // Calculate average
    summary.average_receipt =
        summary.total_receipts > 0
            ? summary.total_amount / summary.total_receipts
            : 0;

    return summary;
}

/**
 * Get current month expense summary
 */
export async function getCurrentMonthSummary(
    organizationId: string
): Promise<ExpenseSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return getExpenseSummary(
        organizationId,
        startOfMonth.toISOString().split('T')[0],
        endOfMonth.toISOString().split('T')[0]
    );
}

/**
 * Search receipts
 */
export async function searchReceipts(
    organizationId: string,
    query: string,
    limit = 20
): Promise<Receipt[]> {
    const receipts = await getOrganizationReceipts(organizationId, {
        limit: 1000,
    });

    const lowerQuery = query.toLowerCase();

    return receipts
        .filter((r) => {
            return (
                r.merchant_name.toLowerCase().includes(lowerQuery) ||
                r.notes?.toLowerCase().includes(lowerQuery) ||
                r.tags?.some((t) => t.toLowerCase().includes(lowerQuery))
            );
        })
        .slice(0, limit);
}

/**
 * Get receipts by tag
 */
export async function getReceiptsByTag(
    organizationId: string,
    tag: string
): Promise<Receipt[]> {
    const receipts = await getOrganizationReceipts(organizationId, {
        limit: 1000,
    });

    return receipts.filter((r) =>
        r.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
}

/**
 * Get reimbursable receipts
 */
export async function getReimbursableReceipts(
    organizationId: string,
    status?: 'pending' | 'approved' | 'rejected' | 'paid'
): Promise<Receipt[]> {
    const receipts = await getOrganizationReceipts(organizationId, {
        limit: 1000,
    });

    return receipts.filter((r) => {
        if (!r.is_reimbursable) return false;
        if (status && r.reimbursement_status !== status) return false;
        return true;
    });
}

/**
 * Bulk update receipt categories
 */
export async function bulkUpdateCategory(
    receiptIds: string[],
    category: ExpenseCategory
): Promise<void> {
    const supabase = getSupabaseServerClient();

    for (const id of receiptIds) {
        await supabase
            .from('receipts')
            .update({
                category,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);
    }
}

/**
 * Get receipt statistics
 */
export async function getReceiptStats(
    organizationId: string,
    userId?: string
): Promise<{
    total_receipts: number;
    total_amount: number;
    this_month_count: number;
    this_month_amount: number;
    pending_count: number;
}> {
    const allReceipts = await getOrganizationReceipts(organizationId, {
        userId,
        limit: 10000,
    });

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const thisMonthReceipts = allReceipts.filter((r) =>
        r.date.startsWith(thisMonth)
    );

    return {
        total_receipts: allReceipts.length,
        total_amount: allReceipts.reduce((sum, r) => sum + r.total, 0),
        this_month_count: thisMonthReceipts.length,
        this_month_amount: thisMonthReceipts.reduce((sum, r) => sum + r.total, 0),
        pending_count: allReceipts.filter((r) => r.status === 'pending').length,
    };
}

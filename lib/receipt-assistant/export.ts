// Receipt Export - CSV and PDF Generation

import type { Receipt, ExportOptions, ExpenseCategory } from './types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, formatCurrency } from './types';

/**
 * Generate CSV export of receipts
 */
export function generateCSV(
    receipts: Receipt[],
    options: ExportOptions
): string {
    const headers = [
        'Date',
        'Merchant',
        'Category',
        'Amount',
        'Currency',
        'Tax',
        'Subtotal',
        'Payment Method',
        'Notes',
        'Tags',
        'Reimbursable',
        'Reimbursement Status',
    ];

    if (options.include_items) {
        headers.push('Items');
    }

    const rows: string[][] = [headers];

    for (const receipt of receipts) {
        const row = [
            receipt.date,
            escapeCSV(receipt.merchant_name),
            EXPENSE_CATEGORIES[receipt.category]?.name || receipt.category,
            receipt.total.toFixed(2),
            receipt.currency,
            receipt.tax?.toFixed(2) || '',
            receipt.subtotal?.toFixed(2) || '',
            receipt.payment_method ? PAYMENT_METHODS[receipt.payment_method] : '',
            escapeCSV(receipt.notes || ''),
            receipt.tags?.join('; ') || '',
            receipt.is_reimbursable ? 'Yes' : 'No',
            receipt.reimbursement_status || '',
        ];

        if (options.include_items) {
            const itemsStr = receipt.items
                ?.map((item) => `${item.description} (${formatCurrency(item.total_price)})`)
                .join('; ') || '';
            row.push(escapeCSV(itemsStr));
        }

        rows.push(row);
    }

    return rows.map((row) => row.join(',')).join('\n');
}

/**
 * Escape CSV field
 */
function escapeCSV(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

/**
 * Generate PDF report HTML (to be rendered by a PDF library)
 */
export function generatePDFHTML(
    receipts: Receipt[],
    options: ExportOptions,
    summary?: {
        total: number;
        by_category: Record<ExpenseCategory, { count: number; total: number }>;
    }
): string {
    const startDate = options.start_date || 'All time';
    const endDate = options.end_date || 'Present';

    let html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Expense Report</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.5;
            color: #333;
            margin: 40px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #00B4D8;
        }
        .header h1 {
            color: #00B4D8;
            font-size: 24px;
            margin: 0 0 10px 0;
        }
        .header .period {
            color: #666;
            font-size: 14px;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .summary h2 {
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #333;
        }
        .summary-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        .summary-item {
            flex: 1;
            min-width: 150px;
        }
        .summary-item .label {
            color: #666;
            font-size: 11px;
            text-transform: uppercase;
        }
        .summary-item .value {
            font-size: 20px;
            font-weight: bold;
            color: #00B4D8;
        }
        .category-breakdown {
            margin-top: 20px;
        }
        .category-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background: #00B4D8;
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
        }
        td {
            padding: 10px 8px;
            border-bottom: 1px solid #eee;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .amount {
            text-align: right;
            font-weight: bold;
        }
        .category-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            background: #e9ecef;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 10px;
        }
        @media print {
            body { margin: 20px; }
            .header { page-break-after: avoid; }
            tr { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Expense Report</h1>
        <div class="period">${startDate} - ${endDate}</div>
    </div>
`;

    // Summary section
    if (summary) {
        const totalReceipts = receipts.length;
        const avgReceipt = totalReceipts > 0 ? summary.total / totalReceipts : 0;

        html += `
    <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="label">Total Expenses</div>
                <div class="value">${formatCurrency(summary.total)}</div>
            </div>
            <div class="summary-item">
                <div class="label">Receipts</div>
                <div class="value">${totalReceipts}</div>
            </div>
            <div class="summary-item">
                <div class="label">Average</div>
                <div class="value">${formatCurrency(avgReceipt)}</div>
            </div>
        </div>
        <div class="category-breakdown">
            <h3 style="font-size: 14px; margin: 15px 0 10px;">By Category</h3>
`;

        const sortedCategories = Object.entries(summary.by_category)
            .filter(([_, data]) => data.count > 0)
            .sort((a, b) => b[1].total - a[1].total);

        for (const [cat, data] of sortedCategories) {
            const catInfo = EXPENSE_CATEGORIES[cat as ExpenseCategory];
            html += `
            <div class="category-row">
                <span>${catInfo?.icon || ''} ${catInfo?.name || cat}</span>
                <span>${formatCurrency(data.total)} (${data.count} receipts)</span>
            </div>
`;
        }

        html += `
        </div>
    </div>
`;
    }

    // Receipts table
    html += `
    <h2 style="font-size: 16px; margin-bottom: 10px;">Receipts</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Merchant</th>
                <th>Category</th>
                <th>Payment</th>
                <th class="amount">Amount</th>
            </tr>
        </thead>
        <tbody>
`;

    for (const receipt of receipts) {
        const catInfo = EXPENSE_CATEGORIES[receipt.category];
        html += `
            <tr>
                <td>${receipt.date}</td>
                <td>${escapeHTML(receipt.merchant_name)}</td>
                <td><span class="category-badge">${catInfo?.icon || ''} ${catInfo?.name || receipt.category}</span></td>
                <td>${receipt.payment_method ? PAYMENT_METHODS[receipt.payment_method] : '-'}</td>
                <td class="amount">${formatCurrency(receipt.total, receipt.currency)}</td>
            </tr>
`;

        // Include items if requested
        if (options.include_items && receipt.items && receipt.items.length > 0) {
            html += `
            <tr>
                <td colspan="5" style="padding-left: 40px; color: #666; font-size: 11px;">
                    <strong>Items:</strong>
                    ${receipt.items.map((item) => `${item.description} (${formatCurrency(item.total_price)})`).join(', ')}
                </td>
            </tr>
`;
        }
    }

    html += `
        </tbody>
    </table>
    <div class="footer">
        Generated by BotFlow Receipt Assistant on ${new Date().toLocaleDateString()}
    </div>
</body>
</html>
`;

    return html;
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
    format: 'csv' | 'pdf',
    startDate?: string,
    endDate?: string
): string {
    const date = new Date().toISOString().split('T')[0];
    let filename = `expense-report-${date}`;

    if (startDate && endDate) {
        filename = `expense-report-${startDate}-to-${endDate}`;
    }

    return `${filename}.${format}`;
}

/**
 * Calculate totals for export
 */
export function calculateExportTotals(
    receipts: Receipt[]
): {
    total: number;
    by_category: Record<ExpenseCategory, { count: number; total: number }>;
} {
    const byCategory: Record<ExpenseCategory, { count: number; total: number }> = {} as Record<
        ExpenseCategory,
        { count: number; total: number }
    >;

    // Initialize categories
    const categories: ExpenseCategory[] = [
        'food_dining', 'groceries', 'transportation', 'utilities',
        'entertainment', 'shopping', 'healthcare', 'travel',
        'office_supplies', 'software', 'professional_services', 'other',
    ];

    for (const cat of categories) {
        byCategory[cat] = { count: 0, total: 0 };
    }

    let total = 0;

    for (const receipt of receipts) {
        total += receipt.total;
        const catStats = byCategory[receipt.category];
        if (catStats) {
            catStats.count += 1;
            catStats.total += receipt.total;
        }
    }

    return { total, by_category: byCategory };
}

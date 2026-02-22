import { NextRequest, NextResponse } from 'next/server';
import { getOrganizationReceipts } from '@/lib/receipt-assistant/storage';
import {
    generateCSV,
    generatePDFHTML,
    generateExportFilename,
} from '@/lib/receipt-assistant/export';
import type { ExportOptions, ExpenseCategory } from '@/lib/receipt-assistant/types';

// POST /api/receipts/export - Export receipts to CSV or PDF
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            organization_id,
            format = 'csv',
            start_date,
            end_date,
            categories,
            include_items = true,
        } = body as {
            organization_id: string;
            format?: 'csv' | 'pdf';
            start_date?: string;
            end_date?: string;
            categories?: ExpenseCategory[];
            include_items?: boolean;
        };

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        // Fetch receipts with filters
        const receipts = await getOrganizationReceipts(organization_id, {
            startDate: start_date,
            endDate: end_date,
            category: categories?.[0], // Storage function supports single category
        });

        // Filter by status and multiple categories if provided
        let filteredReceipts = receipts.filter((r) => r.status === 'completed');
        if (categories && categories.length > 1) {
            filteredReceipts = filteredReceipts.filter((r) =>
                categories.includes(r.category)
            );
        }

        const options: ExportOptions = {
            format,
            start_date,
            end_date,
            categories,
            include_items,
        };

        if (format === 'csv') {
            const csv = generateCSV(filteredReceipts, options);
            const filename = generateExportFilename('csv', start_date, end_date);

            return new NextResponse(csv, {
                status: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                },
            });
        } else if (format === 'pdf') {
            // Return HTML that can be rendered to PDF by client or server
            const html = generatePDFHTML(filteredReceipts, options);
            const filename = generateExportFilename('pdf', start_date, end_date);

            return NextResponse.json({
                html,
                filename,
                receipt_count: filteredReceipts.length,
            });
        }

        return NextResponse.json(
            { error: 'Invalid format. Use csv or pdf' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error exporting receipts:', error);
        return NextResponse.json(
            { error: 'Failed to export receipts' },
            { status: 500 }
        );
    }
}

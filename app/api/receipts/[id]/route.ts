import { NextRequest, NextResponse } from 'next/server';
import {
    getReceipt,
    updateReceipt,
    deleteReceipt,
} from '@/lib/receipt-assistant/storage';
import type { ReceiptUpdate } from '@/lib/receipt-assistant/types';

// GET /api/receipts/[id] - Get a specific receipt
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const receipt = await getReceipt(id);

        if (!receipt) {
            return NextResponse.json(
                { error: 'Receipt not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ receipt });
    } catch (error) {
        console.error('Error fetching receipt:', error);
        return NextResponse.json(
            { error: 'Failed to fetch receipt' },
            { status: 500 }
        );
    }
}

// PATCH /api/receipts/[id] - Update a receipt
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = (await request.json()) as ReceiptUpdate;

        const receipt = await updateReceipt(id, body);

        if (!receipt) {
            return NextResponse.json(
                { error: 'Receipt not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ receipt });
    } catch (error) {
        console.error('Error updating receipt:', error);
        return NextResponse.json(
            { error: 'Failed to update receipt' },
            { status: 500 }
        );
    }
}

// DELETE /api/receipts/[id] - Delete a receipt
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const receipt = await getReceipt(id);

        if (!receipt) {
            return NextResponse.json(
                { error: 'Receipt not found' },
                { status: 404 }
            );
        }

        await deleteReceipt(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting receipt:', error);
        return NextResponse.json(
            { error: 'Failed to delete receipt' },
            { status: 500 }
        );
    }
}

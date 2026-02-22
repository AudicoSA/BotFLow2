import { NextRequest, NextResponse } from 'next/server';
import {
    processReceiptWithGoogleVision,
    calculateConfidence,
} from '@/lib/receipt-assistant/ocr';
import {
    getReceipt,
    updateReceiptWithOCRData,
} from '@/lib/receipt-assistant/storage';

// POST /api/receipts/process-ocr - Process receipt image with OCR
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { receipt_id, image_base64 } = body;

        if (!receipt_id || !image_base64) {
            return NextResponse.json(
                { error: 'receipt_id and image_base64 are required' },
                { status: 400 }
            );
        }

        // Verify receipt exists
        const receipt = await getReceipt(receipt_id);
        if (!receipt) {
            return NextResponse.json(
                { error: 'Receipt not found' },
                { status: 404 }
            );
        }

        // Process image with Google Vision OCR
        const ocrData = await processReceiptWithGoogleVision(image_base64);

        // Calculate confidence score
        ocrData.confidence = calculateConfidence(ocrData);

        // Update receipt with OCR data
        const updatedReceipt = await updateReceiptWithOCRData(
            receipt_id,
            ocrData
        );

        return NextResponse.json({
            receipt: updatedReceipt,
            ocr_data: ocrData,
        });
    } catch (error) {
        console.error('Error processing OCR:', error);

        const message =
            error instanceof Error ? error.message : 'Failed to process OCR';

        return NextResponse.json({ error: message }, { status: 500 });
    }
}

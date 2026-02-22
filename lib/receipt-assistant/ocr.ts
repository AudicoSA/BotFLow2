// OCR Processing for Receipt Assistant
// Supports Google Cloud Vision API

import type { OCRExtractedData, ReceiptLineItem, PaymentMethod } from './types';
import { suggestCategory } from './types';

const GOOGLE_VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

interface GoogleVisionResponse {
    responses: Array<{
        textAnnotations?: Array<{
            description: string;
            boundingPoly: {
                vertices: Array<{ x: number; y: number }>;
            };
        }>;
        fullTextAnnotation?: {
            text: string;
        };
        error?: {
            code: number;
            message: string;
        };
    }>;
}

/**
 * Process receipt image with Google Cloud Vision API
 */
export async function processReceiptWithGoogleVision(
    imageBase64: string,
    apiKey?: string
): Promise<OCRExtractedData> {
    const key = apiKey || process.env.GOOGLE_CLOUD_VISION_API_KEY;

    if (!key) {
        throw new Error('Google Cloud Vision API key not configured');
    }

    const requestBody = {
        requests: [
            {
                image: {
                    content: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                },
                features: [
                    {
                        type: 'TEXT_DETECTION',
                        maxResults: 1,
                    },
                ],
                imageContext: {
                    languageHints: ['en', 'af'], // English and Afrikaans for SA
                },
            },
        ],
    };

    const response = await fetch(`${GOOGLE_VISION_API_URL}?key=${key}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new OCRError(
            error.error?.message || 'Google Vision API request failed',
            response.status
        );
    }

    const data: GoogleVisionResponse = await response.json();

    if (data.responses[0]?.error) {
        throw new OCRError(
            data.responses[0].error.message,
            data.responses[0].error.code
        );
    }

    const rawText = data.responses[0]?.fullTextAnnotation?.text || '';

    if (!rawText) {
        return {
            raw_text: '',
            confidence: 0,
        };
    }

    // Extract structured data from raw text
    return extractReceiptData(rawText);
}

/**
 * Extract structured receipt data from raw OCR text
 */
export function extractReceiptData(rawText: string): OCRExtractedData {
    const lines = rawText.split('\n').map((line) => line.trim()).filter(Boolean);

    const result: OCRExtractedData = {
        raw_text: rawText,
        confidence: 0.8, // Base confidence
        currency: 'ZAR',
        items: [],
    };

    // Extract merchant name (usually first line or after logo)
    result.merchant_name = extractMerchantName(lines);

    // Extract address
    result.merchant_address = extractAddress(lines);

    // Extract phone number
    result.merchant_phone = extractPhoneNumber(rawText);

    // Extract date and time
    const dateTime = extractDateTime(rawText);
    result.date = dateTime.date;
    result.time = dateTime.time;

    // Extract amounts
    const amounts = extractAmounts(rawText, lines);
    result.subtotal = amounts.subtotal;
    result.tax = amounts.tax;
    result.tip = amounts.tip;
    result.total = amounts.total;

    // Extract payment method
    result.payment_method = extractPaymentMethod(rawText);

    // Extract card last four digits
    result.card_last_four = extractCardLastFour(rawText);

    // Extract line items
    result.items = extractLineItems(lines);

    return result;
}

/**
 * Extract merchant name from receipt lines
 */
function extractMerchantName(lines: string[]): string | undefined {
    // Usually the merchant name is in the first few lines
    // Look for all-caps lines or lines before address patterns
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];

        // Skip very short lines or lines with just numbers
        if (line.length < 3 || /^\d+$/.test(line)) continue;

        // Skip lines that look like addresses
        if (/\d+\s+\w+\s+(street|st|road|rd|avenue|ave)/i.test(line)) continue;

        // Skip lines with phone numbers
        if (/\d{3}[-\s]?\d{3,4}[-\s]?\d{4}/.test(line)) continue;

        // Return the first substantial line
        return line;
    }

    return undefined;
}

/**
 * Extract address from receipt lines
 */
function extractAddress(lines: string[]): string | undefined {
    const addressPatterns = [
        /\d+\s+[\w\s]+(?:street|st|road|rd|avenue|ave|drive|dr|lane|ln|way|boulevard|blvd)/i,
        /(?:shop|unit|store)\s*\d+/i,
        /\d{4}\s*[A-Za-z]+/i, // Postal code pattern
    ];

    const addressLines: string[] = [];

    for (const line of lines) {
        for (const pattern of addressPatterns) {
            if (pattern.test(line)) {
                addressLines.push(line);
                break;
            }
        }
    }

    return addressLines.length > 0 ? addressLines.join(', ') : undefined;
}

/**
 * Extract phone number
 */
function extractPhoneNumber(text: string): string | undefined {
    // South African phone patterns
    const patterns = [
        /\b0\d{2}[-\s]?\d{3}[-\s]?\d{4}\b/, // 011-123-4567 or 0111234567
        /\b\+27\s?\d{2}[-\s]?\d{3}[-\s]?\d{4}\b/, // +27 11 123 4567
        /\btel[:\s]*[\d\s-]+/i,
        /\bphone[:\s]*[\d\s-]+/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[0].replace(/tel[:\s]*/i, '').replace(/phone[:\s]*/i, '').trim();
        }
    }

    return undefined;
}

/**
 * Extract date and time
 */
function extractDateTime(text: string): { date?: string; time?: string } {
    const result: { date?: string; time?: string } = {};

    // Date patterns
    const datePatterns = [
        /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/,  // DD/MM/YYYY or DD-MM-YYYY
        /(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})/,    // YYYY/MM/DD
        /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})/i,
    ];

    for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
            // Try to normalize to ISO date
            try {
                const dateStr = match[0];
                const parsed = parseDate(dateStr);
                if (parsed) {
                    result.date = parsed;
                    break;
                }
            } catch {
                // Continue to next pattern
            }
        }
    }

    // Time patterns
    const timePatterns = [
        /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?\b/i,
        /\btime[:\s]*(\d{1,2}):(\d{2})/i,
    ];

    for (const pattern of timePatterns) {
        const match = text.match(pattern);
        if (match) {
            result.time = match[0].replace(/time[:\s]*/i, '').trim();
            break;
        }
    }

    return result;
}

/**
 * Parse date string to ISO format
 */
function parseDate(dateStr: string): string | undefined {
    // Common South African date format: DD/MM/YYYY
    const ddmmyyyy = dateStr.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    if (ddmmyyyy) {
        const day = ddmmyyyy[1].padStart(2, '0');
        const month = ddmmyyyy[2].padStart(2, '0');
        let year = ddmmyyyy[3];
        if (year.length === 2) {
            year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
        return `${year}-${month}-${day}`;
    }

    // Month name format
    const monthNames: Record<string, string> = {
        jan: '01', feb: '02', mar: '03', apr: '04',
        may: '05', jun: '06', jul: '07', aug: '08',
        sep: '09', oct: '10', nov: '11', dec: '12',
    };

    const monthMatch = dateStr.match(/(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{2,4})/i);
    if (monthMatch) {
        const day = monthMatch[1].padStart(2, '0');
        const month = monthNames[monthMatch[2].toLowerCase().slice(0, 3)];
        let year = monthMatch[3];
        if (year.length === 2) {
            year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
        }
        return `${year}-${month}-${day}`;
    }

    return undefined;
}

/**
 * Extract amounts (subtotal, tax, tip, total)
 */
function extractAmounts(
    text: string,
    _lines: string[]
): { subtotal?: number; tax?: number; tip?: number; total?: number } {
    const result: { subtotal?: number; tax?: number; tip?: number; total?: number } = {};

    // Total patterns (most important)
    const totalPatterns = [
        /total[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /amount\s*due[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /grand\s*total[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /to\s*pay[:\s]*r?\s*([\d,]+\.?\d*)/i,
    ];

    for (const pattern of totalPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.total = parseAmount(match[1]);
            break;
        }
    }

    // Subtotal patterns
    const subtotalPatterns = [
        /sub\s*total[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /subtotal[:\s]*r?\s*([\d,]+\.?\d*)/i,
    ];

    for (const pattern of subtotalPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.subtotal = parseAmount(match[1]);
            break;
        }
    }

    // Tax/VAT patterns
    const taxPatterns = [
        /vat[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /tax[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /15%[:\s]*r?\s*([\d,]+\.?\d*)/i,
    ];

    for (const pattern of taxPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.tax = parseAmount(match[1]);
            break;
        }
    }

    // Tip/gratuity patterns
    const tipPatterns = [
        /tip[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /gratuity[:\s]*r?\s*([\d,]+\.?\d*)/i,
        /service\s*charge[:\s]*r?\s*([\d,]+\.?\d*)/i,
    ];

    for (const pattern of tipPatterns) {
        const match = text.match(pattern);
        if (match) {
            result.tip = parseAmount(match[1]);
            break;
        }
    }

    return result;
}

/**
 * Parse amount string to number
 */
function parseAmount(amountStr: string): number {
    // Remove currency symbols and commas
    const cleaned = amountStr.replace(/[R$,\s]/g, '');
    return parseFloat(cleaned) || 0;
}

/**
 * Extract payment method
 */
function extractPaymentMethod(text: string): PaymentMethod | undefined {
    const lowerText = text.toLowerCase();

    if (/visa|mastercard|credit\s*card|debit\s*card|card\s*payment/.test(lowerText)) {
        return 'card';
    }
    if (/cash|change\s*due|cash\s*tendered/.test(lowerText)) {
        return 'cash';
    }
    if (/eft|bank\s*transfer|electronic\s*fund/.test(lowerText)) {
        return 'eft';
    }
    if (/snapscan|zapper|mobile\s*payment|apple\s*pay|samsung\s*pay/.test(lowerText)) {
        return 'mobile';
    }

    return undefined;
}

/**
 * Extract card last four digits
 */
function extractCardLastFour(text: string): string | undefined {
    // Look for patterns like **** **** **** 1234 or XX1234
    const patterns = [
        /\*{4}\s*\*{4}\s*\*{4}\s*(\d{4})/,
        /x{2,4}\s*(\d{4})/i,
        /card[:\s]*\*+(\d{4})/i,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return undefined;
}

/**
 * Extract line items from receipt
 */
function extractLineItems(lines: string[]): ReceiptLineItem[] {
    const items: ReceiptLineItem[] = [];

    // Pattern for line items: description followed by price
    const itemPattern = /^(.+?)\s+r?\s*([\d,]+\.?\d*)$/i;

    for (const line of lines) {
        // Skip header/footer lines
        if (/total|subtotal|vat|tax|change|date|time|tel|thank/i.test(line)) {
            continue;
        }

        const match = line.match(itemPattern);
        if (match) {
            const description = match[1].trim();
            const price = parseAmount(match[2]);

            // Skip if description is too short or price is 0
            if (description.length > 2 && price > 0) {
                // Try to extract quantity
                const qtyMatch = description.match(/^(\d+)\s*[xX@]\s*(.+)/);
                if (qtyMatch) {
                    items.push({
                        description: qtyMatch[2].trim(),
                        quantity: parseInt(qtyMatch[1]),
                        total_price: price,
                    });
                } else {
                    items.push({
                        description,
                        quantity: 1,
                        total_price: price,
                    });
                }
            }
        }
    }

    return items;
}

/**
 * Custom error class for OCR errors
 */
export class OCRError extends Error {
    constructor(
        message: string,
        public code: number
    ) {
        super(message);
        this.name = 'OCRError';
    }
}

/**
 * Validate extracted data and calculate confidence score
 */
export function calculateConfidence(data: OCRExtractedData): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on extracted fields
    if (data.merchant_name) confidence += 0.1;
    if (data.date) confidence += 0.1;
    if (data.total && data.total > 0) confidence += 0.15;
    if (data.items && data.items.length > 0) confidence += 0.1;
    if (data.payment_method) confidence += 0.05;

    // Validate total matches items sum
    if (data.items && data.items.length > 0 && data.total) {
        const itemsSum = data.items.reduce((sum, item) => sum + item.total_price, 0);
        const difference = Math.abs(data.total - itemsSum);
        if (difference < data.total * 0.1) {
            // Within 10% tolerance
            confidence += 0.1;
        }
    }

    return Math.min(confidence, 1);
}

// Receipt Assistant Types and Interfaces

// Receipt status
export type ReceiptStatus = 'pending' | 'processing' | 'completed' | 'failed';

// Expense categories
export type ExpenseCategory =
    | 'food_dining'
    | 'groceries'
    | 'transportation'
    | 'utilities'
    | 'entertainment'
    | 'shopping'
    | 'healthcare'
    | 'travel'
    | 'office_supplies'
    | 'software'
    | 'professional_services'
    | 'other';

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { name: string; icon: string; color: string }> = {
    food_dining: { name: 'Food & Dining', icon: '🍽️', color: '#F59E0B' },
    groceries: { name: 'Groceries', icon: '🛒', color: '#10B981' },
    transportation: { name: 'Transportation', icon: '🚗', color: '#3B82F6' },
    utilities: { name: 'Utilities', icon: '💡', color: '#8B5CF6' },
    entertainment: { name: 'Entertainment', icon: '🎬', color: '#EC4899' },
    shopping: { name: 'Shopping', icon: '🛍️', color: '#F97316' },
    healthcare: { name: 'Healthcare', icon: '🏥', color: '#EF4444' },
    travel: { name: 'Travel', icon: '✈️', color: '#06B6D4' },
    office_supplies: { name: 'Office Supplies', icon: '📎', color: '#6366F1' },
    software: { name: 'Software', icon: '💻', color: '#14B8A6' },
    professional_services: { name: 'Professional Services', icon: '👔', color: '#64748B' },
    other: { name: 'Other', icon: '📋', color: '#94A3B8' },
};

// Payment methods
export type PaymentMethod = 'cash' | 'card' | 'eft' | 'mobile' | 'other';

export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
    cash: 'Cash',
    card: 'Card',
    eft: 'EFT/Bank Transfer',
    mobile: 'Mobile Payment',
    other: 'Other',
};

// Receipt line item
export interface ReceiptLineItem {
    description: string;
    quantity?: number;
    unit_price?: number;
    total_price: number;
}

// OCR extracted data
export interface OCRExtractedData {
    raw_text: string;
    confidence: number;
    merchant_name?: string;
    merchant_address?: string;
    merchant_phone?: string;
    date?: string;
    time?: string;
    subtotal?: number;
    tax?: number;
    tip?: number;
    total?: number;
    payment_method?: PaymentMethod;
    card_last_four?: string;
    items?: ReceiptLineItem[];
    currency?: string;
}

// Receipt record
export interface Receipt {
    id: string;
    organization_id: string;
    user_id: string;
    image_url: string;
    thumbnail_url?: string;
    status: ReceiptStatus;
    ocr_data?: OCRExtractedData;
    merchant_name: string;
    merchant_address?: string;
    date: string;
    time?: string;
    subtotal?: number;
    tax?: number;
    tip?: number;
    total: number;
    currency: string;
    category: ExpenseCategory;
    payment_method?: PaymentMethod;
    items?: ReceiptLineItem[];
    notes?: string;
    tags?: string[];
    is_reimbursable: boolean;
    reimbursement_status?: 'pending' | 'approved' | 'rejected' | 'paid';
    created_at: string;
    updated_at: string;
}

// Receipt create input
export interface ReceiptCreate {
    organization_id: string;
    user_id: string;
    image_url: string;
    merchant_name?: string;
    date?: string;
    total?: number;
    category?: ExpenseCategory;
    notes?: string;
    tags?: string[];
    is_reimbursable?: boolean;
}

// Receipt update input
export interface ReceiptUpdate {
    merchant_name?: string;
    merchant_address?: string;
    date?: string;
    time?: string;
    subtotal?: number;
    tax?: number;
    tip?: number;
    total?: number;
    category?: ExpenseCategory;
    payment_method?: PaymentMethod;
    items?: ReceiptLineItem[];
    notes?: string;
    tags?: string[];
    is_reimbursable?: boolean;
    reimbursement_status?: 'pending' | 'approved' | 'rejected' | 'paid';
}

// Expense summary
export interface ExpenseSummary {
    organization_id: string;
    period_start: string;
    period_end: string;
    total_receipts: number;
    total_amount: number;
    by_category: Record<ExpenseCategory, {
        count: number;
        total: number;
        percentage: number;
    }>;
    by_month: Array<{
        month: string;
        count: number;
        total: number;
    }>;
    top_merchants: Array<{
        name: string;
        count: number;
        total: number;
    }>;
    average_receipt: number;
}

// Export options
export interface ExportOptions {
    format: 'csv' | 'pdf';
    start_date?: string;
    end_date?: string;
    categories?: ExpenseCategory[];
    include_items?: boolean;
    include_images?: boolean;
}

// Upload progress
export interface UploadProgress {
    receipt_id: string;
    status: 'uploading' | 'processing' | 'extracting' | 'completed' | 'failed';
    progress: number;
    message: string;
}

// OCR provider config
export interface OCRProviderConfig {
    provider: 'google_vision' | 'tesseract';
    api_key?: string;
    language?: string;
}

// Category suggestion based on merchant
export const MERCHANT_CATEGORY_MAP: Record<string, ExpenseCategory> = {
    // South African retailers
    'pick n pay': 'groceries',
    'checkers': 'groceries',
    'woolworths': 'groceries',
    'spar': 'groceries',
    'shoprite': 'groceries',
    'makro': 'groceries',
    'game': 'shopping',
    'clicks': 'healthcare',
    'dischem': 'healthcare',
    'takealot': 'shopping',
    'incredible connection': 'software',
    'engen': 'transportation',
    'shell': 'transportation',
    'bp': 'transportation',
    'caltex': 'transportation',
    'uber': 'transportation',
    'bolt': 'transportation',
    'mr delivery': 'food_dining',
    'uber eats': 'food_dining',
    'nandos': 'food_dining',
    'steers': 'food_dining',
    'kfc': 'food_dining',
    'mcdonalds': 'food_dining',
    "mcdonald's": 'food_dining',
    'wimpy': 'food_dining',
    'spur': 'food_dining',
    'mugg & bean': 'food_dining',
    'vida e caffe': 'food_dining',
    'starbucks': 'food_dining',
    'eskom': 'utilities',
    'city of': 'utilities',
    'municipality': 'utilities',
    'telkom': 'utilities',
    'vodacom': 'utilities',
    'mtn': 'utilities',
    'cell c': 'utilities',
    'dstv': 'entertainment',
    'multichoice': 'entertainment',
    'ster-kinekor': 'entertainment',
    'nu metro': 'entertainment',
};

// Helper to suggest category from merchant name
export function suggestCategory(merchantName: string): ExpenseCategory {
    const normalized = merchantName.toLowerCase().trim();

    for (const [keyword, category] of Object.entries(MERCHANT_CATEGORY_MAP)) {
        if (normalized.includes(keyword)) {
            return category;
        }
    }

    return 'other';
}

// Currency formatter for ZAR
export function formatCurrency(amount: number, currency: string = 'ZAR'): string {
    if (currency === 'ZAR') {
        return `R${amount.toFixed(2)}`;
    }
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency,
    }).format(amount);
}

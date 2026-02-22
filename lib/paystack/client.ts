// Paystack API Client
import type {
    PaystackAPIResponse,
    PaystackPlan,
    PaystackCustomer,
    PaystackSubscription,
    InitializeTransactionResponse,
    VerifyTransactionResponse,
} from './types';

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

class PaystackClient {
    private secretKey: string;
    private baseUrl: string;

    constructor(secretKey?: string) {
        this.secretKey = secretKey || process.env.PAYSTACK_SECRET_KEY || '';
        this.baseUrl = PAYSTACK_BASE_URL;

        if (!this.secretKey) {
            console.warn('Paystack secret key not provided. API calls will fail.');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<PaystackAPIResponse<T>> {
        const url = `${this.baseUrl}${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.secretKey}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new PaystackError(
                data.message || 'Paystack API error',
                response.status,
                data
            );
        }

        return data as PaystackAPIResponse<T>;
    }

    // ============ Transactions ============

    /**
     * Initialize a transaction
     */
    async initializeTransaction(params: {
        email: string;
        amount: number; // in kobo (cents)
        reference?: string;
        callback_url?: string;
        plan?: string; // plan code for subscriptions
        metadata?: Record<string, unknown>;
        channels?: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer' | 'eft')[];
    }): Promise<InitializeTransactionResponse> {
        const response = await this.request<InitializeTransactionResponse>(
            '/transaction/initialize',
            {
                method: 'POST',
                body: JSON.stringify({
                    ...params,
                    currency: 'ZAR',
                }),
            }
        );
        return response.data;
    }

    /**
     * Verify a transaction
     */
    async verifyTransaction(reference: string): Promise<VerifyTransactionResponse> {
        const response = await this.request<VerifyTransactionResponse>(
            `/transaction/verify/${reference}`
        );
        return response.data;
    }

    // ============ Plans ============

    /**
     * Create a plan
     */
    async createPlan(params: {
        name: string;
        amount: number; // in kobo
        interval: 'monthly' | 'yearly' | 'weekly' | 'daily';
        description?: string;
    }): Promise<PaystackPlan> {
        const response = await this.request<PaystackPlan>('/plan', {
            method: 'POST',
            body: JSON.stringify({
                ...params,
                currency: 'ZAR',
            }),
        });
        return response.data;
    }

    /**
     * List all plans
     */
    async listPlans(): Promise<PaystackPlan[]> {
        const response = await this.request<PaystackPlan[]>('/plan');
        return response.data;
    }

    /**
     * Fetch a plan by ID or code
     */
    async fetchPlan(idOrCode: string): Promise<PaystackPlan> {
        const response = await this.request<PaystackPlan>(`/plan/${idOrCode}`);
        return response.data;
    }

    // ============ Customers ============

    /**
     * Create a customer
     */
    async createCustomer(params: {
        email: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
        metadata?: Record<string, unknown>;
    }): Promise<PaystackCustomer> {
        const response = await this.request<PaystackCustomer>('/customer', {
            method: 'POST',
            body: JSON.stringify(params),
        });
        return response.data;
    }

    /**
     * Fetch a customer
     */
    async fetchCustomer(emailOrCode: string): Promise<PaystackCustomer> {
        const response = await this.request<PaystackCustomer>(
            `/customer/${emailOrCode}`
        );
        return response.data;
    }

    // ============ Subscriptions ============

    /**
     * Create a subscription
     */
    async createSubscription(params: {
        customer: string; // customer email or code
        plan: string; // plan code
        authorization?: string; // authorization code from a previous transaction
        start_date?: string; // ISO date string
    }): Promise<PaystackSubscription> {
        const response = await this.request<PaystackSubscription>('/subscription', {
            method: 'POST',
            body: JSON.stringify(params),
        });
        return response.data;
    }

    /**
     * List subscriptions
     */
    async listSubscriptions(params?: {
        customer?: number;
        plan?: number;
    }): Promise<PaystackSubscription[]> {
        const queryString = params
            ? '?' + new URLSearchParams(params as Record<string, string>).toString()
            : '';
        const response = await this.request<PaystackSubscription[]>(
            `/subscription${queryString}`
        );
        return response.data;
    }

    /**
     * Fetch a subscription
     */
    async fetchSubscription(idOrCode: string): Promise<PaystackSubscription> {
        const response = await this.request<PaystackSubscription>(
            `/subscription/${idOrCode}`
        );
        return response.data;
    }

    /**
     * Enable a subscription
     */
    async enableSubscription(params: {
        code: string;
        token: string; // email token
    }): Promise<{ message: string }> {
        const response = await this.request<{ message: string }>(
            '/subscription/enable',
            {
                method: 'POST',
                body: JSON.stringify(params),
            }
        );
        return response.data;
    }

    /**
     * Disable a subscription (cancel)
     */
    async disableSubscription(params: {
        code: string;
        token: string; // email token
    }): Promise<{ message: string }> {
        const response = await this.request<{ message: string }>(
            '/subscription/disable',
            {
                method: 'POST',
                body: JSON.stringify(params),
            }
        );
        return response.data;
    }

    /**
     * Generate a subscription manage link
     */
    async generateSubscriptionLink(code: string): Promise<{ link: string }> {
        const response = await this.request<{ link: string }>(
            `/subscription/${code}/manage/link`
        );
        return response.data;
    }
}

// Error class for Paystack API errors
export class PaystackError extends Error {
    status: number;
    data: unknown;

    constructor(message: string, status: number, data: unknown) {
        super(message);
        this.name = 'PaystackError';
        this.status = status;
        this.data = data;
    }
}

// Singleton instance
let paystackClient: PaystackClient | null = null;

export function getPaystackClient(): PaystackClient {
    if (!paystackClient) {
        paystackClient = new PaystackClient();
    }
    return paystackClient;
}

export { PaystackClient };

// Supabase Client
// Note: This is a placeholder client. In production, use @supabase/supabase-js

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface SupabaseClientOptions {
    useServiceRole?: boolean;
}

interface QueryResult<T> {
    data: T | null;
    error: Error | null;
}

interface QueryBuilder<T> {
    select: (columns?: string) => QueryBuilder<T>;
    insert: (data: Partial<T> | Partial<T>[]) => QueryBuilder<T>;
    update: (data: Partial<T>) => QueryBuilder<T>;
    delete: () => QueryBuilder<T>;
    eq: (column: string, value: unknown) => QueryBuilder<T>;
    neq: (column: string, value: unknown) => QueryBuilder<T>;
    single: () => Promise<QueryResult<T>>;
    maybeSingle: () => Promise<QueryResult<T | null>>;
    order: (column: string, options?: { ascending?: boolean }) => QueryBuilder<T>;
    limit: (count: number) => QueryBuilder<T>;
    then: (resolve: (result: QueryResult<T[]>) => void) => Promise<void>;
}

class SupabaseClient {
    private url: string;
    private key: string;

    constructor(options?: SupabaseClientOptions) {
        this.url = SUPABASE_URL;
        this.key = options?.useServiceRole ? SUPABASE_SERVICE_KEY : SUPABASE_ANON_KEY;

        if (!this.url || !this.key) {
            console.warn('Supabase credentials not configured');
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<QueryResult<T>> {
        try {
            const response = await fetch(`${this.url}/rest/v1${endpoint}`, {
                ...options,
                headers: {
                    apikey: this.key,
                    Authorization: `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation',
                    ...options.headers,
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                return {
                    data: null,
                    error: new Error(errorData.message || `HTTP ${response.status}`),
                };
            }

            const data = await response.json();
            return { data, error: null };
        } catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }

    from<T>(table: string): QueryBuilder<T> {
        let endpoint = `/${table}`;
        let method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET';
        let body: unknown = null;
        const filters: string[] = [];
        let selectColumns = '*';
        let orderBy = '';
        let limitCount = '';
        let preferSingle = false;

        const builder: QueryBuilder<T> = {
            select: (columns = '*') => {
                selectColumns = columns;
                return builder;
            },
            insert: (data) => {
                method = 'POST';
                body = data;
                return builder;
            },
            update: (data) => {
                method = 'PATCH';
                body = data;
                return builder;
            },
            delete: () => {
                method = 'DELETE';
                return builder;
            },
            eq: (column, value) => {
                filters.push(`${column}=eq.${value}`);
                return builder;
            },
            neq: (column, value) => {
                filters.push(`${column}=neq.${value}`);
                return builder;
            },
            single: async () => {
                preferSingle = true;
                const result = await executeQuery();
                if (Array.isArray(result.data) && result.data.length > 0) {
                    return { data: result.data[0] as T, error: null };
                }
                return { data: null, error: result.error || new Error('No rows found') };
            },
            maybeSingle: async () => {
                preferSingle = true;
                const result = await executeQuery();
                if (Array.isArray(result.data) && result.data.length > 0) {
                    return { data: result.data[0] as T, error: null };
                }
                return { data: null, error: null };
            },
            order: (column, options) => {
                const dir = options?.ascending === false ? 'desc' : 'asc';
                orderBy = `order=${column}.${dir}`;
                return builder;
            },
            limit: (count) => {
                limitCount = `limit=${count}`;
                return builder;
            },
            then: async (resolve) => {
                const result = await executeQuery();
                resolve(result as QueryResult<T[]>);
            },
        };

        const executeQuery = async (): Promise<QueryResult<T[]>> => {
            const queryParts = [`select=${selectColumns}`, ...filters];
            if (orderBy) queryParts.push(orderBy);
            if (limitCount) queryParts.push(limitCount);

            const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
            const finalEndpoint = `${endpoint}${queryString}`;

            const options: RequestInit = { method };
            if (body) {
                options.body = JSON.stringify(body);
            }
            if (preferSingle) {
                options.headers = { Prefer: 'return=representation' };
            }

            return this.request<T[]>(finalEndpoint, options);
        };

        return builder;
    }
}

// Client instances
let browserClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

/**
 * Get Supabase client for browser/client-side use
 */
export function getSupabaseBrowserClient(): SupabaseClient {
    if (!browserClient) {
        browserClient = new SupabaseClient();
    }
    return browserClient;
}

/**
 * Get Supabase client for server-side use (with service role key)
 */
export function getSupabaseServerClient(): SupabaseClient {
    if (!serverClient) {
        serverClient = new SupabaseClient({ useServiceRole: true });
    }
    return serverClient;
}

export { SupabaseClient };

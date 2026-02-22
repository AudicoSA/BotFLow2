// AI Assistant Types and Interfaces

// Model configurations
export type AIModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-3.5-turbo';

export interface ModelConfig {
    model: AIModel;
    maxTokens: number;
    contextWindow: number;
    inputPricePerMillion: number; // in cents
    outputPricePerMillion: number; // in cents
}

export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
    'gpt-4': {
        model: 'gpt-4',
        maxTokens: 8192,
        contextWindow: 8192,
        inputPricePerMillion: 3000, // $30 per 1M tokens
        outputPricePerMillion: 6000, // $60 per 1M tokens
    },
    'gpt-4-turbo': {
        model: 'gpt-4-turbo',
        maxTokens: 4096,
        contextWindow: 128000,
        inputPricePerMillion: 1000, // $10 per 1M tokens
        outputPricePerMillion: 3000, // $30 per 1M tokens
    },
    'gpt-4o': {
        model: 'gpt-4o',
        maxTokens: 4096,
        contextWindow: 128000,
        inputPricePerMillion: 250, // $2.50 per 1M tokens
        outputPricePerMillion: 1000, // $10 per 1M tokens
    },
    'gpt-3.5-turbo': {
        model: 'gpt-3.5-turbo',
        maxTokens: 4096,
        contextWindow: 16385,
        inputPricePerMillion: 50, // $0.50 per 1M tokens
        outputPricePerMillion: 150, // $1.50 per 1M tokens
    },
};

// Message types
export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
    role: MessageRole;
    content: string;
    name?: string;
    timestamp?: string;
}

export interface ConversationMessage {
    id: string;
    conversation_id: string;
    role: MessageRole;
    content: string;
    token_count: number;
    created_at: string;
}

// Conversation types
export interface AIConversation {
    id: string;
    organization_id: string;
    user_id: string;
    title: string;
    model: AIModel;
    system_prompt_id?: string;
    total_tokens: number;
    total_input_tokens: number;
    total_output_tokens: number;
    message_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface ConversationCreate {
    organization_id: string;
    user_id: string;
    title?: string;
    model?: AIModel;
    system_prompt_id?: string;
}

// System prompt types
export interface SystemPrompt {
    id: string;
    organization_id: string;
    name: string;
    description: string;
    content: string;
    category: PromptCategory;
    is_default: boolean;
    variables?: PromptVariable[];
    created_at: string;
    updated_at: string;
}

export type PromptCategory =
    | 'general'
    | 'customer_support'
    | 'sales'
    | 'technical'
    | 'creative'
    | 'custom';

export interface PromptVariable {
    name: string;
    description: string;
    default_value?: string;
    required: boolean;
}

export interface SystemPromptCreate {
    organization_id: string;
    name: string;
    description: string;
    content: string;
    category: PromptCategory;
    is_default?: boolean;
    variables?: PromptVariable[];
}

// Usage tracking types
export interface UsageRecord {
    id: string;
    organization_id: string;
    user_id: string;
    conversation_id: string;
    model: AIModel;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    cost_cents: number;
    created_at: string;
}

export interface UsageSummary {
    organization_id: string;
    period_start: string;
    period_end: string;
    total_conversations: number;
    total_messages: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    total_cost_cents: number;
    by_model: Record<AIModel, {
        conversations: number;
        messages: number;
        input_tokens: number;
        output_tokens: number;
        cost_cents: number;
    }>;
}

// Chat request/response types
export interface ChatRequest {
    conversation_id?: string;
    message: string;
    model?: AIModel;
    system_prompt_id?: string;
    system_prompt?: string;
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
}

export interface ChatResponse {
    conversation_id: string;
    message_id: string;
    content: string;
    model: AIModel;
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    finish_reason: 'stop' | 'length' | 'content_filter' | 'null';
}

export interface StreamChunk {
    conversation_id: string;
    content: string;
    done: boolean;
    usage?: {
        input_tokens: number;
        output_tokens: number;
        total_tokens: number;
    };
}

// API error types
export interface AIAssistantError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

export const ERROR_CODES = {
    RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
    CONTEXT_TOO_LONG: 'context_too_long',
    INVALID_MODEL: 'invalid_model',
    CONVERSATION_NOT_FOUND: 'conversation_not_found',
    SYSTEM_PROMPT_NOT_FOUND: 'system_prompt_not_found',
    OPENAI_ERROR: 'openai_error',
    QUOTA_EXCEEDED: 'quota_exceeded',
    UNAUTHORIZED: 'unauthorized',
} as const;

// Default system prompts
export const DEFAULT_SYSTEM_PROMPTS: Omit<SystemPrompt, 'id' | 'organization_id' | 'created_at' | 'updated_at'>[] = [
    {
        name: 'General Assistant',
        description: 'A helpful, friendly AI assistant for general questions',
        content: `You are a helpful AI assistant for BotFlow, a South African business automation platform.
You help users with their questions in a friendly, professional manner.
Always be concise but thorough. If you don't know something, say so.
Remember to consider the South African business context when relevant.`,
        category: 'general',
        is_default: true,
    },
    {
        name: 'Customer Support Agent',
        description: 'Specialized for handling customer support queries',
        content: `You are a customer support AI for {{business_name}}.
Your role is to help customers with their questions and issues professionally.

Guidelines:
- Be empathetic and understanding
- Provide clear, step-by-step solutions
- Escalate to human agents when necessary
- Always maintain a professional, friendly tone
- Reference the business's policies when relevant

Business context: {{business_context}}`,
        category: 'customer_support',
        is_default: false,
        variables: [
            { name: 'business_name', description: 'Name of the business', required: true },
            { name: 'business_context', description: 'Additional context about the business', required: false, default_value: '' },
        ],
    },
    {
        name: 'Sales Assistant',
        description: 'Helps with sales inquiries and product information',
        content: `You are a sales assistant AI for {{business_name}}.
Your goal is to help potential customers understand the products/services and guide them toward making informed decisions.

Guidelines:
- Be helpful and informative, not pushy
- Answer questions about products/services clearly
- Highlight value propositions and benefits
- Guide users to appropriate pricing/contact information
- Use South African Rand (R) for pricing

Available products/services: {{products_services}}`,
        category: 'sales',
        is_default: false,
        variables: [
            { name: 'business_name', description: 'Name of the business', required: true },
            { name: 'products_services', description: 'List of products or services offered', required: true },
        ],
    },
    {
        name: 'Technical Support',
        description: 'For technical troubleshooting and support',
        content: `You are a technical support AI assistant.
Help users troubleshoot technical issues with clear, step-by-step instructions.

Guidelines:
- Ask clarifying questions when needed
- Provide numbered steps for troubleshooting
- Suggest common solutions first
- Know when to escalate complex issues
- Be patient and clear in explanations`,
        category: 'technical',
        is_default: false,
    },
];

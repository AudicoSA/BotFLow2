// OpenAI GPT-4 Client with Context Window Management

import {
    MODEL_CONFIGS,
    type AIModel,
    type ChatMessage,
    type ChatResponse,
    type StreamChunk,
    type ModelConfig,
} from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
    name?: string;
}

interface OpenAIRequest {
    model: string;
    messages: OpenAIMessage[];
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
    user?: string;
}

interface OpenAIResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: 'stop' | 'length' | 'content_filter' | null;
    }>;
    usage: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface OpenAIStreamChunk {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Array<{
        index: number;
        delta: {
            role?: string;
            content?: string;
        };
        finish_reason: 'stop' | 'length' | 'content_filter' | null;
    }>;
}

export class AIAssistantClient {
    private apiKey: string;
    private defaultModel: AIModel;

    constructor(apiKey?: string, defaultModel: AIModel = 'gpt-4o') {
        this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
        this.defaultModel = defaultModel;

        if (!this.apiKey) {
            console.warn('OpenAI API key not configured');
        }
    }

    /**
     * Send a chat completion request to OpenAI
     */
    async chat(
        messages: ChatMessage[],
        options: {
            model?: AIModel;
            temperature?: number;
            maxTokens?: number;
            userId?: string;
        } = {}
    ): Promise<ChatResponse> {
        const model = options.model || this.defaultModel;
        const config = MODEL_CONFIGS[model];

        // Convert to OpenAI message format
        const openAIMessages: OpenAIMessage[] = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            ...(msg.name && { name: msg.name }),
        }));

        const request: OpenAIRequest = {
            model,
            messages: openAIMessages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? config.maxTokens,
            stream: false,
            ...(options.userId && { user: options.userId }),
        };

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new OpenAIError(
                error.error?.message || 'OpenAI API request failed',
                error.error?.type || 'api_error',
                response.status
            );
        }

        const data: OpenAIResponse = await response.json();
        const choice = data.choices[0];

        return {
            conversation_id: '', // Set by caller
            message_id: data.id,
            content: choice.message.content,
            model,
            input_tokens: data.usage.prompt_tokens,
            output_tokens: data.usage.completion_tokens,
            total_tokens: data.usage.total_tokens,
            finish_reason: choice.finish_reason || 'stop',
        };
    }

    /**
     * Stream a chat completion response
     */
    async *chatStream(
        messages: ChatMessage[],
        conversationId: string,
        options: {
            model?: AIModel;
            temperature?: number;
            maxTokens?: number;
            userId?: string;
        } = {}
    ): AsyncGenerator<StreamChunk> {
        const model = options.model || this.defaultModel;
        const config = MODEL_CONFIGS[model];

        const openAIMessages: OpenAIMessage[] = messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            ...(msg.name && { name: msg.name }),
        }));

        const request: OpenAIRequest = {
            model,
            messages: openAIMessages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens ?? config.maxTokens,
            stream: true,
            ...(options.userId && { user: options.userId }),
        };

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new OpenAIError(
                error.error?.message || 'OpenAI API request failed',
                error.error?.type || 'api_error',
                response.status
            );
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Failed to get response reader');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed === 'data: [DONE]') continue;
                    if (!trimmed.startsWith('data: ')) continue;

                    try {
                        const chunk: OpenAIStreamChunk = JSON.parse(
                            trimmed.slice(6)
                        );
                        const content = chunk.choices[0]?.delta?.content || '';
                        fullContent += content;

                        yield {
                            conversation_id: conversationId,
                            content,
                            done: false,
                        };
                    } catch {
                        // Skip invalid JSON chunks
                    }
                }
            }

            // Estimate token usage for streaming (actual usage not provided in stream)
            const estimatedInputTokens = this.estimateTokenCount(
                messages.map((m) => m.content).join(' ')
            );
            const estimatedOutputTokens = this.estimateTokenCount(fullContent);

            yield {
                conversation_id: conversationId,
                content: '',
                done: true,
                usage: {
                    input_tokens: estimatedInputTokens,
                    output_tokens: estimatedOutputTokens,
                    total_tokens: estimatedInputTokens + estimatedOutputTokens,
                },
            };
        } finally {
            reader.releaseLock();
        }
    }

    /**
     * Estimate token count for a string (rough approximation)
     * OpenAI uses ~4 characters per token on average
     */
    estimateTokenCount(text: string): number {
        return Math.ceil(text.length / 4);
    }

    /**
     * Calculate cost in cents for token usage
     */
    calculateCost(
        model: AIModel,
        inputTokens: number,
        outputTokens: number
    ): number {
        const config = MODEL_CONFIGS[model];
        const inputCost = (inputTokens / 1_000_000) * config.inputPricePerMillion;
        const outputCost = (outputTokens / 1_000_000) * config.outputPricePerMillion;
        return Math.ceil(inputCost + outputCost);
    }

    /**
     * Check if messages fit within context window
     */
    fitsInContextWindow(messages: ChatMessage[], model: AIModel): boolean {
        const config = MODEL_CONFIGS[model];
        const totalTokens = messages.reduce(
            (sum, msg) => sum + this.estimateTokenCount(msg.content),
            0
        );
        return totalTokens < config.contextWindow;
    }

    /**
     * Truncate conversation history to fit within context window
     * Keeps system message and most recent messages
     */
    truncateToFitContext(
        messages: ChatMessage[],
        model: AIModel,
        reserveTokens: number = 1000
    ): ChatMessage[] {
        const config = MODEL_CONFIGS[model];
        const maxContextTokens = config.contextWindow - reserveTokens;

        // Separate system message from conversation
        const systemMessages = messages.filter((m) => m.role === 'system');
        const conversationMessages = messages.filter((m) => m.role !== 'system');

        const systemTokens = systemMessages.reduce(
            (sum, msg) => sum + this.estimateTokenCount(msg.content),
            0
        );

        let remainingTokens = maxContextTokens - systemTokens;
        const truncatedConversation: ChatMessage[] = [];

        // Add messages from most recent first
        for (let i = conversationMessages.length - 1; i >= 0; i--) {
            const msg = conversationMessages[i];
            const msgTokens = this.estimateTokenCount(msg.content);

            if (remainingTokens >= msgTokens) {
                truncatedConversation.unshift(msg);
                remainingTokens -= msgTokens;
            } else {
                break;
            }
        }

        return [...systemMessages, ...truncatedConversation];
    }

    /**
     * Get model configuration
     */
    getModelConfig(model: AIModel): ModelConfig {
        return MODEL_CONFIGS[model];
    }
}

// Custom error class for OpenAI errors
export class OpenAIError extends Error {
    constructor(
        message: string,
        public type: string,
        public status: number
    ) {
        super(message);
        this.name = 'OpenAIError';
    }

    isRateLimitError(): boolean {
        return this.status === 429;
    }

    isContextLengthError(): boolean {
        return this.type === 'context_length_exceeded';
    }

    isInvalidRequestError(): boolean {
        return this.status === 400;
    }
}

// Create singleton client
let client: AIAssistantClient | null = null;

export function getAIAssistantClient(): AIAssistantClient {
    if (!client) {
        client = new AIAssistantClient();
    }
    return client;
}

// Re-export types
export { MODEL_CONFIGS };

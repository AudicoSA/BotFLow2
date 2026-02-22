import { NextRequest, NextResponse } from 'next/server';
import { getAIAssistantClient, OpenAIError } from '@/lib/ai-assistant/client';
import {
    createConversation,
    getConversation,
    getConversationHistory,
    addMessage,
    updateConversationTokens,
    generateConversationTitle,
    updateConversation,
} from '@/lib/ai-assistant/conversations';
import { getSystemPrompt, renderPrompt } from '@/lib/ai-assistant/prompts';
import { recordUsage } from '@/lib/ai-assistant/usage';
import type { ChatRequest, AIModel } from '@/lib/ai-assistant/types';

// POST /api/ai-assistant/chat - Send a chat message
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as ChatRequest & {
            organization_id: string;
            user_id: string;
            prompt_variables?: Record<string, string>;
        };

        const {
            organization_id,
            user_id,
            conversation_id,
            message,
            model = 'gpt-4o' as AIModel,
            system_prompt_id,
            system_prompt,
            temperature,
            max_tokens,
            prompt_variables,
        } = body;

        if (!organization_id || !user_id) {
            return NextResponse.json(
                { error: 'organization_id and user_id are required' },
                { status: 400 }
            );
        }

        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                { error: 'message is required' },
                { status: 400 }
            );
        }

        const client = getAIAssistantClient();

        // Get or create conversation
        let conversationIdToUse = conversation_id;
        let isNewConversation = false;

        if (!conversationIdToUse) {
            const conversation = await createConversation({
                organization_id,
                user_id,
                model,
                system_prompt_id,
                title: generateConversationTitle(message),
            });
            conversationIdToUse = conversation.id;
            isNewConversation = true;
        } else {
            // Verify conversation exists and belongs to user
            const existingConversation = await getConversation(conversationIdToUse);
            if (!existingConversation) {
                return NextResponse.json(
                    { error: 'Conversation not found' },
                    { status: 404 }
                );
            }
            if (existingConversation.organization_id !== organization_id) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 403 }
                );
            }
        }

        // Build system prompt
        let finalSystemPrompt = system_prompt;

        if (!finalSystemPrompt && system_prompt_id) {
            const prompt = await getSystemPrompt(system_prompt_id);
            if (prompt) {
                finalSystemPrompt = renderPrompt(prompt, prompt_variables || {});
            }
        }

        // Get conversation history
        const history = await getConversationHistory(
            conversationIdToUse,
            finalSystemPrompt
        );

        // Add new user message to history
        const messages = [
            ...history,
            { role: 'user' as const, content: message },
        ];

        // Truncate if needed
        const truncatedMessages = client.truncateToFitContext(messages, model);

        // Store user message
        const userTokenCount = client.estimateTokenCount(message);
        await addMessage(conversationIdToUse, 'user', message, userTokenCount);

        // Send to OpenAI
        const response = await client.chat(truncatedMessages, {
            model,
            temperature,
            maxTokens: max_tokens,
            userId: user_id,
        });

        // Store assistant response
        await addMessage(
            conversationIdToUse,
            'assistant',
            response.content,
            response.output_tokens
        );

        // Update conversation token counts
        await updateConversationTokens(
            conversationIdToUse,
            response.input_tokens,
            response.output_tokens
        );

        // Record usage for billing
        await recordUsage({
            organization_id,
            user_id,
            conversation_id: conversationIdToUse,
            model,
            input_tokens: response.input_tokens,
            output_tokens: response.output_tokens,
        });

        // Update conversation title if new
        if (isNewConversation) {
            await updateConversation(conversationIdToUse, {
                title: generateConversationTitle(message),
            });
        }

        return NextResponse.json({
            conversation_id: conversationIdToUse,
            message_id: response.message_id,
            content: response.content,
            model: response.model,
            usage: {
                input_tokens: response.input_tokens,
                output_tokens: response.output_tokens,
                total_tokens: response.total_tokens,
            },
            finish_reason: response.finish_reason,
            is_new_conversation: isNewConversation,
        });
    } catch (error) {
        console.error('Chat error:', error);

        if (error instanceof OpenAIError) {
            if (error.isRateLimitError()) {
                return NextResponse.json(
                    { error: 'Rate limit exceeded. Please try again later.' },
                    { status: 429 }
                );
            }
            if (error.isContextLengthError()) {
                return NextResponse.json(
                    { error: 'Conversation is too long. Please start a new conversation.' },
                    { status: 400 }
                );
            }
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        return NextResponse.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}

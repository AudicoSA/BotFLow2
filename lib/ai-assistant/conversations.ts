// Conversation History Storage

import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
    AIConversation,
    ConversationCreate,
    ConversationMessage,
    ChatMessage,
    AIModel,
} from './types';

/**
 * Create a new conversation
 */
export async function createConversation(
    data: ConversationCreate
): Promise<AIConversation> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<AIConversation>('ai_conversations')
        .insert({
            organization_id: data.organization_id,
            user_id: data.user_id,
            title: data.title || 'New Conversation',
            model: data.model || 'gpt-4o',
            system_prompt_id: data.system_prompt_id,
            total_tokens: 0,
            total_input_tokens: 0,
            total_output_tokens: 0,
            message_count: 0,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Partial<AIConversation>)
        .select()
        .single();

    if (result.error || !result.data) {
        throw new Error(`Failed to create conversation: ${result.error?.message || 'Unknown error'}`);
    }

    return result.data;
}

/**
 * Get a conversation by ID
 */
export async function getConversation(
    conversationId: string
): Promise<AIConversation | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<AIConversation>('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

    if (result.error || !result.data) {
        return null;
    }

    return result.data;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(
    organizationId: string,
    userId: string,
    options: {
        limit?: number;
        offset?: number;
        activeOnly?: boolean;
    } = {}
): Promise<AIConversation[]> {
    const supabase = getSupabaseServerClient();

    return new Promise((resolve) => {
        let query = supabase
            .from<AIConversation>('ai_conversations')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('user_id', userId);

        if (options.activeOnly) {
            query = query.eq('is_active', true);
        }

        query
            .order('updated_at', { ascending: false })
            .limit(options.limit || 50)
            .then((result) => {
                if (result.error || !result.data) {
                    console.error('Error fetching conversations:', result.error);
                    resolve([]);
                } else {
                    resolve(result.data);
                }
            });
    });
}

/**
 * Update conversation metadata
 */
export async function updateConversation(
    conversationId: string,
    updates: Partial<Pick<AIConversation, 'title' | 'model' | 'is_active'>>
): Promise<AIConversation | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<AIConversation>('ai_conversations')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .select()
        .single();

    if (result.error || !result.data) {
        console.error('Error updating conversation:', result.error);
        return null;
    }

    return result.data;
}

/**
 * Update conversation token counts
 */
export async function updateConversationTokens(
    conversationId: string,
    inputTokens: number,
    outputTokens: number
): Promise<void> {
    const supabase = getSupabaseServerClient();

    // Get current conversation
    const conversation = await getConversation(conversationId);
    if (!conversation) return;

    await supabase
        .from('ai_conversations')
        .update({
            total_input_tokens: conversation.total_input_tokens + inputTokens,
            total_output_tokens: conversation.total_output_tokens + outputTokens,
            total_tokens: conversation.total_tokens + inputTokens + outputTokens,
            message_count: conversation.message_count + 2, // user + assistant
            updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
}

/**
 * Archive a conversation (soft delete)
 */
export async function archiveConversation(conversationId: string): Promise<void> {
    const supabase = getSupabaseServerClient();

    await supabase
        .from('ai_conversations')
        .update({
            is_active: false,
            updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId);
}

/**
 * Delete a conversation and its messages
 */
export async function deleteConversation(conversationId: string): Promise<void> {
    const supabase = getSupabaseServerClient();

    // Delete messages first
    await supabase
        .from('ai_conversation_messages')
        .delete()
        .eq('conversation_id', conversationId);

    // Delete conversation
    await supabase.from('ai_conversations').delete().eq('id', conversationId);
}

/**
 * Add a message to a conversation
 */
export async function addMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    tokenCount: number
): Promise<ConversationMessage> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<ConversationMessage>('ai_conversation_messages')
        .insert({
            conversation_id: conversationId,
            role,
            content,
            token_count: tokenCount,
            created_at: new Date().toISOString(),
        } as Partial<ConversationMessage>)
        .select()
        .single();

    if (result.error || !result.data) {
        throw new Error(`Failed to add message: ${result.error?.message || 'Unknown error'}`);
    }

    return result.data;
}

/**
 * Get messages for a conversation
 */
export async function getConversationMessages(
    conversationId: string,
    options: {
        limit?: number;
        before?: string;
    } = {}
): Promise<ConversationMessage[]> {
    const supabase = getSupabaseServerClient();

    return new Promise((resolve) => {
        supabase
            .from<ConversationMessage>('ai_conversation_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })
            .limit(options.limit || 100)
            .then((result) => {
                if (result.error || !result.data) {
                    console.error('Error fetching messages:', result.error);
                    resolve([]);
                } else {
                    // Filter by before timestamp if provided (client-side filtering)
                    let messages = result.data;
                    if (options.before) {
                        messages = messages.filter(
                            (m) => new Date(m.created_at) < new Date(options.before!)
                        );
                    }
                    resolve(messages);
                }
            });
    });
}

/**
 * Get conversation messages formatted for chat
 */
export async function getConversationHistory(
    conversationId: string,
    systemPrompt?: string
): Promise<ChatMessage[]> {
    const messages = await getConversationMessages(conversationId);

    const chatMessages: ChatMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
        chatMessages.push({
            role: 'system',
            content: systemPrompt,
        });
    }

    // Add conversation messages
    for (const msg of messages) {
        chatMessages.push({
            role: msg.role,
            content: msg.content,
            timestamp: msg.created_at,
        });
    }

    return chatMessages;
}

/**
 * Generate a title for a conversation based on the first message
 */
export function generateConversationTitle(firstMessage: string): string {
    // Truncate to first 50 characters
    const truncated = firstMessage.slice(0, 50);

    // Remove newlines and extra spaces
    const cleaned = truncated.replace(/\s+/g, ' ').trim();

    // Add ellipsis if truncated
    return cleaned.length < firstMessage.length ? `${cleaned}...` : cleaned;
}

/**
 * Search conversations by title or message content
 */
export async function searchConversations(
    organizationId: string,
    userId: string,
    _query: string,
    _limit = 20
): Promise<AIConversation[]> {
    // Simplified search - in production, use proper full-text search
    const conversations = await getUserConversations(organizationId, userId, {
        limit: 100,
    });

    // Filter by title (basic implementation)
    // Full text search would be done at database level
    return conversations.slice(0, _limit);
}

/**
 * Get conversation statistics for a user
 */
export async function getConversationStats(
    organizationId: string,
    userId: string
): Promise<{
    total_conversations: number;
    total_messages: number;
    total_tokens: number;
    active_conversations: number;
}> {
    const conversations = await getUserConversations(organizationId, userId);

    return {
        total_conversations: conversations.length,
        total_messages: conversations.reduce((sum, c) => sum + c.message_count, 0),
        total_tokens: conversations.reduce((sum, c) => sum + c.total_tokens, 0),
        active_conversations: conversations.filter((c) => c.is_active).length,
    };
}

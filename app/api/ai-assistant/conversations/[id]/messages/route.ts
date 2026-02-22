import { NextRequest, NextResponse } from 'next/server';
import {
    getConversation,
    getConversationMessages,
} from '@/lib/ai-assistant/conversations';

// GET /api/ai-assistant/conversations/[id]/messages - Get messages for a conversation
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '100');
        const before = searchParams.get('before') || undefined;

        const conversation = await getConversation(id);

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        const messages = await getConversationMessages(id, {
            limit,
            before,
        });

        return NextResponse.json({
            conversation_id: id,
            messages,
            has_more: messages.length === limit,
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

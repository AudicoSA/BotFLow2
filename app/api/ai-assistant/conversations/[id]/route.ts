import { NextRequest, NextResponse } from 'next/server';
import {
    getConversation,
    updateConversation,
    deleteConversation,
    archiveConversation,
    getConversationMessages,
} from '@/lib/ai-assistant/conversations';

// GET /api/ai-assistant/conversations/[id] - Get a conversation with messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const includeMessages = searchParams.get('include_messages') !== 'false';

        const conversation = await getConversation(id);

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        let messages = null;
        if (includeMessages) {
            messages = await getConversationMessages(id);
        }

        return NextResponse.json({
            conversation,
            messages,
        });
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversation' },
            { status: 500 }
        );
    }
}

// PATCH /api/ai-assistant/conversations/[id] - Update a conversation
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Only allow updating specific fields
        const allowedFields = ['title', 'model', 'is_active'];
        const updates: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const conversation = await updateConversation(id, updates);

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ conversation });
    } catch (error) {
        console.error('Error updating conversation:', error);
        return NextResponse.json(
            { error: 'Failed to update conversation' },
            { status: 500 }
        );
    }
}

// DELETE /api/ai-assistant/conversations/[id] - Delete or archive a conversation
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const hardDelete = searchParams.get('hard_delete') === 'true';

        const conversation = await getConversation(id);

        if (!conversation) {
            return NextResponse.json(
                { error: 'Conversation not found' },
                { status: 404 }
            );
        }

        if (hardDelete) {
            await deleteConversation(id);
        } else {
            await archiveConversation(id);
        }

        return NextResponse.json({
            success: true,
            action: hardDelete ? 'deleted' : 'archived',
        });
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return NextResponse.json(
            { error: 'Failed to delete conversation' },
            { status: 500 }
        );
    }
}

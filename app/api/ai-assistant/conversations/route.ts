import { NextRequest, NextResponse } from 'next/server';
import {
    createConversation,
    getUserConversations,
} from '@/lib/ai-assistant/conversations';
import type { ConversationCreate } from '@/lib/ai-assistant/types';

// GET /api/ai-assistant/conversations - Get user's conversations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');
        const userId = searchParams.get('user_id');
        const activeOnly = searchParams.get('active_only') === 'true';
        const limit = parseInt(searchParams.get('limit') || '50');

        if (!organizationId || !userId) {
            return NextResponse.json(
                { error: 'organization_id and user_id are required' },
                { status: 400 }
            );
        }

        const conversations = await getUserConversations(organizationId, userId, {
            limit,
            activeOnly,
        });

        return NextResponse.json({ conversations });
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch conversations' },
            { status: 500 }
        );
    }
}

// POST /api/ai-assistant/conversations - Create a new conversation
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as ConversationCreate;

        if (!body.organization_id || !body.user_id) {
            return NextResponse.json(
                { error: 'organization_id and user_id are required' },
                { status: 400 }
            );
        }

        const conversation = await createConversation(body);

        return NextResponse.json({ conversation }, { status: 201 });
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json(
            { error: 'Failed to create conversation' },
            { status: 500 }
        );
    }
}

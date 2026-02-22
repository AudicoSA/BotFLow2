import { NextRequest, NextResponse } from 'next/server';
import {
    createSystemPrompt,
    getOrganizationPrompts,
    initializeDefaultPrompts,
} from '@/lib/ai-assistant/prompts';
import type { SystemPromptCreate, PromptCategory } from '@/lib/ai-assistant/types';

// GET /api/ai-assistant/prompts - Get organization's system prompts
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');
        const category = searchParams.get('category') as PromptCategory | null;

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        const prompts = await getOrganizationPrompts(
            organizationId,
            category || undefined
        );

        // If no prompts exist, initialize defaults
        if (prompts.length === 0) {
            await initializeDefaultPrompts(organizationId);
            const newPrompts = await getOrganizationPrompts(organizationId);
            return NextResponse.json({ prompts: newPrompts });
        }

        return NextResponse.json({ prompts });
    } catch (error) {
        console.error('Error fetching prompts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prompts' },
            { status: 500 }
        );
    }
}

// POST /api/ai-assistant/prompts - Create a new system prompt
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as SystemPromptCreate;

        if (!body.organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        if (!body.name || !body.content) {
            return NextResponse.json(
                { error: 'name and content are required' },
                { status: 400 }
            );
        }

        const prompt = await createSystemPrompt(body);

        return NextResponse.json({ prompt }, { status: 201 });
    } catch (error) {
        console.error('Error creating prompt:', error);
        return NextResponse.json(
            { error: 'Failed to create prompt' },
            { status: 500 }
        );
    }
}

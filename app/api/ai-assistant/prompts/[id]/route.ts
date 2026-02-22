import { NextRequest, NextResponse } from 'next/server';
import {
    getSystemPrompt,
    updateSystemPrompt,
    deleteSystemPrompt,
    renderPrompt,
    validatePromptVariables,
} from '@/lib/ai-assistant/prompts';

// GET /api/ai-assistant/prompts/[id] - Get a system prompt
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const render = searchParams.get('render') === 'true';

        const prompt = await getSystemPrompt(id);

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt not found' },
                { status: 404 }
            );
        }

        // Optionally render the prompt with variables
        if (render) {
            const variablesParam = searchParams.get('variables');
            const variables = variablesParam ? JSON.parse(variablesParam) : {};

            const validation = validatePromptVariables(prompt, variables);
            if (!validation.valid) {
                return NextResponse.json(
                    {
                        error: 'Missing required variables',
                        missing: validation.missing,
                    },
                    { status: 400 }
                );
            }

            const renderedContent = renderPrompt(prompt, variables);
            return NextResponse.json({
                prompt,
                rendered_content: renderedContent,
            });
        }

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('Error fetching prompt:', error);
        return NextResponse.json(
            { error: 'Failed to fetch prompt' },
            { status: 500 }
        );
    }
}

// PATCH /api/ai-assistant/prompts/[id] - Update a system prompt
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const allowedFields = [
            'name',
            'description',
            'content',
            'category',
            'is_default',
            'variables',
        ];
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

        const prompt = await updateSystemPrompt(id, updates);

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ prompt });
    } catch (error) {
        console.error('Error updating prompt:', error);
        return NextResponse.json(
            { error: 'Failed to update prompt' },
            { status: 500 }
        );
    }
}

// DELETE /api/ai-assistant/prompts/[id] - Delete a system prompt
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const prompt = await getSystemPrompt(id);

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt not found' },
                { status: 404 }
            );
        }

        // Don't allow deleting default prompts
        if (prompt.is_default) {
            return NextResponse.json(
                { error: 'Cannot delete default prompts. Unset as default first.' },
                { status: 400 }
            );
        }

        await deleteSystemPrompt(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting prompt:', error);
        return NextResponse.json(
            { error: 'Failed to delete prompt' },
            { status: 500 }
        );
    }
}

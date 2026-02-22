import { NextResponse } from 'next/server';
import { MODEL_CONFIGS, type AIModel } from '@/lib/ai-assistant/types';

// GET /api/ai-assistant/models - Get available AI models
export async function GET() {
    try {
        const models = Object.entries(MODEL_CONFIGS).map(([id, config]) => ({
            id: id as AIModel,
            name: getModelDisplayName(id as AIModel),
            description: getModelDescription(id as AIModel),
            max_tokens: config.maxTokens,
            context_window: config.contextWindow,
            input_price_per_million: config.inputPricePerMillion,
            output_price_per_million: config.outputPricePerMillion,
            recommended: id === 'gpt-4o',
        }));

        return NextResponse.json({ models });
    } catch (error) {
        console.error('Error fetching models:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models' },
            { status: 500 }
        );
    }
}

function getModelDisplayName(model: AIModel): string {
    const names: Record<AIModel, string> = {
        'gpt-4': 'GPT-4',
        'gpt-4-turbo': 'GPT-4 Turbo',
        'gpt-4o': 'GPT-4o (Recommended)',
        'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    };
    return names[model];
}

function getModelDescription(model: AIModel): string {
    const descriptions: Record<AIModel, string> = {
        'gpt-4':
            'Most capable GPT-4 model. Best for complex tasks requiring deep reasoning.',
        'gpt-4-turbo':
            'Faster GPT-4 with 128k context window. Great for long conversations.',
        'gpt-4o':
            'Latest multimodal model. Best balance of speed, capability, and cost.',
        'gpt-3.5-turbo':
            'Fast and cost-effective. Good for simpler tasks and high-volume use.',
    };
    return descriptions[model];
}

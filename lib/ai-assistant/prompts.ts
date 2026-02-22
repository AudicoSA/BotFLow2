// System Prompt Management

import { getSupabaseServerClient } from '@/lib/supabase/client';
import {
    DEFAULT_SYSTEM_PROMPTS,
    type SystemPrompt,
    type SystemPromptCreate,
    type PromptCategory,
    type PromptVariable,
} from './types';

/**
 * Create a new system prompt
 */
export async function createSystemPrompt(
    data: SystemPromptCreate
): Promise<SystemPrompt> {
    const supabase = getSupabaseServerClient();

    // If setting as default, unset other defaults in same category
    if (data.is_default) {
        await supabase
            .from('ai_system_prompts')
            .update({ is_default: false })
            .eq('organization_id', data.organization_id)
            .eq('category', data.category);
    }

    const result = await supabase
        .from<SystemPrompt>('ai_system_prompts')
        .insert({
            organization_id: data.organization_id,
            name: data.name,
            description: data.description,
            content: data.content,
            category: data.category,
            is_default: data.is_default || false,
            variables: data.variables,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        } as Partial<SystemPrompt>)
        .select()
        .single();

    if (result.error || !result.data) {
        throw new Error(`Failed to create system prompt: ${result.error?.message || 'Unknown error'}`);
    }

    return result.data;
}

/**
 * Get a system prompt by ID
 */
export async function getSystemPrompt(
    promptId: string
): Promise<SystemPrompt | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<SystemPrompt>('ai_system_prompts')
        .select('*')
        .eq('id', promptId)
        .single();

    if (result.error || !result.data) {
        return null;
    }

    return result.data;
}

/**
 * Get all system prompts for an organization
 */
export async function getOrganizationPrompts(
    organizationId: string,
    category?: PromptCategory
): Promise<SystemPrompt[]> {
    const supabase = getSupabaseServerClient();

    return new Promise((resolve) => {
        let query = supabase
            .from<SystemPrompt>('ai_system_prompts')
            .select('*')
            .eq('organization_id', organizationId);

        if (category) {
            query = query.eq('category', category);
        }

        query.order('created_at', { ascending: false }).then((result) => {
            if (result.error || !result.data) {
                console.error('Error fetching prompts:', result.error);
                resolve([]);
            } else {
                resolve(result.data);
            }
        });
    });
}

/**
 * Get the default system prompt for an organization/category
 */
export async function getDefaultPrompt(
    organizationId: string,
    category: PromptCategory = 'general'
): Promise<SystemPrompt | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<SystemPrompt>('ai_system_prompts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('category', category)
        .eq('is_default', true)
        .single();

    if (result.error || !result.data) {
        return null;
    }

    return result.data;
}

/**
 * Update a system prompt
 */
export async function updateSystemPrompt(
    promptId: string,
    updates: Partial<Pick<SystemPrompt, 'name' | 'description' | 'content' | 'category' | 'is_default' | 'variables'>>
): Promise<SystemPrompt | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<SystemPrompt>('ai_system_prompts')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', promptId)
        .select()
        .single();

    if (result.error || !result.data) {
        console.error('Error updating prompt:', result.error);
        return null;
    }

    return result.data;
}

/**
 * Delete a system prompt
 */
export async function deleteSystemPrompt(promptId: string): Promise<void> {
    const supabase = getSupabaseServerClient();

    await supabase.from('ai_system_prompts').delete().eq('id', promptId);
}

/**
 * Initialize default prompts for an organization
 */
export async function initializeDefaultPrompts(
    organizationId: string
): Promise<void> {
    const supabase = getSupabaseServerClient();

    // Check if organization already has prompts
    const existing = await getOrganizationPrompts(organizationId);
    if (existing.length > 0) {
        return;
    }

    // Create default prompts
    for (const prompt of DEFAULT_SYSTEM_PROMPTS) {
        await supabase.from('ai_system_prompts').insert({
            organization_id: organizationId,
            name: prompt.name,
            description: prompt.description,
            content: prompt.content,
            category: prompt.category,
            is_default: prompt.is_default,
            variables: prompt.variables ? JSON.stringify(prompt.variables) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    }
}

/**
 * Render a system prompt with variables
 */
export function renderPrompt(
    prompt: SystemPrompt,
    variables: Record<string, string> = {}
): string {
    let content = prompt.content;

    // Parse variables if stored as string
    const promptVariables: PromptVariable[] =
        typeof prompt.variables === 'string'
            ? JSON.parse(prompt.variables)
            : prompt.variables || [];

    // Replace variables in the prompt
    for (const variable of promptVariables) {
        const value = variables[variable.name] ?? variable.default_value ?? '';
        const placeholder = `{{${variable.name}}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    // Also replace any remaining {{variable}} patterns
    for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        content = content.replace(new RegExp(placeholder, 'g'), value);
    }

    return content;
}

/**
 * Validate that all required variables are provided
 */
export function validatePromptVariables(
    prompt: SystemPrompt,
    variables: Record<string, string>
): { valid: boolean; missing: string[] } {
    const promptVariables: PromptVariable[] =
        typeof prompt.variables === 'string'
            ? JSON.parse(prompt.variables)
            : prompt.variables || [];

    const missing: string[] = [];

    for (const variable of promptVariables) {
        if (variable.required && !variables[variable.name] && !variable.default_value) {
            missing.push(variable.name);
        }
    }

    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Get prompt categories with descriptions
 */
export const PROMPT_CATEGORIES: Record<PromptCategory, { name: string; description: string }> = {
    general: {
        name: 'General Assistant',
        description: 'General-purpose AI assistant for various tasks',
    },
    customer_support: {
        name: 'Customer Support',
        description: 'Specialized for handling customer inquiries and issues',
    },
    sales: {
        name: 'Sales Assistant',
        description: 'Helps with sales inquiries and product information',
    },
    technical: {
        name: 'Technical Support',
        description: 'For technical troubleshooting and support',
    },
    creative: {
        name: 'Creative Writing',
        description: 'For creative content generation and writing assistance',
    },
    custom: {
        name: 'Custom',
        description: 'Custom prompts for specific use cases',
    },
};

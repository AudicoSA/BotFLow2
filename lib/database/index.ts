// BotFlow2 SaaS Platform - Database Module
// Re-exports all database types and utilities

export * from './schema';

// Re-export Supabase client utilities
export { getSupabaseBrowserClient, getSupabaseServerClient, SupabaseClient } from '../supabase/client';

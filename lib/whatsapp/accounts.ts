// WhatsApp Accounts Management

import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
    WhatsAppAccount,
    WhatsAppAccountCreate,
    ConnectionStatus,
    CoexistenceMode,
} from './types';

// Get Supabase client
function getSupabaseClient() {
    return getSupabaseServerClient();
}

// Create a new WhatsApp account
export async function createWhatsAppAccount(
    data: WhatsAppAccountCreate
): Promise<WhatsAppAccount> {
    const supabase = getSupabaseClient();

    const accountData: Partial<WhatsAppAccount> = {
        organization_id: data.organization_id,
        phone_number: data.phone_number,
        phone_number_id: data.phone_number_id,
        waba_id: data.waba_id,
        channel_id: data.channel_id,
        display_name: data.display_name,
        quality_rating: 'UNKNOWN' as const,
        connection_status: 'connected' as const,
        coexistence_mode: data.coexistence_mode || 'none',
        access_token: data.access_token,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const result = await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .insert(accountData)
        .select()
        .single();

    if (result.error || !result.data) {
        throw new Error(`Failed to create WhatsApp account: ${result.error?.message || 'Unknown error'}`);
    }

    return result.data;
}

// Get WhatsApp account by ID
export async function getWhatsAppAccount(
    accountId: string
): Promise<WhatsAppAccount | null> {
    const supabase = getSupabaseClient();

    const result = await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .select('*')
        .eq('id', accountId)
        .single();

    if (result.error || !result.data) {
        return null;
    }

    return result.data;
}

// Get WhatsApp account by phone number ID
export async function getWhatsAppAccountByPhoneNumberId(
    phoneNumberId: string
): Promise<WhatsAppAccount | null> {
    const supabase = getSupabaseClient();

    const result = await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .select('*')
        .eq('phone_number_id', phoneNumberId)
        .single();

    if (result.error || !result.data) {
        return null;
    }

    return result.data;
}

// Get WhatsApp account by channel ID
export async function getWhatsAppAccountByChannelId(
    channelId: string
): Promise<WhatsAppAccount | null> {
    const supabase = getSupabaseClient();

    const result = await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .select('*')
        .eq('channel_id', channelId)
        .single();

    if (result.error || !result.data) {
        return null;
    }

    return result.data;
}

// Get all WhatsApp accounts for an organization
export async function getOrganizationWhatsAppAccounts(
    organizationId: string
): Promise<WhatsAppAccount[]> {
    const supabase = getSupabaseClient();

    return new Promise((resolve) => {
        supabase
            .from<WhatsAppAccount>('whatsapp_accounts')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false })
            .then((result) => {
                if (result.error || !result.data) {
                    console.error('Error fetching WhatsApp accounts:', result.error);
                    resolve([]);
                } else {
                    resolve(result.data);
                }
            });
    });
}

// Update WhatsApp account
export async function updateWhatsAppAccount(
    accountId: string,
    updates: Partial<
        Pick<
            WhatsAppAccount,
            | 'display_name'
            | 'quality_rating'
            | 'connection_status'
            | 'coexistence_mode'
            | 'access_token'
            | 'refresh_token'
            | 'token_expires_at'
            | 'last_synced_at'
        >
    >
): Promise<WhatsAppAccount | null> {
    const supabase = getSupabaseClient();

    const result = await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', accountId)
        .select()
        .single();

    if (result.error || !result.data) {
        console.error('Error updating WhatsApp account:', result.error);
        return null;
    }

    return result.data;
}

// Update connection status
export async function updateConnectionStatus(
    accountId: string,
    status: ConnectionStatus
): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .update({
            connection_status: status,
            updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);
}

// Update coexistence mode
export async function updateCoexistenceMode(
    accountId: string,
    mode: CoexistenceMode
): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .update({
            coexistence_mode: mode,
            updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);
}

// Update access token
export async function updateAccessToken(
    accountId: string,
    accessToken: string,
    _expiresAt?: string
): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from<WhatsAppAccount>('whatsapp_accounts')
        .update({
            access_token: accessToken,
            updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);
}

// Delete WhatsApp account
export async function deleteWhatsAppAccount(accountId: string): Promise<void> {
    const supabase = getSupabaseClient();

    // Delete associated contacts and messages first
    await supabase.from('whatsapp_messages').delete().eq('account_id', accountId);
    await supabase.from('whatsapp_contacts').delete().eq('account_id', accountId);

    // Delete the account
    await supabase.from('whatsapp_accounts').delete().eq('id', accountId);
}

// Check if organization has WhatsApp connected
export async function hasWhatsAppConnected(
    organizationId: string
): Promise<boolean> {
    const accounts = await getOrganizationWhatsAppAccounts(organizationId);
    return accounts.some(account => account.connection_status === 'connected');
}

// Get account statistics
export async function getAccountStats(_accountId: string): Promise<{
    total_messages: number;
    total_contacts: number;
    messages_today: number;
    messages_this_week: number;
}> {
    // Simplified stats - in production, implement proper counting
    return {
        total_messages: 0,
        total_contacts: 0,
        messages_today: 0,
        messages_this_week: 0,
    };
}

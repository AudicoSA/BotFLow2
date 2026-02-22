// Chat History and Contacts Sync for WhatsApp

import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
    WhatsAppContact,
    WhatsAppMessage,
    SyncResult,
    ChatHistoryItem,
    WebhookMessage,
    MessageContent,
    MessageType,
} from './types';

// Get Supabase client
function getSupabaseClient() {
    return getSupabaseServerClient();
}

// Sync contacts from WhatsApp to database
export async function syncContacts(
    accountId: string,
    contacts: Array<{
        wa_id: string;
        profile_name?: string;
        phone_number: string;
    }>
): Promise<{ synced: number; errors: string[] }> {
    const supabase = getSupabaseClient();
    const errors: string[] = [];
    let synced = 0;

    for (const contact of contacts) {
        try {
            const result = await supabase.from('whatsapp_contacts').insert({
                account_id: accountId,
                wa_id: contact.wa_id,
                profile_name: contact.profile_name,
                phone_number: contact.phone_number,
                updated_at: new Date().toISOString(),
            });

            if (result.error) {
                errors.push(`Failed to sync contact ${contact.wa_id}: ${result.error.message}`);
            } else {
                synced++;
            }
        } catch (err) {
            errors.push(
                `Error syncing contact ${contact.wa_id}: ${err instanceof Error ? err.message : 'Unknown error'}`
            );
        }
    }

    return { synced, errors };
}

// Store incoming message
export async function storeIncomingMessage(
    accountId: string,
    message: WebhookMessage,
    contactInfo?: { wa_id: string; profile_name?: string }
): Promise<WhatsAppMessage | null> {
    const supabase = getSupabaseClient();

    // First, ensure contact exists
    if (contactInfo) {
        await supabase.from('whatsapp_contacts').insert({
            account_id: accountId,
            wa_id: contactInfo.wa_id,
            profile_name: contactInfo.profile_name,
            phone_number: message.from,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    }

    // Build message content based on type
    const content: MessageContent = {};
    switch (message.type) {
        case 'text':
            content.text = message.text;
            break;
        case 'image':
            content.image = message.image;
            break;
        case 'video':
            content.video = message.video;
            break;
        case 'audio':
            content.audio = message.audio;
            break;
        case 'document':
            content.document = message.document;
            break;
        case 'location':
            content.location = message.location;
            break;
        case 'contacts':
            content.contacts = message.contacts;
            break;
        case 'reaction':
            content.reaction = message.reaction;
            break;
    }

    // Store the message
    const result = await supabase
        .from<WhatsAppMessage>('whatsapp_messages')
        .insert({
            account_id: accountId,
            message_id: message.id,
            from_number: message.from,
            to_number: '', // Will be the business number
            type: message.type,
            content,
            status: 'delivered',
            direction: 'inbound',
            timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
        } as Partial<WhatsAppMessage>)
        .select()
        .single();

    if (result.error) {
        console.error('Error storing message:', result.error);
        return null;
    }

    return result.data;
}

// Store outgoing message
export async function storeOutgoingMessage(
    accountId: string,
    messageId: string,
    to: string,
    type: MessageType,
    content: MessageContent
): Promise<WhatsAppMessage | null> {
    const supabase = getSupabaseClient();

    const result = await supabase
        .from<WhatsAppMessage>('whatsapp_messages')
        .insert({
            account_id: accountId,
            message_id: messageId,
            from_number: '', // Will be the business number
            to_number: to,
            type,
            content,
            status: 'sent',
            direction: 'outbound',
            timestamp: new Date().toISOString(),
        } as Partial<WhatsAppMessage>)
        .select()
        .single();

    if (result.error) {
        console.error('Error storing outgoing message:', result.error);
        return null;
    }

    // Update contact's last message time
    await supabase
        .from('whatsapp_contacts')
        .update({
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId)
        .eq('phone_number', to);

    return result.data;
}

// Update message status
export async function updateMessageStatus(
    accountId: string,
    messageId: string,
    status: 'sent' | 'delivered' | 'read' | 'failed'
): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from('whatsapp_messages')
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId)
        .eq('message_id', messageId);
}

// Get chat history for a contact
export async function getChatHistory(
    accountId: string,
    _contactWaId: string,
    _limit = 50,
    _before?: string
): Promise<WhatsAppMessage[]> {
    // Simplified implementation - in production, use proper filtering
    const supabase = getSupabaseClient();

    return new Promise((resolve) => {
        supabase
            .from<WhatsAppMessage>('whatsapp_messages')
            .select('*')
            .eq('account_id', accountId)
            .order('timestamp', { ascending: false })
            .limit(50)
            .then((result) => {
                if (result.error || !result.data) {
                    console.error('Error fetching chat history:', result.error);
                    resolve([]);
                } else {
                    resolve(result.data);
                }
            });
    });
}

// Get all chat conversations
export async function getChatList(
    accountId: string,
    _limit = 50,
    _offset = 0
): Promise<ChatHistoryItem[]> {
    // Simplified implementation
    const supabase = getSupabaseClient();
    const chatList: ChatHistoryItem[] = [];

    return new Promise((resolve) => {
        supabase
            .from<WhatsAppContact>('whatsapp_contacts')
            .select('*')
            .eq('account_id', accountId)
            .order('last_message_at', { ascending: false })
            .limit(50)
            .then((result) => {
                if (result.error || !result.data) {
                    console.error('Error fetching contacts:', result.error);
                    resolve([]);
                } else {
                    // Return contacts without detailed message info for simplicity
                    for (const contact of result.data) {
                        chatList.push({
                            contact,
                            last_message: null as unknown as WhatsAppMessage,
                            unread_count: 0,
                        });
                    }
                    resolve(chatList);
                }
            });
    });
}

// Mark messages as read
export async function markMessagesAsRead(
    accountId: string,
    contactWaId: string
): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from('whatsapp_messages')
        .update({
            status: 'read',
            updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId)
        .eq('from_number', contactWaId);
}

// Full sync - sync all available data
export async function performFullSync(
    accountId: string
): Promise<SyncResult> {
    const errors: string[] = [];
    const contactsSynced = 0;
    const messagesSynced = 0;

    // Note: WhatsApp Cloud API doesn't provide bulk history export
    // Messages are received via webhooks in real-time
    // This function is for syncing contacts that may have been missed

    const supabase = getSupabaseClient();

    // Update last sync timestamp
    await supabase
        .from('whatsapp_accounts')
        .update({
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', accountId);

    return {
        contacts_synced: contactsSynced,
        messages_synced: messagesSynced,
        errors,
        last_synced_at: new Date().toISOString(),
    };
}

// Search messages
export async function searchMessages(
    _accountId: string,
    _query: string,
    _limit = 20
): Promise<WhatsAppMessage[]> {
    // Simplified - text search requires proper database setup
    return [];
}

// Get contact by phone number
export async function getContactByPhone(
    accountId: string,
    phoneNumber: string
): Promise<WhatsAppContact | null> {
    const supabase = getSupabaseClient();

    const result = await supabase
        .from<WhatsAppContact>('whatsapp_contacts')
        .select('*')
        .eq('account_id', accountId)
        .eq('phone_number', phoneNumber)
        .single();

    if (result.error) {
        return null;
    }

    return result.data;
}

// Update contact tags
export async function updateContactTags(
    accountId: string,
    contactId: string,
    tags: string[]
): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from('whatsapp_contacts')
        .update({
            tags,
            updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId)
        .eq('id', contactId);
}

// Update contact custom fields
export async function updateContactCustomFields(
    accountId: string,
    contactId: string,
    customFields: Record<string, string>
): Promise<void> {
    const supabase = getSupabaseClient();

    await supabase
        .from('whatsapp_contacts')
        .update({
            custom_fields: customFields,
            updated_at: new Date().toISOString(),
        })
        .eq('account_id', accountId)
        .eq('id', contactId);
}

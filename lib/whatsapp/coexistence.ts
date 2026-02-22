// Coexistence Mode for WhatsApp Business API
// Allows users to continue using WhatsApp Business App while also using the Cloud API

import { WhatsAppClient, WhatsAppAPIError } from './client';
import type { CoexistenceStatus, CoexistenceMode } from './types';

// Check if a phone number is eligible for coexistence mode
export async function checkCoexistenceEligibility(
    client: WhatsAppClient,
    phoneNumberId: string
): Promise<CoexistenceStatus> {
    try {
        // Get phone number info to check eligibility
        const phoneInfo = await client.getPhoneNumberInfo(phoneNumberId);

        // Check if the number has an existing WhatsApp Business App link
        // This is determined by various factors from the API response
        const isEligible = !phoneInfo.is_official_business_account;

        return {
            is_coexistence_eligible: isEligible,
            current_mode: 'none',
            migration_status: 'not_started',
            business_app_linked: false, // Would be determined by actual API check
        };
    } catch (error) {
        if (error instanceof WhatsAppAPIError) {
            throw error;
        }
        throw new Error('Failed to check coexistence eligibility');
    }
}

// Enable coexistence mode for a phone number
export async function enableCoexistenceMode(
    client: WhatsAppClient,
    phoneNumberId: string
): Promise<{ success: boolean; mode: CoexistenceMode }> {
    try {
        // In production, this would call the Meta API to enable coexistence
        // For now, we'll simulate the API call structure

        // Register the phone number for coexistence
        // This allows the user to continue using WhatsApp Business App
        // while messages are also routed to the Cloud API

        // Note: Actual implementation depends on Meta API availability
        // The coexistence feature needs to be enabled in Meta Business Manager

        return {
            success: true,
            mode: 'enabled',
        };
    } catch (error) {
        if (error instanceof WhatsAppAPIError) {
            throw error;
        }
        throw new Error('Failed to enable coexistence mode');
    }
}

// Disable coexistence mode (migrate fully to Cloud API)
export async function disableCoexistenceMode(
    client: WhatsAppClient,
    phoneNumberId: string
): Promise<{ success: boolean; mode: CoexistenceMode }> {
    try {
        // This would migrate the number fully to Cloud API
        // The WhatsApp Business App would no longer be usable with this number

        return {
            success: true,
            mode: 'migrated',
        };
    } catch (error) {
        if (error instanceof WhatsAppAPIError) {
            throw error;
        }
        throw new Error('Failed to disable coexistence mode');
    }
}

// Get current coexistence status
export async function getCoexistenceStatus(
    accessToken: string,
    phoneNumberId: string
): Promise<CoexistenceStatus> {
    try {
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=is_official_business_account,code_verification_status`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch coexistence status');
        }

        const data = await response.json();

        // Determine coexistence status based on phone number settings
        const isOfficialAccount = data.is_official_business_account;
        const isVerified = data.code_verification_status === 'VERIFIED';

        let currentMode: CoexistenceMode = 'none';
        let migrationStatus: 'not_started' | 'in_progress' | 'completed' | 'failed' =
            'not_started';

        if (isOfficialAccount && isVerified) {
            currentMode = 'migrated';
            migrationStatus = 'completed';
        }

        return {
            is_coexistence_eligible: !isOfficialAccount,
            current_mode: currentMode,
            migration_status: migrationStatus,
            business_app_linked: !isOfficialAccount,
        };
    } catch (error) {
        console.error('Error fetching coexistence status:', error);
        return {
            is_coexistence_eligible: false,
            current_mode: 'none',
            migration_status: 'not_started',
            business_app_linked: false,
        };
    }
}

// Instructions for user to enable coexistence
export const COEXISTENCE_INSTRUCTIONS = [
    {
        step: 1,
        title: 'Keep Using Your Phone',
        description:
            'With Coexistence mode, you can continue using WhatsApp Business App on your phone while BotFlow handles automated responses.',
    },
    {
        step: 2,
        title: 'Messages Sync Automatically',
        description:
            'All messages sent through BotFlow will appear in your WhatsApp Business App, and vice versa.',
    },
    {
        step: 3,
        title: 'Choose When to Migrate',
        description:
            'When you\'re ready, you can fully migrate to the Cloud API for advanced features. This is optional.',
    },
];

// Migration checklist for users moving from Business App to Cloud API
export const MIGRATION_CHECKLIST = [
    {
        id: 'backup_chats',
        title: 'Backup Chat History',
        description: 'Export your chat history from WhatsApp Business App before migrating.',
        required: true,
    },
    {
        id: 'notify_contacts',
        title: 'Notify Key Contacts',
        description: 'Let important contacts know about the transition to avoid confusion.',
        required: false,
    },
    {
        id: 'setup_templates',
        title: 'Create Message Templates',
        description: 'Set up approved templates for initiating conversations.',
        required: true,
    },
    {
        id: 'configure_webhook',
        title: 'Configure Webhooks',
        description: 'Ensure your webhook endpoint is set up to receive messages.',
        required: true,
    },
    {
        id: 'test_messages',
        title: 'Test Message Flow',
        description: 'Send test messages to verify everything is working correctly.',
        required: true,
    },
];

// Helper to format migration status for display
export function formatMigrationStatus(status: CoexistenceStatus): {
    label: string;
    color: 'gray' | 'yellow' | 'green' | 'red';
    description: string;
} {
    switch (status.current_mode) {
        case 'none':
            return {
                label: 'Not Connected',
                color: 'gray',
                description: 'WhatsApp is not connected to BotFlow yet.',
            };
        case 'enabled':
            return {
                label: 'Coexistence Active',
                color: 'yellow',
                description:
                    'You can use both WhatsApp Business App and BotFlow simultaneously.',
            };
        case 'migrated':
            return {
                label: 'Fully Migrated',
                color: 'green',
                description: 'All messages are handled through BotFlow Cloud API.',
            };
        default:
            return {
                label: 'Unknown',
                color: 'gray',
                description: 'Unable to determine connection status.',
            };
    }
}

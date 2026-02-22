import { NextRequest, NextResponse } from 'next/server';
import {
    getOrganizationWhatsAppAccounts,
    createWhatsAppAccount,
} from '@/lib/whatsapp/accounts';
import type { WhatsAppAccountCreate } from '@/lib/whatsapp/types';

// GET /api/whatsapp/accounts - Get all accounts for an organization
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        const accounts = await getOrganizationWhatsAppAccounts(organizationId);

        // Remove sensitive data
        const sanitizedAccounts = accounts.map((account) => ({
            ...account,
            access_token: undefined,
            refresh_token: undefined,
        }));

        return NextResponse.json({ accounts: sanitizedAccounts });
    } catch (error) {
        console.error('Error fetching WhatsApp accounts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch accounts' },
            { status: 500 }
        );
    }
}

// POST /api/whatsapp/accounts - Create a new account
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as WhatsAppAccountCreate;

        // Validate required fields
        if (
            !body.organization_id ||
            !body.phone_number ||
            !body.phone_number_id ||
            !body.waba_id ||
            !body.channel_id ||
            !body.display_name ||
            !body.access_token
        ) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const account = await createWhatsAppAccount(body);

        // Remove sensitive data from response
        const sanitizedAccount = {
            ...account,
            access_token: undefined,
            refresh_token: undefined,
        };

        return NextResponse.json({ account: sanitizedAccount }, { status: 201 });
    } catch (error) {
        console.error('Error creating WhatsApp account:', error);
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}

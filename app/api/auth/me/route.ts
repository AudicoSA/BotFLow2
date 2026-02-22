import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getUserById, updateUserProfile, changePassword } from '@/lib/auth/users';
import { validatePassword } from '@/lib/auth/types';

// Helper to extract and verify auth token
async function getAuthenticatedUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const result = await verifyAccessToken(token);

    if (!result.valid || !result.payload) {
        return null;
    }

    return result.payload;
}

// GET /api/auth/me - Get current user profile
export async function GET(request: NextRequest) {
    try {
        const payload = await getAuthenticatedUser(request);

        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await getUserById(payload.sub);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Get profile error:', error);
        return NextResponse.json(
            { error: 'Failed to get profile' },
            { status: 500 }
        );
    }
}

// PATCH /api/auth/me - Update user profile
export async function PATCH(request: NextRequest) {
    try {
        const payload = await getAuthenticatedUser(request);

        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, avatar_url } = body;

        const updatedUser = await updateUserProfile(payload.sub, {
            name,
            avatar_url,
        });

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            );
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error('Update profile error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

// PUT /api/auth/me - Change password
export async function PUT(request: NextRequest) {
    try {
        const payload = await getAuthenticatedUser(request);

        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { current_password, new_password } = body;

        if (!current_password || !new_password) {
            return NextResponse.json(
                { error: 'Current password and new password required' },
                { status: 400 }
            );
        }

        // Validate new password
        const passwordValidation = validatePassword(new_password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(', ') },
                { status: 400 }
            );
        }

        const success = await changePassword(
            payload.sub,
            current_password,
            new_password
        );

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to change password' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Password changed successfully',
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to change password';

        if (message.includes('incorrect')) {
            return NextResponse.json({ error: message }, { status: 400 });
        }

        console.error('Change password error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

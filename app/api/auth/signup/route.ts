import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/users';
import { validateEmail, validatePassword } from '@/lib/auth/types';

// POST /api/auth/signup - Create a new user account
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Validate email format
        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Validate password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(', ') },
                { status: 400 }
            );
        }

        // Create user
        const result = await createUser({ email, password, name });

        if (!result) {
            return NextResponse.json(
                { error: 'Failed to create account' },
                { status: 500 }
            );
        }

        // In production, send verification email here
        // await sendVerificationEmail(result.user.email, result.verificationToken);

        return NextResponse.json(
            {
                message: 'Account created successfully. Please check your email to verify your account.',
                user: result.user,
                // Only include token in development for testing
                ...(process.env.NODE_ENV === 'development' && {
                    verification_token: result.verificationToken,
                }),
            },
            { status: 201 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Signup failed';

        if (message.includes('already registered')) {
            return NextResponse.json({ error: message }, { status: 409 });
        }

        console.error('Signup error:', error);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}

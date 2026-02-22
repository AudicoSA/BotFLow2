import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth/users';
import { validateEmail, validatePassword } from '@/lib/auth/types';
import { sendWelcomeEmail, sendVerificationEmail } from '@/lib/email/service';
import { scheduleTrialReminders, scheduleFeatureEducationCampaign } from '@/lib/email/campaigns';
import { appConfig } from '@/lib/config/environment';

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

        // Send verification email
        const verificationUrl = `${appConfig.url}/auth/verify?token=${result.verificationToken}`;
        await sendVerificationEmail(
            result.user.email,
            result.user.id,
            {
                userName: result.user.name || 'there',
                verificationUrl,
                expiresIn: '24 hours',
            }
        );

        // Calculate trial end date (14 days from now)
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);

        // Queue welcome email and onboarding campaigns
        try {
            await sendWelcomeEmail(
                result.user.email,
                result.user.id,
                {
                    userName: result.user.name || 'there',
                    userEmail: result.user.email,
                    trialEndDate: trialEndDate.toLocaleDateString('en-ZA', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                    dashboardUrl: `${appConfig.url}/dashboard`,
                }
            );

            // Schedule trial reminders
            await scheduleTrialReminders({
                id: result.user.id,
                email: result.user.email,
                name: result.user.name || 'User',
                trialEndDate,
                createdAt: new Date(),
            });

            // Schedule feature education drip campaign
            await scheduleFeatureEducationCampaign({
                id: result.user.id,
                email: result.user.email,
                name: result.user.name || 'User',
                createdAt: new Date(),
            });
        } catch (emailError) {
            // Log but don't fail signup if email scheduling fails
            console.error('Failed to schedule onboarding emails:', emailError);
        }

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

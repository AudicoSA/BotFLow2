import { NextRequest, NextResponse } from 'next/server';

interface DeletionRequest {
    email: string;
    scope: 'full' | 'ai' | 'whatsapp' | 'receipt';
    reason?: string;
}

// POST /api/data-deletion - Submit a new data deletion request
export async function POST(request: NextRequest) {
    try {
        const body: DeletionRequest = await request.json();

        // Validate required fields
        if (!body.email) {
            return NextResponse.json(
                { error: 'Email address is required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
            return NextResponse.json(
                { error: 'Invalid email address format' },
                { status: 400 }
            );
        }

        // Validate scope
        const validScopes = ['full', 'ai', 'whatsapp', 'receipt'];
        if (!body.scope || !validScopes.includes(body.scope)) {
            return NextResponse.json(
                { error: 'Invalid deletion scope' },
                { status: 400 }
            );
        }

        // Generate a unique request ID
        const requestId = `DDR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // In a production environment, this would:
        // 1. Store the request in a database
        // 2. Send a verification email to the user
        // 3. Create an audit log entry
        // 4. Queue the deletion job for processing after verification

        // For now, we'll simulate the request submission
        const deletionRequest = {
            id: requestId,
            email: body.email,
            scope: body.scope,
            reason: body.reason || null,
            status: 'pending_verification',
            createdAt: new Date().toISOString(),
            estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        };

        // Log the request (in production, store in database)
        console.log('Data deletion request received:', {
            requestId,
            email: body.email,
            scope: body.scope,
            timestamp: new Date().toISOString(),
        });

        // In production, send verification email here
        // await sendVerificationEmail(body.email, requestId);

        return NextResponse.json({
            success: true,
            message: 'Data deletion request submitted successfully',
            requestId: deletionRequest.id,
            status: deletionRequest.status,
            estimatedCompletionDate: deletionRequest.estimatedCompletionDate,
        });
    } catch (error) {
        console.error('Error processing data deletion request:', error);
        return NextResponse.json(
            { error: 'Failed to process request. Please try again later.' },
            { status: 500 }
        );
    }
}

// GET /api/data-deletion?requestId=XXX - Check status of a deletion request
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const requestId = searchParams.get('requestId');
        const email = searchParams.get('email');

        if (!requestId || !email) {
            return NextResponse.json(
                { error: 'Request ID and email are required' },
                { status: 400 }
            );
        }

        // In production, this would query the database for the request status
        // For now, return a mock response
        const mockStatus = {
            requestId,
            status: 'processing',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            estimatedCompletionDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
            steps: [
                { name: 'Request Submitted', completed: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                { name: 'Verification Email Sent', completed: true, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
                { name: 'Identity Verified', completed: true, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
                { name: 'Data Deletion In Progress', completed: false, date: null },
                { name: 'Confirmation Sent', completed: false, date: null },
            ],
        };

        return NextResponse.json(mockStatus);
    } catch (error) {
        console.error('Error fetching deletion request status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch request status' },
            { status: 500 }
        );
    }
}

// Password Hashing and Validation
// Uses Web Crypto API for Edge-compatible password hashing

/**
 * Hash a password using PBKDF2 with SHA-256
 * This is Edge-compatible (no Node.js crypto dependency)
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Import the password as a key
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
    );

    // Derive key using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        256
    );

    // Combine salt and hash
    const hashArray = new Uint8Array(derivedBits);
    const combined = new Uint8Array(salt.length + hashArray.length);
    combined.set(salt);
    combined.set(hashArray, salt.length);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(
    password: string,
    storedHash: string
): Promise<boolean> {
    try {
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);

        // Decode the stored hash
        const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));

        // Extract salt (first 16 bytes)
        const salt = combined.slice(0, 16);
        const storedHashBytes = combined.slice(16);

        // Import the password as a key
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordBuffer,
            'PBKDF2',
            false,
            ['deriveBits']
        );

        // Derive key using same parameters
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256',
            },
            keyMaterial,
            256
        );

        const newHashBytes = new Uint8Array(derivedBits);

        // Compare hashes in constant time
        return constantTimeCompare(newHashBytes, storedHashBytes);
    } catch (error) {
        console.error('Password verification error:', error);
        return false;
    }
}

/**
 * Constant-time comparison to prevent timing attacks
 */
function constantTimeCompare(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a[i] ^ b[i];
    }

    return result === 0;
}

/**
 * Generate a secure random token (for session IDs, etc.)
 */
export function generateSecureToken(length: number = 32): string {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Generate a URL-safe random token
 */
export function generateUrlSafeToken(length: number = 32): string {
    const bytes = crypto.getRandomValues(new Uint8Array(length));
    // Base64 URL-safe encoding
    const base64 = btoa(String.fromCharCode(...bytes));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate a short numeric code (for email verification, etc.)
 */
export function generateNumericCode(length: number = 6): string {
    const max = Math.pow(10, length);
    const randomNumber = Math.floor(Math.random() * max);
    return randomNumber.toString().padStart(length, '0');
}

import type { NextConfig } from "next";

// Production domains
const PRODUCTION_DOMAINS = [
    'botflow.co.za',
    'www.botflow.co.za',
    'app.botflow.co.za',
];

// Allowed image domains
const IMAGE_DOMAINS = [
    'localhost',
    'botflow.co.za',
    'www.botflow.co.za',
    'supabase.co',
    '*.supabase.co',
    'lh3.googleusercontent.com', // Google profile pictures
    'platform-lookaside.fbsbx.com', // Facebook/Meta images
    'pps.whatsapp.net', // WhatsApp profile pictures
];

const nextConfig: NextConfig = {
    output: 'standalone',

    // Environment variables available at build time
    env: {
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://botflow.co.za',
        NEXT_PUBLIC_APP_NAME: 'BotFlow',
    },

    // Image optimization configuration
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'platform-lookaside.fbsbx.com',
            },
            {
                protocol: 'https',
                hostname: 'pps.whatsapp.net',
            },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Security headers
    async headers() {
        return [
            {
                // API routes CORS
                source: '/api/:path*',
                headers: [
                    {
                        key: 'Access-Control-Allow-Credentials',
                        value: 'true',
                    },
                    {
                        key: 'Access-Control-Allow-Origin',
                        value: process.env.NODE_ENV === 'production'
                            ? 'https://botflow.co.za'
                            : '*',
                    },
                    {
                        key: 'Access-Control-Allow-Methods',
                        value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
                    },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
                    },
                ],
            },
            {
                // Security headers for all routes
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    // Redirects
    async redirects() {
        return [
            {
                source: '/app',
                destination: '/dashboard',
                permanent: true,
            },
            {
                source: '/login',
                destination: '/auth/login',
                permanent: true,
            },
            {
                source: '/signup',
                destination: '/auth/signup',
                permanent: true,
            },
        ];
    },

    // Experimental features
    experimental: {
        // Enable server actions
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },

    // Webpack configuration
    webpack: (config, { isServer }) => {
        // Handle node modules that need to be transpiled
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                crypto: false,
            };
        }

        return config;
    },

    // Enable React strict mode
    reactStrictMode: true,

    // Disable x-powered-by header
    poweredByHeader: false,

    // Compression
    compress: true,

    // Generate ETags for caching
    generateEtags: true,

    // TypeScript configuration
    typescript: {
        // Don't fail build on type errors in production (handled by CI)
        ignoreBuildErrors: false,
    },

    // ESLint configuration
    eslint: {
        // Don't fail build on lint errors in production (handled by CI)
        ignoreDuringBuilds: false,
    },

    // Logging configuration
    logging: {
        fetches: {
            fullUrl: process.env.NODE_ENV === 'development',
        },
    },
};

export default nextConfig;

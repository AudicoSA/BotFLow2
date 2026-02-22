// Redis Connection for BullMQ
// Provides Redis connection management for message queues

import { redisConfig } from '../config/environment';

// Redis connection options
export interface RedisConnectionOptions {
    host: string;
    port: number;
    password?: string;
    tls?: boolean;
    maxRetriesPerRequest: number | null;
    enableReadyCheck: boolean;
    retryStrategy?: (times: number) => number | void;
}

/**
 * Parse Redis URL into connection options
 */
export function parseRedisUrl(url: string): RedisConnectionOptions {
    try {
        const parsed = new URL(url);

        return {
            host: parsed.hostname || 'localhost',
            port: parseInt(parsed.port || '6379', 10),
            password: parsed.password || undefined,
            tls: parsed.protocol === 'rediss:',
            maxRetriesPerRequest: null, // Required for BullMQ
            enableReadyCheck: false, // Required for BullMQ
        };
    } catch {
        // Fallback for simple host:port format
        const [host, port] = url.replace('redis://', '').split(':');
        return {
            host: host || 'localhost',
            port: parseInt(port || '6379', 10),
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
        };
    }
}

/**
 * Get Redis connection options from environment
 */
export function getRedisConnection(): RedisConnectionOptions {
    const url = redisConfig.url || process.env.REDIS_URL || 'redis://localhost:6379';

    const options = parseRedisUrl(url);

    // Add retry strategy
    options.retryStrategy = (times: number) => {
        if (times > 10) {
            console.error('Redis connection failed after 10 retries');
            return undefined; // Stop retrying
        }
        return Math.min(times * 100, 3000); // Exponential backoff up to 3s
    };

    return options;
}

/**
 * Redis connection for production (Railway/Render/Upstash)
 * Handles TLS and authentication
 */
export function getProductionRedisConnection(): RedisConnectionOptions {
    const baseOptions = getRedisConnection();

    // Production optimizations
    return {
        ...baseOptions,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        // For Railway Redis or Upstash, TLS is usually required
        tls: process.env.REDIS_TLS === 'true' || baseOptions.tls,
    };
}

/**
 * Validate Redis connection string
 */
export function validateRedisConnection(url: string): boolean {
    try {
        const options = parseRedisUrl(url);
        return !!(options.host && options.port);
    } catch {
        return false;
    }
}

// Export default connection
export const redisConnection = getRedisConnection();

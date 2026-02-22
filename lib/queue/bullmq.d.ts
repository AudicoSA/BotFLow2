// BullMQ Type Declarations
// Minimal type definitions for dynamic imports

declare module 'bullmq' {
    export interface Job<T = unknown> {
        id?: string;
        name: string;
        data: T;
        getState(): Promise<string>;
        remove(): Promise<void>;
    }

    export interface QueueOptions {
        connection: {
            host: string;
            port: number;
            password?: string;
            tls?: boolean;
            maxRetriesPerRequest: number | null;
            enableReadyCheck: boolean;
        };
    }

    export interface JobOptions {
        attempts?: number;
        backoff?: { type: string; delay: number };
        removeOnComplete?: { count: number } | boolean;
        removeOnFail?: { count: number } | boolean;
        timeout?: number;
        delay?: number;
        priority?: number;
        jobId?: string;
    }

    export class Queue<T = unknown> {
        constructor(name: string, options: QueueOptions);
        add(name: string, data: T, options?: JobOptions): Promise<Job<T>>;
        getJob(id: string): Promise<Job<T> | undefined>;
        close(): Promise<void>;
    }

    export interface WorkerOptions {
        connection: QueueOptions['connection'];
        concurrency?: number;
        limiter?: {
            max: number;
            duration: number;
        };
    }

    export class Worker<T = unknown> {
        constructor(
            name: string,
            processor: (job: Job<T>) => Promise<void>,
            options: WorkerOptions
        );
        on(event: 'completed', handler: (job: Job<T>) => void): void;
        on(event: 'failed', handler: (job: Job<T> | undefined, err: Error) => void): void;
        on(event: 'error', handler: (err: Error) => void): void;
        close(): Promise<void>;
    }
}

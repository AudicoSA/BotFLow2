// Email Campaigns
// Trial reminders and feature education drip campaigns

import { addEmailJob } from '@/lib/queue/client';
import { appConfig } from '@/lib/config/environment';
import type { TrialReminderEmailData, FeatureEducationEmailData } from './templates';

// Constants
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

// User data interface for campaigns
interface UserTrialData {
    id: string;
    email: string;
    name: string;
    trialEndDate: Date;
    createdAt: Date;
    usageStats?: {
        messagesProcessed?: number;
        receiptsScanned?: number;
        hoursaved?: number;
    };
}

interface UserOnboardingData {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    completedOnboarding?: boolean;
}

/**
 * Calculate days until trial ends
 */
function getDaysUntilTrialEnd(trialEndDate: Date): number {
    const now = new Date();
    const diffMs = trialEndDate.getTime() - now.getTime();
    return Math.ceil(diffMs / MS_PER_DAY);
}

/**
 * Calculate days since signup
 */
function getDaysSinceSignup(createdAt: Date): number {
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    return Math.floor(diffMs / MS_PER_DAY);
}

/**
 * Format date for display
 */
function formatDate(date: Date): string {
    return date.toLocaleDateString('en-ZA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

/**
 * Schedule trial reminder emails for a user
 * Call this when a user starts their trial
 */
export async function scheduleTrialReminders(user: UserTrialData): Promise<{ scheduled: string[] }> {
    const scheduled: string[] = [];
    const trialEndDate = new Date(user.trialEndDate);
    const now = new Date();

    // Calculate delays for each reminder
    const reminderDays = [7, 3, 1] as const;

    for (const daysBeforeEnd of reminderDays) {
        const reminderDate = new Date(trialEndDate.getTime() - daysBeforeEnd * MS_PER_DAY);

        // Only schedule if reminder date is in the future
        if (reminderDate > now) {
            const delay = reminderDate.getTime() - now.getTime();

            const templateData: TrialReminderEmailData = {
                userName: user.name,
                daysRemaining: daysBeforeEnd,
                trialEndDate: formatDate(trialEndDate),
                usageHighlights: user.usageStats || {},
                upgradeUrl: `${appConfig.url}/dashboard/settings/billing`,
            };

            const jobId = await addEmailJob(
                {
                    type: 'trial_reminder',
                    to: user.email,
                    userId: user.id,
                    templateData: {
                        ...templateData,
                        emailType: `trial_reminder_${daysBeforeEnd}`,
                    },
                },
                {
                    delay,
                    jobId: `trial-reminder-${user.id}-${daysBeforeEnd}d`,
                }
            );

            scheduled.push(`trial_reminder_${daysBeforeEnd}d: ${jobId}`);
        }
    }

    return { scheduled };
}

/**
 * Schedule feature education drip campaign for a user
 * Call this when a user signs up
 */
export async function scheduleFeatureEducationCampaign(user: UserOnboardingData): Promise<{ scheduled: string[] }> {
    const scheduled: string[] = [];
    const signupDate = new Date(user.createdAt);
    const now = new Date();

    // Education emails on days 1, 3, 5, 7
    const educationDays = [1, 3, 5, 7] as const;

    for (const day of educationDays) {
        const sendDate = new Date(signupDate.getTime() + day * MS_PER_DAY);

        // Only schedule if send date is in the future
        if (sendDate > now) {
            const delay = sendDate.getTime() - now.getTime();

            const templateData: FeatureEducationEmailData = {
                userName: user.name,
                dashboardUrl: `${appConfig.url}/dashboard`,
            };

            const jobId = await addEmailJob(
                {
                    type: 'trial_reminder', // Reuse queue type
                    to: user.email,
                    userId: user.id,
                    templateData: {
                        ...templateData,
                        emailType: `feature_education_${day}`,
                    },
                },
                {
                    delay,
                    jobId: `feature-education-${user.id}-day${day}`,
                }
            );

            scheduled.push(`feature_education_day${day}: ${jobId}`);
        }
    }

    return { scheduled };
}

/**
 * Check and send trial reminders for all users
 * Run this as a daily cron job
 */
export async function checkAndSendTrialReminders(
    getTrialUsers: () => Promise<UserTrialData[]>
): Promise<{ sent: number; errors: string[] }> {
    const users = await getTrialUsers();
    let sent = 0;
    const errors: string[] = [];

    for (const user of users) {
        const daysRemaining = getDaysUntilTrialEnd(user.trialEndDate);

        // Send reminder if it's exactly 7, 3, or 1 days before end
        if ([7, 3, 1].includes(daysRemaining)) {
            try {
                const templateData: TrialReminderEmailData = {
                    userName: user.name,
                    daysRemaining,
                    trialEndDate: formatDate(user.trialEndDate),
                    usageHighlights: user.usageStats || {},
                    upgradeUrl: `${appConfig.url}/dashboard/settings/billing`,
                };

                await addEmailJob({
                    type: 'trial_reminder',
                    to: user.email,
                    userId: user.id,
                    templateData: {
                        ...templateData,
                        emailType: `trial_reminder_${daysRemaining}`,
                    },
                });

                sent++;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to send reminder to ${user.email}: ${message}`);
            }
        }
    }

    return { sent, errors };
}

/**
 * Check and send feature education emails for all users
 * Run this as a daily cron job
 */
export async function checkAndSendFeatureEducation(
    getOnboardingUsers: () => Promise<UserOnboardingData[]>
): Promise<{ sent: number; errors: string[] }> {
    const users = await getOnboardingUsers();
    let sent = 0;
    const errors: string[] = [];

    for (const user of users) {
        // Skip users who completed onboarding
        if (user.completedOnboarding) continue;

        const daysSinceSignup = getDaysSinceSignup(user.createdAt);

        // Send education email if it's exactly day 1, 3, 5, or 7
        if ([1, 3, 5, 7].includes(daysSinceSignup)) {
            try {
                const templateData: FeatureEducationEmailData = {
                    userName: user.name,
                    dashboardUrl: `${appConfig.url}/dashboard`,
                };

                await addEmailJob({
                    type: 'trial_reminder', // Reuse queue type
                    to: user.email,
                    userId: user.id,
                    templateData: {
                        ...templateData,
                        emailType: `feature_education_${daysSinceSignup}`,
                    },
                });

                sent++;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to send education to ${user.email}: ${message}`);
            }
        }
    }

    return { sent, errors };
}

/**
 * Cancel scheduled campaign emails for a user
 * Call this when a user upgrades or unsubscribes
 */
export async function cancelScheduledEmails(
    userId: string,
    campaignType: 'trial' | 'education' | 'all'
): Promise<{ cancelled: string[] }> {
    // Note: This would require BullMQ's getJob and remove functionality
    // The actual implementation depends on having queue access
    const cancelled: string[] = [];

    const jobIds: string[] = [];

    if (campaignType === 'trial' || campaignType === 'all') {
        jobIds.push(
            `trial-reminder-${userId}-7d`,
            `trial-reminder-${userId}-3d`,
            `trial-reminder-${userId}-1d`
        );
    }

    if (campaignType === 'education' || campaignType === 'all') {
        jobIds.push(
            `feature-education-${userId}-day1`,
            `feature-education-${userId}-day3`,
            `feature-education-${userId}-day5`,
            `feature-education-${userId}-day7`
        );
    }

    // Note: Actual job removal would be done via queue client
    // For now, return the job IDs that would be cancelled
    console.log(`[Campaigns] Would cancel jobs: ${jobIds.join(', ')}`);

    return { cancelled: jobIds };
}

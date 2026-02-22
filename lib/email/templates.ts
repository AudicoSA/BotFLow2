// Email Templates
// HTML email templates for all transactional emails

import { appConfig } from '@/lib/config/environment';

// Common email styles
const styles = {
    container: `
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: 40px 20px;
        background-color: #ffffff;
    `,
    header: `
        text-align: center;
        margin-bottom: 32px;
    `,
    logo: `
        font-size: 28px;
        font-weight: 700;
        color: #0EA5E9;
        text-decoration: none;
    `,
    heading: `
        font-size: 24px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 16px;
    `,
    text: `
        font-size: 16px;
        color: #4b5563;
        line-height: 1.6;
        margin: 0 0 16px;
    `,
    button: `
        display: inline-block;
        padding: 14px 32px;
        background-color: #0EA5E9;
        color: #ffffff;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        margin: 24px 0;
    `,
    buttonSecondary: `
        display: inline-block;
        padding: 14px 32px;
        background-color: #f3f4f6;
        color: #374151;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        margin: 24px 0;
    `,
    footer: `
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        color: #9ca3af;
        font-size: 14px;
    `,
    highlight: `
        background-color: #f0f9ff;
        border-left: 4px solid #0EA5E9;
        padding: 16px;
        margin: 24px 0;
    `,
    list: `
        padding-left: 20px;
        color: #4b5563;
        line-height: 1.8;
    `,
    warning: `
        background-color: #fef3c7;
        border-left: 4px solid #f59e0b;
        padding: 16px;
        margin: 24px 0;
    `,
    error: `
        background-color: #fee2e2;
        border-left: 4px solid #ef4444;
        padding: 16px;
        margin: 24px 0;
    `,
};

// Base email wrapper
function emailWrapper(content: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appConfig.name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f9fafb;">
    <div style="${styles.container}">
        <div style="${styles.header}">
            <a href="${appConfig.url}" style="${styles.logo}">${appConfig.name}</a>
        </div>
        ${content}
        <div style="${styles.footer}">
            <p>&copy; ${new Date().getFullYear()} ${appConfig.name}. All rights reserved.</p>
            <p>
                <a href="${appConfig.url}/privacy" style="color: #9ca3af;">Privacy Policy</a> ·
                <a href="${appConfig.url}/terms" style="color: #9ca3af;">Terms of Service</a>
            </p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

// ==========================================
// Welcome Email Templates
// ==========================================

export interface WelcomeEmailData {
    userName: string;
    userEmail: string;
    trialEndDate: string;
    dashboardUrl: string;
}

export function welcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
    return {
        subject: `Welcome to ${appConfig.name}! Let's get started`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Welcome to ${appConfig.name}, ${data.userName}! 🎉</h1>
            <p style="${styles.text}">
                Thank you for joining us! We're thrilled to have you on board. Your account is now active
                and you have access to all premium features during your free trial.
            </p>

            <div style="${styles.highlight}">
                <strong>Your trial ends on:</strong> ${data.trialEndDate}<br>
                <span style="color: #6b7280;">You have full access to all features until then.</span>
            </div>

            <h2 style="font-size: 18px; color: #1f2937; margin: 24px 0 12px;">Here's what you can do:</h2>
            <ul style="${styles.list}">
                <li><strong>AI Assistant</strong> - Connect your business data and get instant insights</li>
                <li><strong>WhatsApp Assistant</strong> - Automate customer conversations on WhatsApp</li>
                <li><strong>Receipt Assistant</strong> - Scan and organize receipts automatically</li>
            </ul>

            <div style="text-align: center;">
                <a href="${data.dashboardUrl}" style="${styles.button}">Go to Dashboard</a>
            </div>

            <p style="${styles.text}">
                Need help getting started? Check out our <a href="${appConfig.url}/docs" style="color: #0EA5E9;">documentation</a>
                or reply to this email - we're here to help!
            </p>
        `),
    };
}

// ==========================================
// Trial Reminder Email Templates
// ==========================================

export interface TrialReminderEmailData {
    userName: string;
    daysRemaining: number;
    trialEndDate: string;
    usageHighlights: {
        messagesProcessed?: number;
        receiptsScanned?: number;
        hoursaved?: number;
    };
    upgradeUrl: string;
}

export function trialReminder7Days(data: TrialReminderEmailData): { subject: string; html: string } {
    return {
        subject: `Your ${appConfig.name} trial ends in 7 days`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Your trial ends in 7 days</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Just a friendly reminder that your ${appConfig.name} trial will end on <strong>${data.trialEndDate}</strong>.
                We hope you've been enjoying the platform!
            </p>

            ${data.usageHighlights.messagesProcessed || data.usageHighlights.receiptsScanned ? `
            <div style="${styles.highlight}">
                <strong>Your progress so far:</strong><br>
                ${data.usageHighlights.messagesProcessed ? `✅ ${data.usageHighlights.messagesProcessed} messages processed<br>` : ''}
                ${data.usageHighlights.receiptsScanned ? `✅ ${data.usageHighlights.receiptsScanned} receipts scanned<br>` : ''}
                ${data.usageHighlights.hoursaved ? `✅ ~${data.usageHighlights.hoursaved} hours saved` : ''}
            </div>
            ` : ''}

            <p style="${styles.text}">
                To continue using ${appConfig.name} without interruption, upgrade to a paid plan before your trial ends.
            </p>

            <div style="text-align: center;">
                <a href="${data.upgradeUrl}" style="${styles.button}">Upgrade Now</a>
            </div>

            <p style="${styles.text}">
                Have questions? Reply to this email and we'll be happy to help!
            </p>
        `),
    };
}

export function trialReminder3Days(data: TrialReminderEmailData): { subject: string; html: string } {
    return {
        subject: `Only 3 days left in your ${appConfig.name} trial`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Only 3 days left! ⏰</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Your ${appConfig.name} trial is ending soon - on <strong>${data.trialEndDate}</strong>.
                Don't lose access to the tools that have been helping your business.
            </p>

            <div style="${styles.warning}">
                <strong>What happens after your trial?</strong><br>
                • You'll lose access to premium features<br>
                • AI-powered automations will stop<br>
                • Your data will be preserved for 30 days
            </div>

            <p style="${styles.text}">
                Upgrade now to keep everything running smoothly:
            </p>

            <div style="text-align: center;">
                <a href="${data.upgradeUrl}" style="${styles.button}">Choose a Plan</a>
            </div>

            <p style="${styles.text}">
                <strong>Special offer:</strong> Use code <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">KEEPGOING</code>
                for 20% off your first 3 months.
            </p>
        `),
    };
}

export function trialReminder1Day(data: TrialReminderEmailData): { subject: string; html: string } {
    return {
        subject: `⚠️ Final day: Your ${appConfig.name} trial ends tomorrow`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Last chance to upgrade! 🚨</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Your ${appConfig.name} trial ends <strong>tomorrow</strong> (${data.trialEndDate}).
                This is your last chance to upgrade before losing access.
            </p>

            <div style="${styles.error}">
                <strong>Action required:</strong> Your automations will stop working at midnight unless you upgrade.
            </div>

            <div style="text-align: center;">
                <a href="${data.upgradeUrl}" style="${styles.button}">Upgrade Now - Don't Lose Access</a>
            </div>

            <p style="${styles.text}">
                If you're not ready to upgrade, no worries - your data will be safely stored for 30 days.
                You can come back anytime.
            </p>
        `),
    };
}

// ==========================================
// Feature Education Drip Campaign
// ==========================================

export interface FeatureEducationEmailData {
    userName: string;
    dashboardUrl: string;
}

export function featureEducationDay1(data: FeatureEducationEmailData): { subject: string; html: string } {
    return {
        subject: `Tip #1: Set up your first AI Assistant in 5 minutes`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Let's set up your AI Assistant 🤖</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                The AI Assistant is your new secret weapon for handling repetitive questions and
                providing instant support to your customers.
            </p>

            <h2 style="font-size: 18px; color: #1f2937; margin: 24px 0 12px;">Quick Setup (5 minutes):</h2>
            <ol style="${styles.list}">
                <li>Go to your Dashboard → AI Assistant</li>
                <li>Click "Create New Assistant"</li>
                <li>Upload your FAQ document or paste your knowledge base</li>
                <li>Test with a few sample questions</li>
                <li>Connect to your preferred channel (WhatsApp, Website, etc.)</li>
            </ol>

            <div style="text-align: center;">
                <a href="${data.dashboardUrl}/ai-assistant" style="${styles.button}">Set Up AI Assistant</a>
            </div>

            <p style="${styles.text}">
                <strong>Pro tip:</strong> The more context you give your assistant, the better it performs.
                Include common questions and detailed answers.
            </p>
        `),
    };
}

export function featureEducationDay3(data: FeatureEducationEmailData): { subject: string; html: string } {
    return {
        subject: `Tip #2: Automate WhatsApp conversations`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Connect WhatsApp Business 📱</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Did you know ${appConfig.name} can handle your WhatsApp Business conversations automatically?
                No more missed messages, even while you sleep.
            </p>

            <div style="${styles.highlight}">
                <strong>What you can automate:</strong><br>
                • Instant responses to common questions<br>
                • Order status updates<br>
                • Appointment reminders<br>
                • Lead qualification
            </div>

            <h2 style="font-size: 18px; color: #1f2937; margin: 24px 0 12px;">Get started:</h2>
            <ol style="${styles.list}">
                <li>Go to Dashboard → WhatsApp Assistant</li>
                <li>Connect your WhatsApp Business account</li>
                <li>Create your first automation flow</li>
            </ol>

            <div style="text-align: center;">
                <a href="${data.dashboardUrl}/whatsapp-assistant" style="${styles.button}">Connect WhatsApp</a>
            </div>
        `),
    };
}

export function featureEducationDay5(data: FeatureEducationEmailData): { subject: string; html: string } {
    return {
        subject: `Tip #3: Scan receipts with AI-powered OCR`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Organize receipts automatically 🧾</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Say goodbye to manual data entry! Our Receipt Assistant uses advanced AI to scan,
                categorize, and organize your business receipts automatically.
            </p>

            <h2 style="font-size: 18px; color: #1f2937; margin: 24px 0 12px;">Features:</h2>
            <ul style="${styles.list}">
                <li><strong>Smart scanning</strong> - Extracts vendor, amount, date, and items</li>
                <li><strong>Auto-categorization</strong> - Organizes by expense type</li>
                <li><strong>Duplicate detection</strong> - Prevents duplicate entries</li>
                <li><strong>Export ready</strong> - Download for accounting software</li>
            </ul>

            <div style="text-align: center;">
                <a href="${data.dashboardUrl}/receipt-assistant" style="${styles.button}">Try Receipt Scanning</a>
            </div>

            <p style="${styles.text}">
                <strong>Mobile tip:</strong> Use our mobile-friendly upload or email receipts directly
                to your ${appConfig.name} inbox.
            </p>
        `),
    };
}

export function featureEducationDay7(data: FeatureEducationEmailData): { subject: string; html: string } {
    return {
        subject: `Your first week with ${appConfig.name} - What's next?`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">You've completed your first week! 🎊</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Congratulations on your first week with ${appConfig.name}! We hope you've had a chance
                to explore our AI-powered assistants.
            </p>

            <h2 style="font-size: 18px; color: #1f2937; margin: 24px 0 12px;">What's next?</h2>
            <ul style="${styles.list}">
                <li><strong>Explore integrations</strong> - Connect more tools and automate workflows</li>
                <li><strong>Invite your team</strong> - Collaborate with team members</li>
                <li><strong>Check analytics</strong> - See how much time you're saving</li>
            </ul>

            <div style="${styles.highlight}">
                <strong>Need help?</strong> Our support team is here for you:<br>
                • Reply to this email<br>
                • Check our <a href="${appConfig.url}/docs" style="color: #0EA5E9;">documentation</a><br>
                • Join our <a href="${appConfig.url}/community" style="color: #0EA5E9;">community</a>
            </div>

            <div style="text-align: center;">
                <a href="${data.dashboardUrl}" style="${styles.button}">Go to Dashboard</a>
            </div>
        `),
    };
}

// ==========================================
// Payment & Subscription Emails
// ==========================================

export interface PaymentFailedEmailData {
    userName: string;
    amount: string;
    currency: string;
    failureReason: string;
    retryDate: string;
    updatePaymentUrl: string;
}

export function paymentFailedEmail(data: PaymentFailedEmailData): { subject: string; html: string } {
    return {
        subject: `⚠️ Payment failed - Action required`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Payment failed</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                We were unable to process your payment of ${data.currency} ${data.amount} for your ${appConfig.name} subscription.
            </p>

            <div style="${styles.error}">
                <strong>Reason:</strong> ${data.failureReason}<br>
                <strong>Next retry:</strong> ${data.retryDate}
            </div>

            <p style="${styles.text}">
                To avoid any interruption to your service, please update your payment method:
            </p>

            <div style="text-align: center;">
                <a href="${data.updatePaymentUrl}" style="${styles.button}">Update Payment Method</a>
            </div>

            <p style="${styles.text}">
                If you're having trouble, please reply to this email and we'll help you resolve the issue.
            </p>
        `),
    };
}

export interface SubscriptionRenewalEmailData {
    userName: string;
    planName: string;
    amount: string;
    currency: string;
    renewalDate: string;
    invoiceUrl: string;
}

export function subscriptionRenewalEmail(data: SubscriptionRenewalEmailData): { subject: string; html: string } {
    return {
        subject: `Your ${appConfig.name} subscription was renewed`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Subscription renewed ✓</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Your ${appConfig.name} subscription has been successfully renewed.
            </p>

            <div style="${styles.highlight}">
                <strong>Plan:</strong> ${data.planName}<br>
                <strong>Amount:</strong> ${data.currency} ${data.amount}<br>
                <strong>Date:</strong> ${data.renewalDate}
            </div>

            <div style="text-align: center;">
                <a href="${data.invoiceUrl}" style="${styles.buttonSecondary}">View Invoice</a>
            </div>

            <p style="${styles.text}">
                Thank you for your continued support!
            </p>
        `),
    };
}

export interface InvoiceEmailData {
    userName: string;
    invoiceNumber: string;
    amount: string;
    currency: string;
    dueDate: string;
    invoiceUrl: string;
    lineItems: { description: string; amount: string }[];
}

export function invoiceEmail(data: InvoiceEmailData): { subject: string; html: string } {
    const lineItemsHtml = data.lineItems
        .map(item => `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.description}</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${data.currency} ${item.amount}</td></tr>`)
        .join('');

    return {
        subject: `Invoice #${data.invoiceNumber} from ${appConfig.name}`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Invoice #${data.invoiceNumber}</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Here's your invoice from ${appConfig.name}.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Description</th>
                        <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${lineItemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 12px; font-weight: bold;">Total</td>
                        <td style="padding: 12px; text-align: right; font-weight: bold;">${data.currency} ${data.amount}</td>
                    </tr>
                </tfoot>
            </table>

            <p style="${styles.text}">
                <strong>Due date:</strong> ${data.dueDate}
            </p>

            <div style="text-align: center;">
                <a href="${data.invoiceUrl}" style="${styles.button}">View & Download Invoice</a>
            </div>
        `),
    };
}

// ==========================================
// Verification & Password Reset
// ==========================================

export interface VerificationEmailData {
    userName: string;
    verificationUrl: string;
    expiresIn: string;
}

export function verificationEmail(data: VerificationEmailData): { subject: string; html: string } {
    return {
        subject: `Verify your ${appConfig.name} email`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Verify your email address</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                Please verify your email address by clicking the button below.
            </p>

            <div style="text-align: center;">
                <a href="${data.verificationUrl}" style="${styles.button}">Verify Email</a>
            </div>

            <p style="${styles.text}">
                This link will expire in ${data.expiresIn}.
            </p>

            <p style="${styles.text}">
                If you didn't create an account with ${appConfig.name}, you can safely ignore this email.
            </p>
        `),
    };
}

export interface PasswordResetEmailData {
    userName: string;
    resetUrl: string;
    expiresIn: string;
}

export function passwordResetEmail(data: PasswordResetEmailData): { subject: string; html: string } {
    return {
        subject: `Reset your ${appConfig.name} password`,
        html: emailWrapper(`
            <h1 style="${styles.heading}">Reset your password</h1>
            <p style="${styles.text}">
                Hi ${data.userName},
            </p>
            <p style="${styles.text}">
                We received a request to reset your password. Click the button below to create a new password.
            </p>

            <div style="text-align: center;">
                <a href="${data.resetUrl}" style="${styles.button}">Reset Password</a>
            </div>

            <p style="${styles.text}">
                This link will expire in ${data.expiresIn}.
            </p>

            <p style="${styles.text}">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
        `),
    };
}

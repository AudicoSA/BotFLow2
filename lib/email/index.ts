// Email Module Index
// Re-exports all email-related functionality

export { sendEmail, sendBatchEmails, type ResendEmailOptions } from './client';

export {
    sendEmailImmediate,
    queueEmail,
    generateEmail,
    sendWelcomeEmail,
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendTrialReminderEmail,
    sendFeatureEducationEmail,
    sendPaymentFailedEmail,
    sendSubscriptionRenewalEmail,
    sendInvoiceEmail,
    type EmailType,
} from './service';

export {
    welcomeEmail,
    trialReminder7Days,
    trialReminder3Days,
    trialReminder1Day,
    featureEducationDay1,
    featureEducationDay3,
    featureEducationDay5,
    featureEducationDay7,
    paymentFailedEmail,
    subscriptionRenewalEmail,
    invoiceEmail,
    verificationEmail,
    passwordResetEmail,
    type WelcomeEmailData,
    type TrialReminderEmailData,
    type FeatureEducationEmailData,
    type PaymentFailedEmailData,
    type SubscriptionRenewalEmailData,
    type InvoiceEmailData,
    type VerificationEmailData,
    type PasswordResetEmailData,
} from './templates';

export {
    scheduleTrialReminders,
    scheduleFeatureEducationCampaign,
    checkAndSendTrialReminders,
    checkAndSendFeatureEducation,
} from './campaigns';

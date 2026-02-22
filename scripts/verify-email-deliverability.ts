/**
 * Email Deliverability Verification Script for BotFlow
 * Tests email delivery across different providers
 *
 * Usage: npx ts-node scripts/verify-email-deliverability.ts
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@botflow.co.za';
const TEST_EMAILS = process.env.TEST_EMAILS?.split(',') || [];

interface EmailTestResult {
    provider: string;
    recipient: string;
    status: 'sent' | 'failed' | 'skipped';
    messageId?: string;
    error?: string;
    deliveryTime?: number;
}

interface DnsCheckResult {
    record: string;
    status: 'pass' | 'fail' | 'warning';
    value?: string;
    message: string;
}

const results: EmailTestResult[] = [];
const dnsResults: DnsCheckResult[] = [];

/**
 * Check DNS records for email deliverability
 */
async function checkDnsRecords(domain: string): Promise<DnsCheckResult[]> {
    const checks: DnsCheckResult[] = [];

    console.log(`\nChecking DNS records for ${domain}...\n`);

    // SPF Record Check
    try {
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=TXT`);
        const data = await response.json();
        const txtRecords = data.Answer || [];
        const spfRecord = txtRecords.find((r: { data: string }) => r.data?.includes('v=spf1'));

        if (spfRecord) {
            checks.push({
                record: 'SPF',
                status: 'pass',
                value: spfRecord.data,
                message: 'SPF record found',
            });
        } else {
            checks.push({
                record: 'SPF',
                status: 'fail',
                message: 'No SPF record found - emails may be marked as spam',
            });
        }
    } catch {
        checks.push({
            record: 'SPF',
            status: 'warning',
            message: 'Could not verify SPF record',
        });
    }

    // DKIM Record Check (check common selectors)
    const dkimSelectors = ['default', 'google', 'resend', 'sendgrid', 'mail'];
    let dkimFound = false;

    for (const selector of dkimSelectors) {
        try {
            const response = await fetch(`https://dns.google/resolve?name=${selector}._domainkey.${domain}&type=TXT`);
            const data = await response.json();
            if (data.Answer && data.Answer.length > 0) {
                dkimFound = true;
                checks.push({
                    record: 'DKIM',
                    status: 'pass',
                    value: `${selector}._domainkey.${domain}`,
                    message: `DKIM record found with selector: ${selector}`,
                });
                break;
            }
        } catch {
            // Continue checking other selectors
        }
    }

    if (!dkimFound) {
        checks.push({
            record: 'DKIM',
            status: 'warning',
            message: 'No common DKIM selector found - verify with your email provider',
        });
    }

    // DMARC Record Check
    try {
        const response = await fetch(`https://dns.google/resolve?name=_dmarc.${domain}&type=TXT`);
        const data = await response.json();
        const dmarcRecord = data.Answer?.[0];

        if (dmarcRecord && dmarcRecord.data?.includes('v=DMARC1')) {
            const policy = dmarcRecord.data.match(/p=(\w+)/)?.[1] || 'unknown';
            checks.push({
                record: 'DMARC',
                status: policy === 'reject' || policy === 'quarantine' ? 'pass' : 'warning',
                value: dmarcRecord.data,
                message: `DMARC record found with policy: ${policy}`,
            });
        } else {
            checks.push({
                record: 'DMARC',
                status: 'fail',
                message: 'No DMARC record found - recommended for email security',
            });
        }
    } catch {
        checks.push({
            record: 'DMARC',
            status: 'warning',
            message: 'Could not verify DMARC record',
        });
    }

    // MX Record Check
    try {
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
        const data = await response.json();
        if (data.Answer && data.Answer.length > 0) {
            checks.push({
                record: 'MX',
                status: 'pass',
                value: data.Answer.map((r: { data: string }) => r.data).join(', '),
                message: `${data.Answer.length} MX record(s) found`,
            });
        } else {
            checks.push({
                record: 'MX',
                status: 'warning',
                message: 'No MX records found',
            });
        }
    } catch {
        checks.push({
            record: 'MX',
            status: 'warning',
            message: 'Could not verify MX records',
        });
    }

    return checks;
}

/**
 * Send test email via Resend
 */
async function sendResendEmail(to: string): Promise<EmailTestResult> {
    if (!RESEND_API_KEY) {
        return { provider: 'Resend', recipient: to, status: 'skipped', error: 'API key not configured' };
    }

    const start = Date.now();
    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [to],
                subject: 'BotFlow Email Deliverability Test',
                html: `
                    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #0ea5e9;">BotFlow Email Test</h1>
                        <p>This is a deliverability test email sent from BotFlow.</p>
                        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                        <p><strong>Provider:</strong> Resend</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="color: #6b7280; font-size: 14px;">
                            If you received this email, the test was successful.
                        </p>
                    </div>
                `,
            }),
        });

        const data = await response.json();

        if (response.ok && data.id) {
            return {
                provider: 'Resend',
                recipient: to,
                status: 'sent',
                messageId: data.id,
                deliveryTime: Date.now() - start,
            };
        }

        return {
            provider: 'Resend',
            recipient: to,
            status: 'failed',
            error: data.message || 'Unknown error',
        };
    } catch (error) {
        return {
            provider: 'Resend',
            recipient: to,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Send test email via SendGrid
 */
async function sendSendGridEmail(to: string): Promise<EmailTestResult> {
    if (!SENDGRID_API_KEY) {
        return { provider: 'SendGrid', recipient: to, status: 'skipped', error: 'API key not configured' };
    }

    const start = Date.now();
    try {
        const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SENDGRID_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalizations: [{ to: [{ email: to }] }],
                from: { email: FROM_EMAIL },
                subject: 'BotFlow Email Deliverability Test',
                content: [{
                    type: 'text/html',
                    value: `
                        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h1 style="color: #0ea5e9;">BotFlow Email Test</h1>
                            <p>This is a deliverability test email sent from BotFlow.</p>
                            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
                            <p><strong>Provider:</strong> SendGrid</p>
                            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                            <p style="color: #6b7280; font-size: 14px;">
                                If you received this email, the test was successful.
                            </p>
                        </div>
                    `,
                }],
            }),
        });

        if (response.status === 202) {
            const messageId = response.headers.get('x-message-id');
            return {
                provider: 'SendGrid',
                recipient: to,
                status: 'sent',
                messageId: messageId || undefined,
                deliveryTime: Date.now() - start,
            };
        }

        const data = await response.json().catch(() => ({}));
        return {
            provider: 'SendGrid',
            recipient: to,
            status: 'failed',
            error: JSON.stringify(data) || `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            provider: 'SendGrid',
            recipient: to,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Test email delivery to a specific address
 */
async function testEmailDelivery(email: string): Promise<void> {
    console.log(`Testing delivery to: ${email}`);

    // Test both providers in parallel
    const [resendResult, sendgridResult] = await Promise.all([
        sendResendEmail(email),
        sendSendGridEmail(email),
    ]);

    results.push(resendResult);
    results.push(sendgridResult);
}

async function main() {
    console.log('\n===========================================');
    console.log('  BOTFLOW EMAIL DELIVERABILITY TEST');
    console.log('===========================================\n');

    // Check DNS records first
    const domain = FROM_EMAIL.split('@')[1] || 'botflow.co.za';
    const dnsChecks = await checkDnsRecords(domain);
    dnsResults.push(...dnsChecks);

    // Print DNS results
    console.log('DNS CONFIGURATION:');
    console.log('-------------------');
    for (const check of dnsChecks) {
        const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
        console.log(`${icon} ${check.record}: ${check.message}`);
        if (check.value) {
            console.log(`   Value: ${check.value.substring(0, 80)}${check.value.length > 80 ? '...' : ''}`);
        }
    }

    // Send test emails
    if (TEST_EMAILS.length === 0) {
        console.log('\n⚠️  No test emails configured. Set TEST_EMAILS environment variable.');
        console.log('   Example: TEST_EMAILS=test@gmail.com,test@outlook.com\n');
    } else {
        console.log('\nSENDING TEST EMAILS:');
        console.log('--------------------');

        for (const email of TEST_EMAILS) {
            await testEmailDelivery(email.trim());
        }
    }

    // Print email results
    console.log('\n===========================================');
    console.log('  EMAIL DELIVERY RESULTS');
    console.log('===========================================\n');

    let sent = 0;
    let failed = 0;
    let skipped = 0;

    for (const result of results) {
        const icon = result.status === 'sent' ? '✅' : result.status === 'failed' ? '❌' : '⏭️';
        console.log(`${icon} ${result.provider} → ${result.recipient}`);
        if (result.messageId) {
            console.log(`   Message ID: ${result.messageId}`);
        }
        if (result.deliveryTime) {
            console.log(`   Delivery time: ${result.deliveryTime}ms`);
        }
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
        console.log('');

        if (result.status === 'sent') sent++;
        else if (result.status === 'failed') failed++;
        else skipped++;
    }

    // Summary
    console.log('===========================================');
    console.log(`  SUMMARY: ${sent} sent, ${failed} failed, ${skipped} skipped`);
    console.log('===========================================\n');

    // Recommendations
    console.log('RECOMMENDATIONS:');
    console.log('----------------');

    const failedDns = dnsChecks.filter(c => c.status === 'fail');
    if (failedDns.length > 0) {
        console.log('❗ Fix the following DNS issues:');
        for (const check of failedDns) {
            console.log(`   - ${check.record}: ${check.message}`);
        }
    }

    if (failed > 0) {
        console.log('❗ Some email deliveries failed. Check provider configuration.');
    }

    if (sent === 0 && skipped === results.length) {
        console.log('❗ No email providers configured. Set RESEND_API_KEY or SENDGRID_API_KEY.');
    }

    if (failedDns.length === 0 && failed === 0 && sent > 0) {
        console.log('✅ All checks passed. Email deliverability looks good!');
    }

    console.log('');

    // Exit with appropriate code
    if (failed > 0 || failedDns.some(c => c.record === 'SPF')) {
        process.exit(1);
    }
}

main().catch(console.error);

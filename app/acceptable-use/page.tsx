import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import { AlertTriangle, Ban, CheckCircle, Shield, MessageSquare, Bot, Receipt } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Acceptable Use Policy - BotFlow',
    description: 'BotFlow Acceptable Use Policy - Guidelines for using AI Assistant, WhatsApp Assistant, and Receipt Assistant services responsibly.',
};

export default function AcceptableUsePolicyPage() {
    const lastUpdated = '22 February 2026';

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            <article className="pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Acceptable Use Policy</h1>
                        <p className="text-gray-600">Last updated: {lastUpdated}</p>
                    </div>

                    {/* Introduction */}
                    <div className="bg-white rounded-xl p-6 border border-gray-200 mb-12">
                        <p className="text-gray-700">
                            This Acceptable Use Policy (&ldquo;AUP&rdquo;) outlines the rules for using BotFlow services responsibly. By using our AI Assistant, WhatsApp Assistant, or Receipt Assistant, you agree to follow these guidelines. Violation of this policy may result in suspension or termination of your account.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        {/* General Prohibited Uses */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Ban className="w-6 h-6 text-red-500" />
                                1. General Prohibited Uses
                            </h2>
                            <p className="text-gray-700 mb-4">You may NOT use BotFlow services to:</p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Illegal Activities</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Conduct or promote illegal activities</li>
                                <li>Violate any applicable laws or regulations</li>
                                <li>Facilitate fraud, money laundering, or financial crimes</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Distribute or create illegal content</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Harmful Content</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Create, store, or distribute malware, viruses, or malicious code</li>
                                <li>Generate content that promotes violence, terrorism, or self-harm</li>
                                <li>Produce child sexual abuse material (CSAM) or any content sexualizing minors</li>
                                <li>Create non-consensual intimate imagery or deepfakes</li>
                                <li>Generate hate speech or content discriminating based on race, gender, religion, etc.</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 Harassment and Abuse</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Harass, threaten, or intimidate others</li>
                                <li>Stalk or track individuals without consent</li>
                                <li>Impersonate others or misrepresent identity</li>
                                <li>Dox or expose personal information of others</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">1.4 System Abuse</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Overwhelm our services with excessive requests (DoS attacks)</li>
                                <li>Reverse engineer, decompile, or extract source code</li>
                                <li>Use automated tools to scrape data without permission</li>
                                <li>Circumvent usage limits or billing mechanisms</li>
                                <li>Resell or redistribute services without authorization</li>
                            </ul>
                        </section>

                        {/* AI Assistant Specific */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Bot className="w-6 h-6 text-violet-500" />
                                2. AI Assistant Specific Rules
                            </h2>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-red-800 mb-2">Prohibited AI Uses</h4>
                                <ul className="list-disc pl-6 text-red-700 space-y-1">
                                    <li>Generating medical, legal, or financial advice presented as professional guidance</li>
                                    <li>Creating misleading content designed to deceive (e.g., fake news, phishing)</li>
                                    <li>Producing content to manipulate democratic processes</li>
                                    <li>Generating academic content for plagiarism or cheating</li>
                                    <li>Creating content that violates OpenAI&apos;s usage policies</li>
                                    <li>Automated decision-making affecting individual rights without human oversight</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Acceptable AI Uses
                                </h4>
                                <ul className="list-disc pl-6 text-green-700 space-y-1">
                                    <li>Automating customer support responses</li>
                                    <li>Generating business communications and drafts</li>
                                    <li>Answering frequently asked questions</li>
                                    <li>Creating marketing content and copy</li>
                                    <li>Summarizing documents and data</li>
                                    <li>Assisting with brainstorming and ideation</li>
                                </ul>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Disclosure Requirements</h3>
                            <p className="text-gray-700 mb-4">
                                When using AI-generated content in customer-facing contexts, we recommend:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Disclosing that responses may be AI-generated when appropriate</li>
                                <li>Providing human escalation options for complex issues</li>
                                <li>Reviewing AI outputs before using for critical decisions</li>
                            </ul>
                        </section>

                        {/* WhatsApp Assistant Specific */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare className="w-6 h-6 text-green-500" />
                                3. WhatsApp Assistant Specific Rules
                            </h2>

                            <p className="text-gray-700 mb-4">
                                When using the WhatsApp Assistant, you must comply with <a href="https://www.whatsapp.com/legal/business-policy" target="_blank" rel="noopener noreferrer" className="text-surf-DEFAULT hover:underline">WhatsApp Business Policy</a> and <a href="https://www.whatsapp.com/legal/commerce-policy" target="_blank" rel="noopener noreferrer" className="text-surf-DEFAULT hover:underline">WhatsApp Commerce Policy</a>.
                            </p>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-red-800 mb-2">Prohibited WhatsApp Uses</h4>
                                <ul className="list-disc pl-6 text-red-700 space-y-1">
                                    <li>Sending spam or unsolicited bulk messages</li>
                                    <li>Messaging users who have not opted in</li>
                                    <li>Selling or trading message lists</li>
                                    <li>Sending messages outside the 24-hour customer service window without templates</li>
                                    <li>Using unapproved message templates for marketing</li>
                                    <li>Automated messages that impersonate individuals</li>
                                    <li>High-volume automated messaging without rate limiting</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Required Practices
                                </h4>
                                <ul className="list-disc pl-6 text-green-700 space-y-1">
                                    <li>Obtain opt-in consent before messaging users</li>
                                    <li>Provide clear opt-out instructions in messages</li>
                                    <li>Honor opt-out requests promptly</li>
                                    <li>Use approved message templates for proactive outreach</li>
                                    <li>Respond within the 24-hour service window</li>
                                    <li>Maintain accurate business information</li>
                                    <li>Identify your business clearly in messages</li>
                                </ul>
                            </div>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">Message Content Guidelines</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Be transparent about automated vs. human responses</li>
                                <li>Do not send misleading or deceptive content</li>
                                <li>Respect user privacy and data</li>
                                <li>Avoid excessive messaging frequency</li>
                                <li>Comply with advertising and promotional guidelines</li>
                            </ul>
                        </section>

                        {/* Receipt Assistant Specific */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Receipt className="w-6 h-6 text-amber-500" />
                                4. Receipt Assistant Specific Rules
                            </h2>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-red-800 mb-2">Prohibited Receipt Uses</h4>
                                <ul className="list-disc pl-6 text-red-700 space-y-1">
                                    <li>Uploading fraudulent or altered receipts</li>
                                    <li>Using the service for tax fraud or false expense claims</li>
                                    <li>Processing receipts containing illegal transactions</li>
                                    <li>Uploading documents with sensitive personal data of others without consent</li>
                                </ul>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5" />
                                    Best Practices
                                </h4>
                                <ul className="list-disc pl-6 text-green-700 space-y-1">
                                    <li>Upload only legitimate business receipts</li>
                                    <li>Verify OCR accuracy before using for accounting</li>
                                    <li>Maintain proper records for audit purposes</li>
                                    <li>Protect receipt data with appropriate access controls</li>
                                </ul>
                            </div>
                        </section>

                        {/* Fair Use */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-surf-DEFAULT" />
                                5. Fair Use and Rate Limits
                            </h2>
                            <p className="text-gray-700 mb-4">
                                To ensure quality service for all users, we enforce fair use policies:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>AI Assistant:</strong> 10,000 messages per month (standard plan)</li>
                                <li><strong>WhatsApp Assistant:</strong> 5,000 messages per month (standard plan)</li>
                                <li><strong>Receipt Assistant:</strong> Unlimited scans (fair use applies)</li>
                            </ul>
                            <p className="text-gray-700">
                                Accounts showing unusual patterns or excessive usage may be subject to temporary rate limits. Contact us to discuss higher limits for enterprise needs.
                            </p>
                        </section>

                        {/* Enforcement */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-amber-500" />
                                6. Enforcement
                            </h2>
                            <p className="text-gray-700 mb-4">
                                Violations of this policy may result in:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>Warning:</strong> First-time minor violations may result in a warning</li>
                                <li><strong>Temporary Suspension:</strong> Repeated or moderate violations may result in account suspension</li>
                                <li><strong>Permanent Termination:</strong> Severe violations will result in immediate termination without refund</li>
                                <li><strong>Legal Action:</strong> Illegal activities may be reported to authorities</li>
                            </ul>
                            <p className="text-gray-700">
                                We reserve the right to take action at our discretion and may not provide advance notice in cases of severe violations.
                            </p>
                        </section>

                        {/* Reporting */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Reporting Violations</h2>
                            <p className="text-gray-700 mb-4">
                                If you become aware of any violation of this policy, please report it to:
                            </p>
                            <div className="bg-gray-100 rounded-lg p-6">
                                <p className="text-gray-700"><strong>Email:</strong> abuse@botflow.co.za</p>
                                <p className="text-gray-700 mt-2">
                                    Please include as much detail as possible, including usernames, timestamps, and evidence of the violation.
                                </p>
                            </div>
                        </section>

                        {/* Updates */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Policy Updates</h2>
                            <p className="text-gray-700">
                                We may update this Acceptable Use Policy from time to time. We will notify users of significant changes via email or through our Services. Continued use after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        {/* Contact */}
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Questions</h2>
                            <p className="text-gray-700 mb-4">
                                If you have questions about this policy or are unsure whether a specific use is acceptable, contact us before proceeding:
                            </p>
                            <div className="bg-gray-100 rounded-lg p-6">
                                <p className="text-gray-700"><strong>Email:</strong> legal@botflow.co.za</p>
                                <p className="text-gray-700"><strong>Response Time:</strong> Within 2 business days</p>
                            </div>
                        </section>
                    </div>

                    {/* Related Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Related Policies</h3>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/terms" className="text-surf-DEFAULT hover:underline">Terms of Service</Link>
                            <Link href="/privacy" className="text-surf-DEFAULT hover:underline">Privacy Policy</Link>
                            <Link href="/refund" className="text-surf-DEFAULT hover:underline">Refund Policy</Link>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </main>
    );
}

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - BotFlow',
    description: 'BotFlow Privacy Policy - Learn how we collect, use, and protect your personal information in compliance with POPIA and GDPR.',
};

export default function PrivacyPolicyPage() {
    const lastUpdated = '22 February 2026';

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            <article className="pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
                        <p className="text-gray-600">Last updated: {lastUpdated}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">POPIA Compliant</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">GDPR Ready</span>
                        </div>
                    </div>

                    {/* Summary Box */}
                    <div className="bg-surf-light/10 border border-surf-DEFAULT/20 rounded-xl p-6 mb-12">
                        <h2 className="font-semibold text-gray-900 mb-3">Privacy at a Glance</h2>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>We only collect data necessary to provide our services</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Your data is stored securely with encryption</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>We never sell your personal information</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>You can export or delete your data anytime</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>We comply with POPIA (South Africa) and GDPR (EU)</span>
                            </li>
                        </ul>
                    </div>

                    {/* Table of Contents */}
                    <nav className="bg-white rounded-xl p-6 border border-gray-200 mb-12">
                        <h2 className="font-semibold text-gray-900 mb-4">Table of Contents</h2>
                        <ol className="space-y-2 text-surf-DEFAULT columns-1 md:columns-2">
                            <li><a href="#introduction" className="hover:underline">1. Introduction</a></li>
                            <li><a href="#responsible-party" className="hover:underline">2. Responsible Party</a></li>
                            <li><a href="#information-collected" className="hover:underline">3. Information We Collect</a></li>
                            <li><a href="#how-we-use" className="hover:underline">4. How We Use Information</a></li>
                            <li><a href="#legal-basis" className="hover:underline">5. Legal Basis for Processing</a></li>
                            <li><a href="#data-sharing" className="hover:underline">6. Data Sharing</a></li>
                            <li><a href="#data-retention" className="hover:underline">7. Data Retention</a></li>
                            <li><a href="#data-security" className="hover:underline">8. Data Security</a></li>
                            <li><a href="#your-rights" className="hover:underline">9. Your Rights</a></li>
                            <li><a href="#cookies" className="hover:underline">10. Cookies and Tracking</a></li>
                            <li><a href="#international" className="hover:underline">11. International Transfers</a></li>
                            <li><a href="#children" className="hover:underline">12. Children&apos;s Privacy</a></li>
                            <li><a href="#changes" className="hover:underline">13. Changes to Policy</a></li>
                            <li><a href="#contact" className="hover:underline">14. Contact Us</a></li>
                        </ol>
                    </nav>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        <section id="introduction" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                            <p className="text-gray-700 mb-4">
                                BotFlow (Pty) Ltd (&ldquo;BotFlow,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI Assistant, WhatsApp Assistant, and Receipt Assistant services (the &ldquo;Services&rdquo;).
                            </p>
                            <p className="text-gray-700">
                                This policy complies with the Protection of Personal Information Act 4 of 2013 (POPIA) of South Africa and the General Data Protection Regulation (GDPR) for users in the European Economic Area.
                            </p>
                        </section>

                        <section id="responsible-party" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Responsible Party</h2>
                            <p className="text-gray-700 mb-4">
                                Under POPIA, the responsible party for processing your personal information is:
                            </p>
                            <div className="bg-gray-100 rounded-lg p-6 mb-4">
                                <p className="text-gray-700"><strong>BotFlow (Pty) Ltd</strong></p>
                                <p className="text-gray-700">Information Officer: Privacy Team</p>
                                <p className="text-gray-700">Email: privacy@botflow.co.za</p>
                                <p className="text-gray-700">Address: Cape Town, South Africa</p>
                            </div>
                            <p className="text-gray-700">
                                For GDPR purposes, we act as the Data Controller for personal information collected through our Services.
                            </p>
                        </section>

                        <section id="information-collected" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information We Collect</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>Account Information:</strong> Name, email address, password, company name, phone number</li>
                                <li><strong>Payment Information:</strong> Billing address (card details are processed securely by Paystack)</li>
                                <li><strong>Service Content:</strong> Messages, conversations, receipts, documents you upload</li>
                                <li><strong>Communications:</strong> Emails, support tickets, feedback you send us</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Information Collected Automatically</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
                                <li><strong>Log Data:</strong> Server logs, error reports, access times</li>
                                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Third-Party Information</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>WhatsApp Data:</strong> Messages and contacts from connected WhatsApp Business accounts</li>
                                <li><strong>Integration Data:</strong> Information from third-party services you connect</li>
                            </ul>
                        </section>

                        <section id="how-we-use" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
                            <p className="text-gray-700 mb-4">We use your information to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Provide, maintain, and improve our Services</li>
                                <li>Process payments and manage subscriptions</li>
                                <li>Send transactional emails (receipts, notifications, security alerts)</li>
                                <li>Provide customer support and respond to inquiries</li>
                                <li>Analyze usage patterns to improve user experience</li>
                                <li>Detect and prevent fraud, abuse, and security threats</li>
                                <li>Comply with legal obligations</li>
                                <li>Send marketing communications (with your consent)</li>
                            </ul>
                        </section>

                        <section id="legal-basis" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Legal Basis for Processing</h2>
                            <p className="text-gray-700 mb-4">Under POPIA and GDPR, we process your information based on:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Contract:</strong> Processing necessary to provide our Services</li>
                                <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing emails)</li>
                                <li><strong>Legitimate Interest:</strong> For security, fraud prevention, and service improvement</li>
                                <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
                            </ul>
                        </section>

                        <section id="data-sharing" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Sharing and Disclosure</h2>
                            <p className="text-gray-700 mb-4">We may share your information with:</p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Service Providers</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>Paystack:</strong> Payment processing</li>
                                <li><strong>OpenAI:</strong> AI model processing (for AI Assistant)</li>
                                <li><strong>Meta/WhatsApp:</strong> WhatsApp Business API</li>
                                <li><strong>Google Cloud:</strong> OCR and cloud services</li>
                                <li><strong>Supabase:</strong> Database hosting</li>
                                <li><strong>Vercel:</strong> Website hosting</li>
                                <li><strong>Resend:</strong> Email delivery</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Legal Requirements</h3>
                            <p className="text-gray-700 mb-4">
                                We may disclose information when required by law, court order, or to protect our rights, safety, or property.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Business Transfers</h3>
                            <p className="text-gray-700 mb-4">
                                In case of merger, acquisition, or sale of assets, your information may be transferred as part of the transaction. We will notify you of any such change.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-semibold">We Never Sell Your Data</p>
                                <p className="text-green-700 text-sm">We do not sell, rent, or trade your personal information to third parties for marketing purposes.</p>
                            </div>
                        </section>

                        <section id="data-retention" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                            <p className="text-gray-700 mb-4">We retain your information for as long as necessary to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Provide our Services while your account is active</li>
                                <li>Comply with legal and regulatory requirements</li>
                                <li>Resolve disputes and enforce our agreements</li>
                            </ul>
                            <p className="text-gray-700 mb-4">Specific retention periods:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li><strong>Account Data:</strong> Retained until account deletion, then 30 days</li>
                                <li><strong>Conversation History:</strong> Retained per your settings (default: 90 days)</li>
                                <li><strong>Receipt Data:</strong> Retained until account deletion</li>
                                <li><strong>Billing Records:</strong> 7 years (legal requirement)</li>
                                <li><strong>Server Logs:</strong> 90 days</li>
                            </ul>
                        </section>

                        <section id="data-security" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Security</h2>
                            <p className="text-gray-700 mb-4">We implement appropriate technical and organizational measures to protect your data:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                                <li>Regular security audits and penetration testing</li>
                                <li>Access controls and authentication mechanisms</li>
                                <li>Employee training on data protection</li>
                                <li>Incident response procedures</li>
                                <li>Regular backups with secure storage</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                Despite our efforts, no method of transmission over the Internet is 100% secure. If you discover a security vulnerability, please report it to security@botflow.co.za.
                            </p>
                        </section>

                        <section id="your-rights" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Rights</h2>
                            <p className="text-gray-700 mb-4">Under POPIA and GDPR, you have the right to:</p>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Access</h4>
                                    <p className="text-gray-600 text-sm">Request a copy of your personal information</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Rectification</h4>
                                    <p className="text-gray-600 text-sm">Correct inaccurate or incomplete data</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Erasure</h4>
                                    <p className="text-gray-600 text-sm">Request deletion of your data (&ldquo;right to be forgotten&rdquo;)</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Portability</h4>
                                    <p className="text-gray-600 text-sm">Export your data in a machine-readable format</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Restriction</h4>
                                    <p className="text-gray-600 text-sm">Limit how we process your data</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Objection</h4>
                                    <p className="text-gray-600 text-sm">Object to processing based on legitimate interest</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Withdraw Consent</h4>
                                    <p className="text-gray-600 text-sm">Withdraw consent at any time</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-semibold text-gray-900 mb-2">Complaint</h4>
                                    <p className="text-gray-600 text-sm">Lodge a complaint with the Information Regulator</p>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4">To exercise your rights:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Use the data management tools in your account settings</li>
                                <li>Email us at privacy@botflow.co.za</li>
                                <li>Use our <Link href="/data-deletion" className="text-surf-DEFAULT hover:underline">Data Deletion Request</Link> form</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                We will respond to requests within 30 days. We may ask for verification of identity before processing requests.
                            </p>
                        </section>

                        <section id="cookies" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies and Tracking</h2>
                            <p className="text-gray-700 mb-4">We use cookies and similar technologies to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>Essential Cookies:</strong> Enable core functionality (authentication, security)</li>
                                <li><strong>Analytics Cookies:</strong> Understand how visitors use our site (PostHog, Vercel Analytics)</li>
                                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                            </ul>
                            <p className="text-gray-700">
                                You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect functionality.
                            </p>
                        </section>

                        <section id="international" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. International Data Transfers</h2>
                            <p className="text-gray-700 mb-4">
                                Your data may be transferred to and processed in countries outside South Africa, including:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>United States (OpenAI, Vercel, some cloud services)</li>
                                <li>European Union (certain infrastructure)</li>
                            </ul>
                            <p className="text-gray-700">
                                We ensure adequate protection through Standard Contractual Clauses, adequacy decisions, or other legally recognized transfer mechanisms as required by POPIA and GDPR.
                            </p>
                        </section>

                        <section id="children" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Children&apos;s Privacy</h2>
                            <p className="text-gray-700">
                                Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we learn that we have collected information from a child, we will delete it promptly. If you believe a child has provided us with personal information, please contact us.
                            </p>
                        </section>

                        <section id="changes" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Changes to This Policy</h2>
                            <p className="text-gray-700">
                                We may update this Privacy Policy periodically. We will notify you of material changes by email and/or by posting a notice on our website. The &ldquo;Last updated&rdquo; date at the top indicates when the policy was last revised. Continued use of our Services after changes constitutes acceptance of the updated policy.
                            </p>
                        </section>

                        <section id="contact" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
                            <p className="text-gray-700 mb-4">For privacy-related inquiries or to exercise your rights:</p>
                            <div className="bg-gray-100 rounded-lg p-6 mb-4">
                                <p className="text-gray-700"><strong>BotFlow Privacy Team</strong></p>
                                <p className="text-gray-700">Email: privacy@botflow.co.za</p>
                                <p className="text-gray-700">Address: Cape Town, South Africa</p>
                            </div>
                            <p className="text-gray-700 mb-4">To lodge a complaint with the regulator:</p>
                            <div className="bg-gray-100 rounded-lg p-6">
                                <p className="text-gray-700"><strong>Information Regulator (South Africa)</strong></p>
                                <p className="text-gray-700">Website: <a href="https://www.justice.gov.za/inforeg/" target="_blank" rel="noopener noreferrer" className="text-surf-DEFAULT hover:underline">www.justice.gov.za/inforeg/</a></p>
                                <p className="text-gray-700">Email: inforeg@justice.gov.za</p>
                            </div>
                        </section>
                    </div>

                    {/* Related Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Related Policies</h3>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/terms" className="text-surf-DEFAULT hover:underline">Terms of Service</Link>
                            <Link href="/refund" className="text-surf-DEFAULT hover:underline">Refund Policy</Link>
                            <Link href="/acceptable-use" className="text-surf-DEFAULT hover:underline">Acceptable Use Policy</Link>
                            <Link href="/data-deletion" className="text-surf-DEFAULT hover:underline">Data Deletion Request</Link>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </main>
    );
}

import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - BotFlow',
    description: 'BotFlow Terms of Service - Read our terms and conditions for using AI Assistant, WhatsApp Assistant, and Receipt Assistant services.',
};

export default function TermsOfServicePage() {
    const lastUpdated = '22 February 2026';

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            <article className="pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
                        <p className="text-gray-600">Last updated: {lastUpdated}</p>
                    </div>

                    {/* Table of Contents */}
                    <nav className="bg-white rounded-xl p-6 border border-gray-200 mb-12">
                        <h2 className="font-semibold text-gray-900 mb-4">Table of Contents</h2>
                        <ol className="space-y-2 text-surf-DEFAULT">
                            <li><a href="#acceptance" className="hover:underline">1. Acceptance of Terms</a></li>
                            <li><a href="#services" className="hover:underline">2. Description of Services</a></li>
                            <li><a href="#eligibility" className="hover:underline">3. Eligibility</a></li>
                            <li><a href="#accounts" className="hover:underline">4. Account Registration</a></li>
                            <li><a href="#subscriptions" className="hover:underline">5. Subscriptions and Payments</a></li>
                            <li><a href="#free-trial" className="hover:underline">6. Free Trial</a></li>
                            <li><a href="#ai-assistant" className="hover:underline">7. AI Assistant Terms</a></li>
                            <li><a href="#whatsapp" className="hover:underline">8. WhatsApp Assistant Terms</a></li>
                            <li><a href="#receipt" className="hover:underline">9. Receipt Assistant Terms</a></li>
                            <li><a href="#data" className="hover:underline">10. Data and Privacy</a></li>
                            <li><a href="#intellectual-property" className="hover:underline">11. Intellectual Property</a></li>
                            <li><a href="#prohibited" className="hover:underline">12. Prohibited Uses</a></li>
                            <li><a href="#termination" className="hover:underline">13. Termination</a></li>
                            <li><a href="#liability" className="hover:underline">14. Limitation of Liability</a></li>
                            <li><a href="#indemnification" className="hover:underline">15. Indemnification</a></li>
                            <li><a href="#disputes" className="hover:underline">16. Dispute Resolution</a></li>
                            <li><a href="#changes" className="hover:underline">17. Changes to Terms</a></li>
                            <li><a href="#contact" className="hover:underline">18. Contact Information</a></li>
                        </ol>
                    </nav>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        <section id="acceptance" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-700 mb-4">
                                Welcome to BotFlow. These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the BotFlow platform, including our AI Assistant, WhatsApp Assistant, and Receipt Assistant services (collectively, the &ldquo;Services&rdquo;), operated by BotFlow (Pty) Ltd (&ldquo;BotFlow,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), a company registered in the Republic of South Africa.
                            </p>
                            <p className="text-gray-700 mb-4">
                                By accessing or using our Services, you agree to be bound by these Terms. If you disagree with any part of these Terms, you may not access the Services.
                            </p>
                            <p className="text-gray-700">
                                These Terms constitute a legally binding agreement between you and BotFlow. Please read them carefully.
                            </p>
                        </section>

                        <section id="services" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Services</h2>
                            <p className="text-gray-700 mb-4">BotFlow provides the following services:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li><strong>AI Assistant:</strong> An artificial intelligence-powered conversational assistant using GPT-4 technology to help businesses automate customer interactions and internal processes.</li>
                                <li><strong>WhatsApp Assistant:</strong> Integration with WhatsApp Business API to automate messaging, handle customer inquiries, and manage conversations on the WhatsApp platform.</li>
                                <li><strong>Receipt Assistant:</strong> Optical Character Recognition (OCR) technology to scan, extract, categorize, and manage business receipts and expense data.</li>
                            </ul>
                            <p className="text-gray-700">
                                The Services are provided on a subscription basis and may be modified, updated, or discontinued at our discretion.
                            </p>
                        </section>

                        <section id="eligibility" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
                            <p className="text-gray-700 mb-4">To use our Services, you must:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Be at least 18 years of age</li>
                                <li>Have the legal capacity to enter into binding contracts</li>
                                <li>Not be prohibited from using the Services under applicable laws</li>
                                <li>If using on behalf of an organization, have the authority to bind that organization to these Terms</li>
                            </ul>
                        </section>

                        <section id="accounts" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration</h2>
                            <p className="text-gray-700 mb-4">When creating an account, you agree to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Provide accurate, current, and complete information</li>
                                <li>Maintain and update your information to keep it accurate</li>
                                <li>Keep your password secure and confidential</li>
                                <li>Notify us immediately of any unauthorized access</li>
                                <li>Accept responsibility for all activities under your account</li>
                            </ul>
                            <p className="text-gray-700">
                                We reserve the right to suspend or terminate accounts that violate these Terms or provide false information.
                            </p>
                        </section>

                        <section id="subscriptions" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Subscriptions and Payments</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Subscription Plans</h3>
                            <p className="text-gray-700 mb-4">We offer the following subscription plans (prices in South African Rand):</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>AI Assistant: R499/month</li>
                                <li>WhatsApp Assistant: R499/month</li>
                                <li>Receipt Assistant: R99/user/month</li>
                                <li>Full Bundle: R899/month (all services included)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Payment Terms</h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Payments are processed through Paystack, a PCI-DSS compliant payment provider</li>
                                <li>Subscriptions are billed monthly in advance</li>
                                <li>All prices are exclusive of VAT unless otherwise stated</li>
                                <li>You authorize us to charge your payment method on a recurring basis</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Cancellation</h3>
                            <p className="text-gray-700 mb-4">
                                You may cancel your subscription at any time through your account settings. Cancellation will take effect at the end of the current billing period. No partial refunds will be provided for unused portions of the billing period, except as outlined in our <Link href="/refund" className="text-surf-DEFAULT hover:underline">Refund Policy</Link>.
                            </p>
                        </section>

                        <section id="free-trial" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Free Trial</h2>
                            <p className="text-gray-700 mb-4">
                                We offer a 14-day free trial for new users. During the trial period:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>You will have full access to all features of your selected plan</li>
                                <li>No payment information is required to start the trial</li>
                                <li>You will receive reminder emails before your trial ends</li>
                                <li>Your account will be downgraded after the trial unless you subscribe</li>
                                <li>Trial periods are limited to one per user/organization</li>
                            </ul>
                        </section>

                        <section id="ai-assistant" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. AI Assistant Terms</h2>
                            <p className="text-gray-700 mb-4">When using the AI Assistant, you acknowledge and agree that:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>AI-generated responses are provided &ldquo;as is&rdquo; and may not always be accurate</li>
                                <li>You are responsible for reviewing and verifying AI outputs before use</li>
                                <li>The AI should not be used for medical, legal, or financial advice</li>
                                <li>You will not use the AI to generate harmful, illegal, or misleading content</li>
                                <li>Usage is subject to fair use limits outlined in your subscription plan</li>
                                <li>We may use anonymized interaction data to improve our services</li>
                            </ul>
                            <p className="text-gray-700">
                                See our <Link href="/acceptable-use" className="text-surf-DEFAULT hover:underline">Acceptable Use Policy</Link> for detailed guidelines.
                            </p>
                        </section>

                        <section id="whatsapp" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. WhatsApp Assistant Terms</h2>
                            <p className="text-gray-700 mb-4">When using the WhatsApp Assistant, you agree to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                                <li>Comply with WhatsApp&apos;s Business Terms and Commerce Policy</li>
                                <li>Obtain proper consent before sending messages to users</li>
                                <li>Not send spam, unsolicited messages, or prohibited content</li>
                                <li>Use message templates approved by WhatsApp for outbound messaging</li>
                                <li>Maintain proper opt-out mechanisms for message recipients</li>
                                <li>Accept that WhatsApp may impose rate limits or restrictions</li>
                            </ul>
                            <p className="text-gray-700">
                                Violation of WhatsApp policies may result in suspension of your WhatsApp Assistant access without refund.
                            </p>
                        </section>

                        <section id="receipt" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Receipt Assistant Terms</h2>
                            <p className="text-gray-700 mb-4">When using the Receipt Assistant:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>OCR accuracy is estimated at 95%+ but is not guaranteed</li>
                                <li>You are responsible for verifying extracted data for accuracy</li>
                                <li>Receipts are stored securely and retained according to your settings</li>
                                <li>Export functionality is provided for convenience and may not be compatible with all accounting software</li>
                                <li>The service does not constitute financial or tax advice</li>
                            </ul>
                        </section>

                        <section id="data" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Data and Privacy</h2>
                            <p className="text-gray-700 mb-4">
                                Your privacy is important to us. Our collection and use of personal information is governed by our <Link href="/privacy" className="text-surf-DEFAULT hover:underline">Privacy Policy</Link>, which is incorporated into these Terms by reference.
                            </p>
                            <p className="text-gray-700 mb-4">Key points:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>We comply with the Protection of Personal Information Act (POPIA)</li>
                                <li>Data is hosted on secure servers in South Africa where feasible</li>
                                <li>You retain ownership of your data</li>
                                <li>You can export or delete your data at any time</li>
                                <li>We implement appropriate security measures to protect your data</li>
                            </ul>
                        </section>

                        <section id="intellectual-property" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Intellectual Property</h2>
                            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.1 Our Property</h3>
                            <p className="text-gray-700 mb-4">
                                The Services, including all software, designs, text, images, and other content, are owned by BotFlow and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our written permission.
                            </p>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3">11.2 Your Content</h3>
                            <p className="text-gray-700">
                                You retain ownership of content you create or upload. By using our Services, you grant us a limited license to process, store, and display your content as necessary to provide the Services.
                            </p>
                        </section>

                        <section id="prohibited" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Prohibited Uses</h2>
                            <p className="text-gray-700 mb-4">You may not use the Services to:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Infringe on intellectual property rights</li>
                                <li>Send spam or unsolicited communications</li>
                                <li>Harass, abuse, or harm others</li>
                                <li>Distribute malware or harmful code</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Reverse engineer or decompile our software</li>
                                <li>Use automated tools to scrape or overload our Services</li>
                                <li>Resell or redistribute our Services without authorization</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                See our <Link href="/acceptable-use" className="text-surf-DEFAULT hover:underline">Acceptable Use Policy</Link> for complete details.
                            </p>
                        </section>

                        <section id="termination" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Termination</h2>
                            <p className="text-gray-700 mb-4">
                                We may suspend or terminate your account if you violate these Terms. Upon termination:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Your right to use the Services immediately ceases</li>
                                <li>You may export your data within 30 days</li>
                                <li>We may delete your data after 30 days</li>
                                <li>Outstanding payment obligations remain due</li>
                            </ul>
                        </section>

                        <section id="liability" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Limitation of Liability</h2>
                            <p className="text-gray-700 mb-4">
                                TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>THE SERVICES ARE PROVIDED &ldquo;AS IS&rdquo; WITHOUT WARRANTIES OF ANY KIND</li>
                                <li>WE DO NOT GUARANTEE UNINTERRUPTED OR ERROR-FREE SERVICE</li>
                                <li>WE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES</li>
                                <li>OUR TOTAL LIABILITY IS LIMITED TO FEES PAID IN THE PREVIOUS 12 MONTHS</li>
                            </ul>
                        </section>

                        <section id="indemnification" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Indemnification</h2>
                            <p className="text-gray-700">
                                You agree to indemnify and hold harmless BotFlow, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Services, violation of these Terms, or infringement of any third-party rights.
                            </p>
                        </section>

                        <section id="disputes" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Dispute Resolution</h2>
                            <p className="text-gray-700 mb-4">
                                These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>First attempted to be resolved through good-faith negotiation</li>
                                <li>If unresolved, submitted to mediation in Cape Town</li>
                                <li>If still unresolved, subject to the exclusive jurisdiction of South African courts</li>
                            </ul>
                        </section>

                        <section id="changes" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Changes to Terms</h2>
                            <p className="text-gray-700">
                                We may modify these Terms at any time. We will notify you of material changes via email or through the Services. Continued use after changes constitutes acceptance of the new Terms.
                            </p>
                        </section>

                        <section id="contact" className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Contact Information</h2>
                            <p className="text-gray-700 mb-4">For questions about these Terms, contact us at:</p>
                            <div className="bg-gray-100 rounded-lg p-6">
                                <p className="text-gray-700"><strong>BotFlow (Pty) Ltd</strong></p>
                                <p className="text-gray-700">Email: legal@botflow.co.za</p>
                                <p className="text-gray-700">Address: Cape Town, South Africa</p>
                            </div>
                        </section>
                    </div>

                    {/* Related Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Related Policies</h3>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/privacy" className="text-surf-DEFAULT hover:underline">Privacy Policy</Link>
                            <Link href="/refund" className="text-surf-DEFAULT hover:underline">Refund Policy</Link>
                            <Link href="/acceptable-use" className="text-surf-DEFAULT hover:underline">Acceptable Use Policy</Link>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </main>
    );
}

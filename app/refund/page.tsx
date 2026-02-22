import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import { Shield, Clock, CreditCard, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Refund Policy - BotFlow',
    description: 'BotFlow Refund Policy - 14-day money-back guarantee. Learn about our refund process and eligibility criteria.',
};

export default function RefundPolicyPage() {
    const lastUpdated = '22 February 2026';

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            <article className="pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Refund Policy</h1>
                        <p className="text-gray-600">Last updated: {lastUpdated}</p>
                    </div>

                    {/* Guarantee Banner */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 mb-12">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-green-800 mb-2">
                                    14-Day Money-Back Guarantee
                                </h2>
                                <p className="text-green-700">
                                    Not satisfied with BotFlow? Get a full refund within 14 days of your first payment, no questions asked. We&apos;re confident you&apos;ll love our services, but if not, we&apos;ve got you covered.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Summary */}
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                            <Clock className="w-8 h-8 text-surf-DEFAULT mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">14 Days</h3>
                            <p className="text-gray-600 text-sm">Full refund window from first payment</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                            <CreditCard className="w-8 h-8 text-surf-DEFAULT mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">5-10 Days</h3>
                            <p className="text-gray-600 text-sm">Processing time for refunds</p>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                            <Mail className="w-8 h-8 text-surf-DEFAULT mx-auto mb-3" />
                            <h3 className="font-semibold text-gray-900 mb-1">Easy Process</h3>
                            <p className="text-gray-600 text-sm">Email us to request a refund</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Refund Eligibility</h2>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Eligible for Full Refund
                            </h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                                <li>Refund requested within 14 days of your <strong>first payment</strong></li>
                                <li>First-time subscribers (not applicable to renewals)</li>
                                <li>All subscription plans (AI Assistant, WhatsApp Assistant, Receipt Assistant, Bundle)</li>
                            </ul>

                            <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                Not Eligible for Refund
                            </h3>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
                                <li>Refund requested after 14 days from first payment</li>
                                <li>Renewal payments (monthly recurring charges after the first month)</li>
                                <li>Accounts terminated for Terms of Service violations</li>
                                <li>Accounts showing clear abuse or fraud</li>
                                <li>Partial month usage after cancellation (prorated refunds not offered)</li>
                            </ul>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800">
                                    <strong>Note:</strong> The 14-day guarantee starts from your first paid subscription, not from when you signed up for a free trial.
                                </p>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How to Request a Refund</h2>
                            <p className="text-gray-700 mb-4">To request a refund, follow these steps:</p>

                            <div className="space-y-4 mb-6">
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-surf-DEFAULT text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">1</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Send an Email</h4>
                                        <p className="text-gray-700">Email <a href="mailto:refunds@botflow.co.za" className="text-surf-DEFAULT hover:underline">refunds@botflow.co.za</a> with the subject line &ldquo;Refund Request&rdquo;</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-surf-DEFAULT text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">2</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Include Required Information</h4>
                                        <ul className="text-gray-700 text-sm mt-1">
                                            <li>• Your account email address</li>
                                            <li>• Date of purchase</li>
                                            <li>• Subscription plan name</li>
                                            <li>• Reason for refund (optional but helpful)</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-surf-DEFAULT text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">3</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Receive Confirmation</h4>
                                        <p className="text-gray-700">We&apos;ll confirm your refund request within 2 business days</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="w-8 h-8 bg-surf-DEFAULT text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">4</div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Refund Processed</h4>
                                        <p className="text-gray-700">Refund will be credited to your original payment method within 5-10 business days</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Processing</h2>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Refunds are processed through Paystack, our payment provider</li>
                                <li>Refunds will be credited to the original payment method</li>
                                <li>Processing typically takes 5-10 business days</li>
                                <li>Depending on your bank, it may take an additional 5-7 days to appear on your statement</li>
                                <li>Refunds are issued in South African Rand (ZAR)</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Status After Refund</h2>
                            <p className="text-gray-700 mb-4">Once a refund is processed:</p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Your subscription will be cancelled immediately</li>
                                <li>You will lose access to paid features</li>
                                <li>Your account will be downgraded to free/limited status</li>
                                <li>Your data will be retained for 30 days, after which it may be deleted</li>
                                <li>You may re-subscribe at any time, but will not be eligible for another refund</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation (No Refund)</h2>
                            <p className="text-gray-700 mb-4">
                                If you cancel your subscription outside the 14-day refund window:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Your subscription will remain active until the end of the current billing period</li>
                                <li>No refunds will be issued for the remaining time</li>
                                <li>You can continue using all features until the period ends</li>
                                <li>Auto-renewal will be disabled</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                To cancel, go to <strong>Settings → Billing → Cancel Subscription</strong> in your account dashboard.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Exceptions</h2>
                            <p className="text-gray-700 mb-4">
                                We reserve the right to refuse refunds in cases of:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>Abuse of the refund policy (e.g., multiple refund requests)</li>
                                <li>Fraudulent activity or chargebacks</li>
                                <li>Violation of our Terms of Service or Acceptable Use Policy</li>
                                <li>Attempts to circumvent usage limits</li>
                            </ul>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Service Credits</h2>
                            <p className="text-gray-700 mb-4">
                                In some cases, instead of a refund, we may offer service credits:
                            </p>
                            <ul className="list-disc pl-6 text-gray-700 space-y-2">
                                <li>For service outages exceeding 24 hours</li>
                                <li>For significant bugs affecting your usage</li>
                                <li>As a goodwill gesture for valid complaints</li>
                            </ul>
                            <p className="text-gray-700 mt-4">
                                Service credits are applied to your next billing cycle and cannot be redeemed for cash.
                            </p>
                        </section>

                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
                            <p className="text-gray-700 mb-4">For refund requests or questions:</p>
                            <div className="bg-gray-100 rounded-lg p-6">
                                <p className="text-gray-700"><strong>Email:</strong> refunds@botflow.co.za</p>
                                <p className="text-gray-700"><strong>Response Time:</strong> Within 2 business days</p>
                                <p className="text-gray-700"><strong>Support Hours:</strong> Monday - Friday, 9AM - 5PM SAST</p>
                            </div>
                        </section>
                    </div>

                    {/* Related Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Related Policies</h3>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/terms" className="text-surf-DEFAULT hover:underline">Terms of Service</Link>
                            <Link href="/privacy" className="text-surf-DEFAULT hover:underline">Privacy Policy</Link>
                            <Link href="/acceptable-use" className="text-surf-DEFAULT hover:underline">Acceptable Use Policy</Link>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </main>
    );
}

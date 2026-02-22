import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import { Trash2, Shield, Clock, AlertTriangle, CheckCircle, FileText, Download } from 'lucide-react';
import type { Metadata } from 'next';
import DataDeletionForm from './DataDeletionForm';

export const metadata: Metadata = {
    title: 'Data Deletion Request - BotFlow',
    description: 'Request deletion of your personal data from BotFlow services. GDPR and POPIA compliant data erasure process.',
};

export default function DataDeletionPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            <article className="pt-32 pb-16">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">Data Deletion Request</h1>
                        <p className="text-gray-600">
                            Exercise your right to erasure under POPIA and GDPR
                        </p>
                    </div>

                    {/* Info Banner */}
                    <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-8 mb-12">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Shield className="w-8 h-8 text-violet-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-violet-800 mb-2">
                                    Your Data Rights
                                </h2>
                                <p className="text-violet-700">
                                    Under POPIA (Protection of Personal Information Act) and GDPR (General Data Protection Regulation),
                                    you have the right to request the deletion of your personal data. We process all deletion requests
                                    within the legally required timeframe.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="grid md:grid-cols-4 gap-4 mb-12">
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                            <div className="w-10 h-10 bg-surf-light text-surf-DEFAULT rounded-full flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Submit Request</h3>
                            <p className="text-gray-500 text-xs mt-1">Fill out the form below</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                            <div className="w-10 h-10 bg-surf-light text-surf-DEFAULT rounded-full flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Verification</h3>
                            <p className="text-gray-500 text-xs mt-1">We verify your identity</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                            <div className="w-10 h-10 bg-surf-light text-surf-DEFAULT rounded-full flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Processing</h3>
                            <p className="text-gray-500 text-xs mt-1">Data is securely deleted</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                            <div className="w-10 h-10 bg-surf-light text-surf-DEFAULT rounded-full flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                            <h3 className="font-semibold text-gray-900 text-sm">Confirmation</h3>
                            <p className="text-gray-500 text-xs mt-1">You receive confirmation</p>
                        </div>
                    </div>

                    {/* What Gets Deleted */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            What Will Be Deleted
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Account Data</h3>
                                <ul className="text-gray-600 text-sm space-y-1">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Name and email address
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Phone number (if provided)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Profile information
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Account preferences
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Service Data</h3>
                                <ul className="text-gray-600 text-sm space-y-1">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        AI Assistant conversation history
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        WhatsApp Assistant configurations
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Receipt scans and extracted data
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        Usage analytics tied to your account
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* What May Be Retained */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Data That May Be Retained
                        </h2>
                        <p className="text-amber-700 mb-4">
                            Certain data may be retained for legal, regulatory, or legitimate business purposes:
                        </p>
                        <ul className="text-amber-700 text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">•</span>
                                <span><strong>Transaction records:</strong> Payment and invoice data required for tax and accounting purposes (retained for 7 years)</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">•</span>
                                <span><strong>Legal compliance:</strong> Data required to comply with legal obligations or defend legal claims</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">•</span>
                                <span><strong>Anonymized data:</strong> Aggregated, non-identifiable data used for analytics</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-semibold">•</span>
                                <span><strong>Backup systems:</strong> Data in backup systems will be deleted within 90 days</span>
                            </li>
                        </ul>
                    </div>

                    {/* Before You Request */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Before You Request Deletion
                        </h2>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-800">Download Your Data First</h3>
                                    <p className="text-blue-700 text-sm">
                                        You can request a copy of your data before deletion. Go to{' '}
                                        <strong>Settings → Privacy → Download My Data</strong> in your account dashboard.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-800">This Action Is Irreversible</h3>
                                    <p className="text-blue-700 text-sm">
                                        Once your data is deleted, it cannot be recovered. Make sure you have exported
                                        any data you wish to keep.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deletion Request Form */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Deletion Request</h2>
                        <DataDeletionForm />
                    </div>

                    {/* Processing Time */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-surf-DEFAULT" />
                            Processing Timeline
                        </h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-700">Initial acknowledgment</span>
                                <span className="font-semibold text-gray-900">Within 48 hours</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-700">Identity verification</span>
                                <span className="font-semibold text-gray-900">1-3 business days</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b border-gray-100">
                                <span className="text-gray-700">Data deletion completed</span>
                                <span className="font-semibold text-gray-900">Within 30 days</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-700">Confirmation email sent</span>
                                <span className="font-semibold text-gray-900">Upon completion</span>
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-4">
                            As required by POPIA and GDPR, we process all deletion requests within 30 days.
                            In exceptional cases requiring more time, we will notify you within the initial 30-day period.
                        </p>
                    </div>

                    {/* Alternative Contact */}
                    <div className="bg-gray-100 rounded-xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Alternative Contact Methods</h2>
                        <p className="text-gray-700 mb-4">
                            You can also submit a deletion request via:
                        </p>
                        <div className="space-y-2">
                            <p className="text-gray-700">
                                <strong>Email:</strong>{' '}
                                <a href="mailto:privacy@botflow.co.za" className="text-surf-DEFAULT hover:underline">
                                    privacy@botflow.co.za
                                </a>
                            </p>
                            <p className="text-gray-700">
                                <strong>Subject Line:</strong> &ldquo;Data Deletion Request - [Your Email]&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Related Links */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Related Policies</h3>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/privacy" className="text-surf-DEFAULT hover:underline">Privacy Policy</Link>
                            <Link href="/terms" className="text-surf-DEFAULT hover:underline">Terms of Service</Link>
                            <Link href="/acceptable-use" className="text-surf-DEFAULT hover:underline">Acceptable Use Policy</Link>
                        </div>
                    </div>
                </div>
            </article>

            <Footer />
        </main>
    );
}

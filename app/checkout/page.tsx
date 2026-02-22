'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CheckoutForm from '../components/checkout/CheckoutForm';
import { getPlan } from '@/lib/paystack/plans';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const planId = searchParams.get('plan') || 'whatsapp-assistant';
    const plan = getPlan(planId);

    if (!plan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-dark-navy mb-4">Plan Not Found</h1>
                    <p className="text-gray-600">The selected plan does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />
            <div className="pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-dark-navy mb-4">
                            Complete Your Order
                        </h1>
                        <p className="text-xl text-gray-600">
                            You&apos;re subscribing to {plan.name}
                        </p>
                    </div>

                    <CheckoutForm plan={plan} />
                </div>
            </div>
            <Footer />
        </main>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-surf"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}

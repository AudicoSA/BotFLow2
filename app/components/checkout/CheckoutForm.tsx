'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    CreditCard,
    Lock,
    Check,
    Loader2,
    AlertCircle,
    Shield,
    ArrowRight,
} from 'lucide-react';
import type { PricingPlan } from '@/lib/paystack/plans';

interface CheckoutFormProps {
    plan: PricingPlan;
}

export default function CheckoutForm({ plan }: CheckoutFormProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalAmount = plan.perUser ? plan.priceInCents * quantity : plan.priceInCents;
    const displayTotal = `R${(totalAmount / 100).toFixed(0)}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    planId: plan.id,
                    email,
                    quantity: plan.perUser ? quantity : 1,
                    metadata: { name },
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Checkout failed');
            }

            // Redirect to Paystack checkout
            window.location.href = data.data.authorizationUrl;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setIsLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Order Summary */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 h-fit"
            >
                <h2 className="text-xl font-bold text-dark-navy mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                    {/* Plan details */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-dark-navy">{plan.name}</h3>
                            <p className="text-sm text-gray-500">{plan.description}</p>
                        </div>
                        <span className="font-bold text-dark-navy">{plan.displayPrice}/mo</span>
                    </div>

                    {/* Quantity selector for per-user plans */}
                    {plan.perUser && (
                        <div className="flex items-center justify-between py-4 border-t border-gray-100">
                            <span className="text-gray-700">Number of users</span>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    -
                                </button>
                                <span className="w-8 text-center font-semibold">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-500 mb-3">What&apos;s included:</h4>
                        <ul className="space-y-2">
                            {plan.features.slice(0, 5).map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                                    <Check className="w-4 h-4 text-green-500" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-dark-navy">Total per month</span>
                        <span className="text-surf-dark">{displayTotal}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Billed monthly. Cancel anytime.
                    </p>
                </div>
            </motion.div>

            {/* Payment Form */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
            >
                <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="w-5 h-5 text-surf" />
                    <h2 className="text-xl font-bold text-dark-navy">Payment Details</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none transition-all"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="john@company.co.za"
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none transition-all"
                        />
                    </div>

                    {/* Payment info notice */}
                    <div className="bg-surf-light/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                            <Lock className="w-5 h-5 text-surf-dark flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-dark-navy">
                                    Secure checkout with Paystack
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                    You&apos;ll be redirected to Paystack to complete payment securely.
                                    We accept cards, bank transfers, and EFT.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="bg-red-50 text-red-700 rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 px-6 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Continue to Payment
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    {/* Trust badges */}
                    <div className="flex items-center justify-center gap-6 pt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            <span>Secure Payment</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Lock className="w-4 h-4" />
                            <span>SSL Encrypted</span>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

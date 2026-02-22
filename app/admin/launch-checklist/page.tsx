import Navigation from '../../components/Navigation';
import Footer from '../../components/Footer';
import type { Metadata } from 'next';
import LaunchChecklistClient from './LaunchChecklistClient';

export const metadata: Metadata = {
    title: 'Launch Checklist - BotFlow Admin',
    description: 'Pre-launch verification checklist for BotFlow',
};

export default function LaunchChecklistPage() {
    return (
        <main className="min-h-screen bg-gray-100">
            <Navigation />

            <div className="pt-24 pb-16">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Launch Preparation Checklist</h1>
                        <p className="text-gray-600">
                            Complete all items before launching BotFlow to production
                        </p>
                    </div>

                    <LaunchChecklistClient />
                </div>
            </div>

            <Footer />
        </main>
    );
}

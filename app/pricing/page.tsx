import Navigation from '../components/Navigation';
import PricingHero from '../components/pricing/PricingHero';
import PricingTiers from '../components/pricing/PricingTiers';
import FeatureComparison from '../components/pricing/FeatureComparison';
import PricingFAQ from '../components/pricing/PricingFAQ';
import PricingCTA from '../components/pricing/PricingCTA';
import Footer from '../components/Footer';
import Testimonials from '../components/conversion/Testimonials';
import ComparisonTable from '../components/conversion/ComparisonTable';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing - BotFlow | AI Assistant, WhatsApp & Receipt Automation',
    description: 'Simple, transparent pricing for BotFlow automation services. AI Assistant R499/mo, WhatsApp Assistant R499/mo, Receipt Assistant R99/user/mo, or get the full bundle for R899/mo.',
    openGraph: {
        title: 'BotFlow Pricing - Affordable Business Automation',
        description: 'Choose the right plan for your business. 14-day free trial, no credit card required.',
    },
};

export default function PricingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navigation />
            <PricingHero />
            <PricingTiers />
            <ComparisonTable type="whatsapp" showCalculator={false} />
            <Testimonials variant="carousel" showStats={true} showLogos={false} maxItems={4} />
            <FeatureComparison />
            <PricingFAQ />
            <PricingCTA />
            <Footer />
        </main>
    );
}

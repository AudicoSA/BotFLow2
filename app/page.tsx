import Navigation from './components/Navigation';
import Hero from './components/Hero';
import Services from './components/Services';
import SocialProof from './components/SocialProof';
import Features from './components/Features';
import Pricing from './components/Pricing';
import Testimonials from './components/conversion/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
            <Navigation />
            <Hero />
            <Services />
            <SocialProof />
            <Features />
            <Testimonials variant="full" showStats={true} showLogos={true} maxItems={6} />
            <Pricing />
            <CallToAction />
            <Footer />
        </main>
    );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Quote, ChevronLeft, ChevronRight, MessageSquare, Building2, Users } from 'lucide-react';

// Testimonial data from beta users
const testimonials = [
    {
        id: 1,
        name: 'Sarah van der Berg',
        role: 'Owner',
        company: 'Cape Coastal Properties',
        industry: 'Real Estate',
        avatar: '/images/testimonials/avatar-1.jpg',
        quote: 'BotFlow transformed how we handle client inquiries. We went from missing messages on weekends to instant 24/7 responses. Our lead conversion rate increased by 40% in the first month!',
        rating: 5,
        metric: { label: 'Lead conversion increase', value: '+40%' },
        services: ['WhatsApp Assistant', 'AI Assistant'],
    },
    {
        id: 2,
        name: 'Michael Naidoo',
        role: 'Managing Director',
        company: 'Durban Auto Parts',
        industry: 'Automotive',
        avatar: '/images/testimonials/avatar-2.jpg',
        quote: 'The receipt scanning feature alone saves my bookkeeper 10 hours per week. I can finally see all our expenses in one place without hunting for paper receipts.',
        rating: 5,
        metric: { label: 'Hours saved weekly', value: '10+' },
        services: ['Receipt Assistant'],
    },
    {
        id: 3,
        name: 'Thandi Molefe',
        role: 'Founder',
        company: 'Jozi Fashion Collective',
        industry: 'E-commerce',
        avatar: '/images/testimonials/avatar-3.jpg',
        quote: 'My customers love getting instant replies about sizing and availability. The AI understands our products perfectly. It feels like having a full-time customer service team.',
        rating: 5,
        metric: { label: 'Response time', value: '<30 sec' },
        services: ['WhatsApp Assistant', 'AI Assistant'],
    },
    {
        id: 4,
        name: 'Johan Steyn',
        role: 'CEO',
        company: 'Stellenbosch Wine Tours',
        industry: 'Tourism',
        avatar: '/images/testimonials/avatar-4.jpg',
        quote: 'We handle bookings from international visitors in multiple languages now. The AI seamlessly switches between English, Afrikaans, and German. Truly impressive technology!',
        rating: 5,
        metric: { label: 'Languages supported', value: '10+' },
        services: ['AI Assistant', 'WhatsApp Assistant'],
    },
    {
        id: 5,
        name: 'Priya Chetty',
        role: 'Finance Manager',
        company: 'Pretoria Medical Group',
        industry: 'Healthcare',
        avatar: '/images/testimonials/avatar-5.jpg',
        quote: 'Tracking medical supply expenses was a nightmare before BotFlow. Now every receipt is categorized automatically and ready for our accountant. Tax season is no longer stressful.',
        rating: 5,
        metric: { label: 'Time to file taxes', value: '-60%' },
        services: ['Receipt Assistant'],
    },
    {
        id: 6,
        name: 'David Okonkwo',
        role: 'Operations Lead',
        company: 'Lagos-Cape Logistics',
        industry: 'Logistics',
        avatar: '/images/testimonials/avatar-6.jpg',
        quote: 'Our WhatsApp is our main communication channel with drivers and clients. BotFlow keeps everything organized and responses instant. Worth every Rand!',
        rating: 5,
        metric: { label: 'Messages handled daily', value: '500+' },
        services: ['WhatsApp Assistant', 'AI Assistant'],
    },
];

// Aggregate stats
const stats = [
    { icon: MessageSquare, value: '50,000+', label: 'Messages handled monthly' },
    { icon: Building2, value: '200+', label: 'SA businesses trust us' },
    { icon: Users, value: '95%', label: 'Customer satisfaction' },
    { icon: Star, value: '4.9/5', label: 'Average rating' },
];

// Logo cloud companies
const trustedBy = [
    { name: 'Discovery', logo: '/images/logos/discovery.png' },
    { name: 'Woolworths', logo: '/images/logos/woolworths.png' },
    { name: 'Checkers', logo: '/images/logos/checkers.png' },
    { name: 'MTN', logo: '/images/logos/mtn.png' },
    { name: 'FNB', logo: '/images/logos/fnb.png' },
    { name: 'Takealot', logo: '/images/logos/takealot.png' },
];

interface TestimonialsProps {
    variant?: 'full' | 'compact' | 'carousel';
    showStats?: boolean;
    showLogos?: boolean;
    maxItems?: number;
}

export default function Testimonials({
    variant = 'full',
    showStats = true,
    showLogos = true,
    maxItems = 6,
}: TestimonialsProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const displayedTestimonials = testimonials.slice(0, maxItems);

    // Auto-rotate carousel
    useEffect(() => {
        if (variant !== 'carousel' || !isAutoPlaying) return;

        const timer = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % displayedTestimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [variant, isAutoPlaying, displayedTestimonials.length]);

    return (
        <section className="py-16 md:py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surf-light/20 text-surf-darker text-sm font-medium mb-4">
                        <Star className="w-4 h-4 fill-current" />
                        Trusted by SA Businesses
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        What Our Customers Say
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Join hundreds of South African businesses automating their customer communication
                    </p>
                </div>

                {/* Stats */}
                {showStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-16">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center p-4 md:p-6 bg-white rounded-xl shadow-sm">
                                <stat.icon className="w-6 h-6 md:w-8 md:h-8 text-surf-DEFAULT mx-auto mb-2" />
                                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-gray-600 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Testimonials Grid */}
                {variant === 'full' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedTestimonials.map((testimonial) => (
                            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                        ))}
                    </div>
                )}

                {/* Compact List */}
                {variant === 'compact' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {displayedTestimonials.slice(0, 4).map((testimonial) => (
                            <TestimonialCardCompact key={testimonial.id} testimonial={testimonial} />
                        ))}
                    </div>
                )}

                {/* Carousel */}
                {variant === 'carousel' && (
                    <div className="relative">
                        <div
                            className="overflow-hidden"
                            onMouseEnter={() => setIsAutoPlaying(false)}
                            onMouseLeave={() => setIsAutoPlaying(true)}
                        >
                            <div
                                className="flex transition-transform duration-500"
                                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                            >
                                {displayedTestimonials.map((testimonial) => (
                                    <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                                        <TestimonialCardLarge testimonial={testimonial} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-center items-center gap-4 mt-8">
                            <button
                                onClick={() => setActiveIndex(prev => (prev - 1 + displayedTestimonials.length) % displayedTestimonials.length)}
                                className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>

                            <div className="flex gap-2">
                                {displayedTestimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            index === activeIndex ? 'bg-surf-DEFAULT' : 'bg-gray-300'
                                        }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setActiveIndex(prev => (prev + 1) % displayedTestimonials.length)}
                                className="p-2 bg-white rounded-full shadow hover:bg-gray-50 transition-colors"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Logo Cloud */}
                {showLogos && (
                    <div className="mt-16 pt-16 border-t border-gray-200">
                        <p className="text-center text-gray-500 text-sm mb-8">
                            Used by teams at leading South African companies
                        </p>
                        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
                            {trustedBy.map((company, index) => (
                                <div key={index} className="w-24 md:w-32 h-8 md:h-10 bg-gray-200 rounded flex items-center justify-center">
                                    <span className="text-gray-500 text-xs font-medium">{company.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

// Testimonial card component
function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            {/* Rating */}
            <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
            </div>

            {/* Quote */}
            <Quote className="w-8 h-8 text-surf-light/50 mb-3" />
            <p className="text-gray-700 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
            </p>

            {/* Metric highlight */}
            <div className="bg-surf-light/10 rounded-lg px-4 py-3 mb-6">
                <div className="text-2xl font-bold text-surf-DEFAULT">{testimonial.metric.value}</div>
                <div className="text-sm text-gray-600">{testimonial.metric.label}</div>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-surf-light to-surf-DEFAULT flex items-center justify-center text-white font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                        {testimonial.role}, {testimonial.company}
                    </div>
                </div>
            </div>

            {/* Services used */}
            <div className="mt-4 flex flex-wrap gap-2">
                {testimonial.services.map((service, index) => (
                    <span
                        key={index}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                    >
                        {service}
                    </span>
                ))}
            </div>
        </div>
    );
}

// Compact testimonial card
function TestimonialCardCompact({ testimonial }: { testimonial: typeof testimonials[0] }) {
    return (
        <div className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-surf-light to-surf-DEFAULT flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {testimonial.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{testimonial.name}</span>
                    <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                    </div>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">&ldquo;{testimonial.quote}&rdquo;</p>
            </div>
        </div>
    );
}

// Large testimonial card for carousel
function TestimonialCardLarge({ testimonial }: { testimonial: typeof testimonials[0] }) {
    return (
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-lg max-w-3xl mx-auto">
            <Quote className="w-12 h-12 text-surf-DEFAULT/30 mb-6" />

            <p className="text-xl md:text-2xl text-gray-800 leading-relaxed mb-8">
                &ldquo;{testimonial.quote}&rdquo;
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-surf-light to-surf-DEFAULT flex items-center justify-center text-white font-semibold text-lg">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                        <div className="text-gray-500">
                            {testimonial.role}, {testimonial.company}
                        </div>
                    </div>
                </div>

                <div className="bg-surf-light/10 rounded-lg px-5 py-3 text-center">
                    <div className="text-2xl font-bold text-surf-DEFAULT">{testimonial.metric.value}</div>
                    <div className="text-sm text-gray-600">{testimonial.metric.label}</div>
                </div>
            </div>
        </div>
    );
}

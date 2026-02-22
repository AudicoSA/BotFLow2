'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled
                ? 'bg-white/95 backdrop-blur-md border-b border-surf-light/20 shadow-sm'
                : 'bg-transparent'
        }`}>
            <div className="max-w-7xl mx-auto px-6 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-auto h-[3rem] min-w-[140px] hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/logo.png"
                                alt="BotFlow Logo"
                                fill
                                className="object-contain object-left"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link
                            href="#services"
                            className={`font-medium transition-colors ${
                                isScrolled ? 'text-gray-600 hover:text-surf-DEFAULT' : 'text-white/90 hover:text-white'
                            }`}
                        >
                            Services
                        </Link>
                        <Link
                            href="#features"
                            className={`font-medium transition-colors ${
                                isScrolled ? 'text-gray-600 hover:text-surf-DEFAULT' : 'text-white/90 hover:text-white'
                            }`}
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className={`font-medium transition-colors ${
                                isScrolled ? 'text-gray-600 hover:text-surf-DEFAULT' : 'text-white/90 hover:text-white'
                            }`}
                        >
                            Pricing
                        </Link>

                        <Link
                            href="/login"
                            className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                                isScrolled
                                    ? 'border border-gray-300 hover:border-surf-DEFAULT text-gray-700 hover:text-surf-DEFAULT'
                                    : 'border border-white/30 text-white hover:bg-white/10'
                            }`}
                        >
                            Login
                        </Link>

                        <Link
                            href="#cta"
                            className="px-6 py-2.5 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                        >
                            Start Free Trial
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden p-2 rounded-lg ${isScrolled ? 'text-gray-700' : 'text-white'}`}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 p-6 space-y-4">
                        <Link href="#services" className="block text-gray-700 hover:text-surf-DEFAULT font-medium py-2">Services</Link>
                        <Link href="#features" className="block text-gray-700 hover:text-surf-DEFAULT font-medium py-2">Features</Link>
                        <Link href="#pricing" className="block text-gray-700 hover:text-surf-DEFAULT font-medium py-2">Pricing</Link>
                        <Link href="/login" className="block text-gray-700 hover:text-surf-DEFAULT font-medium py-2">Login</Link>
                        <Link href="#cta" className="block w-full text-center px-6 py-3 bg-surf hover:bg-surf-dark text-white rounded-xl font-semibold">
                            Start Free Trial
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

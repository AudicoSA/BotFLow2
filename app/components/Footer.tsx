import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contact" className="bg-dark-navy text-white py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-surf to-surf-dark flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-bold">BotFlow</span>
                        </div>
                        <p className="text-gray-400 mb-6">
                            AI-powered automation for South African businesses. WhatsApp, AI Assistant, and Receipt processing all in one platform.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-surf transition-colors flex items-center justify-center">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-surf transition-colors flex items-center justify-center">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-surf transition-colors flex items-center justify-center">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-surf transition-colors flex items-center justify-center">
                                <Instagram className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-surf-light">Services</h4>
                        <ul className="space-y-4">
                            <li><Link href="#services" className="text-gray-400 hover:text-white transition-colors">AI Assistant</Link></li>
                            <li><Link href="#services" className="text-gray-400 hover:text-white transition-colors">WhatsApp Assistant</Link></li>
                            <li><Link href="#services" className="text-gray-400 hover:text-white transition-colors">Receipt Assistant</Link></li>
                            <li><Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-surf-light">Company</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-6 text-sm uppercase tracking-wider text-surf-light">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-5 h-5 text-surf-light" />
                                <a href="mailto:hello@botflow.co.za" className="hover:text-white transition-colors">hello@botflow.co.za</a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-400">
                                <Phone className="w-5 h-5 text-surf-light" />
                                <a href="tel:+27100000000" className="hover:text-white transition-colors">+27 10 000 0000</a>
                            </li>
                            <li className="flex items-start gap-3 text-gray-400">
                                <MapPin className="w-5 h-5 text-surf-light flex-shrink-0 mt-1" />
                                <span>Cape Town, South Africa</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-gray-500 text-sm">
                        © {currentYear} BotFlow. All rights reserved. Built with ❤️ in South Africa 🇿🇦
                    </p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy Policy</Link>
                        <Link href="/terms" className="text-gray-500 hover:text-white transition-colors text-sm">Terms of Service</Link>
                        <Link href="/data-deletion" className="text-gray-500 hover:text-white transition-colors text-sm">Data Deletion</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

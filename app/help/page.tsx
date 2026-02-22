'use client';

import Link from 'next/link';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import {
    Search,
    MessageSquare,
    Smartphone,
    Receipt,
    ChevronRight,
    BookOpen,
    Video,
    HelpCircle,
    Mail,
    ExternalLink
} from 'lucide-react';
import { useState } from 'react';

// FAQ categories and items
const faqCategories = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: BookOpen,
        questions: [
            {
                question: 'How do I create a BotFlow account?',
                answer: 'Creating an account is easy! Click the "Start Free Trial" button on our homepage, enter your email address, and follow the setup wizard. No credit card is required for the 14-day free trial.',
            },
            {
                question: 'What is included in the free trial?',
                answer: 'Your 14-day free trial includes full access to all features of your selected plan. You can try the AI Assistant, WhatsApp Assistant, and Receipt Assistant without any limitations. We\'ll send you reminders before your trial ends.',
            },
            {
                question: 'How long does setup take?',
                answer: 'Most users complete their initial setup in under 5 minutes! Our guided onboarding wizard walks you through each step, and you can send your first automated message within minutes of signing up.',
            },
            {
                question: 'Can I change my plan later?',
                answer: 'Yes! You can upgrade, downgrade, or switch plans at any time from your account settings. When upgrading, you\'ll be charged a prorated amount for the remainder of your billing period.',
            },
        ],
    },
    {
        id: 'ai-assistant',
        title: 'AI Assistant',
        icon: MessageSquare,
        questions: [
            {
                question: 'What can the AI Assistant do for my business?',
                answer: 'The AI Assistant uses GPT-4 to handle customer inquiries, provide information about your products/services, answer FAQs, and assist with routine tasks. It learns from your business context to provide accurate, helpful responses.',
            },
            {
                question: 'How do I train the AI on my business information?',
                answer: 'You can upload documents, paste text, or provide URLs containing your business information. The AI will analyze this content and use it to answer questions accurately. You can also customize the AI\'s personality and response style.',
            },
            {
                question: 'Is there a limit to how many messages I can send?',
                answer: 'Your plan includes a generous monthly message quota. The AI Assistant plan includes 10,000 messages per month. If you need more, contact us about enterprise pricing or usage-based billing options.',
            },
            {
                question: 'Can I review AI responses before they\'re sent?',
                answer: 'Yes! You can configure the AI to queue responses for approval, set confidence thresholds, or specify topics that require human review. This gives you control while still automating routine queries.',
            },
        ],
    },
    {
        id: 'whatsapp',
        title: 'WhatsApp Assistant',
        icon: Smartphone,
        questions: [
            {
                question: 'How do I connect my WhatsApp Business account?',
                answer: 'We support two connection methods: QR code scanning (instant setup) or Meta Embedded Signup (recommended for businesses). Our setup wizard guides you through both options, and you can be connected in under 2 minutes.',
            },
            {
                question: 'Will I lose my existing WhatsApp Business conversations?',
                answer: 'No! Our Coexistence mode allows you to keep using your existing WhatsApp Business App while BotFlow handles automated responses. Your chat history and contacts remain intact.',
            },
            {
                question: 'Can I use my existing WhatsApp Business number?',
                answer: 'Yes! You can connect your existing WhatsApp Business number without any changes. We integrate directly with the WhatsApp Business API while preserving your existing setup.',
            },
            {
                question: 'What happens if the bot can\'t answer a question?',
                answer: 'You can configure fallback behaviors: hand off to a human agent, collect contact information for follow-up, or provide alternative resources. The AI knows when it\'s uncertain and handles handoffs gracefully.',
            },
        ],
    },
    {
        id: 'receipts',
        title: 'Receipt Assistant',
        icon: Receipt,
        questions: [
            {
                question: 'How does receipt scanning work?',
                answer: 'Simply take a photo of your receipt or upload an image. Our AI-powered OCR extracts the merchant name, date, total amount, and individual line items. Data is automatically categorized and organized for easy expense tracking.',
            },
            {
                question: 'What receipt formats are supported?',
                answer: 'We support photos, scanned PDFs, and images in common formats (JPG, PNG, PDF). Our OCR works with printed receipts, digital receipts, and even handwritten receipts in most cases.',
            },
            {
                question: 'Can I export receipt data for accounting?',
                answer: 'Yes! Export your receipt data to CSV or PDF format. Our exports are compatible with popular accounting software like QuickBooks, Xero, and Excel.',
            },
            {
                question: 'How accurate is the OCR recognition?',
                answer: 'Our OCR achieves over 95% accuracy on clear receipt images. For best results, ensure good lighting and a flat surface when photographing receipts. You can always edit extracted data if needed.',
            },
        ],
    },
    {
        id: 'billing',
        title: 'Billing & Payments',
        icon: Receipt,
        questions: [
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit/debit cards (Visa, Mastercard, American Express) through Paystack. South African customers can also pay via EFT, SnapScan, and other local payment methods.',
            },
            {
                question: 'Can I get an invoice for my subscription?',
                answer: 'Absolutely! Invoices are automatically generated for each payment and are available in your account settings under Billing History. You can download PDF invoices at any time.',
            },
            {
                question: 'What is your refund policy?',
                answer: 'We offer a 14-day money-back guarantee. If you\'re not satisfied within the first 14 days of your paid subscription, contact us for a full refund. No questions asked.',
            },
            {
                question: 'How do I cancel my subscription?',
                answer: 'You can cancel anytime from your account settings. Your access will continue until the end of your current billing period. We\'ll retain your data for 30 days in case you want to reactivate.',
            },
        ],
    },
];

// Quick start guides
const quickStartGuides = [
    {
        id: 'ai-assistant',
        title: 'AI Assistant Setup',
        description: 'Configure your AI assistant in 5 minutes',
        icon: MessageSquare,
        duration: '5 min',
        href: '/help/guides/ai-assistant',
    },
    {
        id: 'whatsapp',
        title: 'WhatsApp QR Onboarding',
        description: 'Connect WhatsApp with QR code scanning',
        icon: Smartphone,
        duration: '3 min',
        href: '/help/guides/whatsapp',
    },
    {
        id: 'receipts',
        title: 'Receipt Scanning',
        description: 'Start scanning and organizing receipts',
        icon: Receipt,
        duration: '2 min',
        href: '/help/guides/receipts',
    },
];

// Video tutorials
const videoTutorials = [
    {
        id: 'whatsapp-qr',
        title: 'WhatsApp QR Code Setup',
        description: 'Step-by-step QR code connection guide',
        thumbnail: '/images/tutorials/whatsapp-qr-thumb.jpg',
        duration: '2:34',
        href: '/help/videos/whatsapp-qr',
    },
    {
        id: 'first-message',
        title: 'Sending Your First Message',
        description: 'Configure and send automated messages',
        thumbnail: '/images/tutorials/first-message-thumb.jpg',
        duration: '3:15',
        href: '/help/videos/first-message',
    },
    {
        id: 'ai-training',
        title: 'Training Your AI Assistant',
        description: 'Upload documents and customize responses',
        thumbnail: '/images/tutorials/ai-training-thumb.jpg',
        duration: '4:22',
        href: '/help/videos/ai-training',
    },
];

export default function HelpCenterPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('getting-started');
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

    const toggleQuestion = (questionId: string) => {
        const newExpanded = new Set(expandedQuestions);
        if (newExpanded.has(questionId)) {
            newExpanded.delete(questionId);
        } else {
            newExpanded.add(questionId);
        }
        setExpandedQuestions(newExpanded);
    };

    const filteredCategories = faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(
            q => searchQuery === '' ||
                q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        ),
    })).filter(category => category.questions.length > 0);

    const activeQuestions = filteredCategories.find(c => c.id === activeCategory)?.questions || [];

    return (
        <main className="min-h-screen bg-gray-50">
            <Navigation />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-gradient-to-br from-surf-DEFAULT via-surf-dark to-surf-darker">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        How can we help you?
                    </h1>
                    <p className="text-xl text-white/80 mb-8">
                        Find answers, guides, and tutorials to get the most out of BotFlow
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl text-lg border-0 shadow-lg focus:ring-2 focus:ring-surf-light focus:outline-none"
                        />
                    </div>
                </div>
            </section>

            {/* Quick Links */}
            <section className="py-12 bg-white border-b">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Getting Started Guides */}
                        <Link href="#guides" className="group p-6 bg-surf-light/10 rounded-xl hover:bg-surf-light/20 transition-colors">
                            <BookOpen className="w-8 h-8 text-surf-DEFAULT mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-surf-DEFAULT">
                                Getting Started Guides
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Step-by-step setup instructions for each service
                            </p>
                        </Link>

                        {/* Video Tutorials */}
                        <Link href="#videos" className="group p-6 bg-surf-light/10 rounded-xl hover:bg-surf-light/20 transition-colors">
                            <Video className="w-8 h-8 text-surf-DEFAULT mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-surf-DEFAULT">
                                Video Tutorials
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Watch how-to videos for visual learners
                            </p>
                        </Link>

                        {/* Contact Support */}
                        <Link href="#support" className="group p-6 bg-surf-light/10 rounded-xl hover:bg-surf-light/20 transition-colors">
                            <Mail className="w-8 h-8 text-surf-DEFAULT mb-3" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-surf-DEFAULT">
                                Contact Support
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Get help from our support team
                            </p>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        Frequently Asked Questions
                    </h2>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Category Sidebar */}
                        <div className="md:w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                {filteredCategories.map(category => {
                                    const Icon = category.icon;
                                    return (
                                        <button
                                            key={category.id}
                                            onClick={() => setActiveCategory(category.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                activeCategory === category.id
                                                    ? 'bg-surf-DEFAULT text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                            <span className="font-medium">{category.title}</span>
                                            <span className={`ml-auto text-sm ${
                                                activeCategory === category.id ? 'text-white/70' : 'text-gray-400'
                                            }`}>
                                                {category.questions.length}
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Questions List */}
                        <div className="flex-1">
                            <div className="space-y-4">
                                {activeQuestions.map((item, index) => {
                                    const questionId = `${activeCategory}-${index}`;
                                    const isExpanded = expandedQuestions.has(questionId);

                                    return (
                                        <div
                                            key={index}
                                            className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggleQuestion(questionId)}
                                                className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="font-medium text-gray-900">
                                                    {item.question}
                                                </span>
                                                <ChevronRight
                                                    className={`w-5 h-5 text-gray-400 transition-transform ${
                                                        isExpanded ? 'rotate-90' : ''
                                                    }`}
                                                />
                                            </button>
                                            {isExpanded && (
                                                <div className="px-5 pb-5">
                                                    <p className="text-gray-600 leading-relaxed">
                                                        {item.answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {activeQuestions.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                        <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">
                                            No questions match your search in this category.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Getting Started Guides */}
            <section id="guides" className="py-16 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Getting Started Guides
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Step-by-step instructions to set up each BotFlow service
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickStartGuides.map(guide => {
                            const Icon = guide.icon;
                            return (
                                <Link
                                    key={guide.id}
                                    href={guide.href}
                                    className="group p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-surf-DEFAULT hover:shadow-lg transition-all"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-surf-light/20 rounded-xl flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-surf-DEFAULT" />
                                        </div>
                                        <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                            {guide.duration}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-surf-DEFAULT">
                                        {guide.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        {guide.description}
                                    </p>
                                    <span className="text-surf-DEFAULT font-medium text-sm inline-flex items-center gap-1">
                                        Read guide <ChevronRight className="w-4 h-4" />
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Video Tutorials */}
            <section id="videos" className="py-16 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Video Tutorials
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Watch step-by-step video guides for WhatsApp setup and more
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {videoTutorials.map(video => (
                            <Link
                                key={video.id}
                                href={video.href}
                                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                            >
                                {/* Video Thumbnail */}
                                <div className="relative aspect-video bg-gray-200">
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800/20">
                                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <div className="w-0 h-0 border-l-[20px] border-l-surf-DEFAULT border-y-[12px] border-y-transparent ml-1" />
                                        </div>
                                    </div>
                                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                        {video.duration}
                                    </span>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-surf-DEFAULT">
                                        {video.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        {video.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Support */}
            <section id="support" className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Still need help?
                    </h2>
                    <p className="text-gray-600 mb-8">
                        Our support team is here to assist you. Choose your preferred way to reach us.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <Mail className="w-10 h-10 text-surf-DEFAULT mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Email Support
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Get a response within 24 hours
                            </p>
                            <a
                                href="mailto:support@botflow.co.za"
                                className="inline-flex items-center gap-2 text-surf-DEFAULT font-medium hover:underline"
                            >
                                support@botflow.co.za <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>

                        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <MessageSquare className="w-10 h-10 text-surf-DEFAULT mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Live Chat
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Chat with our AI-powered support bot
                            </p>
                            <button
                                className="inline-flex items-center gap-2 text-surf-DEFAULT font-medium hover:underline"
                                onClick={() => {
                                    // Trigger chatbot open
                                    const event = new CustomEvent('openSupportChatbot');
                                    window.dispatchEvent(event);
                                }}
                            >
                                Start a conversation <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}

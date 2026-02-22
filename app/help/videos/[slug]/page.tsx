'use client';

import { use } from 'react';
import Link from 'next/link';
import Navigation from '../../../components/Navigation';
import Footer from '../../../components/Footer';
import {
    ChevronLeft,
    Clock,
    Play,
    ChevronRight,
    ThumbsUp,
    ThumbsDown,
    Share2,
    BookOpen
} from 'lucide-react';

// Video tutorial data
const videoTutorials: Record<string, {
    title: string;
    description: string;
    duration: string;
    videoId: string;
    category: string;
    relatedGuide?: string;
    chapters: { time: string; title: string }[];
    relatedVideos: string[];
}> = {
    'whatsapp-qr': {
        title: 'WhatsApp QR Code Setup',
        description: 'Learn how to connect your WhatsApp Business account to BotFlow using QR code scanning. This quick tutorial walks you through the entire process step-by-step.',
        duration: '2:34',
        videoId: 'whatsapp-qr-tutorial',
        category: 'WhatsApp',
        relatedGuide: '/help/guides/whatsapp',
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:15', title: 'Navigate to WhatsApp Setup' },
            { time: '0:45', title: 'Scanning the QR Code' },
            { time: '1:20', title: 'Verifying Connection' },
            { time: '1:50', title: 'Configuring Coexistence Mode' },
            { time: '2:15', title: 'Testing Your Setup' },
        ],
        relatedVideos: ['first-message', 'ai-training'],
    },
    'first-message': {
        title: 'Sending Your First Automated Message',
        description: 'Set up and send your first automated WhatsApp message with BotFlow. Learn how to configure triggers, templates, and responses.',
        duration: '3:15',
        videoId: 'first-message-tutorial',
        category: 'WhatsApp',
        relatedGuide: '/help/guides/whatsapp',
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:20', title: 'Creating a Message Template' },
            { time: '1:00', title: 'Setting Up Triggers' },
            { time: '1:45', title: 'Configuring AI Responses' },
            { time: '2:30', title: 'Testing with a Real Message' },
            { time: '3:00', title: 'Monitoring Responses' },
        ],
        relatedVideos: ['whatsapp-qr', 'ai-training'],
    },
    'ai-training': {
        title: 'Training Your AI Assistant',
        description: 'Discover how to train your AI assistant with your business knowledge. Upload documents, customize responses, and improve accuracy over time.',
        duration: '4:22',
        videoId: 'ai-training-tutorial',
        category: 'AI Assistant',
        relatedGuide: '/help/guides/ai-assistant',
        chapters: [
            { time: '0:00', title: 'Introduction' },
            { time: '0:25', title: 'Uploading Knowledge Sources' },
            { time: '1:15', title: 'Supported File Formats' },
            { time: '1:45', title: 'Customizing AI Personality' },
            { time: '2:30', title: 'Setting Response Guidelines' },
            { time: '3:15', title: 'Testing and Refining' },
            { time: '4:00', title: 'Best Practices' },
        ],
        relatedVideos: ['first-message', 'whatsapp-qr'],
    },
};

export default function VideoTutorialPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const video = videoTutorials[slug];

    if (!video) {
        return (
            <main className="min-h-screen bg-gray-50">
                <Navigation />
                <div className="pt-32 pb-16">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h1>
                        <p className="text-gray-600 mb-6">The video tutorial you&apos;re looking for doesn&apos;t exist.</p>
                        <Link href="/help" className="text-surf-DEFAULT hover:underline">
                            Back to Help Center
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-900">
            <Navigation />

            {/* Video Section */}
            <section className="pt-24 pb-8">
                <div className="max-w-6xl mx-auto px-6">
                    <Link
                        href="/help"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to Help Center
                    </Link>

                    {/* Video Player Placeholder */}
                    <div className="relative bg-black rounded-xl aspect-video mb-6 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <button className="w-20 h-20 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                                <Play className="w-8 h-8 text-gray-900 ml-1" />
                            </button>
                        </div>

                        {/* Video placeholder gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Duration badge */}
                        <div className="absolute bottom-4 right-4 bg-black/80 text-white text-sm px-2 py-1 rounded">
                            {video.duration}
                        </div>
                    </div>

                    {/* Video Info */}
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-surf-light text-sm font-medium bg-surf-light/20 px-2 py-1 rounded">
                                    {video.category}
                                </span>
                                <span className="text-gray-400 text-sm flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {video.duration}
                                </span>
                            </div>

                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                {video.title}
                            </h1>

                            <p className="text-gray-300 mb-6">
                                {video.description}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-4 mb-8">
                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                    <ThumbsUp className="w-5 h-5" />
                                    <span>Helpful</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                    <ThumbsDown className="w-5 h-5" />
                                    <span>Not Helpful</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                                    <Share2 className="w-5 h-5" />
                                    <span>Share</span>
                                </button>
                            </div>

                            {/* Related Guide CTA */}
                            {video.relatedGuide && (
                                <Link
                                    href={video.relatedGuide}
                                    className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors group mb-8"
                                >
                                    <div className="w-12 h-12 bg-surf-DEFAULT/20 rounded-lg flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-surf-light" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-white group-hover:text-surf-light">
                                            Read the Step-by-Step Guide
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Prefer reading? Check out our written tutorial
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-surf-light" />
                                </Link>
                            )}

                            {/* Chapters */}
                            <div className="bg-gray-800 rounded-xl p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    Chapters
                                </h2>
                                <div className="space-y-2">
                                    {video.chapters.map((chapter, index) => (
                                        <button
                                            key={index}
                                            className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-700 transition-colors text-left group"
                                        >
                                            <span className="text-surf-light font-mono text-sm w-12">
                                                {chapter.time}
                                            </span>
                                            <span className="text-gray-300 group-hover:text-white flex-1">
                                                {chapter.title}
                                            </span>
                                            <Play className="w-4 h-4 text-gray-500 group-hover:text-surf-light opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar - Related Videos */}
                        <div className="md:w-80">
                            <h2 className="text-lg font-semibold text-white mb-4">
                                Related Videos
                            </h2>
                            <div className="space-y-4">
                                {video.relatedVideos.map(relatedSlug => {
                                    const related = videoTutorials[relatedSlug];
                                    if (!related) return null;

                                    return (
                                        <Link
                                            key={relatedSlug}
                                            href={`/help/videos/${relatedSlug}`}
                                            className="flex gap-4 group"
                                        >
                                            {/* Thumbnail */}
                                            <div className="w-40 flex-shrink-0 aspect-video bg-gray-700 rounded-lg overflow-hidden relative">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Play className="w-8 h-8 text-white/70 group-hover:text-white transition-colors" />
                                                </div>
                                                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                                                    {related.duration}
                                                </span>
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-white text-sm font-medium group-hover:text-surf-light line-clamp-2 mb-1">
                                                    {related.title}
                                                </h3>
                                                <span className="text-gray-500 text-xs">
                                                    {related.category}
                                                </span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="bg-gray-50">
                <Footer />
            </div>
        </main>
    );
}

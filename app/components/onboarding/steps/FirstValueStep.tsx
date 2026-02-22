'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Send,
    Upload,
    MessageSquare,
    CheckCircle,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { useOnboardingStore } from '@/lib/onboarding/store';

export default function FirstValueStep() {
    const {
        selectedServices,
        firstMessageSent,
        firstReceiptScanned,
        firstAIConversation,
        markFirstMessage,
        markFirstReceipt,
        markFirstAIConversation,
        nextStep,
    } = useOnboardingStore();

    const [activeTab, setActiveTab] = useState<string>(selectedServices[0] || 'whatsapp-assistant');
    const [isLoading, setIsLoading] = useState(false);

    // WhatsApp state
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('Hi! This is a test message from BotFlow.');

    // AI state
    const [aiInput, setAiInput] = useState('');
    const [aiResponse, setAiResponse] = useState('');

    const hasAchievedMilestone =
        firstMessageSent || firstReceiptScanned || firstAIConversation;

    const handleSendTestMessage = async () => {
        setIsLoading(true);
        // Simulate sending
        await new Promise((resolve) => setTimeout(resolve, 1500));
        markFirstMessage();
        setIsLoading(false);
    };

    const handleUploadReceipt = async () => {
        setIsLoading(true);
        // Simulate upload
        await new Promise((resolve) => setTimeout(resolve, 2000));
        markFirstReceipt();
        setIsLoading(false);
    };

    const handleAIChat = async () => {
        if (!aiInput.trim()) return;
        setIsLoading(true);
        // Simulate AI response
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setAiResponse(
            "Thanks for your message! I'm your AI Assistant. I can help you with customer inquiries, generate responses, and much more. What would you like to know?"
        );
        markFirstAIConversation();
        setIsLoading(false);
    };

    const renderServiceContent = () => {
        switch (activeTab) {
            case 'whatsapp-assistant':
                return (
                    <div className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Send a test message to see how your automated WhatsApp responses will work.
                        </p>
                        {!firstMessageSent ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={testPhone}
                                        onChange={(e) => setTestPhone(e.target.value)}
                                        placeholder="+27 82 xxx xxxx"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Test Message
                                    </label>
                                    <textarea
                                        value={testMessage}
                                        onChange={(e) => setTestMessage(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none resize-none"
                                    />
                                </div>
                                <button
                                    onClick={handleSendTestMessage}
                                    disabled={isLoading || !testPhone}
                                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                    Send Test Message
                                </button>
                            </>
                        ) : (
                            <div className="bg-green-50 rounded-xl p-6 text-center">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h4 className="font-bold text-green-800 mb-2">Message Sent!</h4>
                                <p className="text-green-700 text-sm">
                                    Check your WhatsApp for the test message. Your automation is working!
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'receipt-assistant':
                return (
                    <div className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Upload a receipt to see how our AI extracts all the details automatically.
                        </p>
                        {!firstReceiptScanned ? (
                            <div
                                onClick={handleUploadReceipt}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-surf hover:bg-surf/5 transition-all"
                            >
                                {isLoading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-12 h-12 text-surf animate-spin mb-3" />
                                        <span className="text-gray-600">Processing receipt...</span>
                                    </div>
                                ) : (
                                    <>
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="font-medium text-gray-700">
                                            Click to upload a receipt
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            or drag and drop an image
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="bg-green-50 rounded-xl p-6">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h4 className="font-bold text-green-800 mb-4 text-center">
                                    Receipt Processed!
                                </h4>
                                <div className="bg-white rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Merchant:</span>
                                        <span className="font-medium">Sample Store</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Date:</span>
                                        <span className="font-medium">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Amount:</span>
                                        <span className="font-bold text-dark-navy">R299.99</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'ai-assistant':
                return (
                    <div className="space-y-4">
                        <p className="text-gray-600 mb-4">
                            Have a conversation with your AI Assistant to see how it responds.
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 h-48 overflow-y-auto">
                            {aiResponse && (
                                <div className="flex gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-surf flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm">
                                        <p className="text-gray-700 text-sm">{aiResponse}</p>
                                    </div>
                                </div>
                            )}
                            {!aiResponse && !firstAIConversation && (
                                <p className="text-gray-400 text-center py-8">
                                    Start a conversation below
                                </p>
                            )}
                            {firstAIConversation && (
                                <div className="text-center py-4">
                                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <span className="text-green-600 font-medium">
                                        First conversation complete!
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={firstAIConversation}
                                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-surf focus:ring-2 focus:ring-surf/20 outline-none disabled:bg-gray-100"
                            />
                            <button
                                onClick={handleAIChat}
                                disabled={isLoading || !aiInput.trim() || firstAIConversation}
                                className="px-4 py-3 bg-surf hover:bg-surf-dark text-white rounded-xl disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl md:text-4xl font-bold text-dark-navy mb-4"
                >
                    Achieve Your First Win!
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-gray-600"
                >
                    Complete one action to see the magic in action
                </motion.p>
            </div>

            {/* Service Tabs */}
            {selectedServices.length > 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex gap-2 mb-6 overflow-x-auto"
                >
                    {selectedServices.map((service) => {
                        const isComplete =
                            (service === 'whatsapp-assistant' && firstMessageSent) ||
                            (service === 'receipt-assistant' && firstReceiptScanned) ||
                            (service === 'ai-assistant' && firstAIConversation);

                        return (
                            <button
                                key={service}
                                onClick={() => setActiveTab(service)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                                    activeTab === service
                                        ? 'bg-surf text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {service === 'whatsapp-assistant' && <MessageSquare className="w-4 h-4" />}
                                {service === 'receipt-assistant' && <Upload className="w-4 h-4" />}
                                {service === 'ai-assistant' && <Sparkles className="w-4 h-4" />}
                                {service.replace('-assistant', '')}
                                {isComplete && <CheckCircle className="w-4 h-4 text-green-400" />}
                            </button>
                        );
                    })}
                </motion.div>
            )}

            {/* Service Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8"
            >
                {renderServiceContent()}
            </motion.div>

            {/* Continue Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center"
            >
                <button
                    onClick={nextStep}
                    disabled={!hasAchievedMilestone}
                    className="px-10 py-4 bg-surf hover:bg-surf-dark text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 mx-auto group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {hasAchievedMilestone ? (
                        <>
                            Complete Setup
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    ) : (
                        'Complete an action above to continue'
                    )}
                </button>
            </motion.div>
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import {
    MessageSquare,
    X,
    Send,
    Minimize2,
    Maximize2,
    HelpCircle,
    ChevronRight,
    Loader2,
    Bot,
    User
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    suggestions?: string[];
}

// Quick reply suggestions based on context
const quickReplies = {
    initial: [
        'How do I connect WhatsApp?',
        'Help with billing',
        'Setup AI Assistant',
        'Talk to a human',
    ],
    whatsapp: [
        'QR code not scanning',
        'Messages not sending',
        'Coexistence mode help',
        'Back to main menu',
    ],
    billing: [
        'View my invoices',
        'Update payment method',
        'Cancel subscription',
        'Back to main menu',
    ],
    ai: [
        'Upload knowledge sources',
        'Improve AI accuracy',
        'Configure responses',
        'Back to main menu',
    ],
};

// Simulated bot responses
const botResponses: Record<string, { response: string; suggestions?: string[] }> = {
    'how do i connect whatsapp?': {
        response: 'To connect WhatsApp, go to your Dashboard and click on "WhatsApp Assistant", then select "Connect WhatsApp". You can choose QR Code scanning for instant setup. Would you like me to walk you through it?',
        suggestions: quickReplies.whatsapp,
    },
    'qr code not scanning': {
        response: 'If the QR code isn\'t scanning:\n\n1. Make sure your camera is clean and has good lighting\n2. Hold your phone steady about 6 inches away\n3. Try refreshing the QR code (it expires every 60 seconds)\n4. Ensure you\'re using "Linked Devices" in WhatsApp settings\n\nStill having trouble? I can connect you with our support team.',
        suggestions: ['Connect to support', 'Try again', 'Back to main menu'],
    },
    'help with billing': {
        response: 'I can help with billing questions! What would you like to know?',
        suggestions: quickReplies.billing,
    },
    'view my invoices': {
        response: 'You can find all your invoices in Settings > Billing > Billing History. From there, you can download PDF copies of any invoice. Would you like me to guide you there?',
        suggestions: ['Take me there', 'Other billing help', 'Back to main menu'],
    },
    'setup ai assistant': {
        response: 'Setting up the AI Assistant is quick! Here\'s what you\'ll do:\n\n1. Go to Dashboard > AI Assistant\n2. Click "Configure"\n3. Upload your business documents or FAQ\n4. Customize the AI personality\n5. Test and go live!\n\nWant step-by-step guidance?',
        suggestions: quickReplies.ai,
    },
    'talk to a human': {
        response: 'I\'ll connect you with our support team! You can:\n\n📧 Email: support@botflow.co.za (Response within 24h)\n💬 Live Chat: Available Mon-Fri 9AM-5PM SAST\n\nWould you like me to create a support ticket with your conversation history?',
        suggestions: ['Create ticket', 'Email support', 'Back to main menu'],
    },
    'back to main menu': {
        response: 'No problem! What else can I help you with today?',
        suggestions: quickReplies.initial,
    },
    default: {
        response: 'I\'m not sure I understand that completely. Let me suggest some topics I can help with, or you can talk to our support team.',
        suggestions: [...quickReplies.initial],
    },
};

export default function SupportChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hi! I\'m BotFlow\'s support assistant. How can I help you today?',
            timestamp: new Date(),
            suggestions: quickReplies.initial,
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Listen for custom event to open chatbot
    useEffect(() => {
        const handleOpenChatbot = () => {
            setIsOpen(true);
            setIsMinimized(false);
        };

        window.addEventListener('openSupportChatbot', handleOpenChatbot);
        return () => {
            window.removeEventListener('openSupportChatbot', handleOpenChatbot);
        };
    }, []);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen && !isMinimized) {
            inputRef.current?.focus();
        }
    }, [isOpen, isMinimized]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate bot thinking
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

        // Get bot response
        const normalizedInput = content.toLowerCase().trim();
        const responseData = botResponses[normalizedInput] || botResponses.default;

        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: responseData.response,
            timestamp: new Date(),
            suggestions: responseData.suggestions,
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleQuickReply = (reply: string) => {
        sendMessage(reply);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-surf-DEFAULT hover:bg-surf-dark text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 z-50"
                aria-label="Open support chat"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-6 right-6 z-50 transition-all ${
                isMinimized ? 'w-72' : 'w-96'
            }`}
        >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-surf-DEFAULT px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm">Support Assistant</h3>
                            <span className="text-white/70 text-xs flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full" />
                                Online
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsMinimized(!isMinimized)}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                            aria-label={isMinimized ? 'Expand chat' : 'Minimize chat'}
                        >
                            {isMinimized ? (
                                <Maximize2 className="w-4 h-4" />
                            ) : (
                                <Minimize2 className="w-4 h-4" />
                            )}
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded transition-colors"
                            aria-label="Close chat"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {!isMinimized && (
                    <>
                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map(message => (
                                <div key={message.id}>
                                    <div
                                        className={`flex gap-2 ${
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 bg-surf-light/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-4 h-4 text-surf-DEFAULT" />
                                            </div>
                                        )}
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                                                message.role === 'user'
                                                    ? 'bg-surf-DEFAULT text-white rounded-br-sm'
                                                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                                            }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-gray-600" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Quick Reply Suggestions */}
                                    {message.role === 'assistant' && message.suggestions && (
                                        <div className="mt-3 pl-10 flex flex-wrap gap-2">
                                            {message.suggestions.map((suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleQuickReply(suggestion)}
                                                    className="text-xs bg-white border border-gray-200 hover:border-surf-DEFAULT hover:text-surf-DEFAULT px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                                >
                                                    {suggestion}
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 bg-surf-light/20 rounded-full flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-surf-DEFAULT" />
                                    </div>
                                    <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-surf-light focus:border-transparent text-sm"
                                    disabled={isTyping}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="w-10 h-10 bg-surf-DEFAULT hover:bg-surf-dark disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors"
                                >
                                    {isTyping ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">
                                Powered by BotFlow AI
                            </p>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

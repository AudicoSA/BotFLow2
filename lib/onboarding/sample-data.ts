// Sample Data for Onboarding

export interface SampleMessage {
    id: string;
    type: 'incoming' | 'outgoing';
    content: string;
    timestamp: string;
    customerName?: string;
    customerPhone?: string;
}

export interface SampleReceipt {
    id: string;
    merchant: string;
    date: string;
    amount: number;
    category: string;
    items: { name: string; amount: number }[];
    imageUrl: string;
}

export interface SampleConversation {
    id: string;
    title: string;
    messages: { role: 'user' | 'assistant'; content: string }[];
    timestamp: string;
}

// Sample WhatsApp messages
export const SAMPLE_MESSAGES: SampleMessage[] = [
    {
        id: 'msg-1',
        type: 'incoming',
        content: 'Hi, do you have availability tomorrow at 2pm?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        customerName: 'Sarah M.',
        customerPhone: '+27 82 xxx xxxx',
    },
    {
        id: 'msg-2',
        type: 'outgoing',
        content: 'Hi Sarah! Yes, we have availability at 2pm tomorrow. Would you like me to book that slot for you?',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
    },
    {
        id: 'msg-3',
        type: 'incoming',
        content: 'Yes please!',
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        customerName: 'Sarah M.',
        customerPhone: '+27 82 xxx xxxx',
    },
    {
        id: 'msg-4',
        type: 'outgoing',
        content: 'Perfect! Your appointment is confirmed for tomorrow at 2pm. We\'ll send you a reminder an hour before. See you then!',
        timestamp: new Date(Date.now() - 3300000).toISOString(),
    },
    {
        id: 'msg-5',
        type: 'incoming',
        content: 'What are your prices for a haircut?',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        customerName: 'John D.',
        customerPhone: '+27 83 xxx xxxx',
    },
    {
        id: 'msg-6',
        type: 'outgoing',
        content: 'Hi John! Our haircut prices range from R150-R250 depending on the style. Would you like to book an appointment?',
        timestamp: new Date(Date.now() - 7100000).toISOString(),
    },
];

// Sample receipts
export const SAMPLE_RECEIPTS: SampleReceipt[] = [
    {
        id: 'receipt-1',
        merchant: 'Woolworths Food',
        date: new Date(Date.now() - 86400000).toISOString(),
        amount: 456.78,
        category: 'Groceries',
        items: [
            { name: 'Fresh Milk 2L', amount: 32.99 },
            { name: 'Bread (Brown)', amount: 18.99 },
            { name: 'Chicken Breast 1kg', amount: 89.99 },
            { name: 'Mixed Vegetables', amount: 45.99 },
            { name: 'Other items', amount: 268.82 },
        ],
        imageUrl: '/samples/receipt-woolworths.jpg',
    },
    {
        id: 'receipt-2',
        merchant: 'Shell Garage',
        date: new Date(Date.now() - 172800000).toISOString(),
        amount: 850.0,
        category: 'Fuel',
        items: [{ name: 'Unleaded 95', amount: 850.0 }],
        imageUrl: '/samples/receipt-shell.jpg',
    },
    {
        id: 'receipt-3',
        merchant: 'Takealot',
        date: new Date(Date.now() - 259200000).toISOString(),
        amount: 1299.0,
        category: 'Office Supplies',
        items: [
            { name: 'Wireless Keyboard', amount: 599.0 },
            { name: 'USB Mouse', amount: 299.0 },
            { name: 'Desk Organizer', amount: 401.0 },
        ],
        imageUrl: '/samples/receipt-takealot.jpg',
    },
];

// Sample AI conversations
export const SAMPLE_CONVERSATIONS: SampleConversation[] = [
    {
        id: 'conv-1',
        title: 'Product Inquiry',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        messages: [
            {
                role: 'user',
                content: 'What services do you offer?',
            },
            {
                role: 'assistant',
                content: 'We offer three main services:\n\n1. **AI Assistant** - GPT-4 powered conversations\n2. **WhatsApp Assistant** - Automate your customer communication\n3. **Receipt Assistant** - Scan and track expenses\n\nWould you like more details about any of these?',
            },
            {
                role: 'user',
                content: 'Tell me more about WhatsApp Assistant',
            },
            {
                role: 'assistant',
                content: 'WhatsApp Assistant helps you automate your customer communication:\n\n- **Quick Setup**: Connect with a QR code in 5 minutes\n- **24/7 Responses**: Answer customers even when you\'re sleeping\n- **Smart Booking**: Let customers book appointments automatically\n- **Message Templates**: Pre-built responses for common questions\n\nIt costs R499/month and includes 5,000 messages. Would you like to start a free trial?',
            },
        ],
    },
    {
        id: 'conv-2',
        title: 'Pricing Question',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        messages: [
            {
                role: 'user',
                content: 'How much does the full bundle cost?',
            },
            {
                role: 'assistant',
                content: 'Great question! The Full Bundle includes all three services:\n\n- AI Assistant (R499)\n- WhatsApp Assistant (R499)\n- Receipt Assistant (R99)\n\n**Bundle Price: R899/month** (You save R198!)\n\nPlus, you get priority support and a dedicated account manager. Would you like to sign up?',
            },
        ],
    },
];

// Sample message templates for WhatsApp
export const SAMPLE_TEMPLATES = [
    {
        id: 'template-1',
        name: 'Welcome Message',
        content:
            'Hi {{customer_name}}! Welcome to {{business_name}}. How can we help you today?',
        category: 'greeting',
    },
    {
        id: 'template-2',
        name: 'Appointment Confirmation',
        content:
            'Your appointment is confirmed for {{date}} at {{time}}. We\'ll send you a reminder 1 hour before. Reply CANCEL to cancel.',
        category: 'booking',
    },
    {
        id: 'template-3',
        name: 'Order Update',
        content:
            'Good news! Your order #{{order_id}} has been shipped. Track it here: {{tracking_link}}',
        category: 'notification',
    },
    {
        id: 'template-4',
        name: 'Business Hours',
        content:
            'Our business hours are:\n- Monday to Friday: 9am - 5pm\n- Saturday: 9am - 1pm\n- Sunday: Closed\n\nWould you like to book an appointment?',
        category: 'info',
    },
];

// Pre-populate function
export function getInitialSampleData(services: string[]) {
    const data: {
        messages?: SampleMessage[];
        receipts?: SampleReceipt[];
        conversations?: SampleConversation[];
        templates?: typeof SAMPLE_TEMPLATES;
    } = {};

    if (services.includes('whatsapp-assistant')) {
        data.messages = SAMPLE_MESSAGES;
        data.templates = SAMPLE_TEMPLATES;
    }

    if (services.includes('receipt-assistant')) {
        data.receipts = SAMPLE_RECEIPTS;
    }

    if (services.includes('ai-assistant')) {
        data.conversations = SAMPLE_CONVERSATIONS;
    }

    return data;
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnalyticsProvider from "./components/analytics/AnalyticsProvider";
import { VercelAnalytics } from "./components/analytics/VercelAnalytics";
import SupportChatbot from "./components/help/SupportChatbot";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "BotFlow - AI Assistant, WhatsApp & Receipt Automation for SA Businesses",
    description: "Transform your business with BotFlow's AI Assistant, WhatsApp automation, and Receipt processing. Built for South African businesses. Start your free trial today.",
    keywords: ["AI Assistant", "WhatsApp automation", "Receipt OCR", "WhatsApp Business API", "South Africa", "business automation", "AI chatbot"],
    authors: [{ name: "BotFlow" }],
    openGraph: {
        title: "BotFlow - AI Assistant, WhatsApp & Receipt Automation",
        description: "Transform your business with intelligent automation. AI Assistant, WhatsApp automation, and Receipt processing for South African businesses.",
        url: "https://botflow.co.za",
        siteName: "BotFlow",
        locale: "en_ZA",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "BotFlow - AI Assistant, WhatsApp & Receipt Automation",
        description: "Transform your business with intelligent automation. Built for South African businesses.",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </head>
            <body className={`${inter.variable} antialiased`}>
                <AnalyticsProvider>
                    {children}
                    <VercelAnalytics />
                    <SupportChatbot />
                </AnalyticsProvider>
            </body>
        </html>
    );
}

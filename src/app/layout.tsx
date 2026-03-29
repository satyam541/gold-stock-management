import type { Metadata } from "next";
import { Outfit, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import NavigationProgress from "@/components/ui/NavigationProgress";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";
import AppShell from "@/components/layout/AppShell";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    weight: ["600", "700"],
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    weight: ["400", "500"],
});

export const metadata: Metadata = {
    title: "AssetFlow - Stock & Asset Management",
    description: "Comprehensive stock, gold, and cash asset management platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${outfit.variable} ${playfair.variable} ${jetbrains.variable} antialiased`}
            >
                <AuthProvider>
                    <NavigationProgress />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 3000,
                            style: {
                                background: "hsl(var(--card))",
                                color: "hsl(var(--card-foreground))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "0.75rem",
                                fontSize: "0.875rem",
                                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            },
                            success: {
                                iconTheme: { primary: "#22c55e", secondary: "#fff" },
                            },
                            error: {
                                iconTheme: { primary: "#ef4444", secondary: "#fff" },
                            },
                        }}
                    />
                    <AppShell>{children}</AppShell>
                </AuthProvider>
            </body>
        </html>
    );
}

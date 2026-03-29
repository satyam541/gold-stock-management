import type { Metadata } from "next";
import { Outfit, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import NavigationProgress from "@/components/ui/NavigationProgress";
import { Toaster } from "react-hot-toast";

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
                <div className="flex min-h-screen">
                    <Sidebar />
                    <div className="flex flex-1 flex-col pl-64">
                        <Header />
                        <main className="flex-1 p-6">{children}</main>
                    </div>
                </div>
            </body>
        </html>
    );
}

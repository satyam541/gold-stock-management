"use client";

import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const authPages = ["/login", "/forgot-password", "/reset-password"];

export default function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { status } = useSession();

    const isAuthPage = authPages.some((p) => pathname.startsWith(p));

    // On auth pages or when not authenticated, render children directly (no sidebar/header)
    if (isAuthPage || status === "unauthenticated") {
        return <>{children}</>;
    }

    // Loading state
    if (status === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col pl-64">
                <Header />
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}

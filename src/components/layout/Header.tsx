"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, { title: string; description: string }> = {
    "/": { title: "Dashboard", description: "Overview of your assets & finances" },
    "/cash": { title: "Cash Management", description: "Track cash flow and transactions" },
    "/gold": { title: "Gold Management", description: "Monitor gold inventory and trades" },
    "/persons": { title: "Persons", description: "Manage contacts and counterparties" },
    "/transactions": { title: "Transactions", description: "Full transaction history" },
    "/reports": { title: "Reports & Analytics", description: "Charts and financial insights" },
    "/settings": { title: "Settings", description: "Configure application settings" },
    "/users": { title: "User Management", description: "Manage system users and access" },
};

export default function Header() {
    const pathname = usePathname();
    const isBillPage = pathname.startsWith("/bill");

    // Match current page
    const currentPage = isBillPage
        ? { title: "Bill / Receipt", description: "Printable transaction receipt" }
        : pageTitles[pathname] || pageTitles["/"];

    if (isBillPage) return null;

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
            <div>
                <h2 className="font-display text-lg font-semibold leading-tight">
                    {currentPage.title}
                </h2>
                <p className="text-xs text-muted-foreground">{currentPage.description}</p>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative hidden sm:flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Quick search..."
                        className="h-8 w-48 rounded-lg border border-border bg-muted/50 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
                    />
                </div>
                <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2 rounded-full bg-primary" />
                </button>
            </div>
        </header>
    );
}

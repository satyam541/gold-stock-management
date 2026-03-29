"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Banknote,
    Gem,
    Users,
    ArrowLeftRight,
    BarChart3,
    FileText,
    Settings,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/cash", icon: Banknote, label: "Cash Management" },
    { href: "/gold", icon: Gem, label: "Gold Management" },
    { href: "/persons", icon: Users, label: "Persons" },
    { href: "/transactions", icon: ArrowLeftRight, label: "Transactions" },
    { href: "/reports", icon: BarChart3, label: "Reports" },
    { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 border-b border-border px-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg gold-gradient shadow-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="font-display text-base font-bold leading-tight gold-text">
                        AssetFlow
                    </h1>
                    <p className="text-[10px] text-muted-foreground">Management Suite</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Main Menu
                </p>
                {navItems.map((item) => {
                    const isActive =
                        item.href === "/"
                            ? pathname === "/"
                            : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn("sidebar-link", isActive && "active")}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="border-t border-border p-4">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full gold-gradient text-xs font-bold text-white">
                        A
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">Admin</p>
                        <p className="truncate text-xs text-muted-foreground">
                            Asset Manager
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const prevPathRef = useRef(pathname);

    const start = useCallback(() => {
        setProgress(0);
        setVisible(true);

        // Quickly ramp to ~80%, then slow down
        let p = 0;
        const tick = () => {
            p += Math.max(1, (85 - p) * 0.08);
            if (p >= 85) p = 85;
            setProgress(p);
            if (p < 85) {
                timerRef.current = setTimeout(tick, 60);
            }
        };
        timerRef.current = setTimeout(tick, 60);
    }, []);

    const done = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setProgress(100);
        setTimeout(() => {
            setVisible(false);
            setProgress(0);
        }, 300);
    }, []);

    // Listen for click on any <a> inside sidebar
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("http") || href.startsWith("#")) return;
            // Only trigger if navigating to a different path
            if (href !== window.location.pathname) {
                start();
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [start]);

    // Complete when pathname changes
    useEffect(() => {
        if (pathname !== prevPathRef.current) {
            done();
            prevPathRef.current = pathname;
        }
    }, [pathname, done]);

    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 top-0 z-[100] h-[3px]">
            <div
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-200 ease-out"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}

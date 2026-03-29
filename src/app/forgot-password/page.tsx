"use client";

import { useState } from "react";
import { TrendingUp, ArrowLeft, Loader2, Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || "Something went wrong");
                return;
            }

            setSent(true);
        } catch {
            setError("Failed to send reset email. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl gold-gradient shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-display text-2xl font-bold gold-text">AssetFlow</h1>
                        <p className="text-xs text-muted-foreground">Management Suite</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                    {sent ? (
                        <div className="text-center space-y-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mx-auto">
                                <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h2 className="font-display text-xl font-semibold">Check your email</h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link. Please check your inbox and spam folder.
                                </p>
                            </div>
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline mt-4"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="mb-6">
                                <h2 className="font-display text-xl font-semibold">Forgot Password</h2>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Enter your email address and we&apos;ll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-xs font-medium text-destructive">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 rounded-lg gold-gradient text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>

                            <div className="mt-4 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <ArrowLeft className="h-3 w-3" />
                                    Back to Sign In
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

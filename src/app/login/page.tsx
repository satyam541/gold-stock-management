"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { TrendingUp, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password) {
            setError("Email and password are required");
            return;
        }

        setLoading(true);
        try {
            const result = await signIn("credentials", {
                email: email.trim(),
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("An unexpected error occurred");
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

                {/* Login Card */}
                <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
                    <div className="mb-6">
                        <h2 className="font-display text-xl font-semibold">Welcome back</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            Sign in to your account to continue
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
                                placeholder="admin@assetflow.pk"
                                className="w-full h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                autoComplete="email"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="w-full h-10 rounded-lg border border-border bg-muted/30 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
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
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link
                            href="/forgot-password"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    &copy; {new Date().getFullYear()} AssetFlow. All rights reserved.
                </p>
            </div>
        </div>
    );
}

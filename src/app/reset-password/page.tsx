"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TrendingUp, ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password || !confirmPassword) {
            setError("Both fields are required");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!token) {
            setError("Invalid reset link. Please request a new one.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Something went wrong");
                return;
            }

            setSuccess(true);
        } catch {
            setError("Failed to reset password. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center space-y-4">
                <p className="text-sm text-destructive">Invalid reset link. Please request a new password reset.</p>
                <Link
                    href="/forgot-password"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Request new reset link
                </Link>
            </div>
        );
    }

    return success ? (
        <div className="text-center space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20 mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
                <h2 className="font-display text-xl font-semibold">Password Reset!</h2>
                <p className="text-sm text-muted-foreground mt-2">
                    Your password has been successfully reset. You can now sign in with your new password.
                </p>
            </div>
            <Link
                href="/login"
                className="inline-flex items-center gap-2 h-10 rounded-lg gold-gradient text-white px-6 text-sm font-medium hover:opacity-90 transition-opacity"
            >
                Go to Sign In
            </Link>
        </div>
    ) : (
        <>
            <div className="mb-6">
                <h2 className="font-display text-xl font-semibold">Reset Password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Enter your new password below.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full h-10 rounded-lg border border-border bg-muted/30 px-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Confirm Password
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full h-10 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                            Resetting...
                        </>
                    ) : (
                        "Reset Password"
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
    );
}

export default function ResetPasswordPage() {
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
                    <Suspense fallback={<div className="text-center text-sm text-muted-foreground">Loading...</div>}>
                        <ResetPasswordForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

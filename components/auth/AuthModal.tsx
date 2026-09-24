"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const GOOGLE_CLIENT = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GITHUB_CLIENT = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<"signin" | "signup">("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error: authError } = await authClient.signUp.email({
            email,
            password,
            name,
        });

        setLoading(false);

        if (authError) {
            setError(authError.message || "Sign up failed");
            return;
        }

        setEmail("");
        setPassword("");
        setName("");
        onSuccess?.();
        onClose();
    };

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { error: authError } = await authClient.signIn.email({
            email,
            password,
        });

        setLoading(false);

        if (authError) {
            setError(authError.message || "Invalid username or password");
            return;
        }

        setEmail("");
        setPassword("");
        onSuccess?.();
        onClose();
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");

        try {
            await authClient.signIn.social({
                provider: "google",
                callbackURL: window.location.href,
            });
        } catch (err) {
            setLoading(false);
            setError("Google sign in failed. Please try again.");
        }
    };

    const handleGithubSignIn = async () => {
        setLoading(true);
        setError("");

        try {
            await authClient.signIn.social({
                provider: "github",
                callbackURL: window.location.href,
            });
        } catch (err) {
            setLoading(false);
            setError("GitHub sign in failed. Please try again.");
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-lg shadow-xl z-50">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                            {mode === "signin" ? "Sign In" : "Create Account"}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form
                        onSubmit={mode === "signin" ? handleSignIn : handleSignUp}
                        className="space-y-4"
                    >
                        {mode === "signup" && (
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 disabled:opacity-50"
                        >
                            {loading
                                ? "Loading..."
                                : mode === "signin"
                                    ? "Sign In"
                                    : "Create Account"}
                        </button>
                    </form>

                    {/* Social Providers */}
                    {(GOOGLE_CLIENT || GITHUB_CLIENT) && (
                        <div className="mt-6">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white text-slate-600">Or continue with</span>
                                </div>
                            </div>

                            <div className={`grid ${(GOOGLE_CLIENT && GITHUB_CLIENT) ? 'grid-cols-2' : ''} gap-3`}>
                                {GOOGLE_CLIENT && (
                                    <button
                                        type="button"
                                        onClick={handleGoogleSignIn}
                                        disabled={loading}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md font-medium hover:bg-slate-50 disabled:opacity-50 text-sm"
                                    >
                                        Google
                                    </button>
                                )}
                                {GITHUB_CLIENT && (
                                    <button
                                        type="button"
                                        onClick={handleGithubSignIn}
                                        disabled={loading}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-md font-medium hover:bg-slate-50 disabled:opacity-50 text-sm"
                                    >
                                        GitHub
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Toggle Mode */}
                    <div className="mt-6 text-center text-sm text-slate-600">
                        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => {
                                setMode(mode === "signin" ? "signup" : "signin");
                                setError("");
                            }}
                            className="font-medium text-orange-600 hover:text-orange-700"
                        >
                            {mode === "signin" ? "Sign up" : "Sign in"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

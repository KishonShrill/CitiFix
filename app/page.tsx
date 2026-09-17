"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Home() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const signUp = async () => {
        setLoading(true);
        setMessage("");

        const { data, error } = await authClient.signUp.email({
            email,
            password,
            name,
        });

        setLoading(false);

        if (error) {
            setMessage(error.message ?? "Sign up failed");
            return;
        }

        setMessage(`Signed up as ${data?.user?.email} `);
    };

    const signIn = async () => {
        setLoading(true);
        setMessage("");

        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });

        setLoading(false);

        if (error) {
            setMessage(error.message ?? "Sign in failed");
            return;
        }

        setMessage(`Signed in as ${data?.user?.email} `);
    };

    const signOut = async () => {
        setLoading(true);
        setMessage("");

        const { error } = await authClient.signOut();

        setLoading(false);

        if (error) {
            setMessage(error.message ?? "Sign out failed");
            return;
        }

        setMessage("Signed out successfully");
    };

    return (
        <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
            <section className="mx-auto flex max-w-xl flex-col gap-8">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">
                        Better Auth Test
                    </p>

                    <h1 className="mt-2 text-4xl font-semibold">
                        Authentication
                    </h1>

                    <p className="mt-3 text-slate-600">
                        Test sign up, sign in, and sign out.
                    </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1 block text-sm font-medium"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-orange-500"
                                placeholder="CJ"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-orange-500"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-sm font-medium"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-orange-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={signUp}
                                disabled={loading}
                                className="rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
                            >
                                Sign Up
                            </button>

                            <button
                                type="button"
                                onClick={signIn}
                                disabled={loading}
                                className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                            >
                                Sign In
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={signOut}
                            disabled={loading}
                            className="rounded-md border border-slate-300 px-4 py-2 font-medium hover:bg-slate-100 disabled:opacity-50"
                        >
                            Sign Out
                        </button>

                        {message && (
                            <div className="rounded-md bg-slate-100 p-3 text-sm">
                                {message}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </main>
    );
}

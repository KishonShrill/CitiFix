"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthTestPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function checkApi() {
        setLoading(true);

        try {
            const response = await fetch("/api/v1/me", {
                credentials: "include",
            });

            const data = await response.json();

            setResult({
                status: response.status,
                data,
            });
        } catch (error) {
            setResult({
                error: String(error),
            });
        } finally {
            setLoading(false);
        }
    }

    async function signIn() {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/auth-test",
        });
    }

    async function signOut() {
        await authClient.signOut();
        setResult(null);
    }

    return (
        <main style={{ padding: "2rem" }}>
            <h1>Authentication Test</h1>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button onClick={signIn}>
                    Sign in with Google
                </button>

                <button onClick={checkApi} disabled={loading}>
                    {loading ? "Checking..." : "Test /api/me"}
                </button>

                <button onClick={signOut}>
                    Sign out
                </button>
            </div>

            {result && (
                <pre
                    style={{
                        marginTop: "2rem",
                        padding: "1rem",
                        background: "#f5f5f5",
                        overflow: "auto",
                    }}
                >
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </main>
    );
}

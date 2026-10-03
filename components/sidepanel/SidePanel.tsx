"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    X,
    User as UserIcon,
    Shield,
    FileText,
    LogOut,
    Plus,
    ExternalLink,
    Mail,
    Sparkles,
    ChevronRight,
    Key,
    Lock,
    Check,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/utils/cn";
import { toast } from "sonner";

interface User {
    id: string;
    name: string | null;
    email: string;
    role?: string;
    status?: string;
    createdAt?: string | Date;
}

interface SidePanelProps {
    isOpen: boolean;
    onClose: () => void;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    user: User | null;
    onMyReportsClick?: () => void;
    onAdminClick?: () => void;
    onReportIssueClick?: () => void;
}

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
        </svg>
    );
}

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
        </svg>
    );
}

export function SidePanel({
    isOpen,
    onClose,
    activeTab = "profile",
    onTabChange,
    user,
    onMyReportsClick,
    onAdminClick,
    onReportIssueClick,
}: SidePanelProps) {
    const [currentTab, setCurrentTab] = useState(activeTab);
    const [isSigningOut, setIsSigningOut] = useState(false);

    // Linked accounts state
    const [accounts, setAccounts] = useState<Array<{ id: string; providerId: string; accountId: string }>>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

    // Set password state
    const [isSettingPassword, setIsSettingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    // Social linking loading state
    const [linkingProvider, setLinkingProvider] = useState<string | null>(null);
    const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);

    useEffect(() => {
        setCurrentTab(activeTab);
    }, [activeTab]);

    const fetchAccounts = async () => {
        if (!user) return;
        setIsLoadingAccounts(true);
        try {
            const res = await authClient.listAccounts();
            if (res?.data) {
                setAccounts(res.data as any);
            }
        } catch (err) {
            console.error("Failed to load linked accounts:", err);
        } finally {
            setIsLoadingAccounts(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAccounts();
        }
    }, [user]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await authClient.signOut();
            toast.success("Signed out successfully");
            onClose();
            window.location.reload();
        } catch (err: any) {
            toast.error(err?.message || "Failed to sign out");
            setIsSigningOut(false);
        }
    };

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("Passwords do not match.");
            return;
        }

        setIsSubmittingPassword(true);
        try {
            const res = await fetch("/api/v1/me/password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ newPassword }),
            });
            const data = await res.json();

            if (!res.ok) {
                setPasswordError(data?.error?.message || "Failed to set password");
                return;
            }

            toast.success("Password created! You can now sign in with your email and password.");
            setNewPassword("");
            setConfirmPassword("");
            setIsSettingPassword(false);
            await fetchAccounts();
        } catch (err: any) {
            setPasswordError(err?.message || "Failed to set password");
        } finally {
            setIsSubmittingPassword(false);
        }
    };

    const handleLinkSocial = async (provider: "google" | "github") => {
        setLinkingProvider(provider);
        try {
            await authClient.linkSocial({
                provider,
                callbackURL: window.location.href,
            });
        } catch (err: any) {
            toast.error(err?.message || `Failed to connect ${provider}`);
            setLinkingProvider(null);
        }
    };

    const handleUnlink = async (providerId: string, providerName: string) => {
        if (accounts.length <= 1) {
            toast.error("You cannot unlink your only login method.");
            return;
        }
        const targetAccount = accounts.find((a) => a.providerId === providerId);
        if (!targetAccount) {
            toast.error(`No linked ${providerName} account found.`);
            return;
        }

        const confirmed = window.confirm(`Are you sure you want to unlink ${providerName}?`);
        if (!confirmed) return;

        setUnlinkingProvider(providerId);
        try {
            const res = await authClient.unlinkAccount({
                accountId: targetAccount.id,
            });
            if (res.error) {
                toast.error(res.error.message || `Failed to unlink ${providerName}`);
            } else {
                toast.success(`${providerName} unlinked successfully`);
                await fetchAccounts();
            }
        } catch (err: any) {
            toast.error(err?.message || `Failed to unlink ${providerName}`);
        } finally {
            setUnlinkingProvider(null);
        }
    };

    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "moderator" ? "Moderator" : "Citizen Reporter";

    const hasPassword = accounts.some(
        (acc) => acc.providerId === "credential" || acc.providerId === "email"
    );
    const hasGoogle = accounts.some((acc) => acc.providerId === "google");
    const hasGitHub = accounts.some((acc) => acc.providerId === "github");

    const tabs = [
        { id: "profile", label: "Profile", icon: UserIcon },
    ];

    return (
        <>
            {/* Mobile Backdrop Overlay (only on small screens so map remains accessible/visible on desktop) */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 md:hidden transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Right Sidepanel (400px width overlaying map) */}
            <aside
                aria-label="Side Panel"
                className={cn(
                    "fixed top-0 right-0 h-full w-full sm:w-[400px] z-50 bg-white shadow-2xl border-l border-slate-200 flex flex-col transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
                )}
            >
                <div
                    className="max-sm:hidden absolute -left-5 top-1/2 -translate-y-1/2 flex items-center w-5 h-15 bg-white hover:bg-slate-200 cursor-pointer rounded-l-xl pointer-events-auto"
                    onClick={onClose}
                >
                    <ChevronRight className={cn(
                        "transition-transform duration-500",
                        isOpen ? "rotate-180" : "rotate-0")} />
                </div>

                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
                            <Sparkles size={16} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-slate-900 leading-tight">
                                User Account
                            </h2>
                            <p className="text-xs text-slate-500">Iligan City Civic Services</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        title="Close panel (Esc)"
                        className="cursor-pointer p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tabs Bar */}
                <div className="px-5 border-b border-slate-100 bg-white flex items-center gap-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = currentTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => {
                                    setCurrentTab(tab.id);
                                    onTabChange?.(tab.id);
                                }}
                                className={cn(
                                    "py-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 cursor-pointer transition-colors",
                                    isActive
                                        ? "border-orange-600 text-orange-600"
                                        : "border-transparent text-slate-500 hover:text-slate-700"
                                )}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/40">
                    {currentTab === "profile" && (
                        <div className="space-y-5">
                            {/* User Profile Card */}
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="relative mb-3">
                                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-orange-50">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
                                </div>

                                {/* Name & Email */}
                                <h3 className="text-lg font-bold text-slate-900">
                                    {user?.name || "Civic Contributor"}
                                </h3>
                                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5 break-all">
                                    <Mail size={13} className="shrink-0 text-slate-400" />
                                    <span>{user?.email || "No email"}</span>
                                </p>

                                {/* Role Badge */}
                                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                                    {isAdmin ? <Shield size={13} className="text-orange-600" /> : <UserIcon size={13} className="text-orange-600" />}
                                    <span>{roleLabel}</span>
                                </div>
                            </div>

                            {/* Account Security & Connected Logins */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Account & Security
                                    </h4>
                                    {isLoadingAccounts && (
                                        <Loader2 size={12} className="text-slate-400 animate-spin" />
                                    )}
                                </div>

                                {/* Password Setup / Status */}
                                {!isLoadingAccounts && (
                                    !hasPassword ? (
                                        <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Key size={16} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="text-sm font-semibold text-slate-900">Email & Password</p>
                                                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                                                            No Password
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                                        You signed in via social OAuth. Set a password to also sign in directly with your email.
                                                    </p>
                                                </div>
                                            </div>

                                            {!isSettingPassword ? (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setIsSettingPassword(true);
                                                        setPasswordError("");
                                                    }}
                                                    className="cursor-pointer w-full py-2 px-3 text-xs font-semibold text-orange-700 bg-white hover:bg-orange-100/50 border border-orange-200 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                                                >
                                                    <Lock size={13} />
                                                    <span>Set Up Password</span>
                                                </button>
                                            ) : (
                                                <form onSubmit={handleSetPassword} className="space-y-2.5 pt-1">
                                                    {passwordError && (
                                                        <div className="p-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
                                                            <AlertCircle size={13} className="shrink-0" />
                                                            <span>{passwordError}</span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                            New Password (min 8 chars)
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type={showPassword ? "text" : "password"}
                                                                value={newPassword}
                                                                onChange={(e) => setNewPassword(e.target.value)}
                                                                placeholder="Enter strong password"
                                                                required
                                                                minLength={8}
                                                                className="w-full px-3 py-1.5 pr-8 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                            >
                                                                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                            Confirm Password
                                                        </label>
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="Re-enter password"
                                                            required
                                                            minLength={8}
                                                            className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                                        />
                                                    </div>
                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIsSettingPassword(false);
                                                                setNewPassword("");
                                                                setConfirmPassword("");
                                                                setPasswordError("");
                                                            }}
                                                            disabled={isSubmittingPassword}
                                                            className="cursor-pointer flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            disabled={isSubmittingPassword}
                                                            className="cursor-pointer flex-1 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                                                        >
                                                            {isSubmittingPassword ? (
                                                                <>
                                                                    <Loader2 size={12} className="animate-spin" />
                                                                    <span>Saving...</span>
                                                                </>
                                                            ) : (
                                                                <span>Save Password</span>
                                                            )}
                                                        </button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                    <Key size={14} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-800">Email & Password</p>
                                                    <p className="text-[11px] text-slate-500">Sign-in enabled with password</p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                <Check size={11} />
                                                <span>Active</span>
                                            </span>
                                        </div>
                                    )
                                )}

                                {/* Connected Social Accounts */}
                                {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                                    <div className="space-y-2 pt-1 border-t border-slate-100">
                                        <p className="text-[11px] font-semibold text-slate-500">Connected Accounts</p>

                                        {/* Google */}
                                        {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                                            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                                                        <GoogleIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-800">Google</p>
                                                        <p className="text-[10px] text-slate-500">
                                                            {hasGoogle ? "Linked to account" : "Not connected"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {hasGoogle ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                            <Check size={11} />
                                                            <span>Connected</span>
                                                        </span>
                                                        {accounts.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUnlink("google", "Google")}
                                                                disabled={unlinkingProvider === "google"}
                                                                className="cursor-pointer text-[11px] text-slate-400 hover:text-red-600 transition-colors px-1"
                                                                title="Unlink Google"
                                                            >
                                                                {unlinkingProvider === "google" ? (
                                                                    <Loader2 size={11} className="animate-spin" />
                                                                ) : (
                                                                    "Unlink"
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLinkSocial("google")}
                                                        disabled={linkingProvider === "google"}
                                                        className="cursor-pointer text-xs font-semibold px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {linkingProvider === "google" ? (
                                                            <>
                                                                <Loader2 size={11} className="animate-spin" />
                                                                <span>Linking...</span>
                                                            </>
                                                        ) : (
                                                            <span>Link</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* GitHub */}
                                        {process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID && (
                                            <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
                                                        <GithubIcon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-800">GitHub</p>
                                                        <p className="text-[10px] text-slate-500">
                                                            {hasGitHub ? "Linked to account" : "Not connected"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {hasGitHub ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                                            <Check size={11} />
                                                            <span>Connected</span>
                                                        </span>
                                                        {accounts.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleUnlink("github", "GitHub")}
                                                                disabled={unlinkingProvider === "github"}
                                                                className="cursor-pointer text-[11px] text-slate-400 hover:text-red-600 transition-colors px-1"
                                                                title="Unlink GitHub"
                                                            >
                                                                {unlinkingProvider === "github" ? (
                                                                    <Loader2 size={11} className="animate-spin" />
                                                                ) : (
                                                                    "Unlink"
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLinkSocial("github")}
                                                        disabled={linkingProvider === "github"}
                                                        className="cursor-pointer text-xs font-semibold px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {linkingProvider === "github" ? (
                                                            <>
                                                                <Loader2 size={11} className="animate-spin" />
                                                                <span>Linking...</span>
                                                            </>
                                                        ) : (
                                                            <span>Link</span>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Quick Action Navigation */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                                {onReportIssueClick && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onReportIssueClick();
                                        }}
                                        className="cursor-pointer w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                                <Plus size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                                                    Report New Issue
                                                </p>
                                                <p className="text-xs text-slate-500">Pin a problem in Iligan City</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                )}

                                {onMyReportsClick && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onMyReportsClick();
                                        }}
                                        className="cursor-pointer w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                                <FileText size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                                    My Reports
                                                </p>
                                                <p className="text-xs text-slate-500">View status of submitted reports</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                )}

                                {isAdmin && onAdminClick && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            onClose();
                                            onAdminClick();
                                        }}
                                        className="cursor-pointer w-full px-4 py-3 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                                <Shield size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-purple-700 group-hover:text-purple-800 transition-colors">
                                                    Moderation Queue
                                                </p>
                                                <p className="text-xs text-slate-500">Review & verify civic reports</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
                                    </button>
                                )}
                            </div>

                            {/* Legal & Policy Links */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2.5">
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                                    Legal & Policies
                                </p>
                                <div className="flex flex-col gap-1">
                                    <Link
                                        href="/privacy"
                                        onClick={onClose}
                                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-slate-400" />
                                            <span>Privacy Policy</span>
                                        </div>
                                        <ExternalLink size={12} className="text-slate-400" />
                                    </Link>
                                    <Link
                                        href="/terms"
                                        onClick={onClose}
                                        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-slate-400" />
                                            <span>Terms of Service</span>
                                        </div>
                                        <ExternalLink size={12} className="text-slate-400" />
                                    </Link>
                                </div>
                            </div>

                            {/* Sign Out Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={handleSignOut}
                                    disabled={isSigningOut}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2 py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl text-sm border border-red-200/80 transition-colors disabled:opacity-50"
                                >
                                    <LogOut size={16} />
                                    <span>{isSigningOut ? "Signing Out..." : "Sign Out"}</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}

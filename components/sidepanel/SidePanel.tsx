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

    useEffect(() => {
        setCurrentTab(activeTab);
    }, [activeTab]);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                setIsSidePanelOpen(false);
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

    const isAdmin = user?.role === "admin" || user?.role === "moderator";
    const roleLabel = user?.role === "admin" ? "Administrator" : user?.role === "moderator" ? "Moderator" : "Citizen Reporter";

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
                    className="max-sm:hidden absolute -left-5 top-1/2 -translate-y-1/2 flex items-center w-5 h-15 bg-white rounded-l-xl pointer-events-auto"
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

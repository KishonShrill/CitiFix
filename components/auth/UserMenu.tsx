"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LogOut, Shield, FileText } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface User {
    id: string;
    name: string | null;
    email: string;
    role?: string;
}

export interface UserMenuProps {
    user: User | null;
    onMyReportsClick?: () => void;
    onAdminClick?: () => void;
}

export function UserMenu({ user, onMyReportsClick, onAdminClick }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = async () => {
        await authClient.signOut();
        setIsOpen(false);
        window.location.reload();
    };

    if (!user) {
        return null;
    }

    const isAdmin = user.role === "admin" || user.role === "moderator";

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer text-sm flex items-center gap-2 px-3 py-1 bg-white text-slate-700 hover:bg-slate-100 rounded-lg shadow-lg"
            >
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                {user.name}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg">
                    <div className="px-4 py-3 border-b border-slate-200">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-sm text-slate-600">{user.email}</p>
                    </div>

                    <button
                        onClick={() => {
                            onMyReportsClick?.();
                            setIsOpen(false);
                        }}
                        className="cursor-pointer w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm"
                    >
                        My Reports
                    </button>

                    {isAdmin && (
                        <button
                            onClick={() => {
                                onAdminClick?.();
                                setIsOpen(false);
                            }}
                            className="cursor-pointer w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 text-sm font-medium border-t border-slate-200 text-orange-600"
                        >
                            Moderation Queue
                        </button>
                    )}

                    <div className="border-t border-slate-200 py-1">
                        <Link
                            href="/privacy"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-1.5 text-slate-600 hover:bg-slate-50 text-xs"
                        >
                            <Shield size={14} className="text-slate-400" />
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-2 px-4 py-1.5 text-slate-600 hover:bg-slate-50 text-xs"
                        >
                            <FileText size={14} className="text-slate-400" />
                            Terms & Conditions
                        </Link>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="cursor-pointer w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 text-sm border-t border-slate-200 flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const TopNav = ({ href, text }: { href: string, text: string }) => {
    return (
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
            <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2 group">
                        <Image
                            src="/images/logos/betteriligan-logo.svg"
                            alt="BetterIligan Logo"
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-lg object-cover shadow-sm group-hover:opacity-90 transition-opacity"
                        />
                        <div>
                            <span className="font-bold text-slate-900 text-lg leading-tight block">CitiFIX</span>
                            <span className="text-xs text-orange-600 font-medium block -mt-1">BetterIligan</span>
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href={href}
                        className="text-sm font-medium text-slate-600 hidden sm:block hover:underline hover:text-blue-500!"
                    >
                        {text}
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 text-white! hover:bg-orange-700 text-sm font-medium shadow-sm transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Map</span>
                    </Link>
                </div>
            </div>
        </header>
    )
}

export default TopNav;

import Link from "next/link";
import { X, Shield, FileText } from "lucide-react";
import { useCategories, useProblemTypes } from "@/hooks/useReports";
import { getIcon } from "@/lib/icons";

interface LegendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LegendModal({ isOpen, onClose }: LegendModalProps) {
    const { data: categories } = useCategories();
    const { data: problemTypes } = useProblemTypes();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 md:pt-14">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95dvh] md:max-h-[80dvh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Map Legend</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-8">
                        {categories?.map((category: any) => {
                            const categoryProblems = problemTypes?.filter(
                                (p) => p.categoryId === category.id
                            );
                            if (categoryProblems?.length === 0) return null;

                            return (
                                <div key={category.id}>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: category.color || "#cbd5e1" }}
                                        />
                                        <h3 className="font-semibold text-slate-800">{category.name}</h3>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {categoryProblems?.map((pt) => {
                                            const Icon = getIcon(pt.icon ?? "");
                                            return (
                                                <div key={pt.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                                                    <div
                                                        className="p-1.5 rounded text-white"
                                                        style={{ backgroundColor: category.color || "#cbd5e1" }}
                                                    >
                                                        <Icon size={16} />
                                                    </div>
                                                    <span className="text-sm text-slate-700">{pt.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legal & Governance Links */}
                    <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                        <p>BetterIliganCity · BetterGov Civic Organization</p>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/privacy"
                                onClick={onClose}
                                className="flex items-center gap-1 text-slate-600 hover:text-orange-600 font-medium transition-colors"
                            >
                                <Shield size={13} />
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                onClick={onClose}
                                className="flex items-center gap-1 text-slate-600 hover:text-orange-600 font-medium transition-colors"
                            >
                                <FileText size={13} />
                                Terms & Conditions
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload, ArrowLeft, ArrowRight, Check, Trash2, MapPin, AlertTriangle, Layers, FileText } from "lucide-react";
import { useCategories, useCategoryProblemTypes, useCreateReport } from "@/hooks/useReports";
import type { CreateReportInput } from "@/lib/api/reports";
import * as api from "@/lib/api/reports";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { isPointInPolygon } from "@/lib/geo";
import { validInputPhotos, validDraggedPhotos } from "@/utils/fileChecker";
import { getIcon } from "@/lib/icons";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    location?: { lat: number; lng: number };
}

type Phase = 1 | 2 | 3 | 4;

export function ReportModal({
    isOpen,
    onClose,
    location,
}: ReportModalProps) {
    const [currentPhase, setCurrentPhase] = useState<Phase>(1);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [problemTypeId, setProblemTypeId] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgressText, setUploadProgressText] = useState<string>("");
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        severity: "low" | "medium" | "high";
    }>({
        title: "",
        description: "",
        severity: "medium",
    });

    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: problemTypes, isLoading: problemTypesLoading } = useCategoryProblemTypes(selectedCategory);
    const createReport = useCreateReport();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Selected objects for review and breadcrumbs
    const selectedCategoryObj = categories?.find((c) => c.id === selectedCategory);
    const selectedProblemTypeObj = problemTypes?.find((p) => p.id === problemTypeId);

    // Object URL preview handling for photos
    useEffect(() => {
        const urls = selectedFiles.map((file) => URL.createObjectURL(file));
        setPreviewUrls(urls);
        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [selectedFiles]);

    // Reset wizard when modal opens
    useEffect(() => {
        if (isOpen) {
            setCurrentPhase(1);
            setSelectedCategory("");
            setProblemTypeId("");
            setFormData({ title: "", description: "", severity: "medium" });
            setSelectedFiles([]);
            setUploading(false);
            setUploadProgressText("");
        }
    }, [isOpen]);

    const handleInputChange = (field: string, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = validInputPhotos(e);
        if (files && files.length > 0) {
            const combined = [...selectedFiles, ...Array.from(files)].slice(0, 3);
            setSelectedFiles(combined);
        }
    };

    const handleRemoveFile = (indexToRemove: number) => {
        setSelectedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files.length === 0) return;

        const files = validDraggedPhotos(e);
        if (files && files.length > 0) {
            const combined = [...selectedFiles, ...Array.from(files)].slice(0, 3);
            setSelectedFiles(combined);
        }
    };

    // Phase progression validations
    const handleNextFromPhase1 = () => {
        if (!selectedCategory) {
            toast.error("Please select a category to continue");
            return;
        }
        setCurrentPhase(2);
    };

    const handleNextFromPhase2 = () => {
        if (!problemTypeId) {
            toast.error("Please select a problem type to continue");
            return;
        }
        setCurrentPhase(3);
    };

    const handleNextFromPhase3 = () => {
        if (!formData.title.trim()) {
            toast.error("Please enter a title for the issue");
            return;
        }
        if (!formData.description.trim()) {
            toast.error("Please enter a description of the issue");
            return;
        }
        if (selectedFiles.length < 1 || selectedFiles.length > 3) {
            toast.error("Please attach between 1 and 3 photos of the issue");
            return;
        }
        setCurrentPhase(4);
    };

    // Final Submission
    const handleSubmit = async () => {
        if (
            !formData.title.trim() ||
            !formData.description.trim() ||
            !selectedCategory ||
            !problemTypeId ||
            !location
        ) {
            toast.error("Please complete all required steps");
            return;
        }

        if (selectedFiles.length < 1 || selectedFiles.length > 3) {
            toast.error("Please attach between 1 and 3 photos");
            return;
        }

        try {
            setUploading(true);
            setUploadProgressText("Verifying city boundary...");

            const boundaryRes = await fetch("/data/iligan-city-boundary.json");
            const boundaryData = (await boundaryRes.json()) as {
                features: Array<{ geometry: { coordinates: number[][][] } }>;
            };

            const polygonCoords = boundaryData.features[0].geometry.coordinates[0] as [number, number][];

            if (!isPointInPolygon(location, polygonCoords)) {
                setUploading(false);
                setUploadProgressText("");
                toast.error("Location must be within Iligan City boundary.", {
                    description: "Please adjust the pin position on the map before submitting.",
                    duration: 5000,
                });
                return;
            }

            setUploadProgressText("Creating report...");
            const report = await createReport.mutateAsync({
                title: formData.title.trim(),
                description: formData.description.trim(),
                categoryId: selectedCategory,
                problemTypeId,
                severity: formData.severity,
                latitude: location.lat,
                longitude: location.lng,
            });

            // Upload photos sequentially
            for (let i = 0; i < selectedFiles.length; i++) {
                setUploadProgressText(`Uploading photo ${i + 1} of ${selectedFiles.length}...`);
                const file = selectedFiles[i];
                await api.uploadReportMedia(report.id, file);
            }

            toast.success("Report submitted successfully with photos");
            setUploading(false);
            setUploadProgressText("");
            onClose();
        } catch (error) {
            setUploading(false);
            setUploadProgressText("");
            toast.error(error instanceof Error ? error.message : "Failed to create report");
        }
    };

    if (!isOpen) return null;

    const steps = [
        { num: 1, title: "Category", icon: Layers },
        { num: 2, title: "Problem Type", icon: AlertTriangle },
        { num: 3, title: "Details & Photos", icon: FileText },
        { num: 4, title: "Confirmation", icon: Check },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity"
                onClick={uploading ? undefined : onClose}
            />

            {/* Modal Dialog */}
            <div className="fixed inset-4 top-1/2 sm:left-1/2 sm:-translate-x-1/2 -translate-y-1/2 sm:w-full sm:max-w-2xl bg-white rounded-2xl shadow-2xl z-50 flex flex-col h-[95dvh] sm:max-h-[95dvh] sm:h-fit overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Report Civic Issue
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Step {currentPhase} of 4: {steps[currentPhase - 1].title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Step Progress Indicators */}
                <div className="px-6 pt-3 pb-2 bg-slate-50/40 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        {steps.map((step, idx) => {
                            const isCompleted = currentPhase > step.num;
                            const isCurrent = currentPhase === step.num;
                            return (
                                <div key={step.num} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={cn(
                                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                                                isCompleted
                                                    ? "bg-orange-600 text-white shadow-sm"
                                                    : isCurrent
                                                        ? "bg-orange-100 text-orange-700 ring-2 ring-orange-500 font-bold"
                                                        : "bg-slate-200 text-slate-500"
                                            )}
                                        >
                                            {isCompleted ? <Check size={14} strokeWidth={3} /> : step.num}
                                        </div>
                                        <span
                                            className={cn(
                                                "text-xs hidden sm:inline font-medium",
                                                isCurrent
                                                    ? "text-slate-900 font-semibold"
                                                    : isCompleted
                                                        ? "text-slate-700"
                                                        : "text-slate-400"
                                            )}
                                        >
                                            {step.title}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div
                                            className={cn(
                                                "flex-1 h-0.5 mx-2 sm:mx-3 transition-all",
                                                currentPhase > step.num ? "bg-orange-500" : "bg-slate-200"
                                            )}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content Body (Scrollable) */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* ----------------- PHASE 1: CATEGORY SELECTION ----------------- */}
                    {currentPhase === 1 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Select Issue Category
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Choose the category that best matches the issue you are reporting.
                                </p>
                            </div>

                            {categoriesLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm">Loading categories...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {categories?.map((cat) => {
                                        const isSelected = selectedCategory === cat.id;
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedCategory(cat.id);
                                                    setProblemTypeId("");
                                                }}
                                                className={cn(
                                                    "cursor-pointer p-4 rounded-xl border text-left flex items-start gap-3 transition-all duration-150",
                                                    isSelected
                                                        ? "border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-sm"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                                                )}
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                                                    style={{ backgroundColor: `${cat.color}20` }}
                                                >
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: cat.color }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-sm text-slate-900 truncate">
                                                            {cat.name}
                                                        </p>
                                                        {isSelected && (
                                                            <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                                                                <Check size={12} strokeWidth={3} />
                                                            </span>
                                                        )}
                                                    </div>
                                                    {cat.description && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                            {cat.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ----------------- PHASE 2: PROBLEM TYPE SELECTION ----------------- */}
                    {currentPhase === 2 && (
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold"
                                        style={{
                                            backgroundColor: `${selectedCategoryObj?.color}18`,
                                            color: selectedCategoryObj?.color || "#ea580c",
                                        }}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: selectedCategoryObj?.color || "#ea580c" }}
                                        />
                                        {selectedCategoryObj?.name}
                                    </span>
                                </div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Select Specific Problem Type
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Choose the exact type of issue to help authorities respond faster.
                                </p>
                            </div>

                            {problemTypesLoading ? (
                                <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
                                    <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm">Loading problem types...</p>
                                </div>
                            ) : problemTypes?.length === 0 ? (
                                <div className="py-8 text-center text-slate-500">
                                    No problem types found for this category.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {problemTypes?.map((type) => {
                                        const isSelected = problemTypeId === type.id;
                                        const Icon = getIcon(type.icon ?? "");
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setProblemTypeId(type.id)}
                                                className={cn(
                                                    "cursor-pointer p-4 rounded-xl border text-left flex items-start gap-3 transition-all duration-150",
                                                    isSelected
                                                        ? "border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20 shadow-sm"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                                                )}
                                            >
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-sm"
                                                    style={{ backgroundColor: selectedCategoryObj?.color || "#ea580c" }}
                                                >
                                                    <Icon size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-sm text-slate-900 truncate">
                                                            {type.name}
                                                        </p>
                                                        {isSelected && (
                                                            <span className="w-5 h-5 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0">
                                                                <Check size={12} strokeWidth={3} />
                                                            </span>
                                                        )}
                                                    </div>
                                                    {type.description && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                            {type.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ----------------- PHASE 3: DETAILS & PHOTOS ----------------- */}
                    {currentPhase === 3 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Issue Details & Evidence
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Provide descriptive details and attach 1 to 3 clear photos.
                                </p>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange("title", e.target.value)}
                                    placeholder="e.g., Deep pothole causing heavy traffic hazard"
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Describe the problem, nearby landmarks, or how long it has been present..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                                />
                            </div>

                            {/* Severity Segmented Selector */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Severity Level <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { key: "low", label: "Low", desc: "Minor inconvenience", color: "text-emerald-700 border-emerald-300 bg-emerald-50/50" },
                                        { key: "medium", label: "Medium", desc: "Noticeable impact", color: "text-amber-700 border-amber-300 bg-amber-50/50" },
                                        { key: "high", label: "High", desc: "Hazard / Urgent", color: "text-red-700 border-red-300 bg-red-50/50" },
                                    ].map((sev) => {
                                        const isSelected = formData.severity === sev.key;
                                        return (
                                            <button
                                                key={sev.key}
                                                type="button"
                                                onClick={() => handleInputChange("severity", sev.key)}
                                                className={cn(
                                                    "p-2.5 rounded-xl border text-center transition-all",
                                                    isSelected
                                                        ? `${sev.color} ring-2 ring-orange-500 border-orange-500 shadow-sm font-semibold`
                                                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
                                                )}
                                            >
                                                <div className="text-sm">{sev.label}</div>
                                                <div className="text-[10px] text-slate-500 font-normal mt-0.5">{sev.desc}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Photo Upload Section */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Attach Photos <span className="text-red-500">*</span>
                                    </label>
                                    <span className="text-xs text-slate-500">
                                        {selectedFiles.length} of 3 photos added
                                    </span>
                                </div>

                                {/* Dropzone */}
                                {selectedFiles.length < 3 && (
                                    <div
                                        className={cn(
                                            "border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200",
                                            isDragging
                                                ? "border-orange-500 bg-orange-50 scale-[1.01]"
                                                : "border-slate-300 hover:border-orange-500 hover:bg-slate-50/60"
                                        )}
                                        onClick={() => fileInputRef.current?.click()}
                                        onDragOver={handleDragOver}
                                        onDragEnter={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <Upload size={22} className="pointer-events-none mx-auto mb-1 text-slate-400" />
                                        <p className="pointer-events-none text-sm font-medium text-slate-700">
                                            Click to browse or drag photos here
                                        </p>
                                        <p className="pointer-events-none text-xs text-slate-400 mt-0.5">
                                            1 to 3 images required (max 5MB each, JPEG, PNG, WebP)
                                        </p>
                                    </div>
                                )}

                                {/* Thumbnails Preview Gallery */}
                                {selectedFiles.length > 0 && (
                                    <div className="grid grid-cols-3 gap-3 mt-3">
                                        {selectedFiles.map((file, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square"
                                            >
                                                <img
                                                    src={previewUrls[idx]}
                                                    alt={`Photo ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile(idx);
                                                        }}
                                                        className="p-1.5 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-colors cursor-pointer"
                                                        title="Remove photo"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-mono">
                                                    {(file.size / (1024 * 1024)).toFixed(1)}MB
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ----------------- PHASE 4: DETAILS CONFIRMATION & REVIEW ----------------- */}
                    {currentPhase === 4 && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Review & Confirm Report
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Please verify the details before final submission.
                                </p>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
                                {/* Location */}
                                <div className="flex items-start gap-2.5">
                                    <div className="p-2 bg-orange-100 text-orange-700 rounded-lg shrink-0 mt-0.5">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Confirmed Location</p>
                                        <p className="text-sm font-mono text-slate-800 font-medium">
                                            {location
                                                ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                                                : "Location not provided"}
                                        </p>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200" />

                                {/* Category & Problem Type */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Category & Type</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: selectedCategoryObj?.color || "#ea580c" }}
                                            />
                                            <span className="text-sm font-semibold text-slate-900">
                                                {selectedCategoryObj?.name}
                                            </span>
                                            <span className="text-slate-400">/</span>
                                            <span className="text-sm text-slate-700 font-medium">
                                                {selectedProblemTypeObj?.name}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Severity Tag */}
                                    <div className="text-right">
                                        <p className="text-xs font-semibold text-slate-500 uppercase">Severity</p>
                                        <span
                                            className={cn(
                                                "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase mt-1",
                                                formData.severity === "high"
                                                    ? "bg-red-100 text-red-700"
                                                    : formData.severity === "medium"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-emerald-100 text-emerald-700"
                                            )}
                                        >
                                            {formData.severity}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200" />

                                {/* Title & Description */}
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase">Issue Summary</p>
                                    <p className="text-sm font-bold text-slate-900 mt-1">{formData.title}</p>
                                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap leading-relaxed">
                                        {formData.description}
                                    </p>
                                </div>

                                <div className="h-px bg-slate-200" />

                                {/* Attached Photos */}
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                                        Attached Evidence ({selectedFiles.length})
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto pb-1">
                                        {previewUrls.map((url, idx) => (
                                            <img
                                                key={idx}
                                                src={url}
                                                alt={`Preview ${idx + 1}`}
                                                className="w-16 h-16 rounded-lg object-cover border border-slate-300 shrink-0 shadow-sm"
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {uploading && (
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3 text-orange-800 text-sm">
                                    <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin shrink-0" />
                                    <span>{uploadProgressText || "Submitting report..."}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Navigation Bar */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
                    {/* Left Action Button */}
                    {currentPhase === 1 ? (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                        >
                            Cancel
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setCurrentPhase((prev) => (prev - 1) as Phase)}
                            disabled={uploading}
                            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </button>
                    )}

                    {/* Right Action Button */}
                    {currentPhase === 1 && (
                        <button
                            type="button"
                            onClick={handleNextFromPhase1}
                            disabled={!selectedCategory}
                            className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            Next: Problem Type
                            <ArrowRight size={16} />
                        </button>
                    )}

                    {currentPhase === 2 && (
                        <button
                            type="button"
                            onClick={handleNextFromPhase2}
                            disabled={!problemTypeId}
                            className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            Next: Issue Details
                            <ArrowRight size={16} />
                        </button>
                    )}

                    {currentPhase === 3 && (
                        <button
                            type="button"
                            onClick={handleNextFromPhase3}
                            disabled={!formData.title.trim() || !formData.description.trim() || selectedFiles.length === 0}
                            className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                            Next: Review Report
                            <ArrowRight size={16} />
                        </button>
                    )}

                    {currentPhase === 4 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={uploading}
                                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={createReport.isPending || uploading}
                                className="px-5 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-sm cursor-pointer flex items-center gap-2"
                            >
                                {createReport.isPending || uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Submit Report</span>
                                        <Check size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

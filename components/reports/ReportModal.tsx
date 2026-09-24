"use client";

import { useState, useRef, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useCategories, useCategoryProblemTypes, useCreateReport } from "@/hooks/useReports";
import type { CreateReportInput } from "@/lib/api/reports";
import * as api from "@/lib/api/reports";
import { toast } from "sonner";
import { cn } from "@/utils/cn";
import { isPointInPolygon } from "@/lib/geo";
import { validInputPhotos, validDraggedPhotos } from "@/utils/fileChecker";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    location?: { lat: number; lng: number };
}

export function ReportModal({
    isOpen,
    onClose,
    location,
}: ReportModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [formData, setFormData] = useState<Partial<CreateReportInput>>({
        title: "",
        description: "",
        severity: "medium",
    });

    const { data: categories, isLoading: categoriesLoading } = useCategories();
    const { data: problemTypes } = useCategoryProblemTypes(selectedCategory);
    const createReport = useCreateReport();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: string, value: unknown) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = validInputPhotos(e)
        setSelectedFiles(Array.from(files ? files : []));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.title ||
            !formData.description ||
            !selectedCategory ||
            !formData.problemTypeId ||
            !location
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (selectedFiles.length < 1 || selectedFiles.length > 3) {
            toast.error("Please select between 1 and 3 photos");
            return;
        }

        try {
            setUploading(true);
            // Fetch boundary data and check if location is inside
            const boundaryRes = await fetch("/data/iligan-city-boundary.json");
            const boundaryData = await boundaryRes.json() as { features: Array<{ geometry: { coordinates: number[][][] } }> };

            // Boundary data is a FeatureCollection, we need the first feature's coordinates
            // It's a Polygon, so the outer ring is the first element of coordinates
            const polygonCoords = boundaryData.features[0].geometry.coordinates[0] as [number, number][];

            if (!isPointInPolygon(location, polygonCoords)) {
                setUploading(false);
                toast.error("Location must be within Iligan City boundary.", {
                    description: "Please move the pin inside the city limits before submitting.",
                    duration: 5000,
                });
                return;
            }

            const report = await createReport.mutateAsync({
                title: formData.title,
                description: formData.description,
                categoryId: selectedCategory,
                problemTypeId: formData.problemTypeId,
                severity: formData.severity,
                latitude: location.lat,
                longitude: location.lng,
            });

            console.log(report)

            // Upload files
            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                await api.uploadReportMedia(report.id, file);
            }

            toast.success("Report submitted successfully with photos");
            setUploading(false);
            onClose();
        } catch (error) {
            setUploading(false);
            toast.error(error instanceof Error ? error.message : "Failed to create report");
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        console.log("over");
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        console.log("leave")
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files.length === 0) return;

        const files = validDraggedPhotos(e)
        setSelectedFiles(Array.from(files ? files : []));
    };

    useEffect(() => {
        if (isOpen) {
            setFormData({ title: "", description: "", severity: "medium" });
            setSelectedCategory("");
            setSelectedFiles([]);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-4 sm:auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-xl bg-white rounded-lg shadow-xl z-50 overflow-y-auto max-h-[90vh] h-fit">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">
                            Report Issue Details
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* ------------------------------------------------ form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.title || ""}
                                onChange={(e) => handleInputChange("title", e.target.value)}
                                placeholder="Brief title of the issue"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => handleInputChange("description", e.target.value)}
                                placeholder="Detailed description of the issue"
                                rows={3}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    handleInputChange("problemTypeId", "");
                                }}
                                disabled={categoriesLoading}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                            >
                                <option value="">Select a category</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name} | {cat.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Problem Type */}
                        {selectedCategory && (
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-1">
                                    Problem Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.problemTypeId || ""}
                                    onChange={(e) => handleInputChange("problemTypeId", e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Select a type</option>
                                    {problemTypes?.map((type) => (
                                        <option key={type.id} value={type.id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Severity */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Severity
                            </label>
                            <select
                                value={formData.severity || "medium"}
                                onChange={(e) => handleInputChange("severity", e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-1">
                                Attach Photos
                            </label>
                            <div
                                className={cn(
                                    "border-2 border-dashed rounded-md p-6 text-center cursor-pointer",
                                    "transition-all duration-200",
                                    isDragging
                                        ? "border-orange-500 bg-orange-50 scale-[1.01]"
                                        : "border-slate-300 hover:border-orange-500 hover:bg-slate-50"
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
                                <Upload size={20} className="pointer-events-none mx-auto mb-2 text-slate-400" />
                                <p className="pointer-events-none text-sm text-slate-600">Click to upload photos or drag and drop</p>
                            </div>
                            {selectedFiles.length > 0 && (
                                <div className="mt-2 text-sm text-slate-600">
                                    {selectedFiles.length} file(s) selected
                                </div>
                            )}
                        </div>

                        {/* Confirmed location */}
                        <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600">
                            📍 {" "}
                            {location ? (
                                <span className="font-mono">
                                    {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                                </span>
                            ) : (
                                "Unknown location"
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-900 rounded-md font-medium hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={createReport.isPending || uploading}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 disabled:opacity-50"
                            >
                                {createReport.isPending || uploading ? "Submitting..." : "Submit Report"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

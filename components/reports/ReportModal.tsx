"use client";

import { useState, useRef } from "react";
import { X, Upload } from "lucide-react";
import { useCategories, useCategoryProblemTypes, useCreateReport } from "@/hooks/useReports";
import { CreateReportInput } from "@/lib/api/reports";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  latitude?: number;
  longitude?: number;
}

export function ReportModal({
  isOpen,
  onClose,
  latitude,
  longitude,
}: ReportModalProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const { data: problemTypes } = useCategoryProblemTypes(selectedCategory);
  const createReport = useCreateReport();

  const [formData, setFormData] = useState<Partial<CreateReportInput>>({
    title: "",
    description: "",
    severity: "medium",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.title ||
      !formData.description ||
      !selectedCategory ||
      !formData.problemTypeId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await createReport.mutateAsync({
        title: formData.title,
        description: formData.description,
        categoryId: selectedCategory,
        problemTypeId: formData.problemTypeId,
        severity: formData.severity,
        latitude,
        longitude,
      });

      // Reset form
      setFormData({
        title: "",
        description: "",
        severity: "medium",
      });
      setSelectedCategory("");
      setSelectedFiles([]);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create report");
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
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-2xl bg-white rounded-lg shadow-xl z-50 overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Report Issue</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                rows={4}
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
                    {cat.name}
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
              <div className="border-2 border-dashed border-slate-300 rounded-md p-4 text-center hover:border-orange-500 cursor-pointer">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Upload size={20} className="mx-auto mb-2 text-slate-400" />
                <p
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-slate-600"
                >
                  Click to upload photos or drag and drop
                </p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-2 text-sm text-slate-600">
                  {selectedFiles.length} file(s) selected
                </div>
              )}
            </div>

            {/* Location Info */}
            <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600">
              📍 Location: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
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
                disabled={createReport.isPending}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 disabled:opacity-50"
              >
                {createReport.isPending ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

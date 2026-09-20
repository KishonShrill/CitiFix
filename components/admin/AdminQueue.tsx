"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle, Copy } from "lucide-react";
import { Report } from "@/lib/api/reports";

interface AdminQueueProps {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  isLoading: boolean;
  onVerify: (reportId: string) => Promise<void>;
  onReject: (reportId: string, reason: string) => Promise<void>;
  onDuplicate: (reportId: string) => Promise<void>;
}

export function AdminQueue({
  isOpen,
  onClose,
  reports,
  isLoading,
  onVerify,
  onReject,
  onDuplicate,
}: AdminQueueProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleVerify = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await onVerify(reportId);
      setSelectedReport(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to verify report");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reportId: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }
    setActionLoading(reportId);
    try {
      await onReject(reportId, rejectReason);
      setSelectedReport(null);
      setRejectReason("");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to reject report");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (reportId: string) => {
    setActionLoading(reportId);
    try {
      await onDuplicate(reportId);
      setSelectedReport(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to mark as duplicate");
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  const pendingReports = reports.filter((r) => r.status === "submitted");

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-5xl bg-white rounded-lg shadow-xl z-50 overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Moderation Queue</h2>
              <p className="text-sm text-slate-600 mt-1">
                {pendingReports.length} report{pendingReports.length !== 1 ? "s" : ""} pending review
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queue List */}
            <div className="lg:col-span-1 border-r border-slate-200">
              {isLoading && (
                <div className="text-center py-8">
                  <p className="text-slate-600">Loading queue...</p>
                </div>
              )}

              {!isLoading && pendingReports.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-600">All caught up! No pending reports.</p>
                </div>
              )}

              <div className="space-y-2 max-h-[calc(90vh-200px)] overflow-y-auto">
                {pendingReports.map((report) => (
                  <button
                    key={report.publicId}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selectedReport?.publicId === report.publicId
                        ? "bg-blue-50 border-blue-300"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-medium text-sm text-slate-900 truncate">
                      {report.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1 truncate">
                      {report.barangay || "Unknown"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(report.submittedAt).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Report Details */}
            <div className="lg:col-span-2">
              {selectedReport ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {selectedReport.title}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Submitted {new Date(selectedReport.submittedAt).toLocaleDateString()} at{" "}
                      {new Date(selectedReport.submittedAt).toLocaleTimeString()}
                    </p>
                    <p className="text-slate-700 mb-4">{selectedReport.description}</p>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-md">
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Location</p>
                      <p className="text-sm text-slate-900">
                        {selectedReport.barangay || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Severity</p>
                      <p className="text-sm text-slate-900 capitalize">
                        {selectedReport.severity || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Coordinates</p>
                      <p className="text-sm text-slate-900 font-mono">
                        {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Report ID</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-slate-900 font-mono truncate">
                          {selectedReport.publicId.slice(0, 8)}...
                        </p>
                        <button className="p-1 hover:bg-slate-200 rounded">
                          <Copy size={14} className="text-slate-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Media */}
                  {selectedReport.media && selectedReport.media.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-2">Attached Media</p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReport.media.map((media) => (
                          <img
                            key={media.id}
                            src={media.url}
                            alt="Report media"
                            className="w-full h-32 object-cover rounded-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => handleVerify(selectedReport.publicId)}
                      disabled={actionLoading === selectedReport.publicId}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle size={18} />
                      Verify Report
                    </button>

                    <button
                      onClick={() => handleDuplicate(selectedReport.publicId)}
                      disabled={actionLoading === selectedReport.publicId}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-md font-medium hover:bg-yellow-700 disabled:opacity-50"
                    >
                      <Copy size={18} />
                      Mark as Duplicate
                    </button>

                    <div className="space-y-2">
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Enter reason for rejection..."
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                      />
                      <button
                        onClick={() => handleReject(selectedReport.publicId)}
                        disabled={actionLoading === selectedReport.publicId}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        <XCircle size={18} />
                        Reject Report
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full min-h-[400px] text-slate-600">
                  Select a report from the queue to review
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

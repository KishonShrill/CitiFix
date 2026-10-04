export type ReportNotificationEvent = "submitted" | "verified" | "rejected" | "duplicate";

export interface DiscordReportNotificationParams {
    event: ReportNotificationEvent;
    report: {
        id: string;
        title: string;
        description: string;
        address?: string | null;
        barangay?: string | null;
        severity?: string | null;
        createdAt?: Date | string | null;
    };
    category?: {
        name: string;
    } | null;
    problemType?: {
        name: string;
    } | null;
    reporter?: {
        name?: string | null;
        email?: string | null;
    } | string | null;
    mediaUrl?: string | null;
    actor?: {
        name?: string | null;
        email?: string | null;
        role?: string | null;
    } | null;
    reason?: string | null;
}

// Discord embed color codes (Decimal values)
// Yellow: #FEE75C (16705372)
// Green: #57F287 (5763719)
// Red: #ED4245 (15548997)
// Orange: #E67E22 (15105570)
export const DISCORD_EVENT_COLORS: Record<ReportNotificationEvent, number> = {
    submitted: 16705372, // Yellow (New report submission)
    verified: 5763719,   // Green (Admin acceptance)
    rejected: 15548997,  // Red (Admin rejection)
    duplicate: 15105570, // Orange (Admin duplicate)
};

const EVENT_HEADERS: Record<ReportNotificationEvent, { titlePrefix: string; statusLabel: string }> = {
    submitted: {
        titlePrefix: "📢 New Report Submitted",
        statusLabel: "Submitted",
    },
    verified: {
        titlePrefix: "✅ Report Accepted",
        statusLabel: "Verified / Accepted",
    },
    rejected: {
        titlePrefix: "❌ Report Rejected",
        statusLabel: "Rejected",
    },
    duplicate: {
        titlePrefix: "⚠️ Report Marked as Duplicate",
        statusLabel: "Duplicate",
    },
};

/**
 * Truncates text safely to ensure it fits within Discord limits.
 */
function truncate(text: string, maxLength: number): string {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
}

/**
 * Formats reporter name/identity nicely for display.
 */
function formatReporter(reporter?: DiscordReportNotificationParams["reporter"]): string {
    if (!reporter) return "Anonymous Citizen";
    if (typeof reporter === "string") return reporter.trim() || "Anonymous Citizen";
    if (reporter.name && reporter.email) return `${reporter.name} (${reporter.email})`;
    return reporter.name || reporter.email || "Anonymous Citizen";
}

/**
 * Sends a notification to Discord using the webhook URL defined in DISCORD_WEBHOOK_URL.
 * If DISCORD_WEBHOOK_URL is not configured, this function safely does nothing.
 */
export async function sendDiscordReportNotification(params: DiscordReportNotificationParams): Promise<void> {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl || !webhookUrl.trim()) {
        return;
    }

    try {
        const { event, report, category, problemType, reporter, mediaUrl, actor, reason } = params;
        const eventConfig = EVENT_HEADERS[event] || EVENT_HEADERS.submitted;
        const color = DISCORD_EVENT_COLORS[event] ?? DISCORD_EVENT_COLORS.submitted;

        const categoryName = category?.name?.trim() || "Uncategorized";
        const problemTypeName = problemType?.name?.trim() || "General Issue";
        const reporterText = formatReporter(reporter);

        const fields: Array<{ name: string; value: string; inline?: boolean }> = [
            {
                name: "📂 Category",
                value: categoryName,
                inline: true,
            },
            {
                name: "⚠️ Problem Type",
                value: problemTypeName,
                inline: true,
            },
            {
                name: "👤 Reported By",
                value: reporterText,
                inline: true,
            },
        ];

        // Add location details if present
        const locationParts = [report.address, report.barangay].filter(Boolean);
        if (locationParts.length > 0) {
            fields.push({
                name: "📍 Location",
                value: truncate(locationParts.join(", "), 256),
                inline: true,
            });
        }

        // Add severity if present
        if (report.severity) {
            fields.push({
                name: "⚡ Severity",
                value: report.severity.toUpperCase(),
                inline: true,
            });
        }

        // Add moderator / actor if available
        if (actor) {
            const actorName = actor.name || actor.email || "Admin";
            fields.push({
                name: "🛡️ Action By",
                value: actorName,
                inline: true,
            });
        }

        // Add rejection reason or duplicate notes if provided
        if (reason && reason.trim()) {
            const reasonLabel = event === "rejected" ? "🛑 Rejection Reason" : "📝 Reason / Notes";
            fields.push({
                name: reasonLabel,
                value: truncate(reason.trim(), 1024),
                inline: false,
            });
        }

        const embed: Record<string, unknown> = {
            title: truncate(`${eventConfig.titlePrefix}: ${report.title}`, 256),
            description: truncate(report.description || "No description provided.", 2048),
            color,
            fields,
            footer: {
                text: `Report ID: ${report.id} • BetterIligan`,
            },
            timestamp: new Date().toISOString(),
        };

        // Attach image preview if photo URL is present
        if (mediaUrl && mediaUrl.trim()) {
            embed.image = {
                url: mediaUrl.trim(),
            };
        }

        const payload = {
            embeds: [embed],
        };

        const response = await fetch(webhookUrl.trim(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text().catch(() => "");
            console.error(`Discord webhook returned status ${response.status}: ${errorText}`);
        }
    } catch (err) {
        // Ensure webhook notification errors never disrupt the primary application flow
        console.error("Failed to dispatch Discord webhook notification:", err);
    }
}

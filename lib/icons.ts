import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";
import React from "react";

/*
 * Resolve a Lucide icon name string to a renderable component.
 * Falls back to AlertCircle if the name is missing or invalid.
 */
export function getIcon(name: string): React.FC<LucideProps> {
    return (
        (LucideIcons as unknown as Record<string, React.FC<LucideProps>>)[name]
        ?? LucideIcons.AlertCircle
    );
}

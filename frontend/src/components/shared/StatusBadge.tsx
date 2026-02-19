import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: "success" | "warning" | "error" | "pending" | "ongoing" | "removed" | "break" | "hold" | "placed";
    label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    const statusStyles: Record<string, string> = {
        success: "bg-primary/10 text-primary border-primary/20",
        warning: "bg-secondary/10 text-secondary border-secondary/20",
        error: "bg-destructive/10 text-destructive border-destructive/20",
        pending: "bg-muted/50 text-muted-foreground border-border",
        // New statuses
        ongoing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        removed: "bg-destructive/10 text-destructive border-destructive/20",
        break: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        hold: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
        placed: "bg-green-600/10 text-green-600 border-green-600/20",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
                statusStyles[status] || statusStyles.pending
            )}
        >
            {label}
        </span>
    );
}

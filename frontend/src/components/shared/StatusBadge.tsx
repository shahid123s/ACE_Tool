import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: "success" | "warning" | "error" | "pending";
    label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
    const statusStyles = {
        success: "bg-primary/10 text-primary border-primary/20",
        warning: "bg-secondary/10 text-secondary border-secondary/20",
        error: "bg-destructive/10 text-destructive border-destructive/20",
        pending: "bg-muted/50 text-muted-foreground border-border",
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

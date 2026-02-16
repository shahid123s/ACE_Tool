import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
    return (
        <div
            className={cn(
                "glass-card rounded-xl p-6 animate-fade-up opacity-0",
                hover && "hover:scale-[1.02]",
                className
            )}
            style={{ animationFillMode: "forwards" }}
        >
            {children}
        </div>
    );
}

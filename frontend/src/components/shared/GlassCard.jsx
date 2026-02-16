import { cn } from "@/lib/utils";

export function GlassCard({ children, className, hover = true }) {
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

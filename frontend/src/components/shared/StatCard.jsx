import { cn } from "@/lib/utils";
import { GlassCard } from "./GlassCard";

export function StatCard({ title, value, icon: Icon, trend, trendUp, delay = 0 }) {
    const staggerClass = delay > 0 ? `stagger-${delay}` : "";

    return (
        <GlassCard className={cn("animate-fade-up opacity-0", staggerClass)}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
                    {trend && (
                        <p className={cn(
                            "text-xs mt-2 flex items-center gap-1",
                            trendUp ? "text-primary" : "text-muted-foreground"
                        )}>
                            {trendUp && (
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            )}
                            {trend}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Icon className="h-6 w-6" />
                    </div>
                )}
            </div>
        </GlassCard>
    );
}

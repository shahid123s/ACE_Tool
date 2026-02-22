import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";

const notifications = [
    { id: 1, message: "John Doe submitted a new worklog", time: "5 min ago", read: false },
    { id: 2, message: "Sarah Miller raised a concern", time: "20 min ago", read: false },
    { id: 4, message: "3 pending leave requests", time: "2 hours ago", read: true },
    { id: 5, message: "Weekly report auto-generated", time: "3 hours ago", read: true },
    { id: 6, message: "Alex Rivera completed onboarding", time: "Yesterday", read: true },
];

export default function AdminAlerts() {
    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
                <p className="text-sm text-muted-foreground mt-1">Recent platform notifications and activity alerts</p>
            </div>

            <GlassCard>
                <h3 className="font-semibold text-foreground mb-4">Recent Notifications</h3>
                <div className="space-y-2">
                    {notifications.map((n) => (
                        <div key={n.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${n.read ? "bg-muted/30" : "bg-primary/5 border border-primary/10"}`}>
                            <div className={`h-2 w-2 rounded-full shrink-0 ${n.read ? "bg-muted-foreground/30" : "bg-primary"}`} />
                            <div className="flex-1">
                                <p className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.message}</p>
                                <p className="text-xs text-muted-foreground">{n.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </GlassCard>
        </AdminLayout>
    );
}

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/shared/GlassCard";

export default function Admin() {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage students, worklogs, and platform settings</p>
            </div>

            <GlassCard>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Admin Dashboard Coming Soon</h2>
                    <p className="text-muted-foreground">
                        This will include tabs for Students, Worklogs, LeetCode Leaderboard, Meetings, Concerns, Requests, and Notifications.
                    </p>
                </div>
            </GlassCard>
        </DashboardLayout>
    );
}

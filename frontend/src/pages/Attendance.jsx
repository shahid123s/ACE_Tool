import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/shared/GlassCard";

export default function Attendance() {
    return (
        <DashboardLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
                <p className="text-muted-foreground text-sm mt-1">Track your attendance and work hours</p>
            </div>

            <GlassCard>
                <div className="text-center py-12">
                    <h2 className="text-xl font-semibold text-foreground mb-2">Attendance Tracking</h2>
                    <p className="text-muted-foreground">Clock in/out and view your attendance history here.</p>
                </div>
            </GlassCard>
        </DashboardLayout>
    );
}

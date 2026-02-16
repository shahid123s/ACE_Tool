import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/shared/GlassCard";

export default function Worklogs() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Worklogs</h1>
        <p className="text-muted-foreground text-sm mt-1">Submit and manage your daily worklogs</p>
      </div>
      <GlassCard>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Worklog Management</h2>
          <p className="text-muted-foreground">Submit your daily worklogs and track approval status.</p>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}

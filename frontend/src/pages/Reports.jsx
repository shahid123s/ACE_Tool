import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/shared/GlassCard";

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Placeholder page</p>
      </div>
      <GlassCard>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">Reports</h2>
          <p className="text-muted-foreground">Content coming soon.</p>
        </div>
      </GlassCard>
    </DashboardLayout>
  );
}

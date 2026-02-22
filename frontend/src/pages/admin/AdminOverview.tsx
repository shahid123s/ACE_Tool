import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatCard } from "@/components/shared/StatCard";
import { Users, Clock, FileText, AlertCircle } from "lucide-react";
import { useGetAdminStatsQuery, useGetAdminStudentsQuery, useGetAdminRequestsQuery } from "@/app/apiService";

export default function AdminOverview() {
    const { data: statsData } = useGetAdminStatsQuery();
    const { data: studentsData } = useGetAdminStudentsQuery({});
    const { data: requestsData } = useGetAdminRequestsQuery();

    const students = Array.isArray(studentsData) ? studentsData : studentsData?.students || [];
    const stats = statsData || {};
    const adminRequestsList = Array.isArray(requestsData) ? requestsData : requestsData?.requests || [];

    const totalActive = students.filter((s: any) => s.status === "ongoing").length;
    const totalHours = students.reduce((sum: number, s: any) => sum + (s.hoursThisWeek || 0), 0);
    const totalWorklogs = students.reduce((sum: number, s: any) => sum + (s.worklogs || 0), 0);

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Overview</h1>
                <p className="text-sm text-muted-foreground mt-1">Platform-wide statistics and activity summary</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Trainees" value={String(stats?.totalStudents || students.length)} icon={Users} trend={`${totalActive} active`} trendUp delay={0} />
                <StatCard title="Hours This Week" value={`${stats?.totalHours || totalHours}h`} icon={Clock} trend="+12% vs last week" trendUp delay={1} />
                <StatCard title="Worklogs Submitted" value={String(stats?.totalWorklogs || totalWorklogs)} icon={FileText} trend="Across all users" delay={2} />
                <StatCard title="Pending Requests" value={String(stats?.pendingRequests || adminRequestsList.filter((r: any) => r.status === "pending").length)} icon={AlertCircle} trend="Needs attention" delay={3} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassCard>
                    <h3 className="font-semibold text-foreground mb-4">Department Distribution</h3>
                    <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                        No data available
                    </div>
                </GlassCard>
            </div>
        </AdminLayout>
    );
}

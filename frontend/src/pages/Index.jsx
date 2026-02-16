import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/shared/StatCard";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
    Clock,
    FileText,
    Code2,
    CalendarDays,
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const chartData = [
    { name: "Mon", hours: 7.5 },
    { name: "Tue", hours: 8 },
    { name: "Wed", hours: 6.5 },
    { name: "Thu", hours: 9 },
    { name: "Fri", hours: 7 },
    { name: "Sat", hours: 4 },
    { name: "Sun", hours: 0 },
];

const recentWorklogs = [
    { id: 1, task: "UI Dashboard design", hours: 3, date: "Today", status: "success" },
    { id: 2, task: "API Integration", hours: 2.5, date: "Today", status: "success" },
    { id: 3, task: "Bug fixing - Auth module", hours: 1.5, date: "Yesterday", status: "pending" },
    { id: 4, task: "Documentation update", hours: 1, date: "Yesterday", status: "success" },
];

const upcomingMeetings = [
    { id: 1, title: "Sprint Review", time: "10:00 AM", host: "Sarah M." },
    { id: 2, title: "1-on-1 with Mentor", time: "2:30 PM", host: "James K." },
    { id: 3, title: "Team Standup", time: "Tomorrow 9:00 AM", host: "Team Lead" },
];

export default function Index() {
    return (
        <DashboardLayout>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Welcome back, John 👋</h1>
                <p className="text-muted-foreground text-sm mt-1">Here's your activity overview for today</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Hours Today" value="6.5h" icon={Clock} trend="+12% from yesterday" trendUp delay={0} />
                <StatCard title="Worklogs" value="12" icon={FileText} trend="3 pending review" delay={1} />
                <StatCard title="LeetCode Score" value="847" icon={Code2} trend="+23 this week" trendUp delay={2} />
                <StatCard title="Meetings Today" value="3" icon={CalendarDays} delay={3} />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <GlassCard className="lg:col-span-2 stagger-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">Weekly Hours</h3>
                        <StatusBadge status="success" label="On Track" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(80, 60%, 34%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(80, 60%, 34%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(40, 10%, 88%)" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                            <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 46%)" />
                            <Tooltip
                                contentStyle={{
                                    background: "hsl(0, 0%, 100%, 0.8)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid hsl(40, 10%, 88%)",
                                    borderRadius: "8px",
                                    fontSize: 12,
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="hours"
                                stroke="hsl(80, 60%, 34%)"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorHours)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </GlassCard>

                {/* Recent Worklogs */}
                <GlassCard className="stagger-3 p-6">
                    <h3 className="font-semibold text-foreground mb-4">Recent Worklogs</h3>
                    <div className="space-y-3">
                        {recentWorklogs.map((log) => (
                            <div key={log.id} className="p-3 rounded-lg border border-border/50 hover:border-border transition-colors bg-background/30">
                                <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-medium text-foreground">{log.task}</p>
                                    <StatusBadge status={log.status} />
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>{log.hours}h</span>
                                    <span>•</span>
                                    <span>{log.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Upcoming Meetings */}
                <GlassCard className="lg:col-span-3 stagger-4 p-6">
                    <h3 className="font-semibold text-foreground mb-4">Upcoming Meetings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {upcomingMeetings.map((meeting) => (
                            <div key={meeting.id} className="p-4 rounded-lg border border-border/50 hover:border-border transition-colors bg-background/30">
                                <p className="font-medium text-foreground mb-2">{meeting.title}</p>
                                <p className="text-sm text-muted-foreground mb-1">{meeting.time}</p>
                                <p className="text-xs text-muted-foreground">with {meeting.host}</p>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </DashboardLayout>
    );
}

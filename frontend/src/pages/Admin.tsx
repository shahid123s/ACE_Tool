import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Users,
    Clock,
    FileText,
    AlertCircle,
    Search,
    CalendarDays,
    Bell,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Plus,
    Trophy,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend,
} from "recharts";

// ─── Mock Data ───
interface AdminConcern {
    id: number;
    user: string;
    title: string;
    priority: "high" | "medium" | "low";
    status: "warning" | "pending" | "success";
    date: string;
}

interface AdminRequest {
    id: number;
    user: string;
    type: string;
    desc: string;
    status: "pending" | "success" | "error";
    date: string;
}

// ... (Other interfaces as needed)

const weeklyTrend = [
    { week: "W1", hours: 310, worklogs: 120 },
    { week: "W2", hours: 340, worklogs: 135 },
    { week: "W3", hours: 295, worklogs: 110 },
    { week: "W4", hours: 360, worklogs: 148 },
];

const departmentBreakdown = [
    { name: "Engineering", value: 4 },
    { name: "Design", value: 2 },
    { name: "Data Science", value: 2 },
];
const DEPT_COLORS = ["hsl(80,60%,34%)", "hsl(25,90%,58%)", "hsl(174,50%,42%)"];

const leetcodeLeaderboard = [
    { rank: 1, name: "Marcus Lee", score: 1024, solved: 245, streak: 42 },
    { rank: 2, name: "James Kim", score: 912, solved: 198, streak: 28 },
    { rank: 3, name: "John Doe", score: 847, solved: 176, streak: 15 },
    { rank: 4, name: "Alex Rivera", score: 734, solved: 154, streak: 21 },
    { rank: 5, name: "Olivia Brown", score: 678, solved: 132, streak: 10 },
];

const adminConcerns: AdminConcern[] = [
    { id: 1, user: "John Doe", title: "VPN access issue", priority: "high", status: "warning", date: "Feb 12" },
    { id: 2, user: "Sarah Miller", title: "Laptop overheating", priority: "medium", status: "pending", date: "Feb 11" },
    { id: 3, user: "Alex Rivera", title: "IDE license expired", priority: "low", status: "success", date: "Feb 10" },
    { id: 4, user: "Priya Patel", title: "Meeting room booking", priority: "medium", status: "warning", date: "Feb 10" },
];

const adminRequests: AdminRequest[] = [
    { id: 1, user: "John Doe", type: "Hardware", desc: "External monitor request", status: "pending", date: "Feb 12" },
    { id: 2, user: "Sarah Miller", type: "Leave", desc: "Sick leave - 2 days", status: "pending", date: "Feb 11" },
    { id: 3, user: "James Kim", type: "Access", desc: "AWS console access", status: "pending", date: "Feb 11" },
    { id: 4, user: "Priya Patel", type: "Hardware", desc: "Mechanical keyboard", status: "success", date: "Feb 9" },
    { id: 5, user: "Marcus Lee", type: "Leave", desc: "Personal day off", status: "error", date: "Feb 8" },
];

const notifications = [
    { id: 1, message: "John Doe submitted a new worklog", time: "5 min ago", read: false },
    { id: 2, message: "Sarah Miller raised a concern", time: "20 min ago", read: false },
    { id: 3, message: "Marcus Lee achieved 1000+ LeetCode score", time: "1 hour ago", read: false },
    { id: 4, message: "3 pending leave requests", time: "2 hours ago", read: true },
    { id: 5, message: "Weekly report auto-generated", time: "3 hours ago", read: true },
    { id: 6, message: "Alex Rivera completed onboarding", time: "Yesterday", read: true },
];

const meetings = [
    { id: 1, title: "Sprint Planning", date: "Feb 14", time: "10:00 AM", attendees: 8 },
    { id: 2, title: "Design Review", date: "Feb 14", time: "2:00 PM", attendees: 4 },
    { id: 3, title: "All Hands", date: "Feb 15", time: "11:00 AM", attendees: 12 },
    { id: 4, title: "1-on-1 with John", date: "Feb 15", time: "3:00 PM", attendees: 2 },
];

import { useAppSelector } from "@/app/hooks";
import { selectIsAdmin } from "@/app/authSlice";
import {
    useGetAdminStatsQuery,
    useGetAdminStudentsQuery,
    useGetAdminWorklogsQuery,
    useGetAdminConcernsQuery,
    useGetAdminRequestsQuery
} from "@/app/apiService";

const Admin = () => {
    const isAdmin = useAppSelector(selectIsAdmin);
    const { data: statsData } = useGetAdminStatsQuery();
    const { data: studentsData } = useGetAdminStudentsQuery({});
    useGetAdminWorklogsQuery();
    const { data: concernsData } = useGetAdminConcernsQuery();
    const { data: requestsData } = useGetAdminRequestsQuery();

    const [searchQuery, setSearchQuery] = useState("");
    const [deptFilter, setDeptFilter] = useState("all");
    const [respondDialog, setRespondDialog] = useState<number | null>(null);
    const [meetingDialog, setMeetingDialog] = useState(false);
    const [requestActions, setRequestActions] = useState<Record<number, string>>({});

    // ... handle logout or admin check if needed
    if (!isAdmin) {
        return <div>Access Denied</div>;
    }

    const handleRequestAction = (id: number, action: string) => {
        setRequestActions((prev) => ({ ...prev, [id]: action }));
    };

    const students = Array.isArray(studentsData) ? studentsData : studentsData?.students || [];
    const stats = statsData || {};
    const adminConcernsList = Array.isArray(concernsData) ? concernsData : concernsData?.concerns || adminConcerns;
    const adminRequestsList = Array.isArray(requestsData) ? requestsData : requestsData?.requests || adminRequests;

    const filteredStudents = students.filter((s: any) => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = deptFilter === "all" || s.department === deptFilter;
        return matchesSearch && matchesDept;
    });

    const totalActive = students.filter((s: any) => s.status === "active").length;
    const totalHours = students.reduce((sum: number, s: any) => sum + s.hoursThisWeek, 0);
    const totalWorklogs = students.reduce((sum: number, s: any) => sum + s.worklogs, 0);

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage trainees, track performance, and handle requests</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Trainees" value={String(stats?.totalStudents || students.length)} icon={Users} trend={`${totalActive} active`} trendUp delay={0} />
                <StatCard title="Hours This Week" value={`${stats?.totalHours || totalHours}h`} icon={Clock} trend="+12% vs last week" trendUp delay={1} />
                <StatCard title="Worklogs Submitted" value={String(stats?.totalWorklogs || totalWorklogs)} icon={FileText} trend="Across all users" delay={2} />
                <StatCard title="Pending Requests" value={String(stats?.pendingRequests || adminRequestsList.filter((r: any) => r.status === "pending").length)} icon={AlertCircle} trend="Needs attention" delay={3} />
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="glass-card !p-1 flex-wrap h-auto">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="worklogs">Worklogs</TabsTrigger>
                    <TabsTrigger value="leetcode">LeetCode</TabsTrigger>
                    <TabsTrigger value="meetings">Meetings</TabsTrigger>
                    <TabsTrigger value="concerns">Concerns</TabsTrigger>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="notifications">
                        <Bell className="h-4 w-4 mr-1" />
                        Alerts
                    </TabsTrigger>
                </TabsList>

                {/* ─── Overview ─── */}
                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <GlassCard>
                            <h3 className="font-semibold text-foreground mb-4">Weekly Trends</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <LineChart data={weeklyTrend}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                    <Tooltip contentStyle={{ background: "hsl(var(--glass-bg))", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                                    <Line type="monotone" dataKey="hours" stroke="hsl(80,60%,34%)" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line type="monotone" dataKey="worklogs" stroke="hsl(25,90%,58%)" strokeWidth={2} dot={{ r: 4 }} />
                                    <Legend />
                                </LineChart>
                            </ResponsiveContainer>
                        </GlassCard>

                        <GlassCard>
                            <h3 className="font-semibold text-foreground mb-4">Department Distribution</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={departmentBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                                        {departmentBreakdown.map((_, i) => <Cell key={i} fill={DEPT_COLORS[i]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </GlassCard>
                    </div>
                </TabsContent>

                {/* ─── Students ─── */}
                <TabsContent value="students">
                    <GlassCard>
                        <div className="flex flex-col sm:flex-row gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 glass-input" />
                            </div>
                            <Select value={deptFilter} onValueChange={setDeptFilter}>
                                <SelectTrigger className="w-full sm:w-44 glass-input">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    <SelectItem value="Engineering">Engineering</SelectItem>
                                    <SelectItem value="Design">Design</SelectItem>
                                    <SelectItem value="Data Science">Data Science</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Hours/Week</TableHead>
                                        <TableHead className="text-right">Worklogs</TableHead>
                                        <TableHead className="text-right">LeetCode</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map((s: any) => (
                                        <TableRow key={s.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium text-foreground">{s.name}</p>
                                                    <p className="text-xs text-muted-foreground">{s.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{s.department}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={s.status === "active" ? "success" : "error"} label={s.status === "active" ? "Active" : "Inactive"} />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{s.hoursThisWeek}h</TableCell>
                                            <TableCell className="text-right">{s.worklogs}</TableCell>
                                            <TableCell className="text-right font-medium">{s.leetcode}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </GlassCard>
                </TabsContent>

                {/* ─── Worklogs Overview ─── */}
                <TabsContent value="worklogs">
                    <GlassCard>
                        <h3 className="font-semibold text-foreground mb-4">Worklogs Across All Users</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={students.filter((s: any) => s.status === "active")}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                                <Tooltip contentStyle={{ background: "hsl(var(--glass-bg))", backdropFilter: "blur(12px)", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 12 }} />
                                <Bar dataKey="worklogs" fill="hsl(80,60%,34%)" radius={[6, 6, 0, 0]} name="Worklogs" />
                                <Bar dataKey="hoursThisWeek" fill="hsl(174,50%,42%)" radius={[6, 6, 0, 0]} name="Hours" />
                                <Legend />
                            </BarChart>
                        </ResponsiveContainer>
                    </GlassCard>
                </TabsContent>

                {/* ─── LeetCode Leaderboard ─── */}
                <TabsContent value="leetcode">
                    <GlassCard>
                        <div className="flex items-center gap-2 mb-4">
                            <Trophy className="h-5 w-5 text-secondary" />
                            <h3 className="font-semibold text-foreground">LeetCode Leaderboard</h3>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">Rank</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="text-right">Score</TableHead>
                                    <TableHead className="text-right">Solved</TableHead>
                                    <TableHead className="text-right">Streak</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leetcodeLeaderboard.map((entry) => (
                                    <TableRow key={entry.rank}>
                                        <TableCell>
                                            <span className={`font-bold ${entry.rank <= 3 ? "text-secondary" : "text-muted-foreground"}`}>
                                                #{entry.rank}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium text-foreground">{entry.name}</TableCell>
                                        <TableCell className="text-right font-bold text-primary">{entry.score}</TableCell>
                                        <TableCell className="text-right">{entry.solved}</TableCell>
                                        <TableCell className="text-right">{entry.streak} days 🔥</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </GlassCard>
                </TabsContent>

                {/* ─── Meetings ─── */}
                <TabsContent value="meetings">
                    <GlassCard>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-foreground">Scheduled Meetings</h3>
                            <Button size="sm" onClick={() => setMeetingDialog(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Schedule Meeting
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {meetings.map((m) => (
                                <div key={m.id} className="p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CalendarDays className="h-4 w-4 text-primary" />
                                        <span className="font-medium text-foreground">{m.title}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>{m.date} · {m.time}</span>
                                        <span>{m.attendees} attendees</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                    <Dialog open={meetingDialog} onOpenChange={setMeetingDialog}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Schedule Meeting</DialogTitle>
                                <DialogDescription>Create a new meeting for your team</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3">
                                <Input placeholder="Meeting title" className="glass-input" />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input type="date" className="glass-input" />
                                    <Input type="time" className="glass-input" />
                                </div>
                                <Textarea placeholder="Description (optional)" className="glass-input" />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setMeetingDialog(false)}>Cancel</Button>
                                <Button onClick={() => setMeetingDialog(false)}>Create</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* ─── Concerns ─── */}
                <TabsContent value="concerns">
                    <GlassCard>
                        <h3 className="font-semibold text-foreground mb-4">Concern Management</h3>
                        <div className="space-y-3">
                            {adminConcernsList.map((c: any) => (
                                <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-medium text-foreground">{c.title}</p>
                                            <StatusBadge status={c.status} label={c.status === "warning" ? "Open" : c.status === "pending" ? "In Progress" : "Resolved"} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">By {c.user} · {c.date} · Priority: <span className="capitalize">{c.priority}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setRespondDialog(c.id)}>
                                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Respond
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                    <Dialog open={respondDialog !== null} onOpenChange={() => setRespondDialog(null)}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Respond to Concern</DialogTitle>
                                <DialogDescription>Send a response to the trainee</DialogDescription>
                            </DialogHeader>
                            <Textarea placeholder="Type your response..." className="glass-input min-h-[100px]" />
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setRespondDialog(null)}>Cancel</Button>
                                <Button onClick={() => setRespondDialog(null)}>Send Response</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* ─── Requests ─── */}
                <TabsContent value="requests">
                    <GlassCard>
                        <h3 className="font-semibold text-foreground mb-4">Request Approvals</h3>
                        <div className="space-y-3">
                            {adminRequests.map((r) => {
                                const overridden = requestActions[r.id];
                                const displayStatus = overridden === "approved" ? "success" : overridden === "rejected" ? "error" : r.status;
                                const displayLabel = overridden === "approved" ? "Approved" : overridden === "rejected" ? "Rejected" : r.status === "pending" ? "Pending" : r.status === "success" ? "Approved" : "Rejected";
                                return (
                                    <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-medium text-foreground">{r.desc}</p>
                                                <StatusBadge status={displayStatus} label={displayLabel} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">By {r.user} · {r.type} · {r.date}</p>
                                        </div>
                                        {r.status === "pending" && !overridden && (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="text-primary border-primary/30 hover:bg-primary/10" onClick={() => handleRequestAction(r.id, "approved")}>
                                                    <ThumbsUp className="h-3.5 w-3.5 mr-1" /> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleRequestAction(r.id, "rejected")}>
                                                    <ThumbsDown className="h-3.5 w-3.5 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </GlassCard>
                </TabsContent>

                {/* ─── Notifications ─── */}
                <TabsContent value="notifications">
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
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
};

export default Admin;

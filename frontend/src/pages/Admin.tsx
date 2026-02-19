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
    MoreHorizontal,
    Pencil,
    Ban,
    CheckCircle,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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
    useGetAdminRequestsQuery,
    useCreateStudentMutation,
    CreateStudentRequest,
    useUpdateStudentMutation,
} from "@/app/apiService";
import { toast } from "sonner";

const Admin = () => {
    const isAdmin = useAppSelector(selectIsAdmin);
    const { data: statsData } = useGetAdminStatsQuery();
    const { data: studentsData } = useGetAdminStudentsQuery({});
    useGetAdminWorklogsQuery();
    const { data: concernsData } = useGetAdminConcernsQuery();
    const { data: requestsData } = useGetAdminRequestsQuery();

    const [searchQuery, setSearchQuery] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [respondDialog, setRespondDialog] = useState<number | null>(null);
    const [meetingDialog, setMeetingDialog] = useState(false);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
    const [newStudent, setNewStudent] = useState<CreateStudentRequest>({
        aceId: "",
        name: "",
        email: "",
        phone: "",
        batch: "",
        domain: "",
        tier: "Tier-1",
    });

    const [requestActions, setRequestActions] = useState<Record<number, string>>({});

    // Edit Student State
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

    const handleEditClick = (student: any) => {
        setEditingStudent({
            id: student.id,
            name: student.name,
            email: student.email,
            phone: student.phone || "",
            aceId: student.aceId || "",
            batch: student.batch || "",
            domain: student.domain || "",
            tier: student.tier || "Tier-1",
            stage: student.stage || "Boarding week",
            status: student.status || "ongoing",
        });
        setEditDialogOpen(true);
    };

    const handleUpdateStudent = async () => {
        if (!editingStudent) return;
        try {
            const { id, ...data } = editingStudent;
            await updateStudent({ id, data }).unwrap();
            toast.success("Student updated successfully");
            setEditDialogOpen(false);
            setEditingStudent(null);
        } catch (err: any) {
            toast.error("Failed to update student", {
                description: err.data?.message || "Please check your input and try again."
            });
        }
    };

    const handleStatusToggle = async (student: any, newStatus: string) => {
        try {
            await updateStudent({ id: student.id, data: { status: newStatus } }).unwrap();
            toast.success(`User ${newStatus === 'ongoing' ? 'unblocked' : 'blocked/updated'} successfully`);
        } catch (err: any) {
            toast.error("Failed to update status");
        }
    };

    const handleCreateStudent = async () => {
        try {
            await createStudent(newStudent).unwrap();
            toast.success("Student created successfully", {
                description: "Credentials have been sent to their email."
            });
            setCreateDialogOpen(false);
            setNewStudent({
                aceId: "",
                name: "",
                email: "",
                phone: "",
                batch: "",
                domain: "",
                tier: "Tier-1",
            });
        } catch (err: any) {
            toast.error("Failed to create student", {
                description: err.data?.message || "Please check your input and try again."
            });
        }
    };

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
        const matchesDomain = domainFilter === "all" || s.domain === domainFilter;
        return matchesSearch && matchesDomain;
    });

    const totalActive = students.filter((s: any) => s.status === "ongoing").length;
    const totalHours = students.reduce((sum: number, s: any) => sum + (s.hoursThisWeek || 0), 0);
    const totalWorklogs = students.reduce((sum: number, s: any) => sum + (s.worklogs || 0), 0);

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
                            <h3 className="font-semibold text-foreground mb-4">Department Distribution</h3>
                            <div className="flex items-center justify-center h-[240px] text-muted-foreground">
                                No data available
                            </div>
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
                            <Select value={domainFilter} onValueChange={setDomainFilter}>
                                <SelectTrigger className="w-full sm:w-44 glass-input">
                                    <SelectValue placeholder="Domain" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Domains</SelectItem>
                                    <SelectItem value="MERN">MERN Stack</SelectItem>
                                    <SelectItem value="MEAN">MEAN Stack</SelectItem>
                                    <SelectItem value="Python+Django">Python + Django</SelectItem>
                                    <SelectItem value="Flutter">Flutter</SelectItem>
                                    <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                    <SelectItem value="DS">Data Science</SelectItem>
                                    <SelectItem value="ML">Machine Learning</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={() => setCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Student
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Domain</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Batch</TableHead>
                                        <TableHead className="text-right">Stage</TableHead>
                                        <TableHead className="text-right">LeetCode</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
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
                                            <TableCell className="text-muted-foreground">{s.domain || '-'}</TableCell>
                                            <TableCell>
                                                <StatusBadge status={s.status} label={s.status.charAt(0).toUpperCase() + s.status.slice(1)} />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">{s.batch || '-'}</TableCell>
                                            <TableCell className="text-right">{s.stage || '-'}</TableCell>
                                            <TableCell className="text-right font-medium">{s.leetcode || '-'}</TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="glass-card bg-background/95 backdrop-blur-xl border-border/50">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleEditClick(s)}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        {s.status === 'ongoing' ? (
                                                            <DropdownMenuItem onClick={() => handleStatusToggle(s, 'hold')} className="text-warning">
                                                                <Ban className="mr-2 h-4 w-4" /> Block / Hold
                                                            </DropdownMenuItem>
                                                        ) : (
                                                            <DropdownMenuItem onClick={() => handleStatusToggle(s, 'ongoing')} className="text-success">
                                                                <CheckCircle className="mr-2 h-4 w-4" /> Unblock / Activate
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </GlassCard>
                    <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Add New Student</DialogTitle>
                                <DialogDescription>Create a new student account. Credentials will be emailed.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ACE ID</label>
                                    <Input
                                        placeholder="e.g. ACE123"
                                        value={newStudent.aceId}
                                        onChange={(e) => setNewStudent({ ...newStudent, aceId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        placeholder="John Doe"
                                        value={newStudent.name}
                                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        placeholder="john@example.com"
                                        type="email"
                                        value={newStudent.email}
                                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                        placeholder="+91 9876543210"
                                        value={newStudent.phone}
                                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Batch</label>
                                    <Input
                                        placeholder="Batch-1"
                                        value={newStudent.batch}
                                        onChange={(e) => setNewStudent({ ...newStudent, batch: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Domain</label>
                                    <Select
                                        value={newStudent.domain}
                                        onValueChange={(val) => setNewStudent({ ...newStudent, domain: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Domain" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MERN">MERN Stack</SelectItem>
                                            <SelectItem value="MEAN">MEAN Stack</SelectItem>
                                            <SelectItem value="Python+Django">Python + Django</SelectItem>
                                            <SelectItem value="Flutter">Flutter</SelectItem>
                                            <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                            <SelectItem value="DS">Data Science</SelectItem>
                                            <SelectItem value="ML">Machine Learning</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Tier</label>
                                    <Select
                                        value={newStudent.tier}
                                        onValueChange={(val: any) => setNewStudent({ ...newStudent, tier: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Tier" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Tier-1">Tier-1</SelectItem>
                                            <SelectItem value="Tier-2">Tier-2</SelectItem>
                                            <SelectItem value="Tier-3">Tier-3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateStudent} disabled={isCreating}>
                                    {isCreating ? "Creating..." : "Create Student"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Student Dialog */}
                    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Edit Student</DialogTitle>
                                <DialogDescription>Update student details and status.</DialogDescription>
                            </DialogHeader>
                            {editingStudent && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">ACE ID</label>
                                        <Input
                                            value={editingStudent.aceId}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, aceId: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input
                                            value={editingStudent.name}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            type="email"
                                            value={editingStudent.email}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <Input
                                            value={editingStudent.phone}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Batch</label>
                                        <Input
                                            value={editingStudent.batch}
                                            onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Domain</label>
                                        <Select
                                            value={editingStudent.domain}
                                            onValueChange={(val) => setEditingStudent({ ...editingStudent, domain: val })}
                                        >
                                            <SelectTrigger className="glass-input">
                                                <SelectValue placeholder="Select Domain" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MERN">MERN Stack</SelectItem>
                                                <SelectItem value="MEAN">MEAN Stack</SelectItem>
                                                <SelectItem value="Python+Django">Python + Django</SelectItem>
                                                <SelectItem value="Flutter">Flutter</SelectItem>
                                                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                                                <SelectItem value="DS">Data Science</SelectItem>
                                                <SelectItem value="ML">Machine Learning</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Tier</label>
                                        <Select
                                            value={editingStudent.tier}
                                            onValueChange={(val) => setEditingStudent({ ...editingStudent, tier: val })}
                                        >
                                            <SelectTrigger className="glass-input">
                                                <SelectValue placeholder="Select Tier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Tier-1">Tier-1</SelectItem>
                                                <SelectItem value="Tier-2">Tier-2</SelectItem>
                                                <SelectItem value="Tier-3">Tier-3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Stage</label>
                                        <Select
                                            value={editingStudent.stage}
                                            onValueChange={(val) => setEditingStudent({ ...editingStudent, stage: val })}
                                        >
                                            <SelectTrigger className="glass-input">
                                                <SelectValue placeholder="Select Stage" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Placement">Placement</SelectItem>
                                                <SelectItem value="Boarding week">Boarding week</SelectItem>
                                                <SelectItem value="TOI">TOI</SelectItem>
                                                <SelectItem value="Project">Project</SelectItem>
                                                <SelectItem value="2 FD">2 FD</SelectItem>
                                                <SelectItem value="1 FD">1 FD</SelectItem>
                                                <SelectItem value="Placed">Placed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <Select
                                            value={editingStudent.status}
                                            onValueChange={(val) => setEditingStudent({ ...editingStudent, status: val })}
                                        >
                                            <SelectTrigger className="glass-input">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ongoing">Ongoing</SelectItem>
                                                <SelectItem value="removed">Removed</SelectItem>
                                                <SelectItem value="break">Break</SelectItem>
                                                <SelectItem value="hold">Hold</SelectItem>
                                                <SelectItem value="placed">Placed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleUpdateStudent} disabled={isUpdating}>
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* ─── Worklogs Overview ─── */}
                <TabsContent value="worklogs">
                    <GlassCard>
                        <h3 className="font-semibold text-foreground mb-4">Worklogs Across All Users</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={students.filter((s: any) => s.status === "ongoing")}>
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
        </DashboardLayout >
    );
};

export default Admin;

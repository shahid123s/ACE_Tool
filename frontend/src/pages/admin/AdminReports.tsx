import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { useGetAdminReportsQuery } from "@/app/apiService";

export default function AdminReports() {
    const [searchQuery, setSearchQuery] = useState("");
    const [reportTypeFilter, setReportTypeFilter] = useState<"all" | "weekly" | "monthly">("all");
    const { data: reportsData = [], isLoading: reportsLoading } = useGetAdminReportsQuery(
        reportTypeFilter === "all" ? undefined : { type: reportTypeFilter }
    );

    const filtered = reportsData.filter((r: any) =>
        searchQuery
            ? (r.userName?.toLowerCase().includes(searchQuery.toLowerCase()) || r.period.toLowerCase().includes(searchQuery.toLowerCase()))
            : true
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Reports</h1>
                <p className="text-sm text-muted-foreground mt-1">View weekly and monthly reports from all trainees</p>
            </div>

            <GlassCard>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by student name or period..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 glass-input" />
                    </div>
                    <Select value={reportTypeFilter} onValueChange={(v: "all" | "weekly" | "monthly") => setReportTypeFilter(v)}>
                        <SelectTrigger className="w-full sm:w-44 glass-input"><SelectValue placeholder="Report Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border/50">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>ACE ID / Batch</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Period</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reportsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length > 0 ? filtered.map((r: any) => (
                                <TableRow key={r.id}>
                                    <TableCell className="font-medium">{r.userName || "Unknown"}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <span className="font-medium">#{r.aceId || "—"}</span>
                                            <br />
                                            <span className="text-xs text-muted-foreground">{r.batch || "—"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={r.type === 'weekly' ? 'pending' : 'warning'} label={r.type} />
                                    </TableCell>
                                    <TableCell>{r.period}</TableCell>
                                    <TableCell>{new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={r.driveLink} target="_blank" rel="noreferrer">View Doc</a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No reports found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>
        </AdminLayout>
    );
}

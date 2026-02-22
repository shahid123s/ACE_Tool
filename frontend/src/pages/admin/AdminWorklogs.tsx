import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, FileText } from "lucide-react";
import { useGetAdminWorklogsQuery } from "@/app/apiService";

export default function AdminWorklogs() {
    const [wlFilters, setWlFilters] = useState<{ status?: string; from?: string; to?: string }>({});
    const { data: worklogsData, isLoading: wlLoading } = useGetAdminWorklogsQuery(
        Object.values(wlFilters).some(Boolean) ? wlFilters : undefined
    );
    const worklogs = worklogsData ?? [];
    const [selectedWorklog, setSelectedWorklog] = useState<any | null>(null);

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Worklogs</h1>
                <p className="text-sm text-muted-foreground mt-1">View and filter worklogs across all trainees</p>
            </div>

            {/* Filters */}
            <GlassCard className="mb-4 p-4">
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
                        <Select value={wlFilters.status ?? "all"} onValueChange={(v) => setWlFilters((f) => ({ ...f, status: v === "all" ? undefined : v }))}>
                            <SelectTrigger className="h-9 w-36 glass-input"><SelectValue placeholder="All" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">From</label>
                        <Input type="date" className="h-9 glass-input w-40" value={wlFilters.from ?? ""} onChange={(e) => setWlFilters((f) => ({ ...f, from: e.target.value || undefined }))} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground uppercase tracking-wide">To</label>
                        <Input type="date" className="h-9 glass-input w-40" value={wlFilters.to ?? ""} onChange={(e) => setWlFilters((f) => ({ ...f, to: e.target.value || undefined }))} />
                    </div>
                    {Object.values(wlFilters).some(Boolean) && (
                        <Button variant="ghost" size="sm" onClick={() => setWlFilters({})} className="h-9 text-muted-foreground">Clear</Button>
                    )}
                </div>
            </GlassCard>

            <GlassCard>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Worklogs Across All Users</h3>
                    <span className="text-xs text-muted-foreground">{worklogs.length} entries</span>
                </div>
                {wlLoading ? (
                    <div className="py-12 text-center text-muted-foreground text-sm">Loading worklogs…</div>
                ) : worklogs.length === 0 ? (
                    <div className="py-12 text-center">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-sm text-muted-foreground">No worklogs found for the selected filters.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Tasks</TableHead>
                                <TableHead className="text-center">Hours</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...worklogs].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((w: any) => (
                                <TableRow key={w.id} className="cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => setSelectedWorklog(w)}>
                                    <TableCell className="text-sm font-medium whitespace-nowrap">
                                        {new Date(w.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium text-foreground">{w.userName ?? <span className="text-muted-foreground italic">Unknown</span>}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {w.aceId && <span>#{w.aceId}</span>}
                                                {w.batch && <span>· {w.batch}</span>}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <ul className="space-y-0.5">
                                            {(w.tasks as string[]).slice(0, 3).map((t: string, i: number) => (
                                                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground">
                                                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{t}
                                                </li>
                                            ))}
                                            {w.tasks.length > 3 && <li className="text-xs text-muted-foreground pl-3">+{w.tasks.length - 3} more</li>}
                                        </ul>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="flex items-center justify-center gap-1 text-sm">
                                            <Clock className="h-3 w-3 text-muted-foreground" />{w.hoursWorked}h
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <StatusBadge status={w.status === "submitted" ? "success" : "pending"} label={w.status === "submitted" ? "Submitted" : "Draft"} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </GlassCard>

            {/* Worklog Detail Dialog */}
            <Dialog open={Boolean(selectedWorklog)} onOpenChange={(v) => !v && setSelectedWorklog(null)}>
                <DialogContent className="glass-card max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Worklog Details</DialogTitle>
                        <DialogDescription>Full details for this worklog entry.</DialogDescription>
                    </DialogHeader>
                    {selectedWorklog && (
                        <div className="space-y-4 py-1">
                            <div className="rounded-lg bg-muted/40 p-3 space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Student</p>
                                <p className="font-semibold text-foreground">{selectedWorklog.userName ?? "Unknown"}</p>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    {selectedWorklog.aceId && <span>ACE ID: <span className="text-foreground font-medium">#{selectedWorklog.aceId}</span></span>}
                                    {selectedWorklog.batch && <span>Batch: <span className="text-foreground font-medium">{selectedWorklog.batch}</span></span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Date</p>
                                    <p className="text-sm font-medium">{new Date(selectedWorklog.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
                                </div>
                                <div className="rounded-lg bg-muted/40 p-3">
                                    <p className="text-xs text-muted-foreground mb-1">Hours Worked</p>
                                    <p className="text-sm font-medium">{selectedWorklog.hoursWorked}h</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Tasks</p>
                                <ul className="space-y-1.5">
                                    {(selectedWorklog.tasks as string[]).map((t: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />{t}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {selectedWorklog.notes && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
                                    <p className="text-sm text-foreground italic pl-3 border-l-2 border-border">{selectedWorklog.notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";
import { useGetAdminConcernsQuery } from "@/app/apiService";

export default function AdminConcerns() {
    const { data: concernsData } = useGetAdminConcernsQuery();
    const [respondDialog, setRespondDialog] = useState<number | null>(null);

    const mockConcerns = [
        { id: 1, user: "John Doe", title: "VPN access issue", priority: "high", status: "warning", date: "Feb 12" },
        { id: 2, user: "Sarah Miller", title: "Laptop overheating", priority: "medium", status: "pending", date: "Feb 11" },
        { id: 3, user: "Alex Rivera", title: "IDE license expired", priority: "low", status: "success", date: "Feb 10" },
    ];

    const concerns = Array.isArray(concernsData) ? concernsData : concernsData?.concerns || mockConcerns;

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Concerns</h1>
                <p className="text-sm text-muted-foreground mt-1">Review and respond to trainee concerns</p>
            </div>

            <GlassCard>
                <h3 className="font-semibold text-foreground mb-4">Concern Management</h3>
                <div className="space-y-3">
                    {concerns.map((c: any) => (
                        <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="font-medium text-foreground">{c.title}</p>
                                    <StatusBadge status={c.status} label={c.status === "warning" ? "Open" : c.status === "pending" ? "In Progress" : "Resolved"} />
                                </div>
                                <p className="text-xs text-muted-foreground">By {c.user} · {c.date} · Priority: <span className="capitalize">{c.priority}</span></p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setRespondDialog(c.id)}>
                                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Respond
                            </Button>
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
        </AdminLayout>
    );
}

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useGetAdminRequestsQuery } from "@/app/apiService";

const mockRequests = [
    { id: 1, user: "John Doe", type: "Hardware", desc: "External monitor request", status: "pending", date: "Feb 12" },
    { id: 2, user: "Sarah Miller", type: "Leave", desc: "Sick leave - 2 days", status: "pending", date: "Feb 11" },
    { id: 3, user: "James Kim", type: "Access", desc: "AWS console access", status: "pending", date: "Feb 11" },
    { id: 4, user: "Priya Patel", type: "Hardware", desc: "Mechanical keyboard", status: "success", date: "Feb 9" },
    { id: 5, user: "Marcus Lee", type: "Leave", desc: "Personal day off", status: "error", date: "Feb 8" },
];

export default function AdminRequests() {
    const { data: requestsData } = useGetAdminRequestsQuery();
    const [requestActions, setRequestActions] = useState<Record<number, string>>({});

    const requests = Array.isArray(requestsData) ? requestsData : requestsData?.requests || mockRequests;

    const handleRequestAction = (id: number, action: string) => {
        setRequestActions((prev) => ({ ...prev, [id]: action }));
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Requests</h1>
                <p className="text-sm text-muted-foreground mt-1">Approve or reject trainee requests</p>
            </div>

            <GlassCard>
                <h3 className="font-semibold text-foreground mb-4">Request Approvals</h3>
                <div className="space-y-3">
                    {requests.map((r: any) => {
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
        </AdminLayout>
    );
}

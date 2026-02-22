import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Plus } from "lucide-react";

const meetings = [
    { id: 1, title: "Sprint Planning", date: "Feb 14", time: "10:00 AM", attendees: 8 },
    { id: 2, title: "Design Review", date: "Feb 14", time: "2:00 PM", attendees: 4 },
    { id: 3, title: "All Hands", date: "Feb 15", time: "11:00 AM", attendees: 12 },
    { id: 4, title: "1-on-1 with John", date: "Feb 15", time: "3:00 PM", attendees: 2 },
];

export default function AdminMeetings() {
    const [meetingDialog, setMeetingDialog] = useState(false);

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Meetings</h1>
                <p className="text-sm text-muted-foreground mt-1">Schedule and manage team meetings</p>
            </div>

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
        </AdminLayout>
    );
}

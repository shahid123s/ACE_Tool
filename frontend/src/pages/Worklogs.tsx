import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Clock } from "lucide-react";

interface Worklog {
  id: number;
  task: string;
  description: string;
  hours: number;
  date: string;
  status: "success" | "pending" | "warning";
}

const mockWorklogs: Worklog[] = [
  { id: 1, task: "UI Dashboard design", description: "Designed the main dashboard layout with glassmorphism cards and responsive grid.", hours: 3, date: "2026-02-11", status: "success" },
  { id: 2, task: "API Integration - Auth", description: "Integrated login/signup endpoints with backend auth.", hours: 2.5, date: "2026-02-11", status: "success" },
  { id: 3, task: "Bug Fix - Sidebar collapse", description: "Fixed sidebar animation glitch on mobile viewports.", hours: 1.5, date: "2026-02-10", status: "pending" },
  { id: 4, task: "Documentation update", description: "Updated README and API docs for the worklogs module.", hours: 1, date: "2026-02-10", status: "success" },
  { id: 5, task: "Unit tests - Reports", description: "Wrote unit tests for weekly report generation logic.", hours: 2, date: "2026-02-09", status: "success" },
  { id: 6, task: "Database schema design", description: "Designed tables for meetings and concerns modules.", hours: 3, date: "2026-02-09", status: "warning" },
  { id: 7, task: "Code review", description: "Reviewed PRs #42, #43, and #45 from team members.", hours: 1.5, date: "2026-02-08", status: "success" },
  { id: 8, task: "LeetCode practice", description: "Solved 3 medium problems on arrays and dynamic programming.", hours: 2, date: "2026-02-08", status: "success" },
];

const statusLabel: Record<Worklog["status"], string> = {
  success: "Approved",
  pending: "Pending",
  warning: "Needs Revision",
};

const today = new Date().toISOString().split("T")[0];

const Worklogs = () => {
  const [open, setOpen] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Worklogs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily tasks and hours</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Add Worklog
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>New Worklog Entry</DialogTitle>
              <DialogDescription>Add details about your work today.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <Input placeholder="Task title" className="glass-input" />
              <Textarea
                placeholder="Description of work done..."
                className="glass-input min-h-[80px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input type="number" placeholder="Hours" className="glass-input" />
                <Input type="date" defaultValue={today} className="glass-input" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {mockWorklogs.map((log, i) => (
            <div
              key={log.id}
              className={`relative pl-10 animate-fade-up stagger-${(i % 6) + 1}`}
            >
              <div className="absolute left-2.5 top-4 h-3 w-3 rounded-full bg-primary border-2 border-background" />
              <GlassCard className="!p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{log.task}</h3>
                      <StatusBadge status={log.status} label={statusLabel[log.status]} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{log.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {log.hours}h
                      </span>
                      <span>{log.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-3">
                    <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                    <button className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Worklogs;

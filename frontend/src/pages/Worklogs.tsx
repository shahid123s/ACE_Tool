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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Edit2, Clock, X, CheckCircle2, FileText, Loader2, ListPlus } from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyWorklogsQuery,
  useCreateWorklogMutation,
  useUpdateWorklogMutation,
  useSubmitWorklogMutation,
} from "@/app/apiService";
import { Worklog } from "@/app/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD (local timezone) */
const todayISO = () => new Date().toISOString().split("T")[0];

/** Format ISO date string nicely for display */
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const statusLabel: Record<Worklog["status"], string> = {
  draft: "Draft",
  submitted: "Submitted",
};

const statusBadgeStatus: Record<Worklog["status"], "pending" | "success"> = {
  draft: "pending",
  submitted: "success",
};

// ─── Create / Edit Dialog ─────────────────────────────────────────────────────

interface WorklogDialogProps {
  open: boolean;
  onClose: () => void;
  /** If provided → Edit mode, otherwise → Create mode */
  existing?: Worklog;
  /** Dates that already have a worklog (used in Create mode to block duplicates) */
  takenDates: Set<string>;
}

function WorklogDialog({ open, onClose, existing, takenDates }: WorklogDialogProps) {
  const isEdit = Boolean(existing);

  const [tasks, setTasks] = useState<string[]>(existing?.tasks ?? [""]);
  const [hours, setHours] = useState<string>(existing ? String(existing.hoursWorked) : "");
  const [date, setDate] = useState<string>(existing ? existing.date.split("T")[0] : todayISO());
  const [notes, setNotes] = useState<string>(existing?.notes ?? "");

  const [createWorklog, { isLoading: creating }] = useCreateWorklogMutation();
  const [updateWorklog, { isLoading: updating }] = useUpdateWorklogMutation();
  const isLoading = creating || updating;

  // ── Task list helpers ──
  const addTask = () => setTasks((t) => [...t, ""]);
  const removeTask = (i: number) => setTasks((t) => t.filter((_, idx) => idx !== i));
  const updateTask = (i: number, val: string) =>
    setTasks((t) => t.map((v, idx) => (idx === i ? val : v)));

  const filledTasks = tasks.filter((t) => t.trim().length > 0);
  const parsedHours = parseFloat(hours);
  const isValid =
    filledTasks.length > 0 &&
    !isNaN(parsedHours) &&
    parsedHours >= 0 &&
    parsedHours <= 24;

  const handleClose = () => {
    // Reset form state on close
    setTasks(existing?.tasks ?? [""]);
    setHours(existing ? String(existing.hoursWorked) : "");
    setDate(existing ? existing.date.split("T")[0] : todayISO());
    setNotes(existing?.notes ?? "");
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) return;

    // Guard: date already taken (create mode only)
    if (!isEdit && takenDates.has(date)) {
      toast.error(`A worklog already exists for ${formatDate(date)}. Edit the existing entry.`);
      return;
    }

    try {
      if (isEdit && existing) {
        await updateWorklog({
          id: existing.id,
          data: { tasks: filledTasks, hoursWorked: parsedHours, notes: notes.trim() || undefined },
        }).unwrap();
        toast.success("Worklog updated!");
      } else {
        await createWorklog({
          tasks: filledTasks,
          hoursWorked: parsedHours,
          date,
          notes: notes.trim() || undefined,
        }).unwrap();
        toast.success("Worklog created!");
      }
      handleClose();
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Something went wrong";
      // 409 = duplicate date (backend safety net)
      if (err?.status === 409 || msg.includes("already exists")) {
        toast.error("A worklog already exists for this date.");
      } else {
        toast.error(msg);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="glass-card max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Worklog" : "New Worklog Entry"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your tasks, hours, or notes. You cannot edit a submitted worklog."
              : "Log your work for the day. Add all tasks you completed."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Date — create only */}
          {!isEdit && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date</label>
              <Input
                type="date"
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
                className="glass-input"
              />
              {takenDates.has(date) && (
                <p className="text-xs text-destructive">
                  A worklog already exists for this date. Edit the existing one.
                </p>
              )}
            </div>
          )}

          {/* Tasks */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tasks <span className="text-destructive">*</span>
            </label>
            <div className="space-y-2">
              {tasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder={`Task ${i + 1}`}
                    value={task}
                    onChange={(e) => updateTask(i, e.target.value)}
                    className="glass-input flex-1"
                  />
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTask(i)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors shrink-0"
                    >
                      <X className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addTask}
              className="mt-1 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add another task
            </Button>
          </div>

          {/* Hours */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Hours Worked <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              placeholder="e.g. 6.5"
              value={hours}
              min={0}
              max={24}
              step={0.5}
              onChange={(e) => setHours(e.target.value)}
              className="glass-input"
            />
            {hours !== "" && (parsedHours < 0 || parsedHours > 24) && (
              <p className="text-xs text-destructive">Hours must be between 0 and 24.</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes (optional)</label>
            <Textarea
              placeholder="Any blockers, observations, or context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="glass-input min-h-[70px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isLoading || (!isEdit && takenDates.has(date))}
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
            ) : isEdit ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function WorklogSkeleton() {
  return (
    <div className="relative pl-10 space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="relative">
          <div className="absolute left-[-1.375rem] top-4 h-3 w-3 rounded-full bg-muted animate-pulse" />
          <GlassCard className="!p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-2/3 mb-3" />
            <div className="h-3 bg-muted rounded w-1/4" />
          </GlassCard>
        </div>
      ))}
    </div>
  );
}

// ─── Quick Add Task Dialog ────────────────────────────────────────────────────

interface QuickAddTaskProps {
  open: boolean;
  onClose: () => void;
  worklog: Worklog;
}

function QuickAddTaskDialog({ open, onClose, worklog }: QuickAddTaskProps) {
  const [newTask, setNewTask] = useState("");
  const [hours, setHours] = useState(String(worklog.hoursWorked));
  const [updateWorklog, { isLoading }] = useUpdateWorklogMutation();

  const parsedHours = parseFloat(hours);
  const isValid = newTask.trim().length > 0 && !isNaN(parsedHours) && parsedHours >= 0 && parsedHours <= 24;

  const handleClose = () => {
    setNewTask("");
    setHours(String(worklog.hoursWorked));
    onClose();
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    try {
      await updateWorklog({
        id: worklog.id,
        data: {
          tasks: [...worklog.tasks, newTask.trim()],
          hoursWorked: parsedHours,
        },
      }).unwrap();
      toast.success("Task added to today's worklog!");
      handleClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add task");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="glass-card max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Task to Today</DialogTitle>
          <DialogDescription>
            Quickly add an unplanned task to today's worklog and update your total hours.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              New Task <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g. Fixed login bug"
              value={newTask}
              autoFocus
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && isValid && handleSubmit()}
              className="glass-input"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Hours Today <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              value={hours}
              min={0}
              max={24}
              step={0.5}
              onChange={(e) => setHours(e.target.value)}
              className="glass-input"
            />
            {hours !== "" && (parsedHours < 0 || parsedHours > 24) && (
              <p className="text-xs text-destructive">Must be between 0 and 24.</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const Worklogs = () => {
  const { data: worklogs, isLoading, isError } = useGetMyWorklogsQuery();
  const [submitWorklog, { isLoading: submitting }] = useSubmitWorklogMutation();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Worklog | null>(null);
  const [quickAddTarget, setQuickAddTarget] = useState<Worklog | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  // Today's draft worklog (if any)
  const todayKey = todayISO();
  const todayDraftWorklog = worklogs?.find(
    (w) => w.date.split("T")[0] === todayKey && w.status === "draft"
  ) ?? null;

  // Dates already logged — used to block duplicate creation
  const takenDates = new Set<string>(
    (worklogs ?? []).map((w) => w.date.split("T")[0])
  );

  const handleSubmit = async (worklog: Worklog) => {
    if (submitting) return;
    setSubmittingId(worklog.id);
    try {
      await submitWorklog(worklog.id).unwrap();
      toast.success("Worklog submitted successfully!");
    } catch (err: any) {
      const msg = err?.data?.message || err?.message || "Failed to submit";
      toast.error(msg);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Worklogs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your daily tasks and hours</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Worklog
        </Button>
      </div>

      {/* Body */}
      {isLoading ? (
        <WorklogSkeleton />
      ) : isError ? (
        <GlassCard className="p-8 text-center">
          <p className="text-destructive font-medium mb-1">Failed to load worklogs</p>
          <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
        </GlassCard>
      ) : !worklogs || worklogs.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
          <p className="font-medium text-foreground mb-1">No worklogs yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking your daily work by adding your first entry.
          </p>
          <div className="flex items-center gap-2">
            {/* Quick add — only when today's draft exists */}
            {todayDraftWorklog && (
              <Button
                variant="outline"
                onClick={() => setQuickAddTarget(todayDraftWorklog)}
              >
                <ListPlus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            )}
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Worklog
            </Button>
          </div>
        </GlassCard>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {[...worklogs]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((log, i) => {
                const isSubmitted = log.status === "submitted";
                const isBeingSubmitted = submittingId === log.id;

                return (
                  <div
                    key={log.id}
                    className={`relative pl-10 animate-fade-up stagger-${(i % 6) + 1}`}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2.5 top-4 h-3 w-3 rounded-full border-2 border-background ${isSubmitted ? "bg-primary" : "bg-muted-foreground"
                        }`}
                    />

                    <GlassCard className={`!p-4 ${isSubmitted ? "opacity-90" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Date + Badge */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-foreground">
                              {formatDate(log.date)}
                            </span>
                            <StatusBadge
                              status={statusBadgeStatus[log.status]}
                              label={statusLabel[log.status]}
                            />
                          </div>

                          {/* Tasks list */}
                          <ul className="space-y-1 mb-3">
                            {log.tasks.map((task, ti) => (
                              <li
                                key={ti}
                                className="flex items-start gap-2 text-sm text-foreground"
                              >
                                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                {task}
                              </li>
                            ))}
                          </ul>

                          {/* Notes */}
                          {log.notes && (
                            <p className="text-xs text-muted-foreground italic mb-2">
                              {log.notes}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {log.hoursWorked}h
                            </span>
                            <span>{log.tasks.length} task{log.tasks.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>

                        {/* ── Action bar (draft only) ── */}
                        {!isSubmitted && (
                          <div className="flex items-center gap-2 pt-1">
                            {/* + Add Task — today only */}
                            {log.date.split("T")[0] === todayKey && (
                              <Button
                                size="sm"
                                className="gap-1.5"
                                onClick={() => setQuickAddTarget(log)}
                              >
                                <ListPlus className="h-3.5 w-3.5" />
                                Add Task
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5"
                              onClick={() => setEditTarget(log)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1.5 text-primary border-primary/40 hover:bg-primary/10"
                              disabled={isBeingSubmitted}
                              onClick={() => handleSubmit(log)}
                            >
                              {isBeingSubmitted ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Submit
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    </GlassCard>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Create Dialog */}
      <WorklogDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        takenDates={takenDates}
      />

      {/* Edit Dialog */}
      {editTarget && (
        <WorklogDialog
          open={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          existing={editTarget}
          takenDates={takenDates}
        />
      )}

      {/* Quick Add Task Dialog */}
      {quickAddTarget && (
        <QuickAddTaskDialog
          open={Boolean(quickAddTarget)}
          onClose={() => setQuickAddTarget(null)}
          worklog={quickAddTarget}
        />
      )}
    </DashboardLayout>
  );
};

export default Worklogs;

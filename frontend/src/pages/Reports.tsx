import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Plus,
  Trash2,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyReportsQuery,
  useSubmitReportMutation,
  useDeleteReportMutation,
} from "@/app/apiService";

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"all" | "weekly" | "monthly">("all");

  // Pass the type filter to the query unless 'all' is selected
  const { data: reports = [], isLoading } = useGetMyReportsQuery(
    activeTab === "all" ? undefined : { type: activeTab }
  );

  const [submitReport, { isLoading: isSubmitting }] = useSubmitReportMutation();
  const [deleteReport] = useDeleteReportMutation();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newReport, setNewReport] = useState<{
    type: "weekly" | "monthly";
    driveLink: string;
  }>({
    type: "weekly",
    driveLink: "",
  });

  // Structured period selection
  const currentMonth = new Date().toLocaleString('default', { month: 'short' });
  const currentYear = new Date().getFullYear().toString();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedWeek, setSelectedWeek] = useState("Week 1");

  const isSubmitValid =
    newReport.driveLink.trim().startsWith("http") &&
    selectedMonth !== "" &&
    selectedYear !== "" &&
    (newReport.type === "monthly" || selectedWeek !== "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitValid) return;

    let periodStr = `${selectedMonth} ${selectedYear}`;
    if (newReport.type === "weekly") {
      periodStr += ` - ${selectedWeek}`;
    }

    try {
      await submitReport({
        type: newReport.type,
        period: periodStr,
        driveLink: newReport.driveLink
      }).unwrap();
      toast.success("Report submitted successfully");
      setIsAddOpen(false);
      setNewReport({ type: "weekly", driveLink: "" });
      setSelectedMonth(currentMonth);
      setSelectedYear(currentYear);
      setSelectedWeek("Week 1");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to submit report");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this report?")) return;
    try {
      await deleteReport(id).unwrap();
      toast.success("Report deleted");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete report");
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Reports</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Submit and manage your weekly and monthly reports.
          </p>
        </div>

        <Button onClick={() => setIsAddOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Submit Report
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="mb-6"
      >
        <TabsList className="grid w-[300px] grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <GlassCard className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center border-dashed">
          <FileText className="w-12 h-12 mb-4 opacity-20" />
          <p>No reports found.</p>
          <p className="text-sm mt-1">Click "Submit Report" to add your first entry.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reports.map((report) => (
            <a
              href={report.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              key={report.id}
              className="block group"
            >
              <GlassCard className="p-5 h-full flex flex-col hover:border-primary/50 transition-colors relative cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-lg ${report.type === "monthly"
                        ? "bg-purple-500/10 text-purple-500"
                        : "bg-blue-500/10 text-blue-500"
                        }`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {report.type}
                    </span>
                  </div>
                  <button
                    onClick={(e) => handleDelete(report.id, e)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 z-10 relative"
                    title="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
                  {report.period}
                </h3>

                <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(report.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                    Open <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </GlassCard>
            </a>
          ))}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit New Report</DialogTitle>
            <DialogDescription>
              Provide the Google Docs link for your report. Make sure the link is
              accessible to your mentors.
            </DialogDescription>
          </DialogHeader>

          <form id="submit-report-form" onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <select
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={newReport.type}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    type: e.target.value as "weekly" | "monthly",
                  })
                }
              >
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <select
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <select
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {[2024, 2025, 2026, 2027, 2028].map(y => (
                    <option key={y} value={y.toString()}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {newReport.type === "weekly" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Week</label>
                <select
                  required
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                >
                  {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Google Docs / Drive Link</label>
              <Input
                required
                type="url"
                placeholder="https://docs.google.com/document/d/..."
                value={newReport.driveLink}
                onChange={(e) => setNewReport({ ...newReport, driveLink: e.target.value })}
              />
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="submit-report-form"
              disabled={isSubmitting || !isSubmitValid}
              className="min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

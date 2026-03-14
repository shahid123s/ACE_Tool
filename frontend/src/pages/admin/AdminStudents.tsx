import { useState, useDeferredValue } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MoreHorizontal, Pencil, Ban, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useGetAdminStudentsQuery, useCreateStudentMutation, useUpdateStudentMutation, CreateStudentRequest } from "@/app/apiService";
import { toast } from "sonner";

export default function AdminStudents() {
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [domainFilter, setDomainFilter] = useState("all");
    const [stageFilter, setStageFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const { data: studentsData } = useGetAdminStudentsQuery({
        page,
        limit: 10,
        search: deferredSearchQuery || undefined,
        domain: domainFilter === "all" ? undefined : domainFilter,
        stage: stageFilter === "all" ? undefined : stageFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
    });
    const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
    const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

    const students = studentsData?.students || [];
    const totalPages = studentsData?.totalPages || 1;
    const totalCount = studentsData?.total || 0;
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [newStudent, setNewStudent] = useState<CreateStudentRequest>({ aceId: "", name: "", email: "", phone: "", batch: "", domain: "", tier: "Tier-1" });

    const [isCustomDomainCreate, setIsCustomDomainCreate] = useState(false);
    const [customDomainCreateValue, setCustomDomainCreateValue] = useState("");
    const [isCustomDomainEdit, setIsCustomDomainEdit] = useState(false);
    const [customDomainEditValue, setCustomDomainEditValue] = useState("");

    const baseDomainOptions = ["MERN", "MEAN", "Python+Django", "Flutter", "Cybersecurity", "DS", "ML"];
    const baseDomainLabels: Record<string, string> = { "MERN": "MERN Stack", "MEAN": "MEAN Stack", "Python+Django": "Python + Django", "Flutter": "Flutter", "Cybersecurity": "Cybersecurity", "DS": "Data Science", "ML": "Machine Learning" };

    // The dynamicDomains extraction now only operates on CURRENT page's students, 
    // but we can retain previously seen domains by keeping a broader set globally if needed.
    // However, since server-side filtering is active, we mostly rely on base domains or typed filters.
    const dynamicDomains = Array.from(new Set(students.map((s: any) => s.domain).filter(Boolean)));
    const allDomainOptions = Array.from(new Set([...baseDomainOptions, ...dynamicDomains]));

    const handleSearchChange = (val: string) => {
        setSearchQuery(val);
        setPage(1); // Reset page on new search
    };

    const handleDomainChange = (val: string) => {
        setDomainFilter(val);
        setPage(1); // Reset page on new filter
    };

    const handleStageChange = (val: string) => {
        setStageFilter(val);
        setPage(1);
    };

    const handleStatusChange = (val: string) => {
        setStatusFilter(val);
        setPage(1);
    };

    const handleEditClick = (student: any) => {
        setEditingStudent({ id: student.id, name: student.name, email: student.email, phone: student.phone || "", aceId: student.aceId || "", batch: student.batch || "", domain: student.domain || "", tier: student.tier || "Tier-1", stage: student.stage || "Boarding week", status: student.status || "ongoing" });
        setEditDialogOpen(true);
    };

    const handleCloseEdit = () => {
        setEditDialogOpen(false);
        setEditingStudent(null);
        setIsCustomDomainEdit(false);
        setCustomDomainEditValue("");
    };

    const handleUpdateStudent = async () => {
        if (!editingStudent) return;
        try {
            const finalDomain = isCustomDomainEdit ? customDomainEditValue.trim() : editingStudent.domain;
            const { id, ...data } = editingStudent;
            await updateStudent({ id, data: { ...data, domain: finalDomain } }).unwrap();
            toast.success("Student updated successfully");
            handleCloseEdit();
        } catch (err: any) {
            toast.error("Failed to update student", { description: err.data?.message });
        }
    };

    const handleStatusToggle = async (student: any, newStatus: string) => {
        try {
            await updateStudent({ id: student.id, data: { status: newStatus } }).unwrap();
            toast.success("Status updated successfully");
        } catch { toast.error("Failed to update status"); }
    };

    const handleCloseCreate = () => {
        setCreateDialogOpen(false);
        setNewStudent({ aceId: "", name: "", email: "", phone: "", batch: "", domain: "", tier: "Tier-1" });
        setIsCustomDomainCreate(false);
        setCustomDomainCreateValue("");
    };

    const handleCreateStudent = async () => {
        try {
            const finalDomain = isCustomDomainCreate ? customDomainCreateValue.trim() : newStudent.domain;
            await createStudent({ ...newStudent, domain: finalDomain }).unwrap();
            toast.success("Student created successfully", { description: "Credentials have been sent to their email." });
            handleCloseCreate();
        } catch (err: any) {
            toast.error("Failed to create student", { description: err.data?.message });
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Students</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage trainee accounts and profiles</p>
            </div>

            <GlassCard>
                <div className="flex flex-col sm:flex-row gap-3 mb-4 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search students..." value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} className="pl-9 glass-input" />
                    </div>
                    <Select value={domainFilter} onValueChange={handleDomainChange}>
                        <SelectTrigger className="w-full sm:w-36 glass-input"><SelectValue placeholder="Domain" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            {allDomainOptions.map(d => <SelectItem key={d as string} value={d as string}>{baseDomainLabels[d as string] || (d as string)}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={stageFilter} onValueChange={handleStageChange}>
                        <SelectTrigger className="w-full sm:w-36 glass-input"><SelectValue placeholder="Stage" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Stages</SelectItem>
                            <SelectItem value="Boarding week">Boarding week</SelectItem>
                            <SelectItem value="Learning phase">Learning phase</SelectItem>
                            <SelectItem value="Project phase">Project phase</SelectItem>
                            <SelectItem value="Placement phase">Placement phase</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full sm:w-36 glass-input"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="hold">Hold</SelectItem>
                            <SelectItem value="placed">Placed</SelectItem>
                            <SelectItem value="dropout">Dropout</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
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
                                <TableHead className="text-center">Batch</TableHead>
                                <TableHead className="text-center">Stage</TableHead>
                                <TableHead className="w-[50px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students.map((s: any) => (
                                <TableRow key={s.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-foreground">{s.name}</p>
                                            <p className="text-xs text-muted-foreground">{s.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{s.domain || '-'}</TableCell>
                                    <TableCell><StatusBadge status={s.status} label={s.status.charAt(0).toUpperCase() + s.status.slice(1)} /></TableCell>
                                    <TableCell className="text-center font-medium">{s.batch || '-'}</TableCell>
                                    <TableCell className="text-center">{s.stage || '-'}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="glass-card bg-background/95 backdrop-blur-xl border-border/50">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEditClick(s)}><Pencil className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                {s.status === 'ongoing' ? (
                                                    <DropdownMenuItem onClick={() => handleStatusToggle(s, 'hold')} className="text-warning"><Ban className="mr-2 h-4 w-4" /> Block / Hold</DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem onClick={() => handleStatusToggle(s, 'ongoing')} className="text-success"><CheckCircle className="mr-2 h-4 w-4" /> Unblock / Activate</DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4 border-t border-border/50 pt-4 px-2">
                        <span className="text-sm text-muted-foreground">
                            Page {page} of {totalPages} <span className="hidden sm:inline">({totalCount} total students)</span>
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </GlassCard>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) handleCloseCreate(); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Add New Student</DialogTitle>
                        <DialogDescription>Create a new student account. Credentials will be emailed.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        {[{ label: "ACE ID", key: "aceId", placeholder: "e.g. ACE123" }, { label: "Full Name", key: "name", placeholder: "John Doe" }, { label: "Email", key: "email", placeholder: "john@example.com", type: "email" }, { label: "Phone", key: "phone", placeholder: "+91 9876543210" }, { label: "Batch", key: "batch", placeholder: "Batch-1" }].map(f => (
                            <div key={f.key} className="space-y-2">
                                <label className="text-sm font-medium">{f.label}</label>
                                <Input type={f.type} placeholder={f.placeholder} value={(newStudent as any)[f.key]} onChange={(e) => setNewStudent({ ...newStudent, [f.key]: e.target.value })} />
                            </div>
                        ))}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Domain</label>
                            {isCustomDomainCreate ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Enter custom domain..."
                                        value={customDomainCreateValue}
                                        onChange={(e) => setCustomDomainCreateValue(e.target.value)}
                                        className="glass-input flex-1"
                                    />
                                    <Button type="button" variant="outline" onClick={() => setIsCustomDomainCreate(false)} className="px-3 text-muted-foreground hover:text-foreground">X</Button>
                                </div>
                            ) : (
                                <Select value={newStudent.domain} onValueChange={(val) => {
                                    if (val === "CUSTOM") setIsCustomDomainCreate(true);
                                    else setNewStudent({ ...newStudent, domain: val });
                                }}>
                                    <SelectTrigger className="glass-input"><SelectValue placeholder="Select Domain" /></SelectTrigger>
                                    <SelectContent>
                                        {allDomainOptions.map(d => <SelectItem key={d as string} value={d as string}>{baseDomainLabels[d as string] || (d as string)}</SelectItem>)}
                                        <SelectItem value="CUSTOM" className="text-primary font-medium">+ Add Custom Domain</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tier</label>
                            <Select value={newStudent.tier} onValueChange={(val: any) => setNewStudent({ ...newStudent, tier: val })}>
                                <SelectTrigger><SelectValue placeholder="Select Tier" /></SelectTrigger>
                                <SelectContent><SelectItem value="Tier-1">Tier-1</SelectItem><SelectItem value="Tier-2">Tier-2</SelectItem><SelectItem value="Tier-3">Tier-3</SelectItem></SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseCreate}>Cancel</Button>
                        <Button onClick={handleCreateStudent} disabled={isCreating}>{isCreating ? "Creating..." : "Create Student"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) handleCloseEdit(); }}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>Update student details and status.</DialogDescription>
                    </DialogHeader>
                    {editingStudent && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                            {(["aceId", "name", "email", "phone"] as const).map(k => (
                                <div key={k} className="space-y-2">
                                    <label className="text-sm font-medium capitalize">{k === "aceId" ? "ACE ID" : k}</label>
                                    <Input value={editingStudent[k]} onChange={(e) => setEditingStudent({ ...editingStudent, [k]: e.target.value })} className="glass-input opacity-50 cursor-not-allowed" readOnly />
                                </div>
                            ))}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Batch</label>
                                <Input value={editingStudent.batch} onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value })} className="glass-input" />
                            </div>
                            {/* Domain */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Domain</label>
                                {isCustomDomainEdit ? (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Enter custom domain..."
                                            value={customDomainEditValue}
                                            onChange={(e) => setCustomDomainEditValue(e.target.value)}
                                            className="glass-input flex-1"
                                        />
                                        <Button type="button" variant="outline" onClick={() => setIsCustomDomainEdit(false)} className="px-3 text-muted-foreground hover:text-foreground">X</Button>
                                    </div>
                                ) : (
                                    <Select value={editingStudent.domain} onValueChange={(val) => {
                                        if (val === "CUSTOM") setIsCustomDomainEdit(true);
                                        else setEditingStudent({ ...editingStudent, domain: val });
                                    }}>
                                        <SelectTrigger className="glass-input"><SelectValue placeholder="Select Domain" /></SelectTrigger>
                                        <SelectContent>
                                            {allDomainOptions.map(d => <SelectItem key={d as string} value={d as string}>{baseDomainLabels[d as string] || (d as string)}</SelectItem>)}
                                            <SelectItem value="CUSTOM" className="text-primary font-medium">+ Add Custom Domain</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            {/* Tier */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tier</label>
                                <Select value={editingStudent.tier} onValueChange={(val) => setEditingStudent({ ...editingStudent, tier: val })}>
                                    <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                                    <SelectContent><SelectItem value="Tier-1">Tier-1</SelectItem><SelectItem value="Tier-2">Tier-2</SelectItem><SelectItem value="Tier-3">Tier-3</SelectItem></SelectContent>
                                </Select>
                            </div>
                            {/* Stage */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stage</label>
                                <Select value={editingStudent.stage} onValueChange={(val) => setEditingStudent({ ...editingStudent, stage: val })}>
                                    <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                                    <SelectContent>{["Placement", "Boarding week", "TOI", "Project", "2 FD", "1 FD", "Placed"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={editingStudent.status} onValueChange={(val) => setEditingStudent({ ...editingStudent, status: val })}>
                                    <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                                    <SelectContent>{["ongoing", "removed", "break", "hold", "placed"].map(s => <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseEdit}>Cancel</Button>
                        <Button onClick={handleUpdateStudent} disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

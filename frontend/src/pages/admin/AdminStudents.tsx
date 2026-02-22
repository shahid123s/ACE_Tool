import { useState } from "react";
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
    const { data: studentsData } = useGetAdminStudentsQuery({});
    const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation();
    const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation();

    const students = Array.isArray(studentsData) ? studentsData : studentsData?.students || [];

    const [searchQuery, setSearchQuery] = useState("");
    const [domainFilter, setDomainFilter] = useState("all");
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<any>(null);
    const [newStudent, setNewStudent] = useState<CreateStudentRequest>({ aceId: "", name: "", email: "", phone: "", batch: "", domain: "", tier: "Tier-1" });

    const filteredStudents = students.filter((s: any) => {
        const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDomain = domainFilter === "all" || s.domain === domainFilter;
        return matchesSearch && matchesDomain;
    });

    const handleEditClick = (student: any) => {
        setEditingStudent({ id: student.id, name: student.name, email: student.email, phone: student.phone || "", aceId: student.aceId || "", batch: student.batch || "", domain: student.domain || "", tier: student.tier || "Tier-1", stage: student.stage || "Boarding week", status: student.status || "ongoing" });
        setEditDialogOpen(true);
    };

    const handleUpdateStudent = async () => {
        if (!editingStudent) return;
        try {
            const { id, ...data } = editingStudent;
            await updateStudent({ id, data }).unwrap();
            toast.success("Student updated successfully");
            setEditDialogOpen(false);
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

    const handleCreateStudent = async () => {
        try {
            await createStudent(newStudent).unwrap();
            toast.success("Student created successfully", { description: "Credentials have been sent to their email." });
            setCreateDialogOpen(false);
            setNewStudent({ aceId: "", name: "", email: "", phone: "", batch: "", domain: "", tier: "Tier-1" });
        } catch (err: any) {
            toast.error("Failed to create student", { description: err.data?.message });
        }
    };

    const domainOptions = ["MERN", "MEAN", "Python+Django", "Flutter", "Cybersecurity", "DS", "ML"];
    const domainLabels: Record<string, string> = { "MERN": "MERN Stack", "MEAN": "MEAN Stack", "Python+Django": "Python + Django", "Flutter": "Flutter", "Cybersecurity": "Cybersecurity", "DS": "Data Science", "ML": "Machine Learning" };

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Students</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage trainee accounts and profiles</p>
            </div>

            <GlassCard>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search students..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 glass-input" />
                    </div>
                    <Select value={domainFilter} onValueChange={setDomainFilter}>
                        <SelectTrigger className="w-full sm:w-44 glass-input"><SelectValue placeholder="Domain" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Domains</SelectItem>
                            {domainOptions.map(d => <SelectItem key={d} value={d}>{domainLabels[d]}</SelectItem>)}
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
                                <TableHead className="text-center">Batch</TableHead>
                                <TableHead className="text-center">Stage</TableHead>
                                <TableHead className="w-[50px]">Action</TableHead>
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
            </GlassCard>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
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
                            <Select value={newStudent.domain} onValueChange={(val) => setNewStudent({ ...newStudent, domain: val })}>
                                <SelectTrigger><SelectValue placeholder="Select Domain" /></SelectTrigger>
                                <SelectContent>{domainOptions.map(d => <SelectItem key={d} value={d}>{domainLabels[d]}</SelectItem>)}</SelectContent>
                            </Select>
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
                        <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateStudent} disabled={isCreating}>{isCreating ? "Creating..." : "Create Student"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
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
                                <Select value={editingStudent.domain} onValueChange={(val) => setEditingStudent({ ...editingStudent, domain: val })}>
                                    <SelectTrigger className="glass-input"><SelectValue placeholder="Select Domain" /></SelectTrigger>
                                    <SelectContent>{domainOptions.map(d => <SelectItem key={d} value={d}>{domainLabels[d]}</SelectItem>)}</SelectContent>
                                </Select>
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
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateStudent} disabled={isUpdating}>{isUpdating ? "Saving..." : "Save Changes"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShieldCheck, Plus, UserCheck, KeyRound, Mail, Copy, CheckCheck, AlertTriangle } from "lucide-react";
import { useGetSuperAdminAdminsQuery, useInitiateAdminCreationMutation, useConfirmAdminCreationMutation } from "@/app/apiService";
import { toast } from "sonner";

type FlowStep = "idle" | "initiated" | "confirmed";

export default function SuperAdminAdmins() {
    const { data, isLoading, refetch } = useGetSuperAdminAdminsQuery();
    const [initiateAdminCreation, { isLoading: isInitiating }] = useInitiateAdminCreationMutation();
    const [confirmAdminCreation, { isLoading: isConfirming }] = useConfirmAdminCreationMutation();

    const admins = data?.admins ?? [];

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [flowStep, setFlowStep] = useState<FlowStep>("idle");

    // Form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");

    // Success state
    const [createdAdmin, setCreatedAdmin] = useState<{ name: string; email: string; tempPassword: string } | null>(null);
    const [copied, setCopied] = useState(false);

    const resetDialog = () => {
        setFlowStep("idle");
        setName("");
        setEmail("");
        setOtp("");
        setCreatedAdmin(null);
        setCopied(false);
        setDialogOpen(false);
    };

    const handleInitiate = async () => {
        if (!name.trim() || !email.trim()) {
            toast.error("Name and email are required");
            return;
        }
        try {
            const res = await initiateAdminCreation({ name: name.trim(), email: email.trim() }).unwrap();
            toast.success("OTP Sent!", { description: res.message });
            setFlowStep("initiated");
        } catch (err: any) {
            toast.error("Failed to send OTP", { description: err.data?.message || err.message });
        }
    };

    const handleConfirm = async () => {
        if (!otp.trim()) {
            toast.error("Please enter the OTP");
            return;
        }
        try {
            const res = await confirmAdminCreation({ otp: otp.trim() }).unwrap();
            setCreatedAdmin({ name: res.user.name, email: res.user.email, tempPassword: res.tempPassword });
            setFlowStep("confirmed");
            toast.success("Admin account created!", { description: `Credentials emailed to ${res.user.email}` });
            refetch();
        } catch (err: any) {
            toast.error("Confirmation failed", { description: err.data?.message || err.message });
        }
    };

    const handleCopy = () => {
        if (createdAdmin) {
            navigator.clipboard.writeText(createdAdmin.tempPassword);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        SuperAdmin only — create and view admin accounts
                    </p>
                </div>
                <Button onClick={() => { setDialogOpen(true); setFlowStep("idle"); }}>
                    <Plus className="h-4 w-4 mr-1" /> Create Admin
                </Button>
            </div>

            <GlassCard>
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <p className="text-sm text-muted-foreground p-4">Loading admins...</p>
                    ) : admins.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                            <UserCheck className="h-10 w-10 opacity-30" />
                            <p className="text-sm font-medium">No admins yet</p>
                            <p className="text-xs">Click "Create Admin" to add the first admin.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admins.map((admin: any) => (
                                    <TableRow key={admin.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <ShieldCheck className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="font-medium text-foreground">{admin.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                                        <TableCell>
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary uppercase tracking-wide">
                                                Admin
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "—"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </GlassCard>

            {/* Create Admin Dialog — 2-step OTP flow */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); }}>
                <DialogContent className="max-w-md">
                    {/* ── Step 1: Enter admin details ── */}
                    {flowStep === "idle" && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" /> Create Admin Account
                                </DialogTitle>
                                <DialogDescription>
                                    Enter the new admin's details. An OTP will be sent to <strong>your SuperAdmin email</strong> for confirmation.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Full Name</label>
                                    <Input
                                        placeholder="e.g. John Manager"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="john@ace.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={resetDialog}>Cancel</Button>
                                <Button onClick={handleInitiate} disabled={isInitiating}>
                                    <Mail className="h-4 w-4 mr-1.5" />
                                    {isInitiating ? "Sending OTP..." : "Send OTP"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {/* ── Step 2: Enter OTP ── */}
                    {flowStep === "initiated" && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <KeyRound className="h-5 w-5 text-primary" /> Enter OTP
                                </DialogTitle>
                                <DialogDescription>
                                    A 6-digit OTP has been sent to your SuperAdmin email. Enter it below to confirm creating the admin account for <strong>{email}</strong>.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-700">The OTP expires in <strong>15 minutes</strong>. Do not share it with anyone.</p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">6-Digit OTP</label>
                                    <Input
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                        maxLength={6}
                                        className="text-center text-xl tracking-[0.5em] font-bold"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setFlowStep("idle")}>Back</Button>
                                <Button onClick={handleConfirm} disabled={isConfirming || otp.length < 6}>
                                    {isConfirming ? "Creating..." : "Confirm & Create Admin"}
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {/* ── Step 3: Success ── */}
                    {flowStep === "confirmed" && createdAdmin && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-green-600">
                                    <UserCheck className="h-5 w-5" /> Admin Created!
                                </DialogTitle>
                                <DialogDescription>
                                    The admin account has been created and credentials emailed to <strong>{createdAdmin.email}</strong>.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-3 py-2">
                                <div className="rounded-lg bg-muted/60 border border-border p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Name</span>
                                        <span className="font-medium">{createdAdmin.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Email</span>
                                        <span className="font-medium">{createdAdmin.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Temp Password</span>
                                        <div className="flex items-center gap-1.5">
                                            <code className="font-mono text-xs bg-background px-2 py-0.5 rounded border border-border">
                                                {createdAdmin.tempPassword}
                                            </code>
                                            <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
                                                {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={resetDialog}>Done</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

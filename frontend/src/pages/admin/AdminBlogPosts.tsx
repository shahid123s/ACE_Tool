import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Search, Loader2 } from "lucide-react";
import { useGetAdminBlogPostsQuery, useScoreAdminBlogPostMutation } from "@/app/apiService";
import { toast } from "sonner";

export default function AdminBlogPosts() {
    const { data: blogPostsData = [], isLoading: blogPostsLoading } = useGetAdminBlogPostsQuery();
    const [scoreBlogPost, { isLoading: isScoring }] = useScoreAdminBlogPostMutation();
    const [scoringPost, setScoringPost] = useState<any | null>(null);
    const [scoreInput, setScoreInput] = useState<string>("");
    const [blogSearchQuery, setBlogSearchQuery] = useState("");

    const filtered = blogPostsData.filter((p: any) =>
        blogSearchQuery
            ? (p.userName?.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                p.aceId?.toLowerCase().includes(blogSearchQuery.toLowerCase()) ||
                p.title.toLowerCase().includes(blogSearchQuery.toLowerCase()))
            : true
    );

    return (
        <AdminLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
                <p className="text-sm text-muted-foreground mt-1">Review and score blog posts submitted by trainees</p>
            </div>

            <GlassCard>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by student name, ACE ID, or title..." value={blogSearchQuery} onChange={(e) => setBlogSearchQuery(e.target.value)} className="pl-9 glass-input" />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-border/50">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>ACE ID</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Submitted On</TableHead>
                                <TableHead className="text-center">Avg. Score</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blogPostsLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length > 0 ? filtered.map((p: any) => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">{p.userName || "Unknown"}</TableCell>
                                    <TableCell>
                                        <span className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">{p.aceId || "—"}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="capitalize text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p.platform}</span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <a href={p.link} target="_blank" rel="noreferrer" className="text-sm text-foreground hover:text-primary hover:underline line-clamp-1">{p.title}</a>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(p.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`text-sm font-semibold ${p.averageScore > 0 ? "text-amber-400" : "text-muted-foreground"}`}>
                                            {p.averageScore > 0 ? p.averageScore.toFixed(1) : "—"}
                                            {p.scores?.length > 0 && (
                                                <span className="text-xs font-normal text-muted-foreground ml-1">({p.scores.length})</span>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <a href={p.link} target="_blank" rel="noreferrer">View</a>
                                            </Button>
                                            <Button size="sm" onClick={() => { setScoringPost(p); setScoreInput(""); }}>Score</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No blog posts found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </GlassCard>

            {/* Score Dialog */}
            <Dialog open={Boolean(scoringPost)} onOpenChange={(v) => { if (!v) { setScoringPost(null); setScoreInput(""); } }}>
                <DialogContent className="glass-card sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Score Blog Post</DialogTitle>
                        <DialogDescription>Give a score from 0 to 10. The average of all admin scores is shown to students.</DialogDescription>
                    </DialogHeader>
                    {scoringPost && (
                        <div className="space-y-4 py-2">
                            <div className="rounded-lg bg-muted/40 p-3 space-y-1.5">
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Post</p>
                                <a href={scoringPost.link} target="_blank" rel="noreferrer" className="text-sm font-semibold text-foreground hover:text-primary hover:underline">{scoringPost.title}</a>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1">
                                    <span>Student: <span className="text-foreground font-medium">{scoringPost.userName}</span></span>
                                    {scoringPost.aceId && <span>ACE ID: <span className="text-foreground font-medium">#{scoringPost.aceId}</span></span>}
                                    <span className="capitalize">Platform: <span className="text-foreground font-medium">{scoringPost.platform}</span></span>
                                </div>
                            </div>
                            {scoringPost.scores?.length > 0 && (
                                <div className="rounded-lg bg-muted/40 p-3 space-y-2">
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Scores so far</p>
                                    {scoringPost.scores.map((s: any) => (
                                        <div key={s.adminId} className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">{s.adminName}</span>
                                            <span className="font-semibold text-amber-400">{s.score} / 10</span>
                                        </div>
                                    ))}
                                    <div className="border-t border-border/50 pt-2 flex items-center justify-between text-sm font-semibold">
                                        <span>Average</span>
                                        <span className="text-amber-400">{scoringPost.averageScore?.toFixed(1)} / 10</span>
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Score (0–10)</label>
                                <input type="number" min={0} max={10} step={0.5} placeholder="e.g. 8.5"
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={scoreInput} onChange={(e) => setScoreInput(e.target.value)} />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setScoringPost(null); setScoreInput(""); }}>Cancel</Button>
                        <Button disabled={isScoring || scoreInput === "" || Number(scoreInput) < 0 || Number(scoreInput) > 10} className="min-w-[90px]"
                            onClick={async () => {
                                if (!scoringPost) return;
                                try {
                                    await scoreBlogPost({ id: scoringPost.id, score: Number(scoreInput) }).unwrap();
                                    toast.success("Score submitted!");
                                    setScoringPost(null); setScoreInput("");
                                } catch (err: any) { toast.error(err?.data?.message || "Failed to submit score"); }
                            }}>
                            {isScoring ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Score"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}

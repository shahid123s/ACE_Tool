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
import {
  Plus,
  ExternalLink,
  Trash2,
  Star,
  Loader2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import {
  useGetMyBlogPostsQuery,
  useSubmitBlogPostMutation,
  useDeleteBlogPostMutation,
} from "@/app/apiService";
import { BlogPlatform } from "@/app/types";

// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS: { value: BlogPlatform; label: string }[] = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X (Twitter)" },
  { value: "devto", label: "Dev.to" },
  { value: "medium", label: "Medium" },
  { value: "hashnode", label: "Hashnode" },
  { value: "other", label: "Other" },
];

const platformColors: Record<BlogPlatform, string> = {
  linkedin: "bg-blue-500/15 text-blue-500 border border-blue-500/20",
  x: "bg-zinc-500/15 text-zinc-300 border border-zinc-500/20",
  devto: "bg-violet-500/15 text-violet-400 border border-violet-500/20",
  medium: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  hashnode: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
  other: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
};

const platformLabels: Record<BlogPlatform, string> = {
  linkedin: "LinkedIn",
  x: "X (Twitter)",
  devto: "Dev.to",
  medium: "Medium",
  hashnode: "Hashnode",
  other: "Other",
};

// ─── Star score display ───────────────────────────────────────────────────────
function ScoreStars({ score }: { score: number }) {
  const filled = Math.round(score / 2); // 0-10 → 0-5
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= filled ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-muted-foreground">
        {score > 0 ? score.toFixed(1) : "Not scored yet"}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function BlogPosts() {
  const { data: posts = [], isLoading } = useGetMyBlogPostsQuery();
  const [submitPost, { isLoading: isSubmitting }] = useSubmitBlogPostMutation();
  const [deletePost] = useDeleteBlogPostMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    link: string;
    platform: BlogPlatform;
  }>({ title: "", link: "", platform: "linkedin" });

  const isValid =
    form.title.trim().length > 0 && form.link.trim().startsWith("http");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await submitPost(form).unwrap();
      toast.success("Blog post submitted!");
      setIsOpen(false);
      setForm({ title: "", link: "", platform: "linkedin" });
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit post");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      await deletePost(id).unwrap();
      toast.success("Post deleted");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete post");
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your published articles and posts
          </p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Submit Post
        </Button>
      </div>

      {/* Posts grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : posts.length === 0 ? (
        <GlassCard className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <BookOpen className="h-10 w-10 text-muted-foreground/40" />
          <p className="font-medium text-foreground">No posts yet</p>
          <p className="text-sm text-muted-foreground">
            Share your first blog post by clicking "Submit Post"
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post, i) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <GlassCard
                className={`h-full flex flex-col animate-fade-up stagger-${(i % 6) + 1} hover:border-primary/40 transition-colors`}
              >
                {/* Top row: platform badge + delete */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${platformColors[post.platform]}`}
                  >
                    {platformLabels[post.platform]}
                  </span>
                  <button
                    onClick={(e) => handleDelete(post.id, e)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-foreground text-sm mb-3 line-clamp-2 flex-1">
                  {post.title}
                </h3>

                {/* Bottom row: date + score + view */}
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {new Date(post.submittedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <ScoreStars score={post.averageScore} />
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
                    View <ExternalLink className="h-3 w-3" />
                  </span>
                </div>
              </GlassCard>
            </a>
          ))}
        </div>
      )}

      {/* Submit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md glass-card">
          <DialogHeader>
            <DialogTitle>Submit Blog Post</DialogTitle>
            <DialogDescription>
              Add a link to your published post. Make sure it's publicly accessible.
            </DialogDescription>
          </DialogHeader>

          <form id="blog-form" onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platform</label>
              <select
                required
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={form.platform}
                onChange={(e) =>
                  setForm({ ...form, platform: e.target.value as BlogPlatform })
                }
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Post Title</label>
              <Input
                required
                placeholder="e.g. Building Glassmorphism UIs with Tailwind"
                className="glass-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Post URL</label>
              <Input
                required
                type="url"
                placeholder="https://medium.com/@you/your-post"
                className="glass-input"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
              />
            </div>
          </form>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="blog-form"
              disabled={isSubmitting || !isValid}
              className="min-w-[90px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

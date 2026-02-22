import { useLocation } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const titleMap: Record<string, string> = {
    "/admin": "Overview",
    "/admin/students": "Students",
    "/admin/worklogs": "Worklogs",
    "/admin/reports": "Reports",
    "/admin/blogs": "Blog Posts",
    "/admin/meetings": "Meetings",
    "/admin/concerns": "Concerns",
    "/admin/requests": "Requests",
    "/admin/alerts": "Alerts",
};

export function AdminTopNav() {
    const { pathname } = useLocation();
    const title = titleMap[pathname] ?? "Admin Panel";

    return (
        <header className="h-16 border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-20 shrink-0">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-muted-foreground">Admin</span>
                    <span className="text-muted-foreground/50">/</span>
                    <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                </div>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Admin
                </span>
            </div>
        </header>
    );
}

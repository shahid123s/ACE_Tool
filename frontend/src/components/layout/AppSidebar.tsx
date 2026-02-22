import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Clock,
    FileText,
    BarChart3,
    PenLine,
    Code2,
    CalendarDays,
    AlertCircle,
    ListTodo,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const userNav = [
    { label: "Dashboard", to: "/", icon: LayoutDashboard },
    { label: "Attendance", to: "/attendance", icon: Clock },
    { label: "Worklogs", to: "/worklogs", icon: FileText },
    { label: "Reports", to: "/reports", icon: BarChart3 },
    { label: "Blog Posts", to: "/blogs", icon: PenLine },
    { label: "LeetCode", to: "/leetcode", icon: Code2 },
    { label: "Meetings", to: "/meetings", icon: CalendarDays },
    { label: "Concerns", to: "/concerns", icon: AlertCircle },
    { label: "Requests", to: "/requests", icon: ListTodo },
];

export function AppSidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "glass-sidebar h-screen sticky top-0 flex flex-col transition-all duration-300 z-30",
                collapsed ? "w-16" : "w-60"
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center px-4 border-b border-border/50">
                {!collapsed && (
                    <span className="text-lg font-bold text-primary tracking-tight">ACE</span>
                )}
                {collapsed && (
                    <span className="text-lg font-bold text-primary mx-auto">A</span>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 overflow-y-auto">
                <div className="px-3 mb-2">
                    {!collapsed && <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-2">Menu</p>}
                </div>
                {userNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                        }
                    >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed((c) => !c)}
                className="h-12 flex items-center justify-center border-t border-border/50 text-muted-foreground hover:text-foreground transition-colors"
            >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
        </aside>
    );
}

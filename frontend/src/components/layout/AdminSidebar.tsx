import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { logout, selectCurrentUser } from "@/app/authSlice";
import {
    LayoutDashboard,
    Users,
    FileText,
    BarChart3,
    PenLine,
    CalendarDays,
    AlertCircle,
    ListTodo,
    Bell,
    ChevronLeft,
    ChevronRight,
    LogOut,
    ShieldCheck,
} from "lucide-react";

const adminNav = [
    { label: "Overview", to: "/admin", icon: LayoutDashboard },
    { label: "Students", to: "/admin/students", icon: Users },
    { label: "Worklogs", to: "/admin/worklogs", icon: FileText },
    { label: "Reports", to: "/admin/reports", icon: BarChart3 },
    { label: "Blog Posts", to: "/admin/blogs", icon: PenLine },
    { label: "Meetings", to: "/admin/meetings", icon: CalendarDays },
    { label: "Concerns", to: "/admin/concerns", icon: AlertCircle },
    { label: "Requests", to: "/admin/requests", icon: ListTodo },
    { label: "Alerts", to: "/admin/alerts", icon: Bell },
];

export function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const user = useAppSelector(selectCurrentUser);

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    return (
        <aside
            className={cn(
                "glass-sidebar h-screen sticky top-0 flex flex-col transition-all duration-300 z-30",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo / Brand */}
            <div className="h-16 flex items-center gap-3 px-4 border-b border-border/50 shrink-0">
                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-primary leading-none">ACE Admin</p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-5">
                        Management
                    </p>
                )}
                {adminNav.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/admin"}
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

            {/* Logout */}
            <div className="border-t border-border/50">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-3 w-full px-5 py-3.5 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors",
                        collapsed && "justify-center px-0"
                    )}
                >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed((c) => !c)}
                className="h-10 flex items-center justify-center border-t border-border/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
        </aside>
    );
}

import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopNav } from "./AdminTopNav";
import { BackgroundBlobs } from "@/components/shared/BackgroundBlobs";

interface AdminLayoutProps {
    children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    return (
        <div className="flex min-h-screen w-full relative">
            <BackgroundBlobs />
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminTopNav />
                <main className="flex-1 p-6 z-10 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";
import { BackgroundBlobs } from "@/components/shared/BackgroundBlobs";

export function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen w-full relative">
            <BackgroundBlobs />
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopNav />
                <main className="flex-1 p-6 z-10 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}

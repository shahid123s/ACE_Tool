import { Bell, User } from "lucide-react";

export function TopNav() {
    return (
        <header className="h-16 border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-20">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">ACE Platform</h2>
                </div>

                <div className="flex items-center gap-4">
                    <button className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <Bell className="h-5 w-5" />
                    </button>
                    <button className="h-9 w-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        <User className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}

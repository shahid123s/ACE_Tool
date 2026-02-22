import { useState } from "react";
import { BackgroundBlobs } from "@/components/shared/BackgroundBlobs";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Navigate, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/app/apiService";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, selectIsAuthenticated, selectIsAdmin } from "@/app/authSlice";
import { Loader2, GraduationCap } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAdmin = useAppSelector(selectIsAdmin);

    // Already logged in — send to the right dashboard
    if (isAuthenticated) {
        return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        try {
            const response = await login({ email, password }).unwrap();
            dispatch(setCredentials({ user: response.user, accessToken: response.accessToken }));
            toast.success("Welcome back!");
            // Route based on role returned in the response
            navigate(response.user.role === "admin" ? "/admin" : "/");
        } catch (error: any) {
            toast.error(error.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
            <BackgroundBlobs />

            <div className="w-full max-w-md z-10 space-y-6">
                {/* Brand mark */}
                <div className="flex flex-col items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 flex items-center justify-center ring-1 ring-primary/30">
                        <GraduationCap className="h-7 w-7 text-primary" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-foreground tracking-tight">ACE Platform</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Student Portal</p>
                    </div>
                </div>

                <GlassCard className="p-8">
                    <h2 className="text-xl font-semibold text-foreground mb-1">Welcome back</h2>
                    <p className="text-sm text-muted-foreground mb-6">Sign in to your student account</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Email</label>
                            <Input type="email" placeholder="you@ace.com" value={email}
                                onChange={(e) => setEmail(e.target.value)} className="glass-input" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Password</label>
                            <Input type="password" placeholder="••••••••" value={password}
                                onChange={(e) => setPassword(e.target.value)} className="glass-input" required />
                        </div>
                        <div className="flex justify-end">
                            <Button type="button" variant="link" className="px-0 h-auto text-sm text-muted-foreground hover:text-primary"
                                onClick={() => navigate('/forgot-password')}>
                                Forgot Password?
                            </Button>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</> : "Sign In"}
                        </Button>
                    </form>
                </GlassCard>

                {/* Link to admin login */}
                <p className="text-center text-sm text-muted-foreground">
                    Admin?{" "}
                    <button onClick={() => navigate("/admin/login")} className="text-primary hover:underline font-medium">
                        Sign in to Admin Portal →
                    </button>
                </p>
            </div>
        </div>
    );
}

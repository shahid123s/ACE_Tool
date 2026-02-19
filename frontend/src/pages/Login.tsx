import { useState } from "react";
import { BackgroundBlobs } from "@/components/shared/BackgroundBlobs";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/app/apiService";
import { useAppDispatch } from "@/app/hooks";
import { setCredentials } from "@/app/authSlice";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        try {
            const response = await login({ email, password }).unwrap();
            dispatch(setCredentials({ user: response.user, accessToken: response.accessToken }));
            toast.success("Successfully logged in");
            navigate("/");
        } catch (error: any) {
            toast.error(error.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background relative overflow-hidden">
            <BackgroundBlobs />

            <GlassCard className="w-full max-w-md p-8 z-10">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to ACE Platform</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Email</label>
                        <Input
                            type="email"
                            placeholder="name@ace.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="glass-input"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="glass-input"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing In...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </GlassCard>
        </div>
    );
}

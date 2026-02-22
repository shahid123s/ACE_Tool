import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Navigate, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/app/apiService";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, selectIsAuthenticated, selectIsAdmin } from "@/app/authSlice";
import { Loader2, ShieldCheck, Moon, GraduationCap, ArrowRight, Sparkles, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [login, { isLoading }] = useLoginMutation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAdmin = useAppSelector(selectIsAdmin);

    // Already logged in
    if (isAuthenticated) {
        return <Navigate to={isAdmin ? "/admin" : "/"} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        try {
            const response = await login({ email, password }).unwrap();
            if (response.user.role !== "admin") {
                toast.error("Access denied. This portal is for admins only.");
                return;
            }
            dispatch(setCredentials({ user: response.user, accessToken: response.accessToken }));
            toast.success("Welcome, Admin!");
            navigate("/admin");
        } catch (error: any) {
            toast.error(error.data?.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#FAFBF9]">
            {/* Left Column: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative">
                {/* Dark mode toggle */}
                <div className="absolute bottom-8 left-8">
                    <button className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center border border-gray-100/50 text-gray-700 hover:text-gray-900 transition-colors">
                        <Moon className="h-5 w-5" />
                    </button>
                </div>

                <div className="max-w-md w-full mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col gap-3 items-start">
                        <div className="h-14 w-14 rounded-2xl bg-[#EEF5E5] flex items-center justify-center">
                            <ShieldCheck className="h-7 w-7 text-[#6F8E3C]" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ACE Admin</h1>
                            <p className="text-[13px] text-gray-500 mt-1 font-medium">Restricted — Authorised Personnel Only</p>
                        </div>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-[#f0f0f0]">
                        {/* Admin badge */}
                        <div className="flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-[#EEF5E5] w-fit">
                            <ShieldCheck className="h-3.5 w-3.5 text-[#6F8E3C]" />
                            <span className="text-[11px] font-bold text-[#6F8E3C] uppercase tracking-[0.05em]">Admin Portal</span>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-1.5">Admin Sign-In</h2>
                        <p className="text-[13.5px] text-gray-500 mb-8 font-medium">Enter your administrator credentials</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-gray-700">Admin Email</label>
                                <Input type="email" placeholder="admin@ace.com" value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-white border-gray-200 h-12 rounded-xl text-sm focus-visible:ring-[#6F8E3C]" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[13px] font-semibold text-gray-700">Password</label>
                                <div className="relative">
                                    <Input type="password" placeholder="••••••••" value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-white border-gray-200 h-12 rounded-xl text-sm pr-10 focus-visible:ring-[#6F8E3C]" required />
                                    {/* Eye Icon */}
                                    <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                        <Eye className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-1">
                                <button type="button" className="text-[12px] font-bold text-[#6F8E3C] hover:text-[#56722d] transition-colors">
                                    Forgot password?
                                </button>
                            </div>

                            <Button type="submit"
                                className="w-full h-12 bg-[#6F8E3C] hover:bg-[#56722d] text-white font-medium text-[15px] rounded-xl transition-all shadow-md shadow-[#6F8E3C]/20 border-0 mt-2"
                                disabled={isLoading}>
                                {isLoading
                                    ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Verifying...</>
                                    : <div className="flex items-center gap-2">Access Admin Panel <ArrowRight className="h-4 w-4" /></div>}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-[13px] font-medium text-gray-500 pt-2">
                        Not an admin?{" "}
                        <button onClick={() => navigate("/login")} className="text-[#6F8E3C] hover:text-[#56722d] transition-colors font-bold">
                            Go to Student Login <ArrowRight className="h-3 w-3 inline" />
                        </button>
                    </p>
                </div>
            </div>

            {/* Right Column: Graphic/Banner */}
            <div className="hidden lg:flex w-1/2 p-4 md:p-6 lg:p-8">
                <div className="w-full h-full bg-[#6F8E3C] rounded-[32px] relative overflow-hidden flex flex-col items-center justify-center p-12 shadow-inner">

                    {/* Background subtle noise/dots would go here via CSS, keeping it simple for now */}

                    {/* Top Left Icon */}
                    <div className="absolute top-12 left-12 h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <GraduationCap className="h-7 w-7 text-white" />
                    </div>

                    {/* Text content */}
                    <div className="text-center mb-10 z-10 relative mt-4">
                        <p className="text-white/80 text-[11px] font-bold uppercase tracking-[0.2em] mb-4">Institutional Management</p>
                        <h2 className="text-5xl lg:text-[56px] font-bold text-white leading-[1.15] tracking-tight">Empowering<br />Education</h2>
                    </div>

                    {/* The Chart Mockup (simplified visual representation of the image) */}
                    <div className="w-full max-w-[480px] bg-[#E8EBE3] rounded-t-3xl p-6 shadow-2xl relative z-10 opacity-95 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between border-b border-[#D1D8CB] pb-4 mb-6 pt-2 px-2">
                            <div className="flex gap-4 items-center">
                                <div className="h-2 w-16 bg-[#6F8E3C] rounded-full"></div>
                                <div className="h-2 w-12 bg-[#B7C5A3] rounded-full"></div>
                                <div className="h-2 w-12 bg-[#B7C5A3] rounded-full"></div>
                            </div>
                            <div className="h-2 w-10 bg-[#B7C5A3] rounded-full"></div>
                        </div>
                        <div className="flex gap-8 px-2 pb-6">
                            <div className="flex-1 flex items-center justify-center">
                                {/* Pie chart placeholder matching the exact teal colour from design */}
                                <div className="h-[150px] w-[150px] rounded-full bg-[#358E9D] border-[12px] border-[#D1D8CB]/40 shadow-sm flex items-center justify-center relative">
                                    <span className="text-white font-bold text-[10px] tracking-widest uppercase">Users</span>
                                </div>
                            </div>
                            <div className="w-[140px] flex flex-col justify-center space-y-5">
                                {[
                                    { color: "bg-[#358E9D]", width: "w-14" },
                                    { color: "bg-[#B7C5A3]", width: "w-10" },
                                    { color: "bg-[#B7C5A3]", width: "w-16" },
                                    { color: "bg-[#B7C5A3]", width: "w-12" }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className={`h-2.5 w-2.5 rounded-full ${item.color}`}></div>
                                            <div className={`h-2 ${item.width} bg-[#B7C5A3] rounded-full`}></div>
                                        </div>
                                        <div className="h-2 w-6 bg-[#B7C5A3] rounded-full"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Chart Caption Box */}
                    <div className="w-full max-w-[480px] bg-[#89A45B] rounded-3xl p-8 pt-10 mt-[-2rem] z-0 relative shadow-xl text-left border border-white/10">
                        <h3 className="text-white font-semibold text-lg mb-2">Real-time Student Analytics</h3>
                        <p className="text-white/90 text-[14px] leading-[1.6] opacity-90">
                            Monitor progress across all modules with our integrated tracking system and automated reporting.
                        </p>
                    </div>

                    {/* Bottom Area */}
                    <div className="w-full mt-10 flex items-center justify-center gap-4 relative z-10">
                        <div className="flex -space-x-3">
                            <div className="h-10 w-10 rounded-full bg-[#f8f9f6] border-2 border-[#6F8E3C] overflow-hidden flex items-end justify-center">
                                <div className="h-5 w-5 bg-gray-300 rounded-full mb-[-10px]"></div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#ebeee7] border-2 border-[#6F8E3C] overflow-hidden flex items-end justify-center">
                                <div className="h-5 w-5 bg-gray-400 rounded-full mb-[-10px]"></div>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#b8c6a6] border-2 border-[#6F8E3C] overflow-hidden flex items-end justify-center">
                                <div className="h-5 w-5 bg-gray-500 rounded-full mb-[-10px]"></div>
                            </div>
                        </div>
                        <p className="text-white text-sm font-semibold tracking-wide">Joined by 200+ Educators</p>
                    </div>

                    {/* Bottom Right Icon */}
                    <div className="absolute bottom-12 right-12 h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Sparkles className="h-7 w-7 text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}

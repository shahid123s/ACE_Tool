import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { Navigate, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/app/apiService";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setCredentials, selectIsAuthenticated, selectIsAdmin } from "@/app/authSlice";
import { Loader2, GraduationCap, BookOpen, Trophy, Clock } from "lucide-react";
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
        <div className="min-h-screen w-full flex bg-[#F6F5F2]">
            {/* Left Column: Graphic/Features */}
            <div className="hidden lg:flex w-1/2 bg-[#8B9C5F] flex-col p-12 xl:p-20 justify-between items-center relative overflow-hidden text-left shadow-2xl z-10">
                <div className="w-full max-w-[500px] flex flex-col h-full">
                    {/* Header */}
                    <div className="mb-12">
                        <p className="text-[#D3DAC1] text-sm font-medium mb-1">Welcome Back</p>
                        <h1 className="text-[40px] font-bold text-white tracking-tight leading-none mb-4">Student Portal</h1>
                        <p className="text-[#E0E6D2] text-[15px] leading-relaxed max-w-[340px]">
                            Access your courses, track progress, and stay on top of your learning journey.
                        </p>
                    </div>

                    {/* Image Placeholder Box */}
                    <div className="flex-1 flex items-center justify-center my-8">
                        <div className="w-[320px] h-[320px] rounded-[32px] bg-[#9CAE6C] flex items-center justify-center relative shadow-inner">
                            {/* CSS Illustration replacing the 3D render */}
                            <div className="relative flex flex-col items-center justify-center mt-6">
                                {/* Books */}
                                <div className="absolute -bottom-2 w-36 h-6 bg-[#E8EBDF] rounded-md shadow-md border-b-4 border-[#D0D6C3] z-10 transform -rotate-2"></div>
                                <div className="absolute -bottom-6 flex gap-2 w-40 h-8 bg-[#F2F4EC] rounded-md shadow-lg border-b-4 border-[#E0E5D3] z-0 transform rotate-3 items-center justify-center px-2"></div>
                                {/* Laptop */}
                                <div className="absolute -bottom-10 -right-16 transform rotate-12 z-20">
                                    <div className="w-24 h-16 bg-[#2B3A42] rounded-t-xl border-4 border-gray-800 shadow-xl relative">
                                        <div className="absolute inset-1 bg-[#445b66] rounded-sm"></div>
                                    </div>
                                    <div className="w-28 h-2 bg-gray-300 rounded-b-xl shadow-lg -ml-2"></div>
                                </div>
                                {/* Cap */}
                                <div className="absolute -top-24 z-30 transform -rotate-6">
                                    <div className="relative">
                                        <div className="w-32 h-10 bg-[#5c6e3b] rounded-[50%] absolute top-4 left-2 shadow-[0_10px_20px_rgba(0,0,0,0.2)]"></div>
                                        <div className="w-40 h-16 bg-[#6c8345] transform -skew-x-12 flex items-center justify-center -mb-4 shadow-xl border-t border-[#859f56]">
                                            <div className="h-1 w-1 bg-white rounded-full"></div>
                                        </div>
                                        <div className="absolute -left-6 top-6 w-1 h-16 bg-[#D4AF37] shadow-sm transform rotate-12"></div>
                                        <div className="absolute -left-8 top-20 w-4 h-10 bg-[#D4AF37] opacity-80 rounded-b-lg mix-blend-multiply flex gap-0.5">
                                            <div className="w-0.5 h-full bg-[#B8860B]"></div>
                                            <div className="w-0.5 h-full bg-[#DAA520]"></div>
                                            <div className="w-0.5 h-full bg-[#B8860B]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <div className="bg-[#93A468] rounded-2xl p-5 border border-white/10 hover:bg-[#9CAE6C] transition-colors cursor-default">
                            <BookOpen className="h-5 w-5 text-white mb-3 opacity-90" />
                            <h3 className="text-white font-bold text-[14px] mb-1">Course Access</h3>
                            <p className="text-[#DFE5D2] text-[11px] leading-snug">All your enrolled courses in one place</p>
                        </div>
                        <div className="bg-[#93A468] rounded-2xl p-5 border border-white/10 hover:bg-[#9CAE6C] transition-colors cursor-default">
                            <Trophy className="h-5 w-5 text-white mb-3 opacity-90" />
                            <h3 className="text-white font-bold text-[14px] mb-1">Achievements</h3>
                            <p className="text-[#DFE5D2] text-[11px] leading-snug">Track milestones and certifications</p>
                        </div>
                        <div className="bg-[#93A468] rounded-2xl p-5 border border-white/10 hover:bg-[#9CAE6C] transition-colors cursor-default">
                            <Clock className="h-5 w-5 text-white mb-3 opacity-90" />
                            <h3 className="text-white font-bold text-[14px] mb-1">Live Classes</h3>
                            <p className="text-[#DFE5D2] text-[11px] leading-snug">Join scheduled sessions anytime</p>
                        </div>
                        <div className="bg-[#93A468] rounded-2xl p-5 border border-white/10 hover:bg-[#9CAE6C] transition-colors cursor-default">
                            <GraduationCap className="h-5 w-5 text-white mb-3 opacity-90" />
                            <h3 className="text-white font-bold text-[14px] mb-1">Exam Portal</h3>
                            <p className="text-[#DFE5D2] text-[11px] leading-snug">Module-wise exams with expert review</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative py-12">
                <div className="max-w-md w-full mx-auto space-y-8 flex flex-col items-center">

                    {/* Header Top Icon */}
                    <div className="flex flex-col items-center mb-2">
                        <div className="h-14 w-14 rounded-2xl bg-[#EBEBE5] flex items-center justify-center mb-4">
                            <GraduationCap className="h-7 w-7 text-[#6F7F41]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#2A2B27] tracking-tight">ACE Student Portal</h2>
                        <p className="text-[14px] text-[#71736B] mt-1 font-medium">Access your learning dashboard</p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 w-full text-left">
                        {/* Student Badge */}
                        <div className="flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-[#F4F6F0] w-fit border border-[#E9ECE2]">
                            <GraduationCap className="h-3.5 w-3.5 text-[#738244]" />
                            <span className="text-[10px] font-bold text-[#738244] uppercase tracking-[0.08em]">Student Login</span>
                        </div>

                        <h3 className="text-xl font-bold text-[#1A1A1A] mb-1">Welcome Back 👋</h3>
                        <p className="text-[13px] text-[#7A7A7A] mb-8 font-medium">Sign in with your student credentials</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[12px] font-bold text-[#4A4A4A]">Student Email</label>
                                <Input type="email" placeholder="student@ace.com" value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-[#FAF9F5] border-0 focus-visible:ring-1 focus-visible:ring-[#738244] focus-visible:bg-white h-12 rounded-xl text-[13px] transition-all px-4" required />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[12px] font-bold text-[#4A4A4A]">Password</label>
                                    <button type="button" className="text-[11px] font-bold text-[#899A5B] hover:text-[#657342]" onClick={() => navigate('/forgot-password')}>
                                        Forgot password?
                                    </button>
                                </div>
                                <Input type="password" placeholder="••••••••" value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-[#FAF9F5] border-0 focus-visible:ring-1 focus-visible:ring-[#738244] focus-visible:bg-white h-12 rounded-xl text-[13px] transition-all px-4" required />
                            </div>

                            <Button type="submit"
                                className="w-full h-12 bg-[#768545] hover:bg-[#606D37] text-white font-bold text-[14px] rounded-xl transition-all shadow-md shadow-[#768545]/20 border-0 mt-6"
                                disabled={isLoading}>
                                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing In...</> : "Log In"}
                            </Button>
                        </form>
                    </div>

                    <p className="text-center text-[13px] font-medium text-[#8A8C85] pt-4">
                        Are you an admin?{" "}
                        <button onClick={() => navigate("/admin/login")} className="text-[#768545] hover:text-[#5E6B35] transition-colors font-bold">
                            Go to Admin Login →
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

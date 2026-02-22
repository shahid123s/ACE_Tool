import React, { useState } from 'react';
import { useSendOtpMutation, useResetPasswordMutation } from '@/app/apiService';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Loader2, ArrowLeft, Mail, Lock, ShieldCheck, Eye } from 'lucide-react';

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [sendOtp, { isLoading: isSendingOtp }] = useSendOtpMutation();
    const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendOtp({ email }).unwrap();
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (error: any) {
            toast.error(error.message || 'Failed to send OTP');
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await resetPassword({ email, otp, newPassword }).unwrap();
            toast.success('Password reset successfully');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[#F6F5F2]">
            <div className="w-full max-w-[460px] space-y-8">

                {/* Header Top Icon */}
                <div className="flex flex-col items-center mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-[#EBEBE5] flex items-center justify-center mb-4 shadow-sm border border-gray-100">
                        {step === 1 ? (
                            <Mail className="h-7 w-7 text-[#6F7F41]" />
                        ) : (
                            <Lock className="h-7 w-7 text-[#6F7F41]" />
                        )}
                    </div>
                    <h2 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">
                        {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                    </h2>
                    <p className="text-[15px] text-[#71736B] mt-2 font-medium">
                        {step === 1
                            ? "No worries, we'll send you reset instructions"
                            : "Enter the code and set your new password"}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E9ECE2] w-full text-left">
                    {step === 1 ? (
                        <>
                            <div className="flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-[#F4F6F0] w-fit border border-[#E9ECE2]">
                                <Mail className="h-3.5 w-3.5 text-[#738244]" />
                                <span className="text-[10px] font-bold text-[#738244] uppercase tracking-[0.08em]">Password Recovery</span>
                            </div>

                            <h3 className="text-[22px] font-bold text-[#1A1A1A] mb-1">Enter your email</h3>
                            <p className="text-[14px] text-[#7A7A7A] mb-8 font-medium">We'll send a verification code to reset your password</p>

                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-[#4A4A4A]">Email Address</label>
                                    <Input type="email" placeholder="you@example.com" value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-[#FAF9F5] border border-[#E9ECE2] focus-visible:ring-1 focus-visible:ring-[#738244] focus-visible:bg-white h-12 rounded-xl text-[13px] transition-all px-4" required />
                                </div>
                                <Button type="submit"
                                    className="w-full h-12 bg-[#768545] hover:bg-[#606D37] text-white font-bold text-[14px] rounded-xl transition-all shadow-md shadow-[#768545]/20 border-0"
                                    disabled={isSendingOtp}>
                                    {isSendingOtp ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : "Send Reset Code"}
                                </Button>
                            </form>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-[#F4F6F0] w-fit border border-[#E9ECE2]">
                                <ShieldCheck className="h-3.5 w-3.5 text-[#738244]" />
                                <span className="text-[10px] font-bold text-[#738244] uppercase tracking-[0.08em]">Verification</span>
                            </div>

                            <h3 className="text-[22px] font-bold text-[#1A1A1A] mb-1">Verify & Reset</h3>
                            <p className="text-[14px] text-[#7A7A7A] mb-8 font-medium">Enter the 6-digit code sent to your email</p>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-[#4A4A4A]">Verification Code (OTP)</label>
                                    <Input type="text" placeholder="0 0 0 0 0 0" value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        maxLength={6}
                                        className="bg-[#FAF9F5] border border-[#E9ECE2] focus-visible:ring-1 focus-visible:ring-[#738244] focus-visible:bg-white h-12 rounded-xl text-[18px] tracking-[0.5em] font-medium text-center transition-all px-4 placeholder:tracking-[0.5em]" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-[#4A4A4A]">New Password</label>
                                    <div className="relative">
                                        <Input type="password" placeholder="••••••••" value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="bg-[#FAF9F5] border border-[#E9ECE2] focus-visible:ring-1 focus-visible:ring-[#738244] focus-visible:bg-white h-12 rounded-xl text-[13px] transition-all px-4 pr-10" required />
                                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-bold text-[#4A4A4A]">Confirm Password</label>
                                    <div className="relative">
                                        <Input type="password" placeholder="••••••••" value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-[#FAF9F5] border border-[#E9ECE2] focus-visible:ring-1 focus-visible:ring-[#738244] focus-visible:bg-white h-12 rounded-xl text-[13px] transition-all px-4 pr-10" required />
                                        <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <Button type="submit"
                                    className="w-full h-12 bg-[#768545] hover:bg-[#606D37] text-white font-bold text-[14px] rounded-xl transition-all shadow-md shadow-[#768545]/20 border-0 mt-2 disabled:bg-[#B3BCA2]"
                                    disabled={isResetting || !otp || !newPassword || !confirmPassword}>
                                    {isResetting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Resetting...</> : "Reset Password"}
                                </Button>
                            </form>
                        </>
                    )}
                </div>

                {/* Back to Login Link */}
                <div className="text-center pt-2">
                    <button onClick={() => navigate('/login')} className="text-[#6F7F41] hover:text-[#525E30] transition-colors font-bold inline-flex items-center gap-2 text-[14px]">
                        <ArrowLeft className="h-4 w-4" /> Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

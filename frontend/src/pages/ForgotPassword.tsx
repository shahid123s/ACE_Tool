import React, { useState } from 'react';
import { useSendOtpMutation, useResetPasswordMutation } from '../app/apiService';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import Card, { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, ArrowLeft } from 'lucide-react';

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
        <div className="flex items-center justify-center min-h-screen bg-transparent p-4">
            <Card className="w-full max-w-md glass-card border-black/10">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center text-black">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </CardTitle>
                    <CardDescription className="text-center text-gray-400">
                        {step === 1
                            ? 'Enter your email to receive an OTP'
                            : 'Enter the OTP and your new password'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-black">Email</label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="glass-input text-black placeholder:text-gray-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-gray-200"
                                disabled={isSendingOtp}
                            >
                                {isSendingOtp ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send OTP'}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="otp" className="text-sm font-medium text-black">OTP</label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    className="glass-input text-black placeholder:text-gray-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="newPassword" className="text-sm font-medium text-black">New Password</label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                    className="glass-input text-black placeholder:text-gray-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-black">Confirm Password</label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="glass-input text-black placeholder:text-gray-500"
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-white text-black hover:bg-gray-200"
                                disabled={isResetting}
                            >
                                {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Reset Password'}
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        to="/login"
                        className="flex items-center text-sm text-gray-400 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}

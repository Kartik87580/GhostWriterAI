import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get the email that was passed during signup navigation
    const email = location.state?.email;

    if (!email) {
        // If they managed to get here without an email state, send to signup
        navigate('/signup');
        return null;
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authService.verifyOTP(email, otp);
            toast.success('Email verified successfully! You can now log in.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center relative z-10 w-full px-4">
            <div className="glass-card w-full max-w-md p-8 rounded-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight text-center">Verify Email</h2>
                    <p className="text-slate-400 mt-2 text-center text-sm">
                        Please enter the 6-digit verification code sent to <br />
                        <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Verification Code</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-300 text-center tracking-[0.5em] text-xl"
                            placeholder="------"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || otp.length !== 6}
                        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-medium rounded-xl px-4 py-3 shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify Account'}
                    </button>

                </form>
            </div>
        </div>
    );
}

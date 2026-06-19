import React, { useState } from 'react';
import { 
  X, Mail, Lock, User, Sparkles, AlertCircle, ArrowRight, CheckCircle, Smartphone, Chrome
} from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalsProps {
  onClose: () => void;
  onAuthSuccess: (user: UserType, token: string) => void;
}

export default function AuthModals({ onClose, onAuthSuccess }: AuthModalsProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Alerts states
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // OTP state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [simulatedCode, setSimulatedCode] = useState('');

  // Standard Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    if (!email || !password) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setSuccessText("Authentication successful! Welcome to CineVerse! 🎉");
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    if (!email || !password || !username) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessText("Registered successfully! Welcome, Senpai! 🐱🌸");
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP triggers
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    if (!email) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/otp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP send failed");

      setIsOtpSent(true);
      setSimulatedCode(data.simulatedOtp);
      setSuccessText(`Code sent! Complete verification with PIN: ${data.simulatedOtp}`);
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    if (!email || !otpCode) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid verification code");

      setSuccessText("OTP verified successfully! Welcome!");
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Google Login simulation
  const handleGoogleLogin = async () => {
    setErrorText('');
    setSuccessText('');
    setIsLoading(true);

    try {
      const demoEmail = email || "senpai-google@cineverse.com";
      const demoUser = username || "GoogleStar";
      
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: demoEmail, 
          username: demoUser,
          googleId: "G_" + Math.floor(Math.random() * 100000)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessText("Google Auth connected smoothly! Enjoy CineVerse 👑");
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password triggers
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');
    if (!email) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessText(data.message);
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="frosted-glass-premium text-white border border-white/12 rounded-3xl p-6 max-w-sm w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4.5 right-4.5 rounded-full p-1 text-gray-400 hover:bg-gray-800 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Mascot Sparkle */}
        <div className="flex items-center space-x-1.5 mb-5 select-none">
          <Sparkles className="w-5 h-5 text-[#00E5FF] animate-spin-slow" />
          <span className="text-sm font-black tracking-widest text-[#00E5FF] font-mono">CINEVERSE GATEWAY</span>
        </div>

        {/* Tab triggers */}
        {activeTab !== 'forgot' && (
          <div className="grid grid-cols-3 gap-2.5 bg-white/4 p-1 rounded-full border border-white/8 mb-6 text-center select-none text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
            <button
              onClick={() => { setActiveTab('login'); setErrorText(''); setSuccessText(''); }}
              className={`py-1.5 rounded-full transition-all cursor-pointer ${activeTab === 'login' ? 'bg-[#00E5FF] text-black font-black shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-gray-400 hover:text-white'}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setErrorText(''); setSuccessText(''); }}
              className={`py-1.5 rounded-full transition-all cursor-pointer ${activeTab === 'register' ? 'bg-[#00E5FF] text-black font-black shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-gray-400 hover:text-white'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setActiveTab('otp'); setErrorText(''); setSuccessText(''); }}
              className={`py-1.5 rounded-full transition-all cursor-pointer ${activeTab === 'otp' ? 'bg-[#00E5FF] text-black font-black shadow-[0_0_8px_rgba(0,229,255,0.4)]' : 'text-gray-400 hover:text-white'}`}
            >
              OTP Code
            </button>
          </div>
        )}

        {/* Status Messages */}
        {errorText && (
          <div className="mb-4 bg-red-600/10 border border-red-500/20 rounded-lg p-2.5 flex items-start space-x-1.5 text-xs text-red-400 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <p className="leading-tight">{errorText}</p>
          </div>
        )}

        {successText && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 flex items-start space-x-1.5 text-xs text-emerald-400 font-mono">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
            <p className="leading-tight">{successText}</p>
          </div>
        )}

        {/* FORM 1: STANDARD LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="senpai@cineverse.com"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-xs text-white rounded-full py-2 pl-9 pr-4 focus:outline-none backdrop-blur-sm transition-all focus:ring-1 focus:ring-[#00E5FF]/25"
                />
                <Mail className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[10px] text-gray-500 hover:text-[#00E5FF] hover:underline"
                >
                  Forgot pop?
                </button>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-xs text-white rounded-full py-2 pl-9 pr-4 focus:outline-none backdrop-blur-sm transition-all focus:ring-1 focus:ring-[#00E5FF]/25"
                />
                <Lock className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-xs font-black text-white hover:shadow-[0_4px_12px_rgba(220,38,38,0.4)] transition-all uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>{isLoading ? 'Connecting...' : 'Secure Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* FORM 2: REGISTRATION */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Choose Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="KokoPopcornFan"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-xs text-white rounded-full py-2 pl-9 pr-4 focus:outline-none backdrop-blur-sm transition-all focus:ring-1 focus:ring-[#00E5FF]/25"
                />
                <User className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="senpai@cineverse.com"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-xs text-white rounded-full py-2 pl-9 pr-4 focus:outline-none backdrop-blur-sm transition-all focus:ring-1 focus:ring-[#00E5FF]/25"
                />
                <Mail className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Create Secure Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-xs text-white rounded-full py-2 pl-9 pr-4 focus:outline-none backdrop-blur-sm transition-all focus:ring-1 focus:ring-[#00E5FF]/25"
                />
                <Lock className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-xs font-black text-white hover:shadow-[0_4px_12px_rgba(220,38,38,0.4)] transition-all uppercase tracking-wider flex items-center justify-center space-x-1 cursor-pointer"
            >
              <span>{isLoading ? 'Creating Account...' : 'Register as Member'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}

        {/* FORM 3: OTP ONE-TIME PASSWORD FLOW */}
        {activeTab === 'otp' && (
          <div className="space-y-4">
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Email to Send OTP Code</label>
                  <p className="text-[10px] text-gray-500 leading-tight">We will instantly simulate a 6-digit verification code to log you in without password.</p>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="senpai@cineverse.com"
                      required
                      className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-xs text-white rounded-full py-2 pl-9 pr-4 focus:outline-none backdrop-blur-sm transition-all focus:ring-1 focus:ring-[#00E5FF]/25"
                    />
                    <Smartphone className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-500" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-xs font-black text-white uppercase tracking-wider cursor-pointer"
                >
                  Send OTP Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Enter OTP PIN</label>
                  <p className="text-[10px] text-cyan-400 leading-tight">Check the bottom right alerts or top alerts for pin code: <strong className="text-white font-mono">{simulatedCode}</strong></p>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-center text-lg font-black tracking-widest text-[#00E5FF] rounded-full py-1.5 focus:outline-none backdrop-blur-sm transition-colors"
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => { setIsOtpSent(false); setOtpCode(''); }}
                    className="w-1/3 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-[10px] font-semibold text-gray-400 hover:text-white uppercase"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-full bg-cyan-600 hover:bg-cyan-700 text-xs font-black text-white uppercase tracking-wider cursor-pointer"
                  >
                    Verify & Login
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* FORM 4: FORGOT PASSWORD */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-gray-400 uppercase font-bold">Recover Account</label>
              <p className="text-[10px] text-gray-500 leading-snug">Enter your email and we will dispatch a reset link.</p>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="senpai-lost-pass@cineverse.com"
                  required
                  className="w-full bg-white/5 border border-white/10 focus:border-[#00E5FF]/45 text-xs text-white rounded-full py-2 pl-9 pr-4 focus:outline-none backdrop-blur-sm transition-all focus:ring-1 focus:ring-[#00E5FF]/25"
                />
                <Mail className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-500" />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="w-1/3 py-2 rounded-full bg-gray-800 text-[10px] text-gray-400 hover:text-white uppercase"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-full bg-red-600 hover:bg-red-700 text-xs font-black text-white uppercase"
              >
                Send Instructions
              </button>
            </div>
          </form>
        )}

        {/* SOCIAL SEPARATOR */}
        {activeTab !== 'forgot' && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="relative flex justify-center text-xs mb-4">
              <span className="bg-[#0A0A0A]/95 backdrop-blur-sm px-3.5 text-gray-500 font-mono text-[9px] uppercase tracking-widest">Or instant login with</span>
            </div>
            
            <button
              onClick={handleGoogleLogin}
              className="w-full py-2 rounded-full border border-white/10 hover:border-[#00E5FF]/40 bg-white/5 text-xs font-semibold hover:text-[#00E5FF] transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-sm relative group backdrop-blur-sm"
            >
              <Chrome className="w-4 h-4 text-[#00E5FF]" />
              <span>Continue with Google</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

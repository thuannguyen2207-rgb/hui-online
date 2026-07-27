import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Phone, ShieldCheck, UserCheck, X, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLoginSuccess: (user: User) => void;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
}) => {
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [phone, setPhone] = useState(currentUser.phone || '0908123456');
  const [name, setName] = useState(currentUser.name || 'Nguyễn Văn An');
  const [role, setRole] = useState<UserRole>(currentUser.role || 'chu_hui');
  const [otpCode, setOtpCode] = useState('668899');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 9) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser: User = {
        id: `u_${Date.now()}`,
        phone,
        name,
        role,
        avatar: role === 'chu_hui' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        verified: true,
        bankName: role === 'chu_hui' ? 'MB Bank' : undefined,
        accountNumber: role === 'chu_hui' ? '0908123456888' : undefined,
        accountName: role === 'chu_hui' ? name.toUpperCase() : undefined,
      };
      onLoginSuccess(newUser);
      setStep('success');
      setTimeout(() => {
        onClose();
        setStep('input');
      }, 1200);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {step === 'input' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="text-center space-y-1 mb-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold mb-2 shadow-lg shadow-amber-500/20">
                <Phone className="h-6 w-6 text-slate-950" />
              </div>
              <h3 className="text-xl font-bold text-white">Đăng Nhập SĐT / OTP</h3>
              <p className="text-xs text-slate-400">Xác thực OTP tức thì qua Twilio / Firebase OTP Engine</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Số Điện Thoại</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0908123456"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Họ & Tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn An"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vai Trò Đăng Nhập (RBAC)</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('chu_hui')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                    role === 'chu_hui'
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <ShieldCheck className="h-5 w-5" />
                  <span>Chủ Hụi (Host)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('hui_vien')}
                  className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center space-y-1 transition-all ${
                    role === 'hui_vien'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <UserCheck className="h-5 w-5" />
                  <span>Hụi Viên (Member)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all mt-4"
            >
              {loading ? (
                <span>Đang gửi mã OTP...</span>
              ) : (
                <>
                  <span>Gửi Mã Xác Thực OTP</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center space-y-1 mb-6">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold mb-2 shadow-lg shadow-emerald-500/20">
                <Sparkles className="h-6 w-6 text-slate-950" />
              </div>
              <h3 className="text-xl font-bold text-white">Nhập Mã OTP</h3>
              <p className="text-xs text-slate-400">Mã 6 chữ số đã được gửi tới số <span className="text-amber-400 font-mono">{phone}</span></p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="668899"
                className="w-full bg-slate-950 border border-amber-500/80 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-amber-400 focus:outline-none shadow-inner"
              />
              <p className="text-[11px] text-slate-500 text-center mt-1">Mã giả lập thử nghiệm: <span className="text-amber-400 font-mono font-bold">668899</span></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span>Xác Nhận & Đăng Nhập</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="h-16 w-16 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-white">Đăng Nhập Thành Công!</h3>
            <p className="text-xs text-slate-400">Xin chào <span className="text-amber-400 font-semibold">{name}</span> ({role === 'chu_hui' ? 'Chủ Hụi' : 'Hụi Viên'}).</p>
          </div>
        )}

      </div>
    </div>
  );
};

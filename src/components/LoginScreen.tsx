import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { 
  Phone, 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  QrCode, 
  Lock, 
  Zap, 
  Calculator,
  KeyRound,
  Eye,
  EyeOff,
  UserPlus,
  LogIn
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'demo'>('login');
  
  // Login Form state
  const [phone, setPhone] = useState('0908123456');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form state
  const [regPhone, setRegPhone] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('hui_vien');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Standard Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!phone || phone.trim().length < 8) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // Check if matches host mock or member mock
      const matchedUser = MOCK_USERS.find(u => u.phone === phone.trim()) || {
        id: `u_${Date.now()}`,
        phone: phone.trim(),
        name: phone.startsWith('090') ? 'Trần Thị Thu (Chủ Hụi)' : 'Nguyễn Văn An (Hội Viên)',
        role: phone.startsWith('090') ? 'chu_hui' : 'hui_vien',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
        bankName: 'MB Bank',
        accountNumber: '0908123456888',
        accountName: 'TRÂN THỊ THU'
      };

      onLoginSuccess(matchedUser);
    }, 600);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regName) return;

    if (!isOtpSent) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setIsOtpSent(true);
        setOtpCode('668899');
      }, 500);
      return;
    }

    // Verify OTP & Complete Register
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newUser: User = {
        id: `u_${Date.now()}`,
        phone: regPhone,
        name: regName,
        role: 'hui_vien',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        verified: true,
        bankName: regRole === 'chu_hui' ? 'MB Bank' : undefined,
        accountNumber: regRole === 'chu_hui' ? '0908123456888' : undefined,
        accountName: regRole === 'chu_hui' ? regName.toUpperCase() : undefined,
      };

      onLoginSuccess(newUser);
    }, 600);
  };

  // Quick Demo Login
  const handleQuickDemo = (user: User) => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(user);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 font-black mb-1">
            <Coins className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            SỔ HỤI TRỰC TUYẾN
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide uppercase">
            Hệ Thống Quản Lý & Chơi Hụi Minh Bạch
          </p>
        </div>

        {/* Feature Highlights Pill Bar */}
        <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-300 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl text-center shadow-lg">
          <div className="flex flex-col items-center space-y-1">
            <Calculator className="h-4 w-4 text-amber-400" />
            <span>Thuật Toán $R$</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>VietQR Gạch Nợ</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <Lock className="h-4 w-4 text-blue-400" />
            <span>Bảo Mật Thăm</span>
          </div>
        </div>

        {/* Main Auth Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          
          {/* Main Auth Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                authMode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Đăng Nhập</span>
            </button>

            <button
              onClick={() => { setAuthMode('register'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                authMode === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Đăng Ký</span>
            </button>

            <button
              onClick={() => { setAuthMode('demo'); setErrorMsg(''); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                authMode === 'demo'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Demo</span>
            </button>
          </div>

          {/* TAB 1: FORM ĐĂNG NHẬP CHÍNH CHUẨN */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <h2 className="text-base font-bold text-white">Đăng Nhập Tài Khoản</h2>
                <p className="text-xs text-slate-400">
                  Nhập số điện thoại đăng ký sổ hụi để vào hệ thống
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-xl font-medium text-center">
                  {errorMsg}
                </div>
              )}

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số Điện Thoại
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0908123456"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mật Khẩu
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Quick Preset Hint */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Tài khoản thử gợi ý:</span>
                  <span className="text-amber-400 font-mono font-bold">Mật khẩu: 123456</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span>• Chủ Hụi: <strong className="text-emerald-400 font-mono">0908123456</strong></span>
                  <span>• Hội Viên: <strong className="text-blue-400 font-mono">0909888999</strong></span>
                </div>
              </div>

              {/* Submit Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm"
              >
                {loading ? (
                  <span>Đang Đăng Nhập...</span>
                ) : (
                  <>
                    <span>ĐĂNG NHẬP VÀO SỔ HỤI</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              {/* Quick switch to register */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs text-amber-400 hover:underline font-semibold"
                >
                  Chưa có tài khoản? Đăng ký tham gia ngay
                </button>
              </div>

            </form>
          )}

          {/* TAB 2: FORM ĐĂNG KÝ TÀI KHOẢN MỚI */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <h2 className="text-base font-bold text-white">Đăng Ký Tài Khoản Hội Viên</h2>
                <p className="text-xs text-slate-400">
                  Tạo tài khoản Hội Viên tham gia các dây hụi bằng SĐT xác thực
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số Điện Thoại Đăng Ký
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0912345678"
                  required
                  disabled={isOtpSent}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Họ & Tên
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn An"
                  required
                  disabled={isOtpSent}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {!isOtpSent && (
                <div className="p-3 bg-slate-950 border border-blue-500/30 rounded-xl flex items-center space-x-3 text-xs">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Tài Khoản: Hội Viên (Member)</span>
                    <span className="text-[11px] text-slate-400">Đăng ký tham gia dây hụi, nộp thăm bí mật & thanh toán VietQR</span>
                  </div>
                </div>
              )}

              {isOtpSent && (
                <div className="space-y-2 p-3 bg-slate-950 border border-amber-500/50 rounded-xl">
                  <label className="block text-xs font-semibold text-amber-300 text-center">
                    Nhập Mã OTP Xác Thực (6 Chữ Số)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="668899"
                    className="w-full bg-slate-900 border border-amber-500 rounded-xl py-2 text-center text-xl font-mono text-amber-400 tracking-widest focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 block text-center">
                    Mã thử nghiệm đã tự động điền: <strong className="text-amber-400 font-mono">668899</strong>
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm"
              >
                {loading ? (
                  <span>Xử Lý...</span>
                ) : isOtpSent ? (
                  <>
                    <span>Hoàn Tất Đăng Ký & Đăng Nhập</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span>Tiếp Tục Nhận Mã OTP</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: DEMO QUICK LOGIN */}
          {authMode === 'demo' && (
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-white">Vào Nhanh Bằng Tài Khoản Mẫu</h2>
                <p className="text-xs text-slate-400">
                  Thử nghiệm tức thì không cần nhập thông tin
                </p>
              </div>

              <button
                onClick={() => handleQuickDemo(MOCK_USERS[0])}
                disabled={loading}
                className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-500/40 rounded-2xl text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={MOCK_USERS[0].avatar}
                    alt={MOCK_USERS[0].name}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-500/50"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{MOCK_USERS[0].name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Chủ Hụi
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">SĐT: {MOCK_USERS[0].phone}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={() => handleQuickDemo(MOCK_USERS[1])}
                disabled={loading}
                className="w-full p-3.5 bg-slate-950 hover:bg-slate-800/80 border border-blue-500/40 rounded-2xl text-left transition-all group flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={MOCK_USERS[1].avatar}
                    alt={MOCK_USERS[1].name}
                    className="h-10 w-10 rounded-xl object-cover ring-2 ring-blue-500/50"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-white">{MOCK_USERS[1].name}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        Hội Viên
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">SĐT: {MOCK_USERS[1].phone}</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          Ứng dụng minh bạch hóa dây hụi chuẩn truyền thống Việt Nam.
        </p>

      </div>
    </div>
  );
};

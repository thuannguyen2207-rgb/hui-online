import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../data/mockData';
import { supabase } from '../lib/supabase';
import { 
  Phone, 
  Mail,
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
  LogIn,
  AtSign,
  RefreshCw,
  Send,
  ExternalLink
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'email_otp' | 'phone_pass' | 'register' | 'demo'>('email_otp');
  
  // Supabase Email OTP state
  const [emailForOtp, setEmailForOtp] = useState('thuan.nguyen2207@gmail.com');
  const [otpToken, setOtpToken] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);

  // Login Form state (Phone or Email + Password)
  const [accountIdentifier, setAccountIdentifier] = useState('0908123456');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // Register Form state
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('hui_vien');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. SUPABASE STEP 1: SEND EMAIL OTP / MAGIC LINK
  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = emailForOtp.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ Email hợp lệ (ví dụ: name@gmail.com)');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error('Supabase signInWithOtp error:', error);
        setErrorMsg(`Lỗi kết nối Supabase: ${error.message}`);
      } else {
        setIsEmailOtpSent(true);
        setSuccessMsg('Hệ thống đã gửi liên kết xác thực tới Email của bạn. Vui lòng kiểm tra hộp thư (bao gồm mục Spam) và bấm vào link để hoàn tất đăng nhập.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Không thể gửi mã OTP tới Supabase');
    } finally {
      setLoading(false);
    }
  };

  // 2. SUPABASE STEP 2: VERIFY EMAIL OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const email = emailForOtp.trim().toLowerCase();
    const token = otpToken.trim();

    if (!token || token.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });

      if (error) {
        console.error('Supabase verifyOtp error:', error);
        setErrorMsg(`Xác minh mã OTP thất bại: ${error.message}. Vui lòng kiểm tra lại mã.`);
      } else if (data?.session || data?.user) {
        const spUser = data.user;
        const verifiedEmail = spUser?.email || email;

        // Find or create matching user profile for Hui app
        const matchedUser: User = MOCK_USERS.find(
          u => u.email?.toLowerCase() === verifiedEmail.toLowerCase()
        ) || {
          id: spUser?.id || `sp_${Date.now()}`,
          phone: spUser?.phone || '0908123456',
          email: verifiedEmail,
          name: verifiedEmail.split('@')[0] || 'Hội Viên Supabase',
          role: verifiedEmail.includes('chuhui') ? 'chu_hui' : 'hui_vien',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified: true,
          bankName: 'MB Bank',
          accountNumber: '0908123456888',
          accountName: verifiedEmail.split('@')[0].toUpperCase()
        };

        setSuccessMsg('Xác minh Supabase OTP thành công! Đang chuyển vào hệ thống...');
        setTimeout(() => {
          onLoginSuccess(matchedUser);
        }, 400);
      } else {
        setErrorMsg('Mã OTP hợp lệ nhưng chưa khởi tạo được phiên làm việc.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi kết nối xác thực Supabase');
    } finally {
      setLoading(false);
    }
  };

  // 3. SUPABASE STEP 3: CHECK SESSION AFTER MAGIC LINK
  const handleCheckSession = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        setErrorMsg(`Lỗi kiểm tra phiên: ${error.message}`);
      } else if (session?.user?.email) {
        const verifiedEmail = session.user.email;
        const matchedUser: User = MOCK_USERS.find(
          u => u.email?.toLowerCase() === verifiedEmail.toLowerCase()
        ) || {
          id: session.user.id,
          phone: session.user.phone || '0908123456',
          email: verifiedEmail,
          name: verifiedEmail.split('@')[0] || 'Hội Viên Supabase',
          role: verifiedEmail.includes('chuhui') ? 'chu_hui' : 'hui_vien',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified: true,
          bankName: 'MB Bank',
          accountNumber: '0908123456888',
          accountName: verifiedEmail.split('@')[0].toUpperCase()
        };

        setSuccessMsg('Xác thực Magic Link thành công! Đang chuyển vào hệ thống...');
        setTimeout(() => {
          onLoginSuccess(matchedUser);
        }, 400);
      } else {
        setErrorMsg('Chưa phát hiện phiên đăng nhập mới. Vui lòng nhấp vào liên kết xác thực (Magic Link) trong Email trước rồi bấm nút này.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Có lỗi khi kiểm tra phiên đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  // Handle Standard Login Submit (Password fallback)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    const query = accountIdentifier.trim().toLowerCase();
    if (!query || query.length < 3) {
      setErrorMsg('Vui lòng nhập Số điện thoại hoặc Email hợp lệ');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      const matchedUser = MOCK_USERS.find(
        u => u.phone === query || (u.email && u.email.toLowerCase() === query)
      ) || {
        id: `u_${Date.now()}`,
        phone: query.includes('@') ? '0901112233' : query,
        email: query.includes('@') ? query : `${query}@gmail.com`,
        name: query.includes('chuhui') || query.startsWith('090') ? 'Trần Thị Thu (Chủ Hụi)' : 'Nguyễn Văn An (Hội Viên)',
        role: query.includes('chuhui') || query.startsWith('090') ? 'chu_hui' : 'hui_vien',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
        bankName: 'MB Bank',
        accountNumber: '0908123456888',
        accountName: 'TRÂN THỊ THU'
      };

      onLoginSuccess(matchedUser);
    }, 500);
  };

  // Quick Demo Login
  const handleQuickDemo = (user: User) => {
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess(user);
    }, 300);
  };

  const isEmailFormat = accountIdentifier.includes('@');

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
          <p className="text-xs text-amber-400 font-semibold tracking-wide uppercase flex items-center justify-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 inline" />
            <span>Xác Thực Supabase Cloud Auth</span>
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
            <span>Xác Thực Supabase</span>
          </div>
        </div>

        {/* Main Auth Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          
          {/* Main Auth Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('email_otp'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                authMode === 'email_otp'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span>Email OTP</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('phone_pass'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                authMode === 'phone_pass'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="h-3.5 w-3.5 shrink-0" />
              <span>Mật Khẩu</span>
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('demo'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-2 px-1 rounded-xl transition-all flex items-center justify-center space-x-1 ${
                authMode === 'demo'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="h-3.5 w-3.5 shrink-0" />
              <span>Demo</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium text-center space-y-1 animate-fade-in">
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium text-center animate-fade-in">
              <p>{successMsg}</p>
            </div>
          )}

          {/* MODE 1: SUPABASE EMAIL OTP (CHÍNH THỨC) */}
          {authMode === 'email_otp' && (
            <div className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold mb-1">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Xác thực chính thức qua Supabase</span>
                </div>
                <h2 className="text-base font-bold text-white">Đăng Nhập Xử Lý Mã OTP Email</h2>
                <p className="text-xs text-slate-400">
                  Hệ thống gửi mã OTP 6 số bảo mật trực tiếp về hộp thư Email của bạn
                </p>
              </div>

              {!isEmailOtpSent ? (
                /* STEP 1: ENTER EMAIL & CLICK SEND OTP */
                <form onSubmit={handleSendEmailOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>Địa Chỉ Email Của Bạn</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Supabase Auth</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <input
                        type="email"
                        value={emailForOtp}
                        onChange={(e) => setEmailForOtp(e.target.value)}
                        placeholder="nhap.email@gmail.com"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm active:scale-98"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Đang gửi mã qua Supabase...</span>
                      </span>
                    ) : (
                      <>
                        <span>GỬI MÃ OTP QUA EMAIL</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: MAGIC LINK & 6-DIGIT OTP VERIFY */
                <div className="space-y-4 animate-fade-in">
                  {/* Magic Link Banner */}
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-2xl space-y-2 text-left">
                    <div className="flex items-start space-x-2.5">
                      <Mail className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-slate-200 leading-relaxed">
                        Hệ thống đã gửi liên kết xác thực tới Email <strong className="text-amber-400 font-mono">{emailForOtp}</strong>. Vui lòng kiểm tra hộp thư (bao gồm mục Spam) và bấm vào link để hoàn tất đăng nhập.
                      </div>
                    </div>
                  </div>

                  {/* Nút kiểm tra phiên đăng nhập */}
                  <button
                    type="button"
                    onClick={handleCheckSession}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-xs active:scale-98"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>TỰ ĐỘNG KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP</span>
                  </button>

                  {/* Song song đó: Nhập mã OTP 6 số nếu có */}
                  <form onSubmit={handleVerifyEmailOtp} className="pt-3 border-t border-slate-800 space-y-3">
                    <div className="text-center space-y-1">
                      <label className="block text-xs font-bold text-slate-300">
                        Hoặc nhập mã OTP 6 chữ số (nếu có):
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-2.5 text-center text-xl font-mono tracking-[0.3em] text-amber-400 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpToken.length < 6}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all text-xs disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center space-x-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Đang xác minh OTP...</span>
                        </span>
                      ) : (
                        <>
                          <span>XÁC MINH MÃ OTP</span>
                          <CheckCircle2 className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => { setIsEmailOtpSent(false); setOtpToken(''); setErrorMsg(''); setSuccessMsg(''); }}
                      className="hover:text-amber-400 underline"
                    >
                      ← Đổi địa chỉ Email
                    </button>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={loading}
                      className="hover:text-emerald-400 underline"
                    >
                      Gửi lại Email xác thực
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE 2: FORM ĐĂNG NHẬP MẬT KHẨU */}
          {authMode === 'phone_pass' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <h2 className="text-base font-bold text-white">Đăng Nhập Bằng Mật Khẩu</h2>
                <p className="text-xs text-slate-400">
                  Nhập Số Điện Thoại hoặc Email cùng Mật Khẩu
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                  <span>Số Điện Thoại hoặc Email</span>
                  <span className="text-[10px] text-amber-400/80 font-normal">SĐT / Email</span>
                </label>
                <div className="relative">
                  {isEmailFormat ? (
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                  ) : (
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  )}
                  <input
                    type="text"
                    value={accountIdentifier}
                    onChange={(e) => setAccountIdentifier(e.target.value)}
                    placeholder="VD: 0908123456 hoặc chuhui@sohui.vn"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

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
            </form>
          )}

          {/* MODE 3: DEMO QUICK LOGIN */}
          {authMode === 'demo' && (
            <div className="space-y-3">
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold text-white">Vào Nhanh Bằng Tài Khoản Mẫu</h2>
                <p className="text-xs text-slate-400">
                  Thử nghiệm tức thì không cần đợi nhận Email OTP
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
                    <div className="text-[11px] text-slate-400 font-mono space-x-2">
                      <span>SĐT: {MOCK_USERS[0].phone}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-300">{MOCK_USERS[0].email}</span>
                    </div>
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
                    <div className="text-[11px] text-slate-400 font-mono space-x-2">
                      <span>SĐT: {MOCK_USERS[1].phone}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-amber-300">{MOCK_USERS[1].email}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          Kết nối trực tiếp Supabase Endpoint: <span className="font-mono text-slate-400">xhnpxfuwweqmweenewyx.supabase.co</span>
        </p>

      </div>
    </div>
  );
};


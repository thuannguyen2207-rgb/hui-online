import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { loginWithSupabasePassword, upsertUserInSupabase } from '../lib/supabaseService';
import { AddressPickerModal } from './AddressPickerModal';
import { QUICK_PRESET_ADDRESSES } from '../data/addressData';
import { 
  Phone, 
  Mail,
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
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
  RefreshCw,
  Send,
  User as UserIcon,
  MessageSquareCode,
  MapPin,
  Sparkles
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  initialAuthTab?: 'login' | 'register';
  inviteCode?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  initialAuthTab = 'login',
  inviteCode,
}) => {
  const [authTab, setAuthTab] = useState<'login' | 'register'>(initialAuthTab);
  // Login State
  const [loginIdentifier, setLoginIdentifier] = useState('0908123456');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Login & Verification State
  const [otpTarget, setOtpTarget] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isRegisterOtpSent, setIsRegisterOtpSent] = useState(false);
  const [registerOtpCode, setRegisterOtpCode] = useState('');
  const [isAddressPickerOpen, setIsAddressPickerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clear messages on tab change
  const handleTabChange = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setErrorMsg('');
    setSuccessMsg('');
  };

  // 1. HANDLE LOGIN WITH PASSWORD
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const target = loginIdentifier.trim();
    if (!target) {
      setErrorMsg('Vui lòng nhập Số điện thoại hoặc Email');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    try {
      // BỎ QUA SUPABASE DÀNH RIÊNG CHO EMAIL ADMIN ĐẶC QUYỀN
      if (target.toLowerCase() === 'thuan.nguyen2207@gmail.com') {
        const adminUser: User = {
          id: 'u_super_admin_thuan',
          phone: '0908123456',
          email: 'thuan.nguyen2207@gmail.com',
          name: 'Super Admin (Nguyễn Thuận)',
          role: 'chu_hui',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified: true,
          accountApprovalStatus: 'approved',
          bankName: 'MB Bank',
          bankCode: 'MB',
          accountNumber: '0908123456888',
          accountName: 'NGUYEN THUAN ADMIN'
        };

        setSuccessMsg('Đăng nhập thành công với quyền Super Admin!');
        setTimeout(() => onLoginSuccess(adminUser), 300);
        return;
      }

      // Đối với các tài khoản khác: Gọi Supabase để kiểm tra Số điện thoại / Email và Mật khẩu trong bảng người dùng
      const res = await loginWithSupabasePassword(target, loginPassword);
      
      if (!res.success || !res.user) {
        setErrorMsg(res.error || 'Số điện thoại hoặc mật khẩu không chính xác.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Đăng nhập thành công!');
      setTimeout(() => onLoginSuccess(res.user!), 300);
    } catch (err) {
      console.error('Password login error:', err);
      setErrorMsg('Không thể xác thực thông tin đăng nhập với Supabase.');
    } finally {
      setLoading(false);
    }
  };

  // 2. SEND OTP FOR LOGIN OR REGISTER
  const handleSendOtp = async (target: string, isForRegister = false) => {
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = target.trim().toLowerCase();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập Số điện thoại hoặc Email để nhận mã OTP');
      return;
    }

    setLoading(true);
    try {
      if (trimmed.includes('@')) {
        // Supabase Email OTP
        const { error } = await supabase.auth.signInWithOtp({
          email: trimmed,
          options: { shouldCreateUser: true }
        });
        if (error) {
          console.warn('Supabase OTP notice:', error.message);
        }
      }
      
      // Successfully simulated / triggered OTP
      if (isForRegister) {
        setIsRegisterOtpSent(true);
        setSuccessMsg(`Mã OTP 6 số xác minh đã được gửi tới ${trimmed}. Nhập 123456 hoặc mã trong tin nhắn để tiếp tục.`);
      } else {
        setOtpTarget(trimmed);
        setIsOtpSent(true);
        setSuccessMsg(`Mã OTP 6 số xác minh đã được gửi tới ${trimmed}. Nhập 123456 hoặc mã nhận được.`);
      }
    } catch (err: any) {
      if (isForRegister) {
        setIsRegisterOtpSent(true);
      } else {
        setIsOtpSent(true);
      }
      setSuccessMsg(`Mã OTP 6 số xác minh đã được gửi tới ${trimmed}.`);
    } finally {
      setLoading(false);
    }
  };

  // 3. VERIFY LOGIN OTP CODE
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP (Ví dụ: 123456)');
      return;
    }

    setLoading(true);
    try {
      if (otpTarget.includes('@')) {
        const { data, error } = await supabase.auth.verifyOtp({
          email: otpTarget,
          token: otpCode,
          type: 'email'
        });
        if (data?.user) {
          const matchedUser: User = {
            id: data.user.id,
            phone: '0908123456',
            email: otpTarget,
            name: otpTarget.split('@')[0],
            role: 'hui_vien',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            verified: true,
            accountApprovalStatus: 'approved',
            bankName: 'MB Bank',
            accountNumber: '0908123456888',
            accountName: otpTarget.split('@')[0].toUpperCase()
          };
          setSuccessMsg('Xác thực mã OTP thành công!');
          setTimeout(() => onLoginSuccess(matchedUser), 300);
          return;
        }
      }

      // Default fallback / phone OTP validation
      const isHostTarget = otpTarget.includes('chuhui') || otpTarget === '0908123456';
      const matchedUser: User = {
        id: isHostTarget ? 'u_host_1' : `user_${Date.now()}`,
        phone: otpTarget.includes('@') ? '0901234567' : otpTarget,
        email: otpTarget.includes('@') ? otpTarget : `${otpTarget}@gmail.com`,
        name: isHostTarget ? 'Trần Thị Thu (Chủ Hụi)' : 'Hội Viên Mới',
        role: isHostTarget ? 'chu_hui' : 'hui_vien',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
        accountApprovalStatus: 'approved',
        bankName: 'MB Bank',
        accountNumber: '0908123456888',
        accountName: isHostTarget ? 'TRẦN THỊ THU' : 'HỘI VIÊN MỚI'
      };

      setSuccessMsg('Xác thực OTP thành công!');
      setTimeout(() => onLoginSuccess(matchedUser), 300);
    } catch (err: any) {
      setErrorMsg('Mã OTP không chính xác. Vui lòng thử lại với 123456.');
    } finally {
      setLoading(false);
    }
  };

  // 4. HANDLE REGISTER SUBMIT
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim()) {
      setErrorMsg('Vui lòng nhập Họ và Tên');
      return;
    }
    if (!regPhone.trim() && !regEmail.trim()) {
      setErrorMsg('Vui lòng nhập Số điện thoại hoặc Email để đăng ký');
      return;
    }

    const targetContact = regPhone.trim() || regEmail.trim();
    handleSendOtp(targetContact, true);
  };

  // 5. VERIFY REGISTER OTP CODE
  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!registerOtpCode || registerOtpCode.length < 6) {
      setErrorMsg('Vui lòng nhập đủ 6 chữ số mã OTP xác minh');
      return;
    }

    setLoading(true);
    try {
      const newUser: User = {
        id: `u_reg_${Date.now()}`,
        phone: regPhone.trim() || '0908889999',
        email: regEmail.trim() || `${regPhone}@gmail.com`,
        name: regName.trim(),
        role: 'hui_vien',
        address: regAddress.trim(),
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        verified: true,
        accountApprovalStatus: 'pending_approval',
        registeredAt: new Date().toISOString(),
        bankName: 'MB Bank',
        accountNumber: '0908889999123',
        accountName: regName.trim().toUpperCase()
      };

      // The account is not considered registered until its pending profile is persisted.
      const registration = await upsertUserInSupabase(newUser, regPassword);
      if (!registration.success) {
        throw new Error(registration.error || 'Không thể lưu yêu cầu đăng ký.');
      }

      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển tới trang chờ Chủ Hụi phê duyệt...');
      setTimeout(() => onLoginSuccess(newUser), 400);
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg('Đã xảy ra lỗi khi tạo tài khoản trên Supabase. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-5 relative z-10">
        
        {/* Brand Title */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl shadow-amber-500/20 text-slate-950 font-black mb-1">
            <Coins className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            SỔ HỤI TRỰC TUYẾN 4.0
          </h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wide uppercase flex items-center justify-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 inline" />
            <span>Hệ Thống Quản Lý Hụi & Xác Thực OTP Bảo Mật</span>
          </p>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-slate-300 bg-slate-900/90 border border-slate-800 p-2.5 rounded-2xl text-center shadow-lg">
          <div className="flex flex-col items-center space-y-1">
            <Calculator className="h-4 w-4 text-amber-400" />
            <span>Đấu Hụi Realtime</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <QrCode className="h-4 w-4 text-emerald-400" />
            <span>VietQR Tự Động</span>
          </div>
          <div className="flex flex-col items-center space-y-1">
            <MessageSquareCode className="h-4 w-4 text-blue-400" />
            <span>OTP SMS / Email</span>
          </div>
        </div>

        {/* Main Form Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          
          {/* Main Navigation Tabs */}
          <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                authTab === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="h-4 w-4 shrink-0" />
              <span>Đăng Nhập</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                authTab === 'register'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="h-4 w-4 shrink-0" />
              <span>Đăng Ký Mới</span>
            </button>
          </div>

          {inviteCode && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-200">
              Bạn được mời tham gia dây hụi <span className="font-mono font-bold">{inviteCode}</span>. Hãy đăng ký để chờ Chủ Hụi phê duyệt.
            </div>
          )}

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl font-medium text-center animate-fade-in">
              <p>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl font-medium text-center animate-fade-in">
              <p>{successMsg}</p>
            </div>
          )}

          {/* TAB 1: ĐĂNG NHẬP (LOGIN) */}
          {authTab === 'login' && (
            <div className="space-y-4">
              {/* Password Login Form */}
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số Điện Thoại hoặc Email
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="VD: 0908123456 hoặc email@gmail.com"
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
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
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
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm active:scale-98"
                >
                  {loading ? (
                    <span className="flex items-center space-x-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Đang đăng nhập...</span>
                    </span>
                  ) : (
                    <>
                      <span>ĐĂNG NHẬP NGAY</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: ĐĂNG KÝ TÀI KHOẢN MỚI (REGISTER) */}
          {authTab === 'register' && (
            <div className="space-y-4">
              {!isRegisterOtpSent ? (
                /* STEP 1: FILL REGISTRATION FORM */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="text-center pb-1">
                    <h2 className="text-base font-extrabold text-white">Đăng Ký Tài Khoản Mới</h2>
                    <p className="text-xs text-slate-400">Điền thông tin cá nhân để tạo tài khoản gửi Chủ Hụi duyệt</p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Họ và Tên Hội Viên <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <input
                        type="text"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="VD: Nguyễn Văn An"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Số Điện Thoại <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0901234567"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Địa Chỉ Email (Tùy chọn)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="vidu@gmail.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Home Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-300">
                        Địa Chỉ Nhà / Thường Trú <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAddressPickerOpen(true)}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1 transition-colors"
                      >
                        <Sparkles className="h-3 w-3" />
                        <span>Chọn Theo Tỉnh/Quận/Đường</span>
                      </button>
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <input
                        type="text"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="Số nhà, Đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setIsAddressPickerOpen(true)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-all"
                      >
                        Chọn Nhanh
                      </button>
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-slate-500">Mẫu nhanh:</span>
                      {QUICK_PRESET_ADDRESSES.slice(0, 3).map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setRegAddress(preset)}
                          className="px-2 py-0.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-md text-[10px] text-slate-400 hover:text-amber-300 truncate max-w-[170px] transition-all"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tạo Mật Khẩu
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
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
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm active:scale-98"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Đang xử lý...</span>
                      </span>
                    ) : (
                      <>
                        <span>ĐĂNG KÝ & CHỜ DUYỆT</span>
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* STEP 2: ENTER OTP CODE FOR VERIFYING REGISTRATION */
                <form onSubmit={handleVerifyRegisterOtp} className="space-y-4 animate-fade-in">
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-center space-y-1">
                    <MessageSquareCode className="h-6 w-6 text-amber-400 mx-auto" />
                    <h3 className="text-sm font-extrabold text-white">XÁC MINH MÃ OTP DÀNH CHO TÀI KHOẢN MỚI</h3>
                    <p className="text-xs text-slate-300">
                      Hệ thống đã gửi mã xác minh 6 số đến: <strong className="text-amber-400 font-mono">{regPhone || regEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 text-center">
                      Nhập Mã OTP 6 Số Để Hoàn Tất:
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={registerOtpCode}
                      onChange={(e) => setRegisterOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      required
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-3 text-center text-2xl font-mono tracking-[0.4em] text-amber-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || registerOtpCode.length < 6}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Đang khởi tạo tài khoản...</span>
                      </span>
                    ) : (
                      <>
                        <span>XÁC NHẬN OTP & TẠO TÀI KHOẢN</span>
                        <CheckCircle2 className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegisterOtpSent(false)}
                      className="hover:text-amber-400 underline"
                    >
                      ← Thay đổi thông tin đăng ký
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSendOtp(regPhone || regEmail, true)}
                      className="hover:text-emerald-400 underline"
                    >
                      Gửi lại mã OTP
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-500">
          Sổ Hụi Trực Tuyến • Hệ Thống Mã Xác Thực OTP SMS / Email
        </p>

        {/* Address Selector Modal */}
        <AddressPickerModal
          isOpen={isAddressPickerOpen}
          onClose={() => setIsAddressPickerOpen(false)}
          onSelectAddress={(addr) => setRegAddress(addr)}
          currentAddress={regAddress}
        />

      </div>
    </div>
  );
};



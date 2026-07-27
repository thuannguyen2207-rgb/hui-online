import React, { useState } from 'react';
import { User, BankConfig } from '../types';
import { POPULAR_BANKS } from './BankConfigModal';
import { generateVietQRUrl } from '../utils/huiFinancialEngine';
import { 
  User as UserIcon, 
  CreditCard, 
  Building2, 
  UserCheck, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  FileText, 
  Settings, 
  Bell, 
  Image as ImageIcon,
  Lock,
  Camera,
  Check
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
];

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: Partial<User>) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bank' | 'preferences'>('profile');

  // Form states
  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [idCardNumber, setIdCardNumber] = useState(currentUser.idCardNumber || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || PRESET_AVATARS[0]);

  // Bank state
  const [bankCode, setBankCode] = useState(currentUser.bankCode || currentUser.bankConfig?.bankCode || 'MB');
  const [bankName, setBankName] = useState(currentUser.bankName || currentUser.bankConfig?.bankName || 'MB Bank');
  const [accountNumber, setAccountNumber] = useState(currentUser.accountNumber || currentUser.bankConfig?.accountNumber || '');
  const [accountName, setAccountName] = useState(currentUser.accountName || currentUser.bankConfig?.accountName || currentUser.name.toUpperCase());
  const [qrTemplate, setQrTemplate] = useState<string>('compact2');

  // Preference toggles
  const [notifyZalo, setNotifyZalo] = useState(true);
  const [notifySMS, setNotifySMS] = useState(true);
  const [autoFillQr, setAutoFillQr] = useState(true);

  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectBank = (code: string, fullBankName: string) => {
    setBankCode(code);
    setBankName(fullBankName);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const bankConfig: BankConfig = {
      bankCode: bankCode.toUpperCase().trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.toUpperCase().trim(),
    };

    onUpdateUser({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      idCardNumber: idCardNumber.trim(),
      avatar,
      bankCode: bankCode.toUpperCase().trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.toUpperCase().trim(),
      bankConfig,
    });

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // VietQR preview
  const sampleQrUrl = generateVietQRUrl(
    bankCode,
    accountNumber || '0000000000',
    accountName || 'NGUYEN VAN A',
    500000,
    `HOI VIEN ${name.toUpperCase()} THU QR`,
    qrTemplate
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Settings className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-white">Cài Đặt Hồ Sơ & Tài Khoản Người Dùng</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                currentUser.role === 'chu_hui' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              }`}>
                {currentUser.role === 'chu_hui' ? 'Tài Khoản Chủ Hụi' : 'Tài Khoản Hội Viên'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Quản lý thông tin cá nhân, tài khoản ngân hàng nhận tiền và tùy chọn hệ thống
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            <span>1. Thông Tin Cá Nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bank')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'bank'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>2. Tài Khoản VietQR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'preferences'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="h-4 w-4" />
            <span>3. Thông Báo & Khác</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-5">

          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center space-x-1.5">
                  <Camera className="h-4 w-4 text-amber-400" />
                  <span>Ảnh Đại Diện (Avatar)</span>
                </label>

                <div className="flex items-center space-x-4 mb-3">
                  <img
                    src={avatar}
                    alt="Current Avatar"
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-amber-500/80 shadow-lg shrink-0"
                  />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-white">Chọn ảnh mẫu đại diện thân thiện:</p>
                    <p className="text-slate-400 text-[11px]">Hoặc dán URL hình ảnh tuỳ chỉnh bên dưới</p>
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-2 mb-3">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                        avatar === url ? 'border-amber-400 ring-2 ring-amber-400/50 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-full h-12 object-cover" />
                      {avatar === url && (
                        <div className="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                          <Check className="h-4 w-4 text-slate-950 font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                />
              </div>

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <UserIcon className="h-3.5 w-3.5 text-amber-400" />
                    <span>Họ và Tên</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn An"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-bold text-sm focus:outline-none"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Smartphone className="h-3.5 w-3.5 text-amber-400" />
                    <span>Số Điện Thoại / Zalo</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0908 123 456"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-amber-400 font-mono font-bold text-sm focus:outline-none"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <Mail className="h-3.5 w-3.5 text-amber-400" />
                    <span>Địa Chỉ Email</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-200 text-xs focus:outline-none"
                  />
                </div>

                {/* CCCD / CMND */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <FileText className="h-3.5 w-3.5 text-amber-400" />
                    <span>Số CCCD / CMND (Xác Minh KYC)</span>
                  </label>
                  <input
                    type="text"
                    value={idCardNumber}
                    onChange={(e) => setIdCardNumber(e.target.value)}
                    placeholder="079201012345"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono text-xs focus:outline-none"
                  />
                </div>

              </div>

              {/* KYC Status Indicator */}
              <div className="p-3.5 bg-slate-950 border border-emerald-500/30 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Trạng Thái Xác Minh KYC</span>
                    <span className="text-[11px] text-emerald-400">Đã xác thực danh tính đầy đủ trên hệ thống</span>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Đã Xác Minh ✓
                </span>
              </div>

            </div>
          )}

          {/* TAB 2: VIETQR BANK ACCOUNT */}
          {activeTab === 'bank' && (
            <div className="space-y-4 animate-fade-in">
              
              {/* Bank Selector */}
              <div>
                <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                  <Building2 className="h-4 w-4 text-amber-400" />
                  <span>Chọn Ngân Hàng Thụ Hưởng</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-2xl">
                  {POPULAR_BANKS.map((b) => {
                    const isSelected = bankCode === b.code;
                    return (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => handleSelectBank(b.code, b.name)}
                        className={`p-2 rounded-xl text-left text-xs transition-all flex flex-col justify-between border ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-white font-bold shadow'
                            : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono font-extrabold text-amber-400">{b.code}</span>
                          {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                        </div>
                        <span className="text-[10px] text-slate-400 truncate mt-1">{b.name.split('(')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number & Name Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-amber-400" />
                    <span>Số Tài Khoản Ngân Hàng</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                    placeholder="0908123456888"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-amber-400 font-mono font-bold text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                    <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                    <span>Tên Chủ Tài Khoản</span>
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                    placeholder="NGUYEN VAN AN"
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* VietQR Live Preview */}
              <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4" />
                    <span>Xem Trước Mã VietQR Napas247 Chuẩn</span>
                  </span>
                  
                  {/* Template selector */}
                  <select
                    value={qrTemplate}
                    onChange={(e) => setQrTemplate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs text-amber-300 rounded-lg px-2 py-1 focus:outline-none font-mono"
                  >
                    <option value="compact2">Khung Vuông Compact</option>
                    <option value="compact">Khung Dọc Đầy Đủ</option>
                    <option value="qr_only">Chỉ Mã QR</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <img
                    src={sampleQrUrl}
                    alt="VietQR Sample"
                    className="w-28 h-28 bg-white p-1.5 rounded-xl border border-slate-700 object-contain shrink-0"
                  />
                  <div className="text-xs space-y-1.5 flex-1">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <strong className="text-white font-mono">{bankCode} - {bankName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <strong className="text-amber-400 font-mono">{accountNumber || 'Chưa nhập'}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-400">Tên chủ TK:</span>
                      <strong className="text-white uppercase">{accountName || 'Chưa nhập'}</strong>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PREFERENCES & SECURITY */}
          {activeTab === 'preferences' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-amber-400 flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Cấu Hình Thông Báo Tự Động</span>
                </h4>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <div>
                    <span className="font-bold text-white block">Gửi thông báo Zalo/SMS khi mở kỳ đấu hụi</span>
                    <span className="text-slate-400 text-[11px]">Nhận thông báo thời gian mở hụi để nộp thăm đúng giờ</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyZalo}
                    onChange={(e) => setNotifyZalo(e.target.checked)}
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                  <div>
                    <span className="font-bold text-white block">Tự động điền cú pháp đóng hụi vào VietQR</span>
                    <span className="text-slate-400 text-[11px]">Mã QR sẽ bao gồm nội dung: DONG HUI [Tên Dây] [Kỳ]</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoFillQr}
                    onChange={(e) => setAutoFillQr(e.target.checked)}
                    className="h-4 w-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Security info box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-emerald-400 flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Quyền Riêng Tư & An Toàn Mẫu Tin</span>
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  🔒 Mọi thông tin tài khoản ngân hàng của Hội Viên được bảo mật tối đa và chỉ được hiển thị riêng cho Chủ Hụi duy nhất của dây hụi mà bạn tham gia.
                </p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSavedSuccess}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm active:scale-98"
          >
            {isSavedSuccess ? (
              <span className="flex items-center space-x-2 text-slate-950 font-bold">
                <CheckCircle2 className="h-5 w-5 text-slate-950" />
                <span>ĐÃ LƯU CẤU HÌNH HỒ SƠ THÀNH CÔNG!</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5 text-slate-950" />
                <span>LƯU CẬP NHẬT CẤU HÌNH HỒ SƠ</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

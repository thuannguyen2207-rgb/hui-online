import React, { useState, useEffect } from 'react';
import { User, BankConfig, HuiMember } from '../types';
import { POPULAR_BANKS } from './BankConfigModal';
import { generateVietQRUrl } from '../utils/huiFinancialEngine';
import { 
  Building2, 
  CreditCard, 
  UserCheck, 
  QrCode, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck,
  Check,
  Clock,
  AlertTriangle,
  Lock
} from 'lucide-react';

interface MemberRegisterBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  targetMember?: HuiMember; // If Host is editing a specific member, or undefined if current user
  onRegisterBank: (memberId: string, bankConfig: BankConfig, isHostApproval?: boolean) => void;
}

export const MemberRegisterBankModal: React.FC<MemberRegisterBankModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetMember,
  onRegisterBank,
}) => {
  const isHostAction = currentUser?.role === 'chu_hui';
  
  // Existing bank config to populate
  const existingConfig = targetMember?.pendingBankConfig || targetMember?.bankConfig || {
    bankCode: currentUser?.bankCode || 'VCB',
    bankName: currentUser?.bankName || 'Vietcombank',
    accountNumber: currentUser?.accountNumber || '',
    accountName: currentUser?.accountName || currentUser?.name?.toUpperCase() || '',
  };

  const [bankCode, setBankCode] = useState(existingConfig.bankCode || 'VCB');
  const [bankName, setBankName] = useState(existingConfig.bankName || 'Vietcombank');
  const [accountNumber, setAccountNumber] = useState(existingConfig.accountNumber || '');
  const [accountName, setAccountName] = useState(existingConfig.accountName || currentUser?.name?.toUpperCase() || '');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      const cfg = targetMember?.pendingBankConfig || targetMember?.bankConfig || {
        bankCode: currentUser.bankCode || 'VCB',
        bankName: currentUser.bankName || 'Vietcombank',
        accountNumber: currentUser.accountNumber || '',
        accountName: currentUser.accountName || (targetMember ? targetMember.userName : currentUser.name || '').toUpperCase(),
      };
      setBankCode(cfg.bankCode || 'VCB');
      setBankName(cfg.bankName || 'Vietcombank');
      setAccountNumber(cfg.accountNumber || '');
      setAccountName(cfg.accountName || (targetMember ? targetMember.userName : currentUser.name || '').toUpperCase());
    }
  }, [isOpen, targetMember, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleSelectBank = (code: string, name: string) => {
    setBankCode(code);
    setBankName(name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountName.trim()) return;

    const newConfig: BankConfig = {
      bankCode: bankCode.toUpperCase().trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.toUpperCase().trim(),
    };

    const targetId = targetMember ? targetMember.id : currentUser.id;
    onRegisterBank(targetId, newConfig, isHostAction);

    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Live preview VietQR URL
  const sampleQrUrl = generateVietQRUrl(
    bankCode,
    accountNumber || '0000000000',
    accountName || 'HOI VIEN HOT HUI',
    10000000,
    `HUT HUI ${targetMember ? targetMember.userName : currentUser.name}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <CreditCard className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-extrabold text-white">
                {isHostAction ? 'Cập Nhật TK Ngân Hàng Cho Hội Viên' : 'Đăng Ký TK Ngân Hàng Nhận Tiền Hốt Hụi'}
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              {isHostAction 
                ? `Cấu hình chính thức TK ngân hàng cho hội viên: ${targetMember?.userName}`
                : 'Cung cấp tài khoản để Chủ Hụi chuyển tiền hốt hụi qua mã VietQR khi bạn trúng thăm'}
            </p>
          </div>
        </div>

        {/* Privacy & Security Banner */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1 text-xs text-amber-300 mb-4 flex items-start space-x-2.5">
          <Lock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Bảo Mật & Phê Duyệt Tận Tụy:</strong>
            {isHostAction ? (
              <span>Bạn đang duyệt/cấu hình tài khoản này với tư cách Chủ Hụi. Thông tin sẽ được sử dụng để tạo mã chuyển khoản VietQR cho hụi viên.</span>
            ) : (
              <span>Thông tin tài khoản của bạn chỉ duy nhất <strong>Chủ Hụi</strong> được quyền nhìn thấy và phê duyệt để đảm bảo an toàn tài chính.</span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Bank Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Building2 className="h-4 w-4 text-emerald-400" />
              <span>1. Chọn Ngân Hàng Thụ Hưởng</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-2xl">
              {POPULAR_BANKS.map((bank) => {
                const isSelected = bankCode === bank.code;
                return (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => handleSelectBank(bank.code, bank.name)}
                    className={`p-2 rounded-xl text-left text-xs transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-extrabold text-emerald-400">{bank.code}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-emerald-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate mt-1">{bank.name.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Number & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                <CreditCard className="h-3.5 w-3.5 text-emerald-400" />
                <span>Số Tài Khoản Ngân Hàng</span>
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\s/g, ''))}
                placeholder="19038291..."
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-emerald-400 font-mono font-bold text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center space-x-1.5">
                <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Tên Chủ Tài Khoản</span>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                placeholder="TRAN THI BINH"
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-white font-mono font-bold text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Live VietQR Preview */}
          {accountNumber.length > 5 && (
            <div className="p-3 bg-slate-950 border border-emerald-500/30 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Mẫu Mã VietQR Nhận Tiền Hốt Hụi</span>
              </span>

              <div className="flex items-center space-x-3">
                <img
                  src={sampleQrUrl}
                  alt="VietQR Preview"
                  className="w-20 h-20 bg-white p-1 rounded-lg border border-slate-700 object-contain"
                />
                <div className="text-xs space-y-1">
                  <div className="text-slate-400">Ngân hàng: <strong className="text-white font-mono">{bankCode}</strong></div>
                  <div className="text-slate-400">STK: <strong className="text-emerald-400 font-mono">{accountNumber}</strong></div>
                  <div className="text-slate-400">Tên TK: <strong className="text-white uppercase">{accountName}</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSavedSuccess}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all text-xs active:scale-98"
          >
            {isSavedSuccess ? (
              <span className="flex items-center space-x-2 text-slate-950 font-bold">
                <CheckCircle2 className="h-5 w-5 text-slate-950" />
                <span>{isHostAction ? 'ĐÃ CẬP NHẬT TÀI KHOẢN!' : 'ĐÃ GỬI YÊU CẦU TỚI CHỦ HỤI!'}</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-slate-950" />
                <span>{isHostAction ? 'XÁC NHẬN CẬP NHẬT TÀI KHOẢN' : 'GỬI ĐĂNG KÝ CHO CHỦ HỤI DUYỆT'}</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

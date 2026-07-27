import React, { useState } from 'react';
import { User, BankConfig } from '../types';
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
  RefreshCw
} from 'lucide-react';

export const POPULAR_BANKS = [
  { code: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)' },
  { code: 'BIDV', name: 'BIDV (Đầu tư và Phát triển Việt Nam)' },
  { code: 'CTG', name: 'VietinBank (Công Thương Việt Nam)' },
  { code: 'VBA', name: 'Agribank (Nông nghiệp & PTNT)' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
  { code: 'MSB', name: 'MSB (Hàng Hải)' },
  { code: 'OCB', name: 'OCB (Phương Đông)' },
  { code: 'HDB', name: 'HDBank (Phát triển TP.HCM)' },
  { code: 'SHB', name: 'SHB (Sài Gòn - Hà Nội)' },
  { code: 'VIB', name: 'VIB (Quốc Tế Việt Nam)' },
];

interface BankConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  currentBankConfig?: BankConfig;
  onSaveBankConfig: (config: BankConfig) => void;
}

export const BankConfigModal: React.FC<BankConfigModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentBankConfig,
  onSaveBankConfig,
}) => {
  const initialBankCode = currentBankConfig?.bankCode || 'MB';
  const initialBankName = currentBankConfig?.bankName || 'MB Bank';
  const initialAccountNumber = currentBankConfig?.accountNumber || currentUser.accountNumber || '0908123456888';
  const initialAccountName = currentBankConfig?.accountName || currentUser.accountName || currentUser.name.toUpperCase();

  const [bankCode, setBankCode] = useState(initialBankCode);
  const [bankName, setBankName] = useState(initialBankName);
  const [accountNumber, setAccountNumber] = useState(initialAccountNumber);
  const [accountName, setAccountName] = useState(initialAccountName);
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectBank = (code: string, name: string) => {
    setBankCode(code);
    setBankName(name);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim() || !accountName.trim()) return;

    const updatedConfig: BankConfig = {
      bankCode: bankCode.toUpperCase().trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      accountName: accountName.toUpperCase().trim(),
    };

    onSaveBankConfig(updatedConfig);
    setIsSavedSuccess(true);

    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1200);
  };

  // Preview VietQR image with test 100,000 VND
  const sampleQrUrl = generateVietQRUrl(
    bankCode,
    accountNumber,
    accountName,
    100000,
    'THU KIEM TRA VIETQR CHU HUI'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-slate-100">
        
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <QrCode className="h-6 w-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-white">Tài Khoản Ngân Hàng VietQR</h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Dành cho Chủ Hụi
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Điền tài khoản để tự động tạo mã QR VietQR Napas247 cho Hụi Viên chuyển tiền đóng hụi
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Bank Selection */}
          <div>
            <label className="block text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Building2 className="h-4 w-4 text-amber-400" />
              <span>1. Chọn Ngân Hàng Thụ Hưởng</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-2xl">
              {POPULAR_BANKS.map((bank) => {
                const isSelected = bankCode === bank.code;
                return (
                  <button
                    key={bank.code}
                    type="button"
                    onClick={() => handleSelectBank(bank.code, bank.name)}
                    className={`p-2 rounded-xl text-left text-xs transition-all flex flex-col justify-between border ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white font-bold shadow-md'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-extrabold text-amber-400">{bank.code}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-amber-400" />}
                    </div>
                    <span className="text-[11px] text-slate-400 truncate mt-1">{bank.name.split('(')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Account Number & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Account Number */}
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

            {/* Account Name */}
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

          {/* Live VietQR Preview */}
          <div className="p-4 bg-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Xem Trước Mã VietQR Tự Động</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Chính Xác Chuẩn Napas247</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
              {/* QR Image */}
              <div className="bg-white p-2 rounded-xl shadow-lg border border-slate-700 shrink-0">
                <img
                  src={sampleQrUrl}
                  alt="VietQR Sample"
                  className="w-32 h-32 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              {/* QR Info Text */}
              <div className="text-xs space-y-1.5 flex-1">
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="font-bold text-white font-mono">{bankCode} - {bankName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="font-mono font-bold text-amber-400">{accountNumber || 'Chưa nhập'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1">
                  <span className="text-slate-400">Tên chủ TK:</span>
                  <span className="font-bold text-white uppercase">{accountName || 'Chưa nhập'}</span>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  💡 Hụi Viên chỉ cần mở ứng dụng Ngân Hàng, quét mã này là hệ thống tự điền Số tiền & Nội dung đóng hụi chính xác!
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSavedSuccess}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm active:scale-98"
          >
            {isSavedSuccess ? (
              <span className="flex items-center space-x-2 text-slate-950 font-bold">
                <CheckCircle2 className="h-5 w-5 text-slate-950" />
                <span>ĐÃ LƯU THÔNG TIN THÀNH CÔNG!</span>
              </span>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-slate-950" />
                <span>LƯU TÀI KHOẢN NGÂN HÀNG & CẬP NHẬT VIETQR</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BidLimitType, CycleType, FeeType, HuiDay, TieBreakRule, User } from '../types';
import { formatVND } from '../utils/huiFinancialEngine';
import { PolicyTermsModal } from './PolicyTermsModal';
import { PlusCircle, X, ShieldAlert, Sparkles, Building2, Percent, DollarSign, Calendar, Scale, ExternalLink, ShieldCheck } from 'lucide-react';

interface CreateHuiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onCreateHuiDay: (huiDay: HuiDay) => void;
}

export const CreateHuiModal: React.FC<CreateHuiModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onCreateHuiDay,
}) => {
  const [name, setName] = useState('Hụi Tuần Xoay Vốn - 5 Tr/Kỳ');
  const [totalShares, setTotalShares] = useState(10);
  const [shareAmount, setShareAmount] = useState(5000000);
  const [cycleType, setCycleType] = useState<CycleType>('weekly');
  const [cycleDays, setCycleDays] = useState(7);
  const [agreedPolicy, setAgreedPolicy] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  
  // Fee configuration
  const [feeType, setFeeType] = useState<FeeType>('percent_value');
  const [feeValue, setFeeValue] = useState(2.0); // 2% of V
  
  // Bid limit range
  const [minBidType, setMinBidType] = useState<BidLimitType>('amount');
  const [minBidValue, setMinBidValue] = useState(100000);
  const [maxBidType, setMaxBidType] = useState<BidLimitType>('percent');
  const [maxBidValue, setMaxBidValue] = useState(30.0); // max 30%
  
  // Tie break rule
  const [tieBreakRule, setTieBreakRule] = useState<TieBreakRule>('earliest');
  
  // Feature Toggles Controlled By Host (Chủ Hụi)
  const [allowP2pLending, setAllowP2pLending] = useState(true);
  const [allowMaturityVault, setAllowMaturityVault] = useState(true);

  // Bank details for VietQR
  const [bankName, setBankName] = useState(currentUser.bankName || 'MB Bank');
  const [bankCode, setBankCode] = useState('MB');
  const [accountNumber, setAccountNumber] = useState(currentUser.accountNumber || '0908123456888');
  const [accountName, setAccountName] = useState(currentUser.accountName || currentUser.name.toUpperCase());
  const [description, setDescription] = useState('Dây hụi uy tín, mở thăm công khai, chốt gạch nợ qua VietQR tự động.');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inviteCode = `HUI${Math.floor(1000 + Math.random() * 9000)}`;
    const newHuiDay: HuiDay = {
      id: `day_${Date.now()}`,
      name,
      hostId: currentUser.id,
      hostName: currentUser.name,
      hostPhone: currentUser.phone,
      totalShares: Number(totalShares),
      shareAmount: Number(shareAmount),
      cycleType,
      cycleDays: Number(cycleDays),
      feeType,
      feeValue: Number(feeValue),
      minBidType,
      minBidValue: Number(minBidValue),
      maxBidType,
      maxBidValue: Number(maxBidValue),
      tieBreakRule,
      startDate: new Date().toISOString().split('T')[0],
      currentRound: 1,
      status: 'recruiting',
      inviteCode,
      bankConfig: {
        bankName,
        bankCode,
        accountNumber,
        accountName,
      },
      description,
      createdAt: new Date().toISOString(),
      allowP2pLending,
      allowMaturityVault,
    };

    onCreateHuiDay(newHuiDay);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative my-8 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <PlusCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Khởi Tạo Dây Hụi Mới</h3>
            <p className="text-xs text-slate-400">Cấu hình linh hoạt các tham số động: Phí Thảo, Trần/Sàn nộp thăm & Xử lý hòa giá</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
              <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span>Toàn Quyền Cấu Hình Dành Cho Chủ Hụi</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Chủ hụi tự do đặt mức tiền chơi (từ vài trăm ngàn đến hàng chục triệu) và tự chọn chu kỳ mở hụi (Hụi ngày, Hụi tuần, Hụi 10 ngày, Hụi nửa tháng, Hụi 1 tháng hoặc Số ngày tùy chọn theo ý muốn).
              </p>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Calendar className="h-4 w-4" />
              <span>1. Thông Tin & Chu Kỳ Mở Hụi Tự Chọn</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Dây Hụi</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="VD: Hụi 10 Ngày Phát Tài, Hụi Tuần Lộc Phát..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Số Phần Hụi (N)</label>
                <input
                  type="number"
                  min={3}
                  max={100}
                  value={totalShares}
                  onChange={(e) => setTotalShares(Number(e.target.value))}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-sm font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mức Chơi / Giá Trị Kỳ Đóng Chuẩn (V)</label>
                <div className="space-y-2">
                  <input
                    type="number"
                    step={50000}
                    min={50000}
                    value={shareAmount}
                    onChange={(e) => setShareAmount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500 text-sm font-mono"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[500000, 1000000, 2000000, 3000000, 5000000, 10000000, 20000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setShareAmount(amt)}
                        className={`px-2 py-1 rounded text-[11px] font-mono font-bold transition-all ${
                          shareAmount === amt
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {formatVND(amt)}
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block font-semibold">{formatVND(shareAmount)} / phần / kỳ</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Loại Chu Kỳ Mở Hụi</label>
                <select
                  value={cycleType}
                  onChange={(e) => {
                    const newType = e.target.value as CycleType;
                    setCycleType(newType);
                    if (newType === 'daily') setCycleDays(1);
                    else if (newType === 'weekly') setCycleDays(7);
                    else if (newType === 'ten_days') setCycleDays(10);
                    else if (newType === 'half_month') setCycleDays(15);
                    else if (newType === 'monthly') setCycleDays(30);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-500 text-sm"
                >
                  <option value="daily">Hụi Ngày (1 ngày / kỳ)</option>
                  <option value="weekly">Hụi Tuần (7 ngày / kỳ)</option>
                  <option value="ten_days">Hụi 10 Ngày (10 ngày / kỳ)</option>
                  <option value="half_month">Hụi Nửa Tháng (15 ngày / kỳ)</option>
                  <option value="monthly">Hụi 1 Tháng (30 ngày / kỳ)</option>
                  <option value="custom">Hụi Tùy Chỉnh (Tự nhập số ngày tùy ý...)</option>
                </select>
              </div>

              {cycleType === 'custom' ? (
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">Số Ngày Định Kỳ (Tự Đặt)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={cycleDays}
                    onChange={(e) => setCycleDays(Number(e.target.value))}
                    required
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3.5 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400 text-sm font-mono"
                  />
                  <span className="text-[10px] text-amber-400/80 mt-1 block">Chốt hụi & thu tiền mỗi {cycleDays} ngày/lần</span>
                </div>
              ) : (
                <div className="flex items-center pt-5 text-xs text-slate-400 font-mono">
                  <span>Thời gian chốt hụi: <strong className="text-white">{cycleDays} ngày/kỳ</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Cấu hình Phí Thảo */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
              <Percent className="h-4 w-4" />
              <span>2. Cấu Hình Phí Thảo (Hoa Hồng Chủ Hụi)</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Loại Phí Thảo</label>
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as FeeType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs"
                >
                  <option value="percent_value">% Trên giá trị V ({formatVND(shareAmount)})</option>
                  <option value="percent_payout">% Trên tổng tiền thu gom thực tế</option>
                  <option value="fixed_amount">Số tiền cố định (VNĐ / Kỳ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Giá Trị Phí Thảo</label>
                <input
                  type="number"
                  step={feeType === 'fixed_amount' ? 50000 : 0.5}
                  value={feeValue}
                  onChange={(e) => setFeeValue(Number(e.target.value))}
                  required
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-emerald-400 font-bold text-xs font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  {feeType === 'fixed_amount'
                    ? `${formatVND(feeValue)} / kỳ`
                    : `${feeValue}% (${formatVND((shareAmount * feeValue) / 100)} / phần)`}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Cấu hình Đấu Hụi (Trần / Sàn & Hòa Giá) */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
              <Scale className="h-4 w-4" />
              <span>3. Cấu Hình Khung Giá Đấu Hụi & Quy Tắc Hòa Giá</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sàn nộp thăm */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Mức Đấu Tối Thiểu (Sàn Bid)</label>
                <div className="flex space-x-2">
                  <select
                    value={minBidType}
                    onChange={(e) => setMinBidType(e.target.value as BidLimitType)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 text-xs text-slate-300"
                  >
                    <option value="amount">VNĐ</option>
                    <option value="percent">% V</option>
                  </select>
                  <input
                    type="number"
                    value={minBidValue}
                    onChange={(e) => setMinBidValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Trần nộp thăm */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">Mức Đấu Tối Đa (Trần Bid)</label>
                  <span className="text-[10px] text-amber-400 flex items-center"><ShieldAlert className="h-3 w-3 mr-0.5" /> Tránh giật hụi</span>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={maxBidType}
                    onChange={(e) => setMaxBidType(e.target.value as BidLimitType)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2 text-xs text-slate-300"
                  >
                    <option value="percent">% V</option>
                    <option value="amount">VNĐ</option>
                  </select>
                  <input
                    type="number"
                    value={maxBidValue}
                    onChange={(e) => setMaxBidValue(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-amber-400 font-bold font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Trần tối đa: {maxBidType === 'percent' ? `${maxBidValue}% V (${formatVND((shareAmount * maxBidValue) / 100)})` : formatVND(maxBidValue)}
                </span>
              </div>
            </div>

            {/* Quy tắc hòa giá */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-2">Quy Tắc Xử Lý Khi Hòa Giá Đấu Hụi</label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center space-x-2 transition-all ${
                  tieBreakRule === 'earliest' ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="tieBreak"
                    checked={tieBreakRule === 'earliest'}
                    onChange={() => setTieBreakRule('earliest')}
                    className="hidden"
                  />
                  <span>1. Ưu tiên nộp thăm sớm hơn</span>
                </label>

                <label className={`p-2.5 rounded-xl border text-xs cursor-pointer flex items-center space-x-2 transition-all ${
                  tieBreakRule === 'random' ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input
                    type="radio"
                    name="tieBreak"
                    checked={tieBreakRule === 'random'}
                    onChange={() => setTieBreakRule('random')}
                    className="hidden"
                  />
                  <span>2. Bốc thăm ngẫu nhiên tự động</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3.5: Cấu Hình Đóng/Mở Chức Năng Tài Chính Do Chủ Hụi Quản Lý */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80 bg-slate-950/60 p-3.5 rounded-2xl border border-amber-500/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Quyền Đóng / Mở Chức Năng Cho Vay & Góp Tích Lũy</span>
              </span>
              <span className="text-[10px] text-amber-300 font-normal">Do Chủ Hụi quyết định</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Toggle 1: P2P Lending */}
              <div 
                onClick={() => setAllowP2pLending(!allowP2pLending)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  allowP2pLending 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-extrabold flex items-center space-x-1">
                    <span>Hũ Tích Lũy</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Cho phép hội viên tích lũy / vay vốn xoay vòng</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                  allowP2pLending ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500/30 text-rose-300'
                }`}>
                  {allowP2pLending ? 'MỞ' : 'ĐÓNG'}
                </span>
              </div>

              {/* Toggle 2: Maturity Vault (Góp Tích Lũy) */}
              <div 
                onClick={() => setAllowMaturityVault(!allowMaturityVault)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  allowMaturityVault 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-extrabold flex items-center space-x-1">
                    <span>Hũ Tích Lũy Mãn Hạn (Góp)</span>
                  </div>
                  <div className="text-[10px] text-slate-400">Tích lũy góp tiền định kỳ khóa vốn</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase shrink-0 ${
                  allowMaturityVault ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500/30 text-rose-300'
                }`}>
                  {allowMaturityVault ? 'MỞ' : 'ĐÓNG'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Tài khoản nhận tiền VietQR */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
              <Building2 className="h-4 w-4" />
              <span>4. Tài Khoản Chủ Hụi Tạo Mã VietQR Động</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ngân Hàng (Mã)</label>
                <input
                  type="text"
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value.toUpperCase())}
                  placeholder="MB, VCB, TCB, ACB"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Số Tài Khoản</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Chủ Tài Khoản</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase text-xs"
                />
              </div>
            </div>
          </div>

          {/* Policy & Host Responsibility Commitment */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedPolicy}
                onChange={(e) => setAgreedPolicy(e.target.checked)}
                required
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
              />
              <span className="text-[11px] text-slate-300 leading-tight">
                Tôi xác nhận làm Chủ Hụi và cam kết thực hiện đúng nghĩa vụ quản lý dây hụi, giao tiền hốt hụi đúng hạn theo{' '}
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(true)}
                  className="text-amber-400 underline hover:text-amber-300 font-bold inline-flex items-center space-x-0.5"
                >
                  <span>Quy định Pháp lý & Nghị định 19/2019/NĐ-CP</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!agreedPolicy}
            className={`w-full font-bold py-3.5 px-4 rounded-xl shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98 ${
              agreedPolicy
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            }`}
          >
            <Sparkles className="h-5 w-5" />
            <span>Xác Nhận Tạo Dây Hụi & Sinh Mã Mời</span>
          </button>

        </form>

        {/* Policy Terms Modal */}
        <PolicyTermsModal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
          onAgree={() => setAgreedPolicy(true)}
        />

      </div>
    </div>
  );
};

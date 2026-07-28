import React, { useState } from 'react';
import { P2PLoan, MaturityVault, User, HuiDay } from '../types';
import { ElectronicContractModal, ContractActionContext } from './ElectronicContractModal';
import { 
  X, 
  HandCoins, 
  Vault, 
  TrendingUp, 
  ShieldCheck, 
  Lock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Coins, 
  QrCode, 
  Sparkles,
  ArrowRight,
  Landmark,
  FileText,
  Clock,
  UserCheck,
  Building2,
  Percent
} from 'lucide-react';

interface ExtendedFinancialServicesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  huiDays: HuiDay[];
  p2pLoans: P2PLoan[];
  maturityVaults: MaturityVault[];
  activeHuiDay?: HuiDay;
  onToggleHuiFeature?: (huiDayId: string, feature: 'p2p' | 'vault', enabled: boolean) => void;
  onCreateP2PLoan: (loan: Omit<P2PLoan, 'id' | 'createdAt' | 'status'>) => void;
  onFundP2PLoan: (loanId: string) => void;
  onRepayP2PLoan: (loanId: string) => void;
  onCreateMaturityVault: (vault: Omit<MaturityVault, 'id' | 'completedCycles' | 'status' | 'startDate' | 'deposits'>) => void;
  onDepositVaultCycle: (vaultId: string, amount: number) => void;
  onWithdrawMaturityVault: (vaultId: string) => void;
}

export const ExtendedFinancialServicesModal: React.FC<ExtendedFinancialServicesModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  huiDays,
  p2pLoans,
  maturityVaults,
  activeHuiDay,
  onToggleHuiFeature,
  onCreateP2PLoan,
  onFundP2PLoan,
  onRepayP2PLoan,
  onCreateMaturityVault,
  onDepositVaultCycle,
  onWithdrawMaturityVault,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'p2p_lending' | 'maturity_vault'>('maturity_vault');
  const [showCreateLoanForm, setShowCreateLoanForm] = useState(false);
  const [showCreateVaultForm, setShowCreateVaultForm] = useState(false);

  // Contract Modal Trigger State
  const [pendingContract, setPendingContract] = useState<{
    context: ContractActionContext;
    onConfirm: () => void;
  } | null>(null);

  // New Loan Form State
  const [loanAmount, setLoanAmount] = useState(2000000);
  const [loanInterest, setLoanInterest] = useState(12); // 12%/năm
  const [loanTerm, setLoanTerm] = useState(3); // 3 tháng
  const [loanPurpose, setLoanPurpose] = useState('Xoay tiền đóng hụi sống kỳ này');
  const [loanCollateral, setLoanCollateral] = useState('Thế chấp 1 Suất Hụi Dây T3 (Trị giá 5M)');

  // New Vault Form State
  const [selectedHuiDayId, setSelectedHuiDayId] = useState(huiDays[0]?.id || '');
  const [vaultName, setVaultName] = useState('Hũ Tích Lũy Mãn Hạn Dây Hụi');
  const [targetCycles, setTargetCycles] = useState(12);
  const [amountPerCycle, setAmountPerCycle] = useState(1000000);
  const [bonusRate, setBonusRate] = useState(8.5); // 8.5%/năm

  // Filter User Vaults & P2P Loans
  const myVaults = maturityVaults.filter(v => v.userId === currentUser.id);
  const openP2PLoans = p2pLoans.filter(l => l.status === 'open');
  const myP2PLoans = p2pLoans.filter(l => l.borrowerId === currentUser.id || l.lenderId === currentUser.id);

  // Submit Create P2P Loan (Triggers Contract)
  const handleCreateLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPendingContract({
      context: {
        title: 'HỢP ĐỒNG ĐIỆN TỬ ĐĂNG YÊU CẦU TẠO HŨ TÍCH LŨY',
        actionType: 'p2p_borrow',
        partnerName: 'Công Ty FinTech & Quỹ Tín Dụng Hũ Tích Lũy (Bên Thứ Ba)',
        summaryText: `Đăng khoản vay ${loanAmount.toLocaleString('vi-VN')} đ (${loanTerm} tháng, Lãi ${loanInterest}%/năm) - Tài sản đảm bảo: ${loanCollateral}`,
        amount: loanAmount,
      },
      onConfirm: () => {
        onCreateP2PLoan({
          borrowerId: currentUser.id,
          borrowerName: currentUser.name,
          borrowerAvatar: currentUser.avatar,
          amount: loanAmount,
          interestRateYearly: loanInterest,
          termMonths: loanTerm,
          purpose: loanPurpose,
          collateralNote: loanCollateral,
        });
        setShowCreateLoanForm(false);
      }
    });
  };

  // Submit Create Vault (Triggers Contract)
  const handleCreateVaultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedHui = huiDays.find(h => h.id === selectedHuiDayId);
    const totalEst = amountPerCycle * targetCycles;

    setPendingContract({
      context: {
        title: 'HỢP ĐỒNG ĐIỆN TỬ KHÓA VỐN TÍCH LŨY MÃN HẠN HỤI',
        actionType: 'vault_create',
        partnerName: 'Liên Minh Quỹ Tín Dụng & Ngân Hàng Tích Lũy Lộc Phát (Bên Thứ Ba)',
        summaryText: `Khởi tạo Hũ Tích Lũy '${vaultName}' - Cam kết đóng đủ ${targetCycles} kỳ x ${amountPerCycle.toLocaleString('vi-VN')} đ/kỳ. Rút tiền khi hoàn thành mãn hạn!`,
        amount: totalEst,
      },
      onConfirm: () => {
        const now = new Date();
        const matDate = new Date();
        matDate.setMonth(now.getMonth() + targetCycles);

        onCreateMaturityVault({
          userId: currentUser.id,
          userName: currentUser.name,
          huiDayId: selectedHuiDayId,
          huiDayName: matchedHui?.name || 'Hũ Tiết Kiệm Độc Lập',
          vaultName: vaultName,
          targetCycles: targetCycles,
          amountPerCycle: amountPerCycle,
          bonusInterestRate: bonusRate,
          maturityDate: matDate.toISOString(),
        });
        setShowCreateVaultForm(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl p-5 sm:p-8 shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto text-slate-100 space-y-6">
        
        {/* Glow ambient background effects */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-20"
        >
          <X className="h-6 w-6" />
        </button>

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-emerald-500 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-500/20">
              <Landmark className="h-7 w-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
                  TÀI CHÍNH MỞ RỘNG 4.0
                </span>
                <span className="text-xs text-slate-400 font-mono">Bảo mật & Tín nhiệm Hụi</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
                DỊCH VỤ TÀI CHÍNH & TÍCH LŨY MÃN HẠN
              </h2>
            </div>
          </div>
        </div>

        {/* HOST CONTROL PANEL FOR FINANCIAL SERVICES */}
        {currentUser.role === 'chu_hui' && (
          <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/40 space-y-3 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  QUYỀN CHỦ HỤI — ĐÓNG / MỜ CÁC DỊCH VỤ TÀI CHÍNH
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {activeHuiDay ? `Dây Hụi: ${activeHuiDay.name}` : 'Tất cả dây hụi'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Toggle P2P */}
              <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                activeHuiDay?.allowP2pLending !== false 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <div>
                  <span className="font-extrabold block text-white">1. Hũ Tích Lũy xoay vòng</span>
                  <span className="text-[10px] text-slate-400">Trạng thái: {activeHuiDay?.allowP2pLending !== false ? '🟢 Đang Mở' : '🔴 Đã Đóng'}</span>
                </div>
                {onToggleHuiFeature && activeHuiDay && (
                  <button
                    onClick={() => onToggleHuiFeature(activeHuiDay.id, 'p2p', activeHuiDay.allowP2pLending === false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black shadow transition-all shrink-0 ${
                      activeHuiDay.allowP2pLending !== false ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    }`}
                  >
                    {activeHuiDay.allowP2pLending !== false ? 'TẠM ĐÓNG' : 'MỞ MẠNG'}
                  </button>
                )}
              </div>

              {/* Toggle Vault */}
              <div className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                activeHuiDay?.allowMaturityVault !== false 
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                <div>
                  <span className="font-extrabold block text-white">2. Góp Hũ Tích Lũy Mãn Hạn</span>
                  <span className="text-[10px] text-slate-400">Trạng thái: {activeHuiDay?.allowMaturityVault !== false ? '🟢 Đang Mở' : '🔴 Đã Đóng'}</span>
                </div>
                {onToggleHuiFeature && activeHuiDay && (
                  <button
                    onClick={() => onToggleHuiFeature(activeHuiDay.id, 'vault', activeHuiDay.allowMaturityVault === false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black shadow transition-all shrink-0 ${
                      activeHuiDay.allowMaturityVault !== false ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                    }`}
                  >
                    {activeHuiDay.allowMaturityVault !== false ? 'TẠM ĐÓNG' : 'MỞ MẠNG'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION TABS */}
        <div className="flex items-center space-x-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('maturity_vault')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all ${
              activeTab === 'maturity_vault'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-102'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Vault className="h-5 w-5" />
            <span>HŨ GÓP HỤI MÃN HẠN (KHÓA ĐÚNG KỲ)</span>
            <span className="bg-slate-950/30 text-[10px] px-2 py-0.5 rounded-full text-slate-950 font-black">
              {myVaults.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('p2p_lending')}
            className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center space-x-2 transition-all ${
              activeTab === 'p2p_lending'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-102'
                : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <HandCoins className="h-5 w-5" />
            <span>HŨ TÍCH LŨY</span>
            <span className="bg-slate-950/30 text-[10px] px-2 py-0.5 rounded-full text-slate-950 font-black">
              {openP2PLoans.length}
            </span>
          </button>
        </div>

        {/* TAB 1: MATURITY VAULT (HŨ GÓP HỤI MÃN HẠN) */}
        {activeTab === 'maturity_vault' && (
          <div className="space-y-6">
            
            {/* Banner Rules Notice */}
            <div className="p-4 sm:p-5 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-start space-x-3.5 shadow-lg">
              <ShieldCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-slate-200">
                <h4 className="font-extrabold text-emerald-400 text-base uppercase">
                  QUY TẮC KHÓA VỐN: GÓP HỤI ĐÚNG KỲ MỚI NHẬN TIỀN RÚT MÃN HẠN
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Mỗi kỳ đến hạn, hội viên cần nộp số tiền cố định vào <strong>Hũ Tích Lũy</strong>. Số tiền tích lũy và khoản lãi thưởng (<strong className="text-emerald-300">8.5%/năm</strong>) sẽ <strong>hoàn toàn bị khóa</strong> cho đến khi hoàn thành đủ tổng số kỳ mục tiêu hoặc đến ngày mãn hạn hụi!
                </p>
              </div>
            </div>

            {/* Closed Notice for Maturity Vault if disabled by host */}
            {activeHuiDay?.allowMaturityVault === false && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-rose-300">
                <Lock className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-extrabold text-rose-200 uppercase">
                    CHỨC NĂNG GÓP HŨ TÍCH LŨY ĐANG TẠM ĐÓNG BỞI CHỦ HỤI
                  </h4>
                  <p className="text-rose-300/90">
                    Chủ Hụi đã tạm đóng việc đăng ký hũ tích lũy mới cho dây hụi này. Các hũ tiết kiệm đã tạo trước đó vẫn tiếp tục duy trì nộp tiền bình thường.
                  </p>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <Coins className="h-5 w-5 text-emerald-400" />
                <span>Danh Sách Hũ Tiết Kiệm Mãn Hạn Của Bạn ({myVaults.length})</span>
              </h3>

              {activeHuiDay?.allowMaturityVault === false ? (
                <button
                  disabled
                  className="px-4 py-2.5 bg-slate-800 text-slate-500 font-extrabold text-xs rounded-xl flex items-center space-x-2 cursor-not-allowed border border-slate-700/60"
                >
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Chủ Hụi Đã Tạm Đóng</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateVaultForm(!showCreateVaultForm)}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-transform active:scale-95"
                >
                  <Plus className="h-4 w-4 text-slate-950" />
                  <span>Mở Hũ Tích Lũy Mới</span>
                </button>
              )}
            </div>

            {/* FORM: CREATE MATURITY VAULT */}
            {showCreateVaultForm && (
              <form onSubmit={handleCreateVaultSubmit} className="p-5 bg-slate-950 border border-emerald-500/40 rounded-3xl space-y-4 shadow-xl animate-fade-in">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h4 className="font-extrabold text-emerald-400 text-sm flex items-center space-x-2 uppercase">
                    <Vault className="h-4 w-4" />
                    <span>Thiết Lập Hũ Tích Lũy Mãn Hạn Mới</span>
                  </h4>
                  <button type="button" onClick={() => setShowCreateVaultForm(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Gắn Với Dây Hụi (Tùy Chọn):</label>
                    <select
                      value={selectedHuiDayId}
                      onChange={(e) => {
                        setSelectedHuiDayId(e.target.value);
                        const matched = huiDays.find(h => h.id === e.target.value);
                        if (matched) {
                          setVaultName(`Hũ Tích Lũy Mãn Hạn - ${matched.name}`);
                          setTargetCycles(matched.totalShares);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">-- Hũ Tiết Kiệm Tự Do (Không Gắn Dây) --</option>
                      {huiDays.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.name} - ({h.totalShares} kỳ x {h.shareAmount.toLocaleString('vi-VN')}đ)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Tên Hũ Tích Lũy:</label>
                    <input
                      type="text"
                      value={vaultName}
                      onChange={(e) => setVaultName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Số Tiền Tích Lũy Mỗi Kỳ (VNĐ):</label>
                    <input
                      type="number"
                      step={100000}
                      min={100000}
                      value={amountPerCycle}
                      onChange={(e) => setAmountPerCycle(Number(e.target.value))}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Tổng Số Kỳ Tích Lũy (Số Tháng):</label>
                    <input
                      type="number"
                      min={3}
                      max={60}
                      value={targetCycles}
                      onChange={(e) => setTargetCycles(Number(e.target.value))}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Estimate Preview */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Tổng Vốn Tích Lũy Dự Kiến: </span>
                    <strong className="text-white">{(amountPerCycle * targetCycles).toLocaleString('vi-VN')} đ</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Lãi Thưởng Mãn Hạn (+{bonusRate}%/năm): </span>
                    <strong className="text-emerald-400">
                      +{Math.round((amountPerCycle * targetCycles * bonusRate * (targetCycles / 12)) / 100).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2"
                >
                  <Vault className="h-4 w-4" />
                  <span>XÁC NHẬN MỞ HŨ TÍCH LŨY MÃN HẠN</span>
                </button>
              </form>
            )}

            {/* VAULTS LIST */}
            {myVaults.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 border border-slate-800 rounded-3xl space-y-3">
                <Vault className="h-12 w-12 mx-auto text-slate-600" />
                <p className="text-slate-300 font-bold text-sm">Bạn chưa có Hũ Tích Lũy Mãn Hạn nào.</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Tạo hũ tích lũy ngay để khóa kỷ luật đóng hụi hàng kỳ và nhận khoản tiền mãn hạn lớn kèm lãi thưởng hấp dẫn!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myVaults.map((vault) => {
                  const percentComplete = Math.round((vault.completedCycles / vault.targetCycles) * 100);
                  const totalAccumulated = vault.completedCycles * vault.amountPerCycle;
                  const estimatedInterest = Math.round(
                    (totalAccumulated * vault.bonusInterestRate * (vault.completedCycles / 12)) / 100
                  );
                  const isMatured = vault.completedCycles >= vault.targetCycles || vault.status === 'matured';

                  return (
                    <div
                      key={vault.id}
                      className={`p-5 rounded-3xl border transition-all space-y-4 relative overflow-hidden ${
                        isMatured
                          ? 'bg-gradient-to-br from-emerald-950 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-emerald-400 font-extrabold uppercase tracking-wider block">
                            {vault.huiDayName || 'Hũ Tiết Kiệm Độc Lập'}
                          </span>
                          <h4 className="font-extrabold text-base text-white">{vault.vaultName}</h4>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          isMatured
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}>
                          {isMatured ? '🎉 ĐÃ MÃN HẠN (RÚT TIỀN)' : `ĐANG TÍCH LŨY (${vault.completedCycles}/${vault.targetCycles} KỲ)`}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-400">Tiến độ nộp hụi đúng kỳ:</span>
                          <strong className="text-emerald-400 font-extrabold">{percentComplete}% ({vault.completedCycles}/{vault.targetCycles} kỳ)</strong>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 border border-slate-800">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(percentComplete, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Metrics Breakdown */}
                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tiền Góp Mỗi Kỳ:</span>
                          <strong className="text-slate-200 text-sm">{vault.amountPerCycle.toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Tổng Tích Lũy Khóa:</span>
                          <strong className="text-emerald-400 text-sm font-extrabold">{totalAccumulated.toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Lãi Thưởng Mãn Hạn:</span>
                          <strong className="text-amber-400 text-xs">+{estimatedInterest.toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Ngày Mãn Hạn Expected:</span>
                          <span className="text-slate-300 text-xs font-sans font-bold">
                            {new Date(vault.maturityDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-1">
                        {vault.status === 'withdrawn' ? (
                          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 text-xs font-bold flex items-center justify-center space-x-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <span>Đã Rút Tiền Mãn Hạn Thành Công</span>
                          </div>
                        ) : isMatured ? (
                          <button
                            onClick={() => {
                              const totalVal = totalAccumulated + estimatedInterest;
                              setPendingContract({
                                context: {
                                  title: 'HỢP ĐỒNG GIẢI NGÂN VỐN MÃN HẠN TÍCH LŨY',
                                  actionType: 'vault_withdraw',
                                  partnerName: 'Ngân Hàng & Đơn Vị Tín Dụng Bảo An Giải Ngân (Bên Thứ Ba)',
                                  summaryText: `Tất toán & rút toàn bộ vốn tích lũy kèm lãi thưởng của ${vault.vaultName}`,
                                  amount: totalVal,
                                },
                                onConfirm: () => onWithdrawMaturityVault(vault.id)
                              });
                            }}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-transform active:scale-95"
                          >
                            <Sparkles className="h-4 w-4 text-slate-950" />
                            <span>RÚT TỔNG TIỀN MÃN HẠN + LÃI THƯỞNG ({ (totalAccumulated + estimatedInterest).toLocaleString('vi-VN') } đ)</span>
                          </button>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setPendingContract({
                                  context: {
                                    title: 'HỢP ĐỒNG TÍCH LŨY KỲ HỤI MÃN HẠN',
                                    actionType: 'vault_deposit',
                                    partnerName: 'Quỹ Tín Dụng & Ngân Hàng Tích Lũy Lộc Phát (Bên Thứ Ba)',
                                    summaryText: `Nộp tiền tích lũy kỳ ${vault.completedCycles + 1} cho ${vault.vaultName}`,
                                    amount: vault.amountPerCycle,
                                  },
                                  onConfirm: () => onDepositVaultCycle(vault.id, vault.amountPerCycle)
                                });
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center space-x-2 transition-transform active:scale-95"
                            >
                              <Plus className="h-4 w-4" />
                              <span>NỘP TIỀN ĐÚNG KỲ {vault.completedCycles + 1} ({vault.amountPerCycle.toLocaleString('vi-VN')} đ)</span>
                            </button>

                            <div className="p-2 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center space-x-2">
                              <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                              <span>Tiền khóa an toàn cho đến khi nộp đủ {vault.targetCycles} kỳ.</span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: P2P LENDING (CHO VAY NGANG HÀNG) */}
        {activeTab === 'p2p_lending' && (
          <div className="space-y-6">

            {/* Banner Notice */}
            <div className="p-4 sm:p-5 bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-start space-x-3.5 shadow-lg">
              <HandCoins className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs sm:text-sm text-slate-200">
                <h4 className="font-extrabold text-amber-400 text-base uppercase">
                  SÀN VAY VỐN & HŨ TÍCH LŨY HỤI
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Cho phép các hội viên vay vốn xoay vòng hoặc đóng hụi bằng cách <strong>thế chấp Suất Hụi</strong> hoặc uy tín trên sàn. Người cho vay nhận lãi suất hấp dẫn trực tiếp từ bên vay mà không qua trung gian ngân hàng.
                </p>
              </div>
            </div>

            {/* Closed Notice for P2P Lending if disabled by host */}
            {activeHuiDay?.allowP2pLending === false && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start space-x-3 text-rose-300">
                <Lock className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <h4 className="font-extrabold text-rose-200 uppercase">
                    CHỨC NĂNG HŨ TÍCH LŨY ĐANG TẠM ĐÓNG BỞI CHỦ HỤI
                  </h4>
                  <p className="text-rose-300/90">
                    Chủ Hụi đã tạm đóng chức năng đăng yêu cầu vay mới cho dây hụi này. Các khoản vay đã khớp trước đó vẫn tiếp tục thực hiện theo hợp đồng.
                  </p>
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center space-x-2">
                <FileText className="h-5 w-5 text-amber-400" />
                <span>Yêu Cầu Vay Đang Chờ Tài Trợ ({openP2PLoans.length})</span>
              </h3>

              {activeHuiDay?.allowP2pLending === false ? (
                <button
                  disabled
                  className="px-4 py-2.5 bg-slate-800 text-slate-500 font-extrabold text-xs rounded-xl flex items-center space-x-2 cursor-not-allowed border border-slate-700/60"
                >
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Chủ Hụi Đã Tạm Đóng</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateLoanForm(!showCreateLoanForm)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center space-x-2 transition-transform active:scale-95"
                >
                  <Plus className="h-4 w-4 text-slate-950" />
                  <span>Tạo Yêu Cầu Hũ Tích Lũy Mới</span>
                </button>
              )}
            </div>

            {/* FORM: CREATE P2P LOAN */}
            {showCreateLoanForm && (
              <form onSubmit={handleCreateLoanSubmit} className="p-5 bg-slate-950 border border-amber-500/40 rounded-3xl space-y-4 shadow-xl animate-fade-in">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h4 className="font-extrabold text-amber-400 text-sm flex items-center space-x-2 uppercase">
                    <HandCoins className="h-4 w-4" />
                    <span>Đăng Yêu Cầu Vốn Hũ Tích Lũy</span>
                  </h4>
                  <button type="button" onClick={() => setShowCreateLoanForm(false)} className="text-slate-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Số Tiền Muốn Vay (VNĐ):</label>
                    <input
                      type="number"
                      step={500000}
                      min={500000}
                      max={50000000}
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-extrabold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold flex justify-between">
                      <span>Lãi Suất Đề Xuất (%/Năm):</span>
                      <span className="text-amber-400 font-extrabold text-[10px]">Tối đa ≤ 20%/năm</span>
                    </label>
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={20}
                      value={loanInterest}
                      onChange={(e) => setLoanInterest(Math.min(20, Math.max(1, Number(e.target.value))))}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Thời Hạn Vay (Tháng):</label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-bold">Tài Sản / Uy Tín Thế Chấp:</label>
                    <input
                      type="text"
                      value={loanCollateral}
                      onChange={(e) => setLoanCollateral(e.target.value)}
                      placeholder="VD: Thế chấp suất hụi sống dây T3"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-400 mb-1 font-bold">Mục Đích Vay Vốn:</label>
                    <input
                      type="text"
                      value={loanPurpose}
                      onChange={(e) => setLoanPurpose(e.target.value)}
                      placeholder="Mục đích sử dụng khoản vay"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Interest Calculation Estimate */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-400">Tiền Lãi Dự Kiến ({loanTerm} tháng): </span>
                    <strong className="text-amber-400">
                      +{Math.round((loanAmount * loanInterest * (loanTerm / 12)) / 100).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Tổng Hoàn Trả: </span>
                    <strong className="text-white">
                      {Math.round(loanAmount + (loanAmount * loanInterest * (loanTerm / 12)) / 100).toLocaleString('vi-VN')} đ
                    </strong>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2"
                >
                  <HandCoins className="h-4 w-4" />
                  <span>XÁC NHẬN ĐĂNG KHOẢN HŨ TÍCH LŨY</span>
                </button>
              </form>
            )}

            {/* OPEN P2P LOANS LIST */}
            {p2pLoans.length === 0 ? (
              <div className="text-center py-12 bg-slate-950/60 border border-slate-800 rounded-3xl space-y-3">
                <HandCoins className="h-12 w-12 mx-auto text-slate-600" />
                <p className="text-slate-300 font-bold text-sm">Chưa có khoản hũ tích lũy nào trên hệ thống.</p>
                <p className="text-slate-500 text-xs max-w-md mx-auto">
                  Hãy đăng đơn vay đầu tiên nếu bạn cần xoay vốn nhanh hoặc tài trợ cho hội viên khác để kiếm lãi suất!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {p2pLoans.map((loan) => {
                  const interestAmount = Math.round((loan.amount * loanInterest * (loan.termMonths / 12)) / 100);
                  const isBorrower = loan.borrowerId === currentUser.id;
                  const isLender = loan.lenderId === currentUser.id;

                  return (
                    <div
                      key={loan.id}
                      className={`p-5 rounded-3xl border transition-all space-y-4 relative ${
                        loan.status === 'open'
                          ? 'bg-slate-950 border-amber-500/40 shadow-xl'
                          : loan.status === 'funded'
                          ? 'bg-slate-950 border-emerald-500/40'
                          : 'bg-slate-950 border-slate-800 opacity-80'
                      }`}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-extrabold text-amber-400 text-sm font-mono">
                            {loan.borrowerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-white block">{loan.borrowerName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Đăng lúc {new Date(loan.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          loan.status === 'open'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : loan.status === 'funded'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {loan.status === 'open' ? '⏳ ĐANG CHỜ TÀI TRỢ' : loan.status === 'funded' ? '✅ ĐÃ CẤP VỐN (ĐANG VAY)' : '🏁 ĐÃ HOÀN TẤT'}
                        </span>
                      </div>

                      {/* Financial Details Grid */}
                      <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-mono">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Số Tiền Vay:</span>
                          <strong className="text-amber-400 text-base font-extrabold">{loan.amount.toLocaleString('vi-VN')} đ</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Lãi Suất:</span>
                          <strong className="text-emerald-400 text-sm">{loan.interestRateYearly}%/năm ({loan.termMonths} tháng)</strong>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px]">Thế Chấp:</span>
                          <span className="text-slate-200 text-xs font-sans font-bold">{loan.collateralNote}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-400 block text-[10px]">Mục Đích:</span>
                          <span className="text-slate-300 text-xs font-sans">{loan.purpose}</span>
                        </div>
                      </div>

                      {/* Action Controls */}
                      <div>
                        {loan.status === 'open' && (
                          isBorrower ? (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl text-center text-xs font-bold">
                              Đơn vay của bạn đang niêm yết chờ hội viên tài trợ vốn.
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setPendingContract({
                                  context: {
                                    title: 'HỢP ĐỒNG ĐIỆN TỬ CẤP VỐN TÀI TRỢ HŨ TÍCH LŨY',
                                    actionType: 'p2p_fund',
                                    partnerName: 'Tập Đoàn FinTech & Trung Tâm Báo Cáo Tín Dụng Tín Nhiệm (Bên Thứ Ba)',
                                    summaryText: `Cấp vốn tài trợ ${loan.amount.toLocaleString('vi-VN')} đ cho khoản vay của ${loan.borrowerName} (Lãi suất ${loan.interestRateYearly}%/năm)`,
                                    amount: loan.amount,
                                  },
                                  onConfirm: () => onFundP2PLoan(loan.id)
                                });
                              }}
                              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-transform active:scale-95"
                            >
                              <HandCoins className="h-4 w-4" />
                              <span>CẤP VỐN TÀI TRỢ KHOẢN VAY NÀY ({loan.amount.toLocaleString('vi-VN')} đ)</span>
                            </button>
                          )
                        )}

                        {loan.status === 'funded' && (
                          <div className="space-y-2">
                            <div className="p-2 bg-slate-900 rounded-xl text-xs text-slate-300 flex items-center justify-between font-mono">
                              <span>Người cho vay: <strong>{loan.lenderName || 'Hội viên'}</strong></span>
                              <span className="text-emerald-400 font-bold">Đã nhận tiền</span>
                            </div>

                            {isBorrower && (
                              <button
                                onClick={() => onRepayP2PLoan(loan.id)}
                                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center space-x-2"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>HOÀN TRẢ KHOẢN HŨ TÍCH LŨY (GỐC + LÃI)</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </div>

      {/* ELECTRONIC CONTRACT MODAL GATE */}
      {pendingContract && (
        <ElectronicContractModal
          isOpen={!!pendingContract}
          onClose={() => setPendingContract(null)}
          onAccept={() => {
            if (pendingContract) {
              pendingContract.onConfirm();
              setPendingContract(null);
            }
          }}
          currentUser={currentUser}
          context={pendingContract.context}
        />
      )}
    </div>
  );
};

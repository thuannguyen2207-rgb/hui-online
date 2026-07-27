import React, { useState } from 'react';
import { Bid, ChatMessage, HuiDay, HuiMember, HuiRound, Transaction, User } from '../types';
import { calculateRoundPayout, formatVND, validateBidAmount } from '../utils/huiFinancialEngine';
import { MemberFinancialToolbar } from './MemberFinancialToolbar';
import { 
  Coins, 
  Scale, 
  QrCode, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Share2, 
  Copy, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  MessageSquare, 
  Info, 
  Wallet, 
  TrendingUp, 
  UserCheck, 
  UserX,
  History,
  Lock,
  ArrowRight,
  Plus
} from 'lucide-react';

interface MemberDashboardViewProps {
  huiDay: HuiDay;
  currentUser: User;
  members: HuiMember[];
  rounds: HuiRound[];
  bids: Bid[];
  transactions: Transaction[];
  chatMessages: ChatMessage[];
  onOpenVietQR: (tx: Transaction) => void;
  onSubmitBid: (amount: number) => void;
  onSendMessage: (msg: string) => void;
  onJoinByCode?: (code: string) => void;
  onOpenExploreModal?: () => void;
  onOpenBankConfigModal?: () => void;
  onOpenRegisterBankModal?: (targetMember?: HuiMember) => void;
}

export const MemberDashboardView: React.FC<MemberDashboardViewProps> = ({
  huiDay,
  currentUser,
  members,
  rounds,
  bids,
  transactions,
  chatMessages,
  onOpenVietQR,
  onSubmitBid,
  onSendMessage,
  onJoinByCode,
  onOpenExploreModal,
  onOpenBankConfigModal,
  onOpenRegisterBankModal,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'my_status' | 'bid_portal' | 'public_ledger' | 'chat'>('my_status');
  const [bidAmountInput, setBidAmountInput] = useState<number>(huiDay.shareAmount * 0.15); // ~15% default
  const [chatInput, setChatInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Find Current User's Member Record
  const myMemberRecord = members.find(m => m.userId === currentUser.id);

  // Active / Current Round
  const currentRoundObj = rounds.find(r => r.roundNumber === huiDay.currentRound) || rounds[rounds.length - 1];

  // Current user's transaction for this round
  const myCurrentTx = transactions.find(t => t.userId === currentUser.id && t.roundId === `round_bt_${huiDay.currentRound}`);

  // Current user's bid for this round
  const myCurrentBid = bids.find(b => b.userId === currentUser.id && b.roundId === `round_bt_${huiDay.currentRound}`);

  // Calculate Member Financial History across rounds
  const myTotalContributed = transactions
    .filter(t => t.userId === currentUser.id && t.status === 'confirmed')
    .reduce((sum, t) => sum + t.amountDue, 0);

  const myPayoutRound = rounds.find(r => r.winnerUserId === currentUser.id);
  const myTotalReceived = myPayoutRound ? myPayoutRound.winnerNetPayout : 0;

  // Validate Bid
  const bidValidation = validateBidAmount(bidAmountInput, huiDay);

  // Calculate potential payout if I win this round with current bid input
  const liveCount = members.filter(m => !m.hasPayout).length;
  const deadCount = members.filter(m => m.hasPayout).length;
  const potentialPayout = calculateRoundPayout(
    huiDay.shareAmount,
    bidAmountInput,
    huiDay.totalShares,
    huiDay.currentRound,
    members,
    huiDay.feeType,
    huiDay.feeValue
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://hui.app/join/${huiDay.inviteCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div className="space-y-6">
      
      {/* MEMBER PERSONALIZED HERO BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-blue-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Wallet className="h-32 w-32 text-blue-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center space-x-1">
                <UserCheck className="h-3.5 w-3.5" />
                <span>CỔNG THÔNG TIN HỘI VIÊN (MEMBER PORTAL)</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Dây: {huiDay.name}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Xin chào, <span className="text-blue-400">{currentUser.name}</span>!
            </h2>

            <p className="text-xs text-slate-300 max-w-xl">
              Góc nhìn cá nhân hội viên: Theo dõi số tiền đóng hàng kỳ, đấu thăm bí mật và lấy mã VietQR nộp tiền nhanh chóng.
            </p>
          </div>

          {/* Quick Financial Badge & Explore Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onOpenExploreModal && (
              <button
                onClick={onOpenExploreModal}
                className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
              >
                <Coins className="h-4 w-4" />
                <span>Khám Phá / Xin Tham Gia Dây Hụi Mới</span>
              </button>
            )}

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Trạng Thái Trong Dây Này</span>
                {myMemberRecord?.status === 'pending' ? (
                  <span className="text-xs font-extrabold text-amber-400 flex items-center space-x-1 animate-pulse">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Đang Chờ Chủ Hụi Duyệt</span>
                  </span>
                ) : myMemberRecord?.hasPayout ? (
                  <span className="text-xs font-extrabold text-rose-400 flex items-center space-x-1">
                    <UserX className="h-3.5 w-3.5" />
                    <span>Hụi Chết (Kỳ {myMemberRecord.payoutRound})</span>
                  </span>
                ) : (
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center space-x-1">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Hụi Sống ({myMemberRecord?.sharesCount || 1} phần)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* MEMBER SUB-NAVIGATION TABS */}
        <div className="flex items-center space-x-2 border-t border-slate-800/80 pt-4 mt-6 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('my_status')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'my_status'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Wallet className="h-4 w-4" />
            <span>Nghĩa Vụ Kỳ Này & VietQR</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bid_portal')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'bid_portal'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Nộp Thăm Bí Mật</span>
            {myCurrentBid && <span className="w-2 h-2 rounded-full bg-emerald-400"></span>}
          </button>

          <button
            onClick={() => setActiveSubTab('public_ledger')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'public_ledger'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>Sổ Hụi Công Khai Toàn Nhóm</span>
          </button>

          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeSubTab === 'chat'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Nhóm Chat Trao Đổi</span>
          </button>
        </div>

      </div>

      {/* FINANCIAL TOOLBAR SLIDER (THANH CÔNG CỤ KÉO QUA LẠI BÁO SỐ PHẦN, LÃI/ÂM) */}
      <MemberFinancialToolbar
        huiDay={huiDay}
        currentUser={currentUser}
        members={members}
        rounds={rounds}
        transactions={transactions}
        onOpenVietQR={onOpenVietQR}
      />

      {/* SUB-TAB 1: NGHĨA VỤ KỲ NÀY & THANH TOÁN VIETQR */}
      {activeSubTab === 'my_status' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Action Card: Current Round Payment Due */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Tiền Đóng Hụi Kỳ {huiDay.currentRound} Của Bạn</h3>
              </div>
              <span className="text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Hạn đóng: 3 ngày sau mở thăm
              </span>
            </div>

            {myCurrentTx ? (
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Số Tiền Kỳ Này Bạn Cần Đóng</span>
                    <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
                      {formatVND(myCurrentTx.amountDue)}
                    </span>
                  </div>

                  <div>
                    {myCurrentTx.status === 'confirmed' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Chủ Hụi Đã Duyệt Nhận Tiền</span>
                      </span>
                    ) : myCurrentTx.status === 'pending_approval' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center space-x-1.5">
                        <Clock className="h-4 w-4 animate-spin" />
                        <span>Đang Chờ Chủ Hụi Duyệt Gạch Nợ</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center space-x-1.5">
                        <AlertCircle className="h-4 w-4" />
                        <span>Chưa Thanh Toán</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Loại hình phần hụi:</span>
                    <span className="text-white font-bold">
                      {myCurrentTx.isDeadHui ? 'Hụi Chết (Đã hốt → Đóng đủ 100% V)' : 'Hụi Sống (Chưa hốt → Đóng V - T)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Nội dung chuyển khoản VietQR:</span>
                    <span className="text-amber-300 font-mono font-bold">{myCurrentTx.paymentRef}</span>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="pt-2">
                  <button
                    onClick={() => onOpenVietQR(myCurrentTx)}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all text-sm"
                  >
                    <QrCode className="h-5 w-5" />
                    <span>Mở Mã VietQR Để Chuyển Khoản Nhanh</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                <Clock className="h-8 w-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Chưa Tạo Lệnh Đóng Cho Kỳ {huiDay.currentRound}</h4>
                <p className="text-xs text-slate-400">
                  Lệnh đóng tiền sẽ tự động kích hoạt sau khi Chủ Hụi công bố người trúng thăm hốt hụi kỳ này.
                </p>
              </div>
            )}

            {/* Past Personal Payments Ledger */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <History className="h-4 w-4 text-amber-400" />
                <span>Lịch Sử Đóng Tiền Các Kỳ Trước Của Bạn</span>
              </h4>

              <div className="space-y-2">
                {transactions
                  .filter(t => t.userId === currentUser.id)
                  .map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">Kỳ đóng {tx.roundId.replace('round_bt_', '')}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{tx.paymentRef}</span>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-amber-400 font-mono block">
                          {formatVND(tx.amountDue)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {tx.status === 'confirmed' ? 'Đã gạch nợ' : 'Đang xử lý'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>

          {/* Financial Summary Breakdown Side Card */}
          <div className="lg:col-span-5 space-y-5">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span>Tổng Kết Tài Chính Cá Nhân</span>
              </h3>

              <div className="space-y-3 text-xs">
                
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Tổng tiền đã tích lũy đóng:</span>
                  <span className="font-bold text-amber-400 font-mono text-sm">{formatVND(myTotalContributed)}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Tổng tiền đã hốt về:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{formatVND(myTotalReceived)}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Số phần hụi đang sở hữu:</span>
                  <span className="font-bold text-white font-mono">{myMemberRecord?.sharesCount || 1} phần</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Giá trị kỳ hụi đóng chuẩn (V):</span>
                  <span className="font-bold text-white font-mono">{formatVND(huiDay.shareAmount)}</span>
                </div>

              </div>
            </div>

            {/* Bank Info of Host */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>Tài Khoản Nhận Tiền Của Chủ Hụi</span>
                </h4>
                {(currentUser.role === 'chu_hui' || currentUser.id === huiDay.hostId) && onOpenBankConfigModal && (
                  <button
                    onClick={onOpenBankConfigModal}
                    className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded-lg border border-amber-500/30 flex items-center space-x-1 transition-all"
                  >
                    <QrCode className="h-3 w-3" />
                    <span>Sửa VietQR</span>
                  </button>
                )}
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ngân hàng:</span>
                  <span className="text-white font-bold">{huiDay.bankConfig.bankCode} ({huiDay.bankConfig.bankName})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tài khoản:</span>
                  <span className="text-amber-300 font-mono font-bold">{huiDay.bankConfig.accountNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chủ tài khoản:</span>
                  <span className="text-white font-bold uppercase">{huiDay.bankConfig.accountName}</span>
                </div>
              </div>
            </div>

            {/* Member's Own Registered Bank Account for Payout */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Wallet className="h-4 w-4 text-emerald-400" />
                  <span>Tài Khoản Nhận Tiền Hốt Hụi Của Bạn</span>
                </h4>
                {onOpenRegisterBankModal && (
                  <button
                    onClick={() => onOpenRegisterBankModal(myMemberRecord)}
                    className="text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center space-x-1 transition-all"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{myMemberRecord?.bankConfig || myMemberRecord?.pendingBankConfig ? 'Đổi/Cập Nhật' : 'Đăng Ký Mới'}</span>
                  </button>
                )}
              </div>

              {/* Status Display */}
              {myMemberRecord?.bankConfig ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Đã được Chủ Hụi phê duyệt</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Chỉ Chủ Hụi nhìn thấy</span>
                  </div>
                  <div className="pt-2 border-t border-slate-900 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ngân hàng:</span>
                      <span className="text-white font-bold">{myMemberRecord.bankConfig.bankCode} ({myMemberRecord.bankConfig.bankName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <span className="text-emerald-400 font-mono font-bold">{myMemberRecord.bankConfig.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tên chủ tài khoản:</span>
                      <span className="text-white font-bold uppercase">{myMemberRecord.bankConfig.accountName}</span>
                    </div>
                  </div>
                </div>
              ) : myMemberRecord?.pendingBankConfig ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-bold flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5 animate-spin" />
                      <span>Đang chờ Chủ Hụi phê duyệt</span>
                    </span>
                    <span className="text-[10px] text-amber-300">Đã gửi yêu cầu</span>
                  </div>
                  <div className="pt-2 border-t border-slate-900 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ngân hàng yêu cầu:</span>
                      <span className="text-white font-bold">{myMemberRecord.pendingBankConfig.bankCode} ({myMemberRecord.pendingBankConfig.bankName})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số tài khoản:</span>
                      <span className="text-amber-300 font-mono font-bold">{myMemberRecord.pendingBankConfig.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tên chủ tài khoản:</span>
                      <span className="text-white font-bold uppercase">{myMemberRecord.pendingBankConfig.accountName}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 text-xs space-y-2 text-center">
                  <p className="text-amber-300 font-bold">
                    Bạn chưa đăng ký tài khoản ngân hàng để nhận tiền hốt hụi!
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    🔒 Vì lý do an toàn & quyền riêng tư, thông tin này chỉ duy nhất <strong>Chủ Hụi</strong> nhìn thấy để bắn VietQR hốt hụi khi bạn trúng thăm.
                  </p>
                  {onOpenRegisterBankModal && (
                    <button
                      onClick={() => onOpenRegisterBankModal(myMemberRecord)}
                      className="mt-2 w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Đăng Ký Tài Khoản Nhận Tiền Ngay</span>
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* SUB-TAB 2: PHÒNG NỘP THĂM BÍ MẬT CỦA HỘI VIÊN */}
      {activeSubTab === 'bid_portal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Member Bidding Form */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Cổng Nộp Thăm Bí Mật - Kỳ {huiDay.currentRound}</h3>
              </div>
              <span className="text-xs text-emerald-400 flex items-center space-x-1">
                <Lock className="h-3.5 w-3.5" />
                <span>Bảo Mật 100%</span>
              </span>
            </div>

            {myMemberRecord?.hasPayout ? (
              <div className="p-6 bg-slate-950 rounded-2xl border border-rose-500/30 text-center space-y-2">
                <AlertCircle className="h-10 w-10 text-rose-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Bạn Là Hụi Chết (Đã Hốt Kỳ {myMemberRecord.payoutRound})</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Theo quy định tài chính hụi, hội viên đã hốt hụi ở các kỳ trước không được tham gia bỏ thăm nộp giá ở các kỳ sau.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Status notice */}
                {myCurrentBid ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold text-white block">Bạn đã nộp thăm thành công!</span>
                        <span className="text-slate-300">Mức thăm bí mật của bạn: <strong className="text-amber-400 font-mono">{formatVND(myCurrentBid.bidAmount)}</strong></span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400">Có thể cập nhật lại giá</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300">
                    Nhập số tiền thăm ($T$) bạn chấp nhận nộp cho các hội viên chưa hốt để được nhận trọn hụi kỳ này.
                  </p>
                )}

                {/* Calculation Simulator for Member */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                    ⚡ Dự Tính Tiền Bạn Sẽ Nhận Về (R) Nếu Trúng Thăm
                  </span>
                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs text-slate-400">Số tiền hốt thực nhận (R):</span>
                    <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                      {formatVND(potentialPayout.netPayoutR)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Đã bao gồm tiền thu từ {potentialPayout.totalDeadShares} phần hụi chết + {potentialPayout.totalLiveShares} phần hụi sống, trừ phí thảo {formatVND(potentialPayout.calculatedFee)}.
                  </p>
                </div>

                {/* Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (bidValidation.isValid) {
                      onSubmitBid(bidAmountInput);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mức Tiền Nộp Thăm ($T$)
                    </label>
                    <input
                      type="number"
                      step={50000}
                      value={bidAmountInput}
                      onChange={(e) => setBidAmountInput(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-extrabold text-xl font-mono focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-xs text-slate-400 mt-1 block font-mono">
                      {formatVND(bidAmountInput)} ({((bidAmountInput / huiDay.shareAmount) * 100).toFixed(1)}% giá trị V)
                    </span>

                    {!bidValidation.isValid && (
                      <p className="text-xs text-rose-400 mt-1 flex items-center space-x-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{bidValidation.message}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!bidValidation.isValid}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 text-sm"
                  >
                    <Send className="h-4 w-4" />
                    <span>{myCurrentBid ? 'Cập Nhật Mức Thăm Bí Mật' : 'Nộp Thăm Bí Mật Ngay'}</span>
                  </button>
                </form>

              </div>
            )}
          </div>

          {/* Rules and Guidance Side Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-slate-800 pb-2 flex items-center space-x-1.5">
                <Info className="h-4 w-4 text-amber-400" />
                <span>Quy Định Nộp Thăm Kỳ {huiDay.currentRound}</span>
              </h4>

              <div className="space-y-2 text-slate-300">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-amber-400 font-bold block mb-0.5">Khung nộp thăm hợp lệ:</span>
                  <span>Tối thiểu <strong className="text-white">{formatVND(huiDay.minBidValue)}</strong> đến tối đa <strong className="text-white">{formatVND((huiDay.shareAmount * huiDay.maxBidValue) / 100)}</strong></span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-emerald-400 font-bold block mb-0.5">Xử lý khi hòa giá:</span>
                  <span>{huiDay.tieBreakRule === 'earliest' ? 'Ưu tiên người nộp thăm sớm hơn' : 'Bốc thăm ngẫu nhiên tự động'}</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-blue-400 font-bold block mb-0.5">Thời gian mở chốt:</span>
                  <span>Chủ Hụi sẽ công bố kết quả mở thăm công khai cho toàn thể nhóm hụi.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: SỔ HỤI CÔNG KHAI TOÀN NHÓM */}
      {activeSubTab === 'public_ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <span>Sổ Công Khai Tình Hình Đóng Hụi Kỳ {huiDay.currentRound}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Minh bạch cho tất cả hội viên: Xem ai đã hoàn tất đóng tiền kỳ này.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.map((m) => {
              const tx = transactions.find(t => t.memberId === m.id && t.roundId === `round_bt_${huiDay.currentRound}`);
              return (
                <div
                  key={m.id}
                  className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <img
                      src={m.userAvatar}
                      alt={m.userName}
                      className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-800"
                    />
                    <div>
                      <span className="font-bold text-xs text-white block">{m.userName}</span>
                      <span className={`text-[10px] font-bold ${m.hasPayout ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {m.hasPayout ? 'Hụi Chết' : 'Hụi Sống'}
                      </span>
                    </div>
                  </div>

                  <div>
                    {tx?.status === 'confirmed' ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Đã Đóng
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        Chờ Đóng
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: NHÓM CHAT */}
      {activeSubTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[500px]">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-white text-sm">Nhóm Chat Trao Đổi Hụi Viên</span>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/60">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.senderRole === 'system'
                    ? 'items-center my-2'
                    : msg.senderId === currentUser.id
                    ? 'items-end'
                    : 'items-start'
                }`}
              >
                {msg.senderRole === 'system' ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-4 py-1.5 rounded-full text-center max-w-md">
                    {msg.message}
                  </div>
                ) : (
                  <div className={`max-w-md rounded-2xl p-3 shadow-md ${
                    msg.senderId === currentUser.id
                      ? 'bg-amber-500 text-slate-950 rounded-br-none'
                      : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                  }`}>
                    <div className="flex items-center justify-between text-[10px] mb-1 opacity-80">
                      <span className="font-bold">{msg.senderName} ({msg.senderRole === 'chu_hui' ? 'Chủ Hụi' : 'Hụi Viên'})</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs font-medium">{msg.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

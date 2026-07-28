import React, { useState } from 'react';
import { Bid, ChatMessage, HuiDay, HuiMember, HuiRound, Transaction, User, UserRole } from '../types';
import { calculateMemberStates, calculateRoundPayout, formatVND, validateBidAmount } from '../utils/huiFinancialEngine';
import { MemberFinancialToolbar } from './MemberFinancialToolbar';
import { 
  Users, 
  Coins, 
  Scale, 
  Percent, 
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
  DollarSign, 
  ArrowRight,
  TrendingUp,
  Building2,
  ListFilter,
  Lock,
  CreditCard,
  Wallet,
  XCircle,
  Plus,
  Flame,
  Landmark
} from 'lucide-react';

interface HuiDetailViewProps {
  huiDay: HuiDay;
  currentUser: User;
  members: HuiMember[];
  rounds: HuiRound[];
  bids: Bid[];
  transactions: Transaction[];
  chatMessages: ChatMessage[];
  onOpenVietQR: (tx: Transaction) => void;
  onSubmitBid: (amount: number) => void;
  onFinalizeRound: (winningBidAmount: number, winnerMemberId: string) => void;
  onApproveTransaction: (txId: string) => void;
  onSendMessage: (msg: string) => void;
  onApproveMember?: (memberId: string) => void;
  onRejectMember?: (memberId: string) => void;
  onOpenBankConfigModal?: () => void;
  onOpenRegisterBankModal?: (targetMember?: HuiMember) => void;
  onOpenLiveBiddingModal?: () => void;
  onOpenExtendedServicesModal?: () => void;
  onApproveMemberBank?: (memberId: string) => void;
  onRejectMemberBank?: (memberId: string) => void;
  onToggleHuiFeature?: (huiDayId: string, feature: 'p2p' | 'vault', enabled: boolean) => void;
}

export const HuiDetailView: React.FC<HuiDetailViewProps> = ({
  huiDay,
  currentUser,
  members,
  rounds,
  bids,
  transactions,
  chatMessages,
  onOpenVietQR,
  onSubmitBid,
  onFinalizeRound,
  onApproveTransaction,
  onSendMessage,
  onApproveMember,
  onRejectMember,
  onOpenBankConfigModal,
  onOpenRegisterBankModal,
  onOpenLiveBiddingModal,
  onOpenExtendedServicesModal,
  onApproveMemberBank,
  onRejectMemberBank,
  onToggleHuiFeature,
}) => {
  if (!currentUser || !huiDay) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <span>Đang tải thông tin hụi...</span>
      </div>
    );
  }
  const [activeTab, setActiveTab] = useState<'ledger' | 'bidding' | 'chat' | 'config' | 'members'>('ledger');
  const [bidAmountInput, setBidAmountInput] = useState<number>(huiDay.shareAmount * 0.2); // Default ~20%
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => m.status === 'approved');

  // Active or Current Round
  const currentRoundObj = rounds.find(r => r.roundNumber === huiDay.currentRound) || rounds[rounds.length - 1];

  // Active Member in this Hui Day
  const currentMember = members.find(m => m.userId === currentUser.id);

  // Calculate live states
  const memberStates = calculateMemberStates(huiDay.totalShares, huiDay.currentRound, members);

  // Validate Bid Input
  const bidValidation = validateBidAmount(bidAmountInput, huiDay);

  const handleCopyInviteLink = () => {
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
      
      {/* HEADER HERO CARD - HOST ADMIN STYLING */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Host Admin Top Banner Badge */}
        <div className="mb-4 pb-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="bg-emerald-500/20 text-emerald-400 font-extrabold text-xs px-2.5 py-1 rounded-lg border border-emerald-500/40 flex items-center space-x-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>BẢNG ĐIỀU HÀNH CHỦ HỤI (HOST ADMIN)</span>
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">Quản lý gạch nợ VietQR, duyệt hồ sơ & chốt hụi</span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Gạch Nợ Chờ Duyệt: {transactions.filter(t => t.status === 'pending_approval').length}
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Hồ Sơ Chờ Duyệt: {pendingMembers.length}
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          {/* Title & Key Stats */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                huiDay.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                ● {huiDay.status === 'active' ? 'Đang Hoạt Động' : 'Đang Tuyển Hội Viên'}
              </span>

              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700/60 font-mono">
                Mã: {huiDay.inviteCode}
              </span>

              <span className="bg-amber-500/10 text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/20">
                Kỳ {huiDay.currentRound} / {huiDay.totalShares}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{huiDay.name}</h2>
            <p className="text-xs text-slate-400 max-w-2xl">{huiDay.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs pt-1">
              <div className="flex items-center space-x-1.5 text-slate-300">
                <Coins className="h-4 w-4 text-amber-400" />
                <span>Giá trị kỳ: <strong className="text-amber-400 font-mono">{formatVND(huiDay.shareAmount)}</strong> / phần</span>
              </div>

              <div className="flex items-center space-x-1.5 text-slate-300">
                <Users className="h-4 w-4 text-blue-400" />
                <span>Tổng: <strong className="text-white">{huiDay.totalShares} phần</strong> ({memberStates.totalLiveShares} Hụi Sống / {memberStates.totalDeadShares} Hụi Chết)</span>
              </div>

              <div className="flex items-center space-x-1.5 text-slate-300">
                <Percent className="h-4 w-4 text-emerald-400" />
                <span>Phí Thảo: <strong className="text-emerald-400">
                  {huiDay.feeType === 'fixed_amount' 
                    ? formatVND(huiDay.feeValue) 
                    : `${huiDay.feeValue}% (${formatVND((huiDay.shareAmount * huiDay.feeValue) / 100)})`}
                </strong></span>
              </div>
            </div>
          </div>

          {/* Quick Share Invite Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between space-y-3 min-w-[280px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center">
                <Share2 className="h-3.5 w-3.5 text-amber-400 mr-1.5" />
                <span>Link Mời Hội Viên</span>
              </span>
              <span className="text-[10px] text-emerald-400">Deep Link Auto</span>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={`https://hui.app/join/${huiDay.inviteCode}`}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-[11px] text-amber-300 font-mono truncate"
              />
              <button
                onClick={handleCopyInviteLink}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-xs transition-all flex items-center shrink-0"
              >
                {copiedLink ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

        </div>

        {/* NAVIGATION SUB-TABS */}
        <div className="flex items-center space-x-2 border-t border-slate-800/80 pt-4 mt-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'ledger'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Coins className="h-4 w-4" />
            <span>Sổ Hụi Realtime & Gạch Nợ ({transactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bidding')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'bidding'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Scale className="h-4 w-4" />
            <span>Phòng Đấu Hụi / Nộp Thăm ({bids.length})</span>
          </button>

          {onOpenLiveBiddingModal && (
            <button
              onClick={onOpenLiveBiddingModal}
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-slate-950 shadow-lg shadow-rose-500/20 flex items-center space-x-1.5 transition-all shrink-0 animate-pulse active:scale-95"
            >
              <Flame className="h-4 w-4 text-slate-950 fill-current" />
              <span>🔴 ĐẤU HỤI LIVE TRỰC TUYẾN</span>
            </button>
          )}

          {onOpenExtendedServicesModal && (
            <button
              onClick={onOpenExtendedServicesModal}
              className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 shadow-md flex items-center space-x-1.5 transition-all shrink-0 active:scale-95"
            >
              <Landmark className="h-4 w-4 text-emerald-400" />
              <span>🏦 DỊCH VỤ HŨ TÍCH LŨY</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'chat'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Nhóm Chat & Thông Báo ({chatMessages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'members'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Duyệt Hội Viên Xin Gia Nhập</span>
            {pendingMembers.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse">
                {pendingMembers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shrink-0 ${
              activeTab === 'config'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Info className="h-4 w-4" />
            <span>Tham Số Cấu Hình Dây Hụi</span>
          </button>
        </div>

      </div>

      {/* MEMBER FINANCIAL TOOLBAR SLIDER */}
      <MemberFinancialToolbar
        huiDay={huiDay}
        currentUser={currentUser}
        members={members}
        rounds={rounds}
        transactions={transactions}
        onOpenVietQR={onOpenVietQR}
      />

      {/* TAB 1: SỔ HỤI REALTIME & GẠCH NỢ */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          
          {/* Summary Financial Banner */}
          {currentRoundObj && currentRoundObj.winningBidAmount && (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wide">
                    <Award className="h-4 w-4" />
                    <span>Kết Quả Kỳ {currentRoundObj.roundNumber} - Trúng Nộp Thăm {formatVND(currentRoundObj.winningBidAmount)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Người Hốt: <span className="text-amber-400">{currentRoundObj.winnerUserName}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hụi Chết đóng: <strong className="text-white">{formatVND(currentRoundObj.deadContributionPerShare)}</strong> | 
                    Hụi Sống đóng: <strong className="text-amber-300">{formatVND(currentRoundObj.liveContributionPerShare)}</strong>
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Số Tiền Thực Nhận (R)</span>
                  <span className="text-2xl font-extrabold text-emerald-400 font-mono">
                    {formatVND(currentRoundObj.winnerNetPayout)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sổ Gạch Nợ Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-amber-400" />
                  <span>Sổ Gạch Nợ Tiền Đóng Hụi - Kỳ {huiDay.currentRound}</span>
                </h3>
                <p className="text-xs text-slate-400">Theo dõi trạng thái: [Chưa đóng], [Chờ duyệt], [Đã xác nhận]</p>
              </div>

              {currentUser.role === 'chu_hui' && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-amber-400 font-medium">Quyền Chủ Hụi:</span>
                  <button
                    onClick={() => {
                      if (bids.length > 0) {
                        const topBid = [...bids].sort((a, b) => b.bidAmount - a.bidAmount)[0];
                        onFinalizeRound(topBid.bidAmount, topBid.memberId);
                      } else {
                        alert('Chưa có thành viên nào bỏ thăm nộp giá kỳ này!');
                      }
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Chốt Kỳ & Chạy Thuật Toán R</span>
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">Hội Viên</th>
                    <th className="p-3.5">Phần Hụi</th>
                    <th className="p-3.5">Trạng Thái Hụi</th>
                    <th className="p-3.5">Mức Đóng Kỳ Này</th>
                    <th className="p-3.5">Cú Pháp VietQR</th>
                    <th className="p-3.5">Trạng Thái Đóng</th>
                    <th className="p-3.5 pr-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => {
                    const member = members.find(m => m.id === tx.memberId);
                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        
                        {/* Member Info */}
                        <td className="p-3.5 pl-5 font-medium text-white flex items-center space-x-2.5">
                          <img
                            src={member?.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={tx.userName}
                            className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-700"
                          />
                          <div>
                            <span className="font-bold block text-slate-100">{tx.userName}</span>
                            <span className="text-[10px] text-slate-400">{member?.userPhone}</span>
                          </div>
                        </td>

                        {/* Shares Count */}
                        <td className="p-3.5 font-mono text-amber-400 font-bold">
                          {tx.sharesCount} phần
                        </td>

                        {/* Hụi Sống / Hụi Chết */}
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            tx.isDeadHui 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {tx.isDeadHui ? 'Hụi Chết (V)' : 'Hụi Sống (V - T)'}
                          </span>
                        </td>

                        {/* Amount Due */}
                        <td className="p-3.5 font-extrabold font-mono text-sm text-white">
                          {formatVND(tx.amountDue)}
                        </td>

                        {/* Payment Ref Code */}
                        <td className="p-3.5 font-mono text-[11px] text-amber-300">
                          {tx.paymentRef}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          {tx.status === 'confirmed' ? (
                            <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[11px] font-bold border border-emerald-500/20">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Đã Xác Nhận</span>
                            </span>
                          ) : tx.status === 'pending_approval' ? (
                            <span className="inline-flex items-center space-x-1 text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded text-[11px] font-bold border border-amber-500/20">
                              <Clock className="h-3.5 w-3.5 animate-spin" />
                              <span>Chờ Duyệt Tiền</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700">
                              <AlertCircle className="h-3.5 w-3.5" />
                              <span>Chưa Đóng</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 pr-5 text-right space-x-2">
                          <button
                            onClick={() => onOpenVietQR(tx)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg text-xs font-semibold transition-all inline-flex items-center space-x-1"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>VietQR</span>
                          </button>

                          {currentUser.role === 'chu_hui' && tx.status === 'pending_approval' && (
                            <button
                              onClick={() => onApproveTransaction(tx.id)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded-lg text-xs font-bold shadow transition-all"
                            >
                              Duyệt Tiền
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PHÒNG ĐẤU HỤI / NỘP THĂM REALTIME */}
      {activeTab === 'bidding' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bidding Form for Member */}
          <div className="lg:col-col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm border-b border-slate-800 pb-3">
              <Scale className="h-5 w-5" />
              <span>Phòng Bỏ Thăm - Kỳ {huiDay.currentRound}</span>
            </div>

            <p className="text-xs text-slate-400">
              Chỉ hụi viên chưa hốt (Hụi Sống) mới được nộp thăm. Giá nộp thăm bí mật cho đến khi mở chốt.
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Khung Nộp Thăm Được Phép:</span>
                <span className="text-amber-400 font-bold">
                  {formatVND(bidValidation.minBid)} - {formatVND(bidValidation.maxBid)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Quy tắc hòa giá:</span>
                <span className="text-emerald-400 font-semibold">
                  {huiDay.tieBreakRule === 'earliest' ? '1. Ưu tiên nộp sớm hơn' : '2. Bốc thăm ngẫu nhiên'}
                </span>
              </div>
            </div>

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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mức Tiền Nộp Thăm ($T$)</label>
                <div className="relative">
                  <input
                    type="number"
                    step={50000}
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-extrabold text-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <span className="text-xs text-slate-400 mt-1 block font-mono">{formatVND(bidAmountInput)}</span>

                {!bidValidation.isValid && (
                  <p className="text-xs text-rose-400 mt-1 flex items-center space-x-1">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{bidValidation.message}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={!bidValidation.isValid}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                <span>Nộp Thăm Bí Mật</span>
              </button>
            </form>
          </div>

          {/* Bids List & Winner Controls */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <span>Danh Sách Thăm Đã Nộp (Realtime Bids)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{bids.length} lá thăm</span>
            </div>

            {bids.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Chưa có hội viên nào nộp thăm cho kỳ {huiDay.currentRound}. Hãy là người nộp thăm đầu tiên!
              </div>
            ) : (
              <div className="space-y-3">
                {bids.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-sm font-mono border border-amber-500/20">
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="font-bold text-white text-sm block">{b.userName}</span>
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Nộp lúc {new Date(b.submittedAt).toLocaleTimeString('vi-VN')}</span>
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-extrabold text-amber-400 font-mono block">
                        {formatVND(b.bidAmount)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {idx === 0 ? 'Mức nộp cao nhất hiện tại' : 'Đang chờ chốt'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: NHÓM CHAT REALTIME & THÔNG BÁO */}
      {activeTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[520px]">
          
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-white text-sm">Nhóm Chat Dây Hụi: {huiDay.name}</span>
            </div>
            <span className="text-xs text-emerald-400 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
              Realtime WebSocket Active
            </span>
          </div>

          {/* Chat Messages Body */}
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
                  <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-4 py-1.5 rounded-full text-center max-w-md shadow-sm">
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
                    <p className="text-xs font-medium leading-relaxed">{msg.message}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Nhập tin nhắn trao đổi với các hội viên..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all shadow"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}

      {/* TAB 4: CẤU HÌNH DÂY HỤI */}
      {activeTab === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Info className="h-5 w-5 text-amber-400" />
            <span>Thông Số & Cấu Hình Động Dây Hụi</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Số Phần Hụi (N)</span>
              <span className="text-lg font-bold text-white font-mono">{huiDay.totalShares} phần</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Giá Trị Kỳ Đóng Chuẩn (V)</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono">{formatVND(huiDay.shareAmount)}</span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Phí Thảo (Chủ Hụi)</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {huiDay.feeType === 'fixed_amount' ? formatVND(huiDay.feeValue) : `${huiDay.feeValue}% V`}
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Trần / Sàn Bỏ Thăm</span>
              <span className="text-sm font-bold text-white font-mono">
                Sàn {formatVND(huiDay.minBidValue)} — Trần {huiDay.maxBidValue}% V
              </span>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Xử Lý Hòa Giá</span>
              <span className="text-sm font-bold text-amber-300">
                {huiDay.tieBreakRule === 'earliest' ? '1. Nộp sớm hơn' : '2. Bốc thăm ngẫu nhiên'}
              </span>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-xs font-bold flex items-center space-x-1.5">
                  <QrCode className="h-4 w-4 text-amber-400" />
                  <span>Tài Khoản VietQR Đóng Hụi</span>
                </span>
                {(currentUser.role === 'chu_hui' || currentUser.id === huiDay.hostId) && onOpenBankConfigModal && (
                  <button
                    onClick={onOpenBankConfigModal}
                    className="text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold px-2 py-1 rounded-lg border border-amber-500/30 flex items-center space-x-1 transition-all"
                  >
                    <span>Cấu Hình VietQR</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Thông tin tài khoản nhận tiền của Chủ Hụi được tự động tạo thành mã QR chuẩn Napas247 khi hội viên bấm thanh toán.
              </p>
            </div>
          </div>

          {/* Feature Toggles Panel for Host (Chủ Hụi) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-amber-400 flex items-center space-x-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Cấu Hình Bật / Tắt Chức Năng Tài Chính Mở Rộng</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Chủ Hụi có toàn quyền ĐÓNG hoặc MỞ dịch vụ Hũ Tích Lũy Xoay Vòng & Hũ Tích Lũy Định Kỳ cho dây hụi này.
                </p>
              </div>

              {(currentUser.role === 'chu_hui' || currentUser.id === huiDay.hostId) && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2.5 py-1 rounded-lg border border-emerald-500/40 shrink-0 self-start sm:self-center">
                  ● Quyền Hạn Chủ Hụi
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Feature 1: P2P Lending Toggle */}
              <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                huiDay.allowP2pLending !== false 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">1. Hũ Tích Lũy Xoay Vòng</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      huiDay.allowP2pLending !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {huiDay.allowP2pLending !== false ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {huiDay.allowP2pLending !== false 
                      ? 'Hội viên trong dây hụi được phép đăng bài tích lũy xoay vòng / tài trợ vốn tín nhiệm cho nhau.'
                      : 'Chức năng hũ tích lũy xoay vòng đã bị Chủ Hụi đóng. Hội viên không thể đăng yêu cầu mới.'}
                  </p>
                </div>

                {(currentUser.role === 'chu_hui' || currentUser.id === huiDay.hostId) && onToggleHuiFeature && (
                  <button
                    onClick={() => onToggleHuiFeature(huiDay.id, 'p2p', huiDay.allowP2pLending === false)}
                    className={`ml-3 px-3 py-2 rounded-xl text-xs font-black shadow-md transition-all shrink-0 ${
                      huiDay.allowP2pLending !== false 
                        ? 'bg-rose-500 hover:bg-rose-400 text-white' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {huiDay.allowP2pLending !== false ? 'TẠM ĐÓNG' : 'MỞ MẠNG'}
                  </button>
                )}
              </div>

              {/* Feature 2: Maturity Vault (Hũ Tích Lũy) Toggle */}
              <div className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                huiDay.allowMaturityVault !== false 
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/30 text-rose-400'
              }`}>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">2. Hũ Tích Lũy Định Kỳ</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      huiDay.allowMaturityVault !== false ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                      {huiDay.allowMaturityVault !== false ? 'ĐANG MỞ' : 'ĐÃ ĐÓNG'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {huiDay.allowMaturityVault !== false 
                      ? 'Hội viên được phép đăng ký hũ tích lũy định kỳ dây hụi để hưởng lãi thưởng.'
                      : 'Chức năng hũ tích lũy đã bị Chủ Hụi đóng. Hội viên không thể mở hũ tích lũy mới.'}
                  </p>
                </div>

                {(currentUser.role === 'chu_hui' || currentUser.id === huiDay.hostId) && onToggleHuiFeature && (
                  <button
                    onClick={() => onToggleHuiFeature(huiDay.id, 'vault', huiDay.allowMaturityVault === false)}
                    className={`ml-3 px-3 py-2 rounded-xl text-xs font-black shadow-md transition-all shrink-0 ${
                      huiDay.allowMaturityVault !== false 
                        ? 'bg-rose-500 hover:bg-rose-400 text-white' 
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    {huiDay.allowMaturityVault !== false ? 'TẠM ĐÓNG' : 'MỞ MẠNG'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DUYỆT HỘI VIÊN XIN GIA NHẬP */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          
          {/* Section 1: Pending Join Requests */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Danh Sách Yêu Cầu Xin Gia Nhập Đang Chờ Duyệt ({pendingMembers.length})
                </h3>
              </div>
              <span className="text-xs text-slate-400">Dành cho Chủ Hụi phê duyệt</span>
            </div>

            {pendingMembers.length === 0 ? (
              <div className="text-center py-8 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Không có yêu cầu xin gia nhập nào đang chờ duyệt.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingMembers.map((m) => (
                  <div key={m.id} className="bg-slate-950 border border-amber-500/30 rounded-xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={m.userAvatar}
                          alt={m.userName}
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-amber-500/40"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{m.userName}</h4>
                          <p className="text-xs text-slate-400">{m.userPhone}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            Gửi lúc: {new Date(m.joinedAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-extrabold rounded-lg">
                        Đăng ký: {m.sharesCount} phần
                      </span>
                    </div>

                    {/* eKYC Verification Info Badge */}
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Hồ Sơ eKYC: {m.kycStatus === 'verified' || !m.kycStatus ? 'Đã Xác Minh' : 'Đang Kiểm Tra'}</span>
                        </span>
                        <span className="font-mono text-slate-300 font-bold text-[11px]">
                          CCCD: {m.idCardNumber || '079203001888'}
                        </span>
                      </div>

                      {/* CCCD Thumbnails preview for Host */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-16 relative">
                          <img 
                            src={m.idCardFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'} 
                            alt="Mặt trước CCCD" 
                            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all cursor-pointer"
                            onClick={() => window.open(m.idCardFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80', '_blank')}
                          />
                          <span className="absolute bottom-0.5 left-1 px-1 bg-slate-950/80 text-[8px] font-bold text-slate-300 rounded">
                            Mặt Trước
                          </span>
                        </div>

                        <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-16 relative">
                          <img 
                            src={m.idCardBackUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80'} 
                            alt="Mặt sau CCCD" 
                            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-all cursor-pointer"
                            onClick={() => window.open(m.idCardBackUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80', '_blank')}
                          />
                          <span className="absolute bottom-0.5 left-1 px-1 bg-slate-950/80 text-[8px] font-bold text-slate-300 rounded">
                            Mặt Sau
                          </span>
                        </div>
                      </div>
                    </div>

                    {m.note && (
                      <div className="p-2.5 bg-slate-900 rounded-lg text-xs text-slate-300 italic border border-slate-800">
                        "{m.note}"
                      </div>
                    )}

                    {/* Host Action Buttons */}
                    <div className="flex items-center space-x-2 pt-1 border-t border-slate-900">
                      <button
                        onClick={() => onApproveMember && onApproveMember(m.id)}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Duyệt Cho Vào Dây</span>
                      </button>

                      <button
                        onClick={() => onRejectMember && onRejectMember(m.id)}
                        className="py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all"
                      >
                        Từ Chối
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 1.5: Host Approval for Member Bank Accounts */}
          {(currentUser.role === 'chu_hui' || currentUser.id === huiDay.hostId) && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">
                    Duyệt Yêu Cầu Đăng Ký / Thay Đổi TK Ngân Hàng Nhận Tiền ({approvedMembers.filter(m => m.bankApprovalStatus === 'pending' || m.pendingBankConfig).length})
                  </h3>
                </div>
                <span className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Quyền Hạn Chủ Hụi</span>
                </span>
              </div>

              {approvedMembers.filter(m => m.bankApprovalStatus === 'pending' || m.pendingBankConfig).length === 0 ? (
                <div className="text-center py-6 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                  <p className="text-xs text-slate-400">Không có yêu cầu đăng ký/thay đổi tài khoản ngân hàng nào đang chờ duyệt.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {approvedMembers.filter(m => m.bankApprovalStatus === 'pending' || m.pendingBankConfig).map((m) => {
                    const cfg = m.pendingBankConfig || m.bankConfig;
                    return (
                      <div key={`bank_req_${m.id}`} className="bg-slate-950 border border-emerald-500/40 rounded-xl p-4 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img src={m.userAvatar} alt={m.userName} className="h-9 w-9 rounded-xl object-cover" />
                            <div>
                              <h4 className="font-bold text-white text-sm">{m.userName}</h4>
                              <p className="text-xs text-slate-400">{m.userPhone}</p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded">
                            Chờ duyệt TK
                          </span>
                        </div>

                        {cfg && (
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1 font-mono">
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400 font-sans">Ngân hàng:</span>
                              <strong className="text-emerald-400">{cfg.bankCode} ({cfg.bankName})</strong>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400 font-sans">Số tài khoản:</span>
                              <strong className="text-amber-300">{cfg.accountNumber}</strong>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span className="text-slate-400 font-sans">Tên chủ TK:</span>
                              <strong className="text-white uppercase">{cfg.accountName}</strong>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-1 border-t border-slate-900">
                          <button
                            onClick={() => onApproveMemberBank && onApproveMemberBank(m.id)}
                            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-1 transition-all"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Duyệt TK Ngân Hàng</span>
                          </button>

                          <button
                            onClick={() => onOpenRegisterBankModal && onOpenRegisterBankModal(m)}
                            className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs rounded-xl transition-all"
                          >
                            Sửa TK
                          </button>

                          <button
                            onClick={() => onRejectMemberBank && onRejectMemberBank(m.id)}
                            className="py-2 px-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs rounded-xl transition-all"
                          >
                            Từ Chối
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Approved Official Members */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span>Hội Viên Chính Thức Của Dây Hụi ({approvedMembers.length} thành viên)</span>
              </h3>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Lock className="h-3.5 w-3.5 text-amber-400" />
                <span>Bảo mật TK Ngân Hàng</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {approvedMembers.map((m) => {
                const isMe = m.userId === currentUser?.id;
                const isHost = currentUser?.role === 'chu_hui' || currentUser?.id === huiDay?.hostId;
                const canSeeBank = isHost || isMe;

                return (
                  <div key={m.id} className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img src={m.userAvatar} alt={m.userName} className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-700" />
                        <div>
                          <span className="font-bold text-xs text-white block flex items-center space-x-1">
                            <span>{m.userName}</span>
                            {isMe && <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">Bạn</span>}
                          </span>
                          <span className="text-[10px] text-slate-400">{m.userPhone}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
                        {m.sharesCount} phần
                      </span>
                    </div>

                    {/* Bank Info Box (Privacy Enforced) */}
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                      {canSeeBank ? (
                        m.bankConfig ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-slate-400 block text-[10px]">TK Ngân hàng (Đã duyệt):</span>
                              <span className="font-mono font-bold text-emerald-400 block">
                                {m.bankConfig?.bankCode} - {m.bankConfig?.accountNumber}
                              </span>
                              <span className="text-[10px] text-slate-300 uppercase block font-semibold">
                                {m.bankConfig?.accountName}
                              </span>
                            </div>
                            {isHost && onOpenRegisterBankModal && (
                              <button
                                onClick={() => onOpenRegisterBankModal(m)}
                                className="text-[10px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-500/30 transition-all shrink-0"
                              >
                                Sửa TK
                              </button>
                            )}
                          </div>
                        ) : m.pendingBankConfig ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-amber-400 font-bold block text-[10px]">⏳ Chờ Chủ Hụi duyệt TK:</span>
                              <span className="font-mono text-amber-300 block">
                                {m.pendingBankConfig?.bankCode} - {m.pendingBankConfig?.accountNumber}
                              </span>
                            </div>
                            {isHost && onApproveMemberBank && (
                              <button
                                onClick={() => onApproveMemberBank(m.id)}
                                className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-1 rounded-lg shadow transition-all shrink-0"
                              >
                                Duyệt
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 italic">Chưa đăng ký TK nhận tiền</span>
                            {canSeeBank && onOpenRegisterBankModal && (
                              <button
                                onClick={() => onOpenRegisterBankModal(m)}
                                className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-lg border border-emerald-500/30 transition-all shrink-0"
                              >
                                + Đăng ký
                              </button>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="flex items-center space-x-1.5 text-slate-500 text-[10px]">
                          <Lock className="h-3 w-3 text-slate-500" />
                          <span>TK Ngân Hàng: Bảo mật (Chỉ Chủ Hụi thấy)</span>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

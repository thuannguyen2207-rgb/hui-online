import React, { useRef, useState } from 'react';
import { HuiDay, HuiMember, HuiRound, Transaction, User } from '../types';
import { calculateRoundPayout, formatVND, generateVietQRUrl } from '../utils/huiFinancialEngine';
import { 
  Coins, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  UserCheck, 
  UserX, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Info, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Layers,
  BarChart3,
  QrCode,
  CheckCircle2
} from 'lucide-react';

interface MemberFinancialToolbarProps {
  huiDay: HuiDay;
  currentUser: User;
  members: HuiMember[];
  rounds: HuiRound[];
  transactions: Transaction[];
  onOpenVietQR?: (tx: Transaction) => void;
}

export const MemberFinancialToolbar: React.FC<MemberFinancialToolbarProps> = ({
  huiDay,
  currentUser,
  members,
  rounds,
  transactions,
  onOpenVietQR,
}) => {
  if (!huiDay || !currentUser) return null;

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Interactive Slider State for Estimating Profit / Loss
  const [interactiveBid, setInteractiveBid] = useState<number>(huiDay.shareAmount * 0.15); // ~15% default

  // Safe bank config fallback
  const hostBankConfig = huiDay?.bankConfig || {
    bankCode: 'MB',
    bankName: 'MB Bank',
    accountNumber: '',
    accountName: '',
  };

  // Member record
  const myMemberRecord = members.find(m => m.userId === currentUser.id);
  const sharesCount = myMemberRecord?.sharesCount || 1;

  // Find or create current transaction for QR payment
  const myCurrentTx = transactions.find(t => t.userId === currentUser.id && t.roundId === `round_bt_${huiDay.currentRound}`) || {
    id: `tx_${Date.now()}_${currentUser.id}`,
    roundId: `round_bt_${huiDay.currentRound}`,
    huiDayId: huiDay.id,
    memberId: myMemberRecord?.id || 'm1',
    userId: currentUser.id,
    userName: currentUser.name,
    sharesCount: sharesCount,
    isDeadHui: myMemberRecord?.hasPayout || false,
    amountDue: myMemberRecord?.hasPayout 
      ? huiDay.shareAmount * sharesCount 
      : (huiDay.shareAmount - (huiDay.minBidValue || 0)) * sharesCount,
    status: 'unpaid' as const,
    vietqrCode: generateVietQRUrl(
      hostBankConfig.bankCode || 'MB',
      hostBankConfig.accountNumber || '',
      hostBankConfig.accountName || '',
      myMemberRecord?.hasPayout ? huiDay.shareAmount * sharesCount : (huiDay.shareAmount - (huiDay.minBidValue || 0)) * sharesCount,
      `DONG HUI ${huiDay.inviteCode} K${huiDay.currentRound}`
    ),
    paymentRef: `HUI${huiDay.inviteCode}K${huiDay.currentRound}`,
    createdAt: new Date().toISOString()
  };

  const handlePayClick = () => {
    if (onOpenVietQR) {
      onOpenVietQR(myCurrentTx);
    }
  };

  // Total Money Paid (Confirmed)
  const myTotalContributed = transactions
    .filter(t => t.userId === currentUser.id && t.status === 'confirmed')
    .reduce((sum, t) => sum + t.amountDue, 0);

  // Total Money Received
  const myPayoutRound = rounds.find(r => r.winnerUserId === currentUser.id);
  const myTotalReceived = myPayoutRound ? myPayoutRound.winnerNetPayout : 0;

  // Calculate past discounts accumulated by being a live member (Sum of T won by others)
  const pastRoundsWonByOthers = rounds.filter(r => r.roundNumber < huiDay.currentRound && r.winnerUserId !== currentUser.id);
  const totalDiscountSavedSoFar = pastRoundsWonByOthers.reduce((sum, r) => sum + (r.winningBidAmount || 0), 0) * sharesCount;

  // Calculate potential payout if I hốt in current round with `interactiveBid`
  const potentialPayout = calculateRoundPayout(
    huiDay.shareAmount,
    interactiveBid,
    huiDay.totalShares,
    huiDay.currentRound,
    members,
    huiDay.feeType,
    huiDay.feeValue
  );

  // Net Financial Position Calculation
  // Nominal baseline capital needed across all rounds = (N - 1) * V * sharesCount
  const totalCycleBaselineCapital = (huiDay.totalShares - 1) * huiDay.shareAmount * sharesCount;

  let netProfitOrLoss = 0;
  let isRealized = false;

  if (myMemberRecord?.hasPayout && myPayoutRound) {
    // REALIZED POSITION (Already collected)
    // Net profit/loss = Total Net Payout Received - Total Capital user will pay across entire cycle:
    // (payoutRound - 1) rounds paid as live member + (N - payoutRound) rounds paid as dead member (V)
    const totalCycleContributionForDeadMember = 
      (myPayoutRound.roundNumber - 1) * (huiDay.shareAmount - 0) + // past live payments
      (huiDay.totalShares - myPayoutRound.roundNumber) * huiDay.shareAmount; // future dead payments
    
    netProfitOrLoss = myTotalReceived - totalCycleContributionForDeadMember;
    isRealized = true;
  } else {
    // UNREALIZED EXPECTED POSITION (If collecting at current round with interactiveBid)
    // Expected Payout R + Discount saved so far - Total Baseline V
    const expectedTotalPayout = potentialPayout.netPayoutR * sharesCount;
    const totalExpectedContribution = myTotalContributed + (huiDay.totalShares - huiDay.currentRound) * huiDay.shareAmount * sharesCount;
    netProfitOrLoss = expectedTotalPayout - totalExpectedContribution;
    isRealized = false;
  }

  // Handle Horizontal Scroll
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden backdrop-blur">
      
      {/* Top Bar Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <span>Thanh Công Cụ Tài Chính Hụi Viên</span>
              <span className="text-[10px] font-semibold bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full border border-slate-700">
                Trượt / Kéo Xem Chi Tiết
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Theo dõi số phần hụi tham gia, số tiền đang lãi/âm ròng và mô phỏng tiền hốt
            </p>
          </div>
        </div>

        {/* Scroll Controls & Quick Pay Button */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePayClick}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
            title="Mở mã QR chuyển khoản đóng tiền hụi"
          >
            <QrCode className="h-4 w-4" />
            <span className="hidden sm:inline">Đóng Tiền Hụi (VietQR)</span>
            <span className="sm:hidden">VietQR</span>
          </button>

          <button
            onClick={() => handleScroll('left')}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-all"
            title="Cuộn sang trái"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-all"
            title="Cuộn sang phải"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* HORIZONTAL CAROUSEL CARDS */}
      <div 
        ref={scrollContainerRef}
        className="flex items-stretch space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 pb-2 pt-1 snap-x snap-mandatory"
      >
        
        {/* CARD 1: SỐ PHẦN HỤI THAM GIA */}
        <div className="min-w-[280px] sm:min-w-[320px] bg-slate-950 p-4 rounded-xl border border-slate-800/90 snap-start flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="h-3.5 w-3.5 text-amber-400" />
              <span>1. Số Phần Hụi Của Bạn</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-300 rounded-full border border-amber-500/20">
              Dây {huiDay.name}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">
                {sharesCount}
              </span>
              <span className="text-sm font-bold text-slate-300">Phần Hụi</span>
              <span className="text-xs text-slate-500">
                ({((sharesCount / huiDay.totalShares) * 100).toFixed(1)}% tổng dây)
              </span>
            </div>

            <div className="pt-1">
              {myMemberRecord?.hasPayout ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  <UserX className="h-3.5 w-3.5" />
                  <span>Hụi Chết (Đã hốt Kỳ {myMemberRecord.payoutRound})</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Hụi Sống (Chưa hốt — Đang đóng V - T)</span>
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900 flex justify-between">
            <span>Giá trị mỗi phần (V):</span>
            <strong className="text-white font-mono">{formatVND(huiDay.shareAmount)}</strong>
          </div>
        </div>

        {/* CARD 2: TỔNG SỐ TIỀN ĐANG LÃI HOẶC ÂM */}
        <div className="min-w-[290px] sm:min-w-[330px] bg-slate-950 p-4 rounded-xl border border-slate-800/90 snap-start flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
              <span>2. Tổng Lãi / Âm Ròng</span>
            </span>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
              netProfitOrLoss >= 0 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {isRealized ? 'Đã Thực Hiện' : 'Dự Kiến Kỳ Này'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                netProfitOrLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {netProfitOrLoss >= 0 ? `+${formatVND(netProfitOrLoss)}` : formatVND(netProfitOrLoss)}
              </span>
            </div>

            <div className="flex items-center space-x-1.5 text-xs font-bold">
              {netProfitOrLoss >= 0 ? (
                <span className="text-emerald-400 flex items-center space-x-1">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Đang LÃI (Tiền lời hụi sống/hốt muộn)</span>
                </span>
              ) : (
                <span className="text-rose-400 flex items-center space-x-1">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>Đang ÂM (Do nộp T hốt sớm)</span>
                </span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-900 flex justify-between">
            <span>Tiền thăm tích lũy đã tiết kiệm:</span>
            <strong className="text-amber-400 font-mono">+{formatVND(totalDiscountSavedSoFar)}</strong>
          </div>
        </div>

        {/* CARD 3: VỐN ĐÃ ĐÓNG VS ĐÃ HỐT */}
        <div className="min-w-[280px] sm:min-w-[320px] bg-slate-950 p-4 rounded-xl border border-slate-800/90 snap-start flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Coins className="h-3.5 w-3.5 text-blue-400" />
              <span>3. Vốn Đã Đóng vs Đã Hốt</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Kỳ {huiDay.currentRound}/{huiDay.totalShares}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">Tổng Đã Đóng:</span>
              <span className="font-extrabold text-amber-400 font-mono block text-sm">
                {formatVND(myTotalContributed)}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 space-y-0.5">
              <span className="text-[10px] text-slate-400 block font-medium">Tổng Đã Hốt Về:</span>
              <span className="font-extrabold text-emerald-400 font-mono block text-sm">
                {formatVND(myTotalReceived)}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex justify-between items-center">
            <span>Mức tiền đóng kỳ này:</span>
            <strong className="text-white font-mono">
              {myMemberRecord?.hasPayout ? formatVND(huiDay.shareAmount) : 'V - T'}
            </strong>
          </div>

          <button
            onClick={handlePayClick}
            className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <QrCode className="h-4 w-4" />
            <span>Đóng Tiền Kỳ {huiDay.currentRound} (Hiện VietQR)</span>
          </button>
        </div>

        {/* CARD 4: THANH KÉO MÔ PHỎNG LÃI/ÂM KHI NỘP THĂM (INTERACTIVE SLIDER TOOL) */}
        <div className="min-w-[320px] sm:min-w-[360px] bg-slate-950 p-4 rounded-xl border border-amber-500/40 snap-start flex flex-col justify-between space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>4. Thanh Kéo Tính Lãi/Âm Nhanh</span>
            </span>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              Công Cụ Trượt
            </span>
          </div>

          {/* Range Slider for Bid T */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Kéo thử mức thăm ($T$):</span>
              <span className="font-extrabold text-amber-300 font-mono">
                {formatVND(interactiveBid)}
              </span>
            </div>

            <input
              type="range"
              min={huiDay.minBidValue}
              max={Math.round((huiDay.shareAmount * huiDay.maxBidValue) / 100)}
              step={50000}
              value={interactiveBid}
              onChange={(e) => setInteractiveBid(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />

            <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Tiền hốt về (R):</span>
                <span className="font-bold text-emerald-400 font-mono">{formatVND(potentialPayout.netPayoutR * sharesCount)}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Dự kiến Lãi/Âm:</span>
                <span className={`font-extrabold font-mono ${
                  (potentialPayout.netPayoutR * sharesCount - (myTotalContributed + (huiDay.totalShares - huiDay.currentRound) * huiDay.shareAmount * sharesCount)) >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}>
                  {formatVND(potentialPayout.netPayoutR * sharesCount - (myTotalContributed + (huiDay.totalShares - huiDay.currentRound) * huiDay.shareAmount * sharesCount))}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500">
            * Kéo thanh trượt để thử nghiệm các mức thăm $T$ và xem thay đổi tiền hốt thực tế ngay lập tức.
          </div>
        </div>

      </div>

    </div>
  );
};

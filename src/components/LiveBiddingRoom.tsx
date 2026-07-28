import React, { useState, useEffect } from 'react';
import { HuiDay, HuiMember, HuiRound, Bid, User } from '../types';
import { calculateRoundPayout, validateBidAmount } from '../utils/huiFinancialEngine';
import { ElectronicContractModal, ContractActionContext } from './ElectronicContractModal';
import { 
  Flame, 
  Trophy, 
  Clock, 
  Zap, 
  Send, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Volume2, 
  VolumeX, 
  AlertCircle, 
  Play, 
  Square, 
  Award,
  CircleDollarSign,
  ArrowUpRight,
  ShieldAlert,
  Smile,
  X
} from 'lucide-react';

interface LiveBiddingRoomProps {
  isOpen: boolean;
  onClose: () => void;
  huiDay: HuiDay;
  currentRound: HuiRound;
  members: HuiMember[];
  bids: Bid[];
  currentUser: User;
  onSubmitBid: (amount: number) => void;
  onFinalizeRound?: (roundId: string, winningBidAmount: number, winnerMemberId: string) => void;
}

export const LiveBiddingRoom: React.FC<LiveBiddingRoomProps> = ({
  isOpen,
  onClose,
  huiDay,
  currentRound,
  members,
  bids,
  currentUser,
  onSubmitBid,
  onFinalizeRound,
}) => {
  if (!isOpen) return null;

  const isHost = currentUser.role === 'chu_hui' || currentUser.id === huiDay.hostId;
  const currentMember = members.find(m => m.userId === currentUser.id);

  // Validate bounds
  const bidValidation = validateBidAmount(1000, huiDay);
  const { minBid, maxBid } = bidValidation;

  // Round Bids
  const roundBids = bids
    .filter(b => b.roundId === currentRound.id)
    .sort((a, b) => b.bidAmount - a.bidAmount);

  const highestBid = roundBids[0] || null;
  const isCurrentMemberHighest = highestBid && currentMember && highestBid.memberId === currentMember.id;

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes live auction default
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [bidAmountInput, setBidAmountInput] = useState<number>(
    highestBid ? Math.min(highestBid.bidAmount + 20000, maxBid) : Math.round(huiDay.shareAmount * 0.15)
  );
  const [liveReactions, setLiveReactions] = useState<{ id: string; emoji: string; name: string }[]>([]);
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [bidSuccessNotice, setBidSuccessNotice] = useState<string | null>(null);
  const [winningCelebration, setWinningCelebration] = useState<Bid | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [pendingBidAmount, setPendingBidAmount] = useState<number | null>(null);

  // Sync bid input with highest bid automatically
  useEffect(() => {
    if (highestBid) {
      setBidAmountInput(Math.min(highestBid.bidAmount + 20000, maxBid));
    }
  }, [highestBid?.bidAmount, maxBid]);

  // Live countdown effect
  useEffect(() => {
    if (!isLiveActive || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsLiveActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveActive, timeLeft]);

  // Fast Bid Adjustment
  const handleAddBid = (delta: number) => {
    setBidAmountInput(prev => {
      const nextVal = Math.min(Math.max(prev + delta, minBid), maxBid);
      return nextVal;
    });
  };

  const executeSubmitBid = (amount: number) => {
    onSubmitBid(amount);
    setBidSuccessNotice(`Đã kê giá thăm thành công: ${amount.toLocaleString('vi-VN')} đ`);
    addReaction('💰', currentMember?.userName || currentUser.name);

    setTimeout(() => {
      setBidSuccessNotice(null);
    }, 2500);
  };

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateBidAmount(bidAmountInput, huiDay);
    if (!validation.isValid) return;

    // Show Electronic Contract before bidding
    setPendingBidAmount(bidAmountInput);
    setShowContractModal(true);
  };

  const addReaction = (emoji: string, senderName: string) => {
    const rxId = `rx_${Date.now()}_${Math.random()}`;
    setLiveReactions(prev => [...prev.slice(-6), { id: rxId, emoji, name: senderName }]);
    setTimeout(() => {
      setLiveReactions(prev => prev.filter(r => r.id !== rxId));
    }, 3000);
  };

  // Host Finalize Winner Action
  const handleHostFinalizeWinner = () => {
    if (!highestBid || !onFinalizeRound) return;
    setWinningCelebration(highestBid);
    onFinalizeRound(currentRound.id, highestBid.bidAmount, highestBid.memberId);
  };

  // Format time (MM:SS)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Net payout preview for the current bid
  const roundBreakdown = calculateRoundPayout(
    huiDay.shareAmount,
    bidAmountInput,
    huiDay.totalShares,
    currentRound.roundNumber,
    members,
    huiDay.feeType,
    huiDay.feeValue,
    currentRound.totalDeadShares
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-4xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto text-slate-100 space-y-6">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-20"
        >
          <X className="h-6 w-6" />
        </button>

        {/* HEADER BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="relative p-3 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 font-extrabold shadow-lg shadow-rose-500/20">
              <Flame className="h-7 w-7 text-slate-950 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase tracking-wider flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>ĐANG LIVE TRỰC TUYẾN</span>
                </span>
                <span className="text-xs font-mono text-slate-400">{huiDay.name} - Kỳ {currentRound.roundNumber}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                SÀN ĐẤU HỤI LIVE - KÊ GIÁ THĂM MỞ
              </h2>
            </div>
          </div>

          {/* Countdown Clock & Controls */}
          <div className="flex items-center space-x-3">
            <div className="bg-slate-950 border border-amber-500/40 rounded-2xl px-4 py-2 flex items-center space-x-2 shadow-inner">
              <Clock className={`h-5 w-5 ${timeLeft < 30 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`} />
              <span className="text-lg sm:text-xl font-mono font-black text-amber-400 tracking-wider">
                {formattedTime}
              </span>
            </div>

            <button
              onClick={() => setIsSoundOn(!isSoundOn)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors"
              title={isSoundOn ? 'Tắt âm thanh live' : 'Bật âm thanh live'}
            >
              {isSoundOn ? <Volume2 className="h-5 w-5 text-emerald-400" /> : <VolumeX className="h-5 w-5 text-slate-500" />}
            </button>
          </div>
        </div>

        {/* WINNER VICTORY CELEBRATION MODAL OVERLAY */}
        {winningCelebration && (
          <div className="p-6 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-600 rounded-2xl text-slate-950 font-black text-center space-y-3 shadow-2xl animate-pulse">
            <Award className="h-12 w-12 mx-auto text-slate-950" />
            <h3 className="text-2xl sm:text-3xl font-black uppercase">
              🎉 CHÚC MỪNG HỘI VIÊN TRÚNG HỤI KỲ {currentRound.roundNumber}!
            </h3>
            <div className="text-lg">
              Người trúng: <strong className="underline decoration-slate-950">{winningCelebration.userName}</strong> với mức đấu giá{' '}
              <strong className="text-2xl font-mono">{winningCelebration.bidAmount.toLocaleString('vi-VN')} đ</strong>!
            </div>
          </div>
        )}

        {/* MAIN LIVE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT 7 COLS: LIVE LEADERBOARD & BID FORM */}
          <div className="lg:col-span-7 space-y-5">

            {/* HIGHEST BIDDER LEADER CARD */}
            <div className={`p-5 rounded-3xl border transition-all ${
              isCurrentMemberHighest 
                ? 'bg-gradient-to-br from-emerald-950/80 to-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10' 
                : 'bg-gradient-to-br from-slate-950 to-slate-900 border-amber-500/40 shadow-xl'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>Mức Kê Giá Cao Nhất Hiện Tại (Dẫn Đầu)</span>
                </span>
                {highestBid && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Cập nhật {new Date(highestBid.submittedAt).toLocaleTimeString('vi-VN')}
                  </span>
                )}
              </div>

              {highestBid ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 font-extrabold text-lg uppercase font-mono">
                        {highestBid.userName.slice(0, 2)}
                      </div>
                      <Trophy className="h-5 w-5 text-amber-400 absolute -top-2 -right-2 drop-shadow" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-extrabold text-base text-white">{highestBid.userName}</span>
                        {isCurrentMemberHighest && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-500/40">
                            BẠN ĐANG DẪN ĐẦU!
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 block">Thăm kê giá cao nhất sàn live</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-mono font-black text-amber-400 block tracking-tight">
                      {highestBid.bidAmount.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-[11px] text-slate-400 block">Thăm / Phần</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-1">
                  <CircleDollarSign className="h-8 w-8 mx-auto text-amber-500/60" />
                  <p className="text-xs font-bold text-slate-300">Chưa có ai bỏ thăm trong phiên live này!</p>
                  <p className="text-[11px] text-slate-500">Hãy là người đầu tiên kê giá thăm để dẫn đầu!</p>
                </div>
              )}
            </div>

            {/* LIVE BIDDING INPUT FORM */}
            <form onSubmit={handlePlaceBid} className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <label className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <span>Kê Giá Đấu Thăm Trực Tiếp</span>
                </label>

                <div className="text-xs text-slate-400 font-mono">
                  Hạn mức: <strong className="text-slate-200">{minBid.toLocaleString('vi-VN')}</strong> - <strong className="text-slate-200">{maxBid.toLocaleString('vi-VN')} đ</strong>
                </div>
              </div>

              {/* Quick Increase Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddBid(10000)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold font-mono text-emerald-400 transition-all hover:scale-102"
                >
                  +10.000 đ
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBid(20000)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold font-mono text-emerald-400 transition-all hover:scale-102"
                >
                  +20.000 đ
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBid(50000)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold font-mono text-amber-400 transition-all hover:scale-102"
                >
                  +50.000 đ
                </button>
                <button
                  type="button"
                  onClick={() => handleAddBid(100000)}
                  className="py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-bold font-mono text-rose-400 transition-all hover:scale-102"
                >
                  +100.000 đ
                </button>
              </div>

              {/* Main Slider & Input */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min={minBid}
                    max={maxBid}
                    step={10000}
                    value={bidAmountInput}
                    onChange={(e) => setBidAmountInput(Number(e.target.value))}
                    className="flex-1 accent-amber-500 h-2 bg-slate-900 rounded-lg cursor-pointer"
                  />
                  <div className="relative">
                    <input
                      type="number"
                      step={5000}
                      min={minBid}
                      max={maxBid}
                      value={bidAmountInput}
                      onChange={(e) => setBidAmountInput(Number(e.target.value))}
                      className="w-36 bg-slate-900 border border-amber-500/50 rounded-xl px-3 py-2 text-right font-mono font-extrabold text-amber-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="absolute right-2 top-2.5 text-[10px] text-slate-500 pointer-events-none">đ</span>
                  </div>
                </div>

                {/* Live Payout Estimation */}
                <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Dự kiến thực nhận nếu thắng:</span>
                  <strong className="text-emerald-400 text-sm font-extrabold">
                    {roundBreakdown.netPayoutR.toLocaleString('vi-VN')} đ
                  </strong>
                </div>
              </div>

              {/* Submit Bid Button */}
              <button
                type="submit"
                disabled={!isLiveActive}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <Zap className="h-5 w-5 text-slate-950 fill-current" />
                <span>KÊ GIÁ THĂM ĐẤU LIVE HỤI ({bidAmountInput.toLocaleString('vi-VN')} đ)</span>
              </button>

              {bidSuccessNotice && (
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl text-center animate-fade-in flex items-center justify-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>{bidSuccessNotice}</span>
                </div>
              )}
            </form>

            {/* HOST CONTROLS IF USER IS HOST */}
            {isHost && (
              <div className="p-4 bg-slate-950 border border-emerald-500/40 rounded-3xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                    <Award className="h-4 w-4" />
                    <span>Quyền Điều Hành Chủ Hụi (Live Session)</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Kỳ {currentRound.roundNumber}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsLiveActive(!isLiveActive);
                      if (!isLiveActive) setTimeLeft(180);
                    }}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 border transition-all ${
                      isLiveActive 
                        ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 hover:bg-rose-500/30' 
                        : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                    }`}
                  >
                    {isLiveActive ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    <span>{isLiveActive ? 'Tạm Dừng Đấu' : 'Mở Đấu Live (3 phút)'}</span>
                  </button>

                  <button
                    onClick={handleHostFinalizeWinner}
                    disabled={!highestBid}
                    className="py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-40"
                  >
                    <Trophy className="h-4 w-4 text-slate-950" />
                    <span>Chốt Hụi & Công Bố Người Trúng</span>
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT 5 COLS: LIVE BID FEED & REACTION STREAM */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            
            {/* Live Feed Header */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 flex-1 flex flex-col min-h-[350px] shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                  <span>Dòng Lịch Sử Bỏ Thăm Live ({roundBids.length})</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Real-time
                </span>
              </div>

              {/* Bids Stream List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1">
                {roundBids.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Chưa có lượt đặt thăm nào trong phiên.
                  </div>
                ) : (
                  roundBids.map((b, idx) => {
                    const isTop = idx === 0;
                    return (
                      <div
                        key={b.id}
                        className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                          isTop 
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-200 shadow-md' 
                            : 'bg-slate-900/80 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className={`w-6 h-6 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                            isTop ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-xs block text-white">{b.userName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(b.submittedAt).toLocaleTimeString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-black text-sm text-amber-400 block">
                            {b.bidAmount.toLocaleString('vi-VN')} đ
                          </span>
                          {isTop && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-extrabold uppercase">
                              Cao Nhất
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Floating Live Reaction Stream */}
              {liveReactions.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-900 flex flex-wrap gap-1.5 animate-fade-in">
                  {liveReactions.map((r) => (
                    <span
                      key={r.id}
                      className="px-2.5 py-1 bg-slate-900 border border-amber-500/30 text-amber-300 rounded-full text-xs font-bold flex items-center space-x-1 animate-bounce"
                    >
                      <span>{r.emoji}</span>
                      <span className="text-[10px] text-slate-300">{r.name}</span>
                    </span>
                  ))}
                </div>
              )}

              {/* Quick Reaction Bar */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Cảm xúc live:</span>
                <div className="flex items-center space-x-2">
                  {['🔥', '👏', '💰', '😱', '🎉'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addReaction(emoji, currentMember?.userName || currentUser.name)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-base transition-transform active:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Electronic Contract Modal before Bidding */}
      {showContractModal && pendingBidAmount && (
        <ElectronicContractModal
          isOpen={showContractModal}
          onClose={() => {
            setShowContractModal(false);
            setPendingBidAmount(null);
          }}
          onAccept={() => {
            if (pendingBidAmount) {
              executeSubmitBid(pendingBidAmount);
            }
            setShowContractModal(false);
            setPendingBidAmount(null);
          }}
          currentUser={currentUser}
          context={{
            title: `HỢP ĐỒNG ĐIỆN TỬ ĐẤU GIÁ KÊ THĂM KỲ ${currentRound.roundNumber}`,
            actionType: 'live_bid',
            partnerName: 'Công Ty Tài Chính & Trung Tâm Chứng Thư Điện Tử (Bên Thứ Ba)',
            summaryText: `Đặt giá thăm ${pendingBidAmount.toLocaleString('vi-VN')} đ cho kỳ ${currentRound.roundNumber} dây '${huiDay.name}'. Mọi nghĩa vụ thanh toán và bảo chứng do Bên Thứ 3 xác nhận.`,
            amount: pendingBidAmount,
          }}
        />
      )}
    </div>
  );
};

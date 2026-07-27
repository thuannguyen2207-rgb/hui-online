import React, { useState } from 'react';
import { FeeType } from '../types';
import { calculateRoundPayout, formatVND } from '../utils/huiFinancialEngine';
import { Calculator, CheckCircle2, DollarSign, HelpCircle, Info, Percent, Sparkles, TrendingUp, ShieldCheck, Scale } from 'lucide-react';

export const FinancialCalculatorView: React.FC = () => {
  const [shareAmount, setShareAmount] = useState<number>(10000000); // V = 10 triệu
  const [totalShares, setTotalShares] = useState<number>(12); // N = 12 phần
  const [customDeadShares, setCustomDeadShares] = useState<number>(2); // 2 hụi chết
  const [winningBid, setWinningBid] = useState<number>(1500000); // T = 1.5 triệu
  const [feeType, setFeeType] = useState<FeeType>('percent_value');
  const [feeValue, setFeeValue] = useState<number>(2.0); // 2% của V

  // Run calculation
  const totalLiveShares = Math.max(0, totalShares - customDeadShares);
  const result = calculateRoundPayout(
    shareAmount,
    winningBid,
    totalShares,
    customDeadShares + 1,
    [],
    feeType,
    feeValue,
    customDeadShares
  );

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Calculator className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">Bộ Kiểm Thử Thuật Toán Tài Chính Hụi</h2>
            <p className="text-xs text-slate-400">
              Công thức tài chính chuẩn xác: <code className="text-amber-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">R = (Hụi_Chết × V) + (Hụi_Sống × (V - T)) - Phí_Thảo - Tiền_Đóng_Kỳ_Hiện_Tại</code>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Parameters Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 border-b border-slate-800 pb-3 flex items-center space-x-2">
            <Scale className="h-4 w-4" />
            <span>Tùy Chỉnh Tham Số Đơn Kỳ</span>
          </h3>

          <div className="space-y-4 text-xs">
            
            {/* V */}
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Giá Trị Kỳ Đóng Chuẩn (V)</span>
                <span className="text-amber-400 font-mono font-bold">{formatVND(shareAmount)}</span>
              </div>
              <input
                type="range"
                min={500000}
                max={50000000}
                step={500000}
                value={shareAmount}
                onChange={(e) => setShareAmount(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* N */}
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Tổng Số Phần Hụi (N)</span>
                <span className="text-white font-mono font-bold">{totalShares} phần</span>
              </div>
              <input
                type="range"
                min={3}
                max={30}
                value={totalShares}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  setTotalShares(n);
                  if (customDeadShares >= n) setCustomDeadShares(n - 1);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Dead shares count */}
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Số Hụi Chết (Đã hốt kỳ trước)</span>
                <span className="text-rose-400 font-mono font-bold">{customDeadShares} phần</span>
              </div>
              <input
                type="range"
                min={0}
                max={totalShares - 1}
                value={customDeadShares}
                onChange={(e) => setCustomDeadShares(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tương ứng: <strong className="text-emerald-400">{totalLiveShares} phần Hụi Sống</strong> (Chưa hốt)
              </span>
            </div>

            {/* T */}
            <div>
              <div className="flex justify-between text-slate-300 font-semibold mb-1">
                <span>Mức Tiền Đấu Giá Thắng (T)</span>
                <span className="text-amber-400 font-mono font-bold">{formatVND(winningBid)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={shareAmount * 0.4}
                step={50000}
                value={winningBid}
                onChange={(e) => setWinningBid(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Fee config */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="block text-slate-300 font-semibold">Phí Thảo (Chủ Hụi)</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={feeType}
                  onChange={(e) => setFeeType(e.target.value as FeeType)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
                >
                  <option value="percent_value">% trên V</option>
                  <option value="percent_payout">% tổng gom</option>
                  <option value="fixed_amount">Cố định VNĐ</option>
                </select>
                <input
                  type="number"
                  value={feeValue}
                  onChange={(e) => setFeeValue(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-emerald-400 font-bold font-mono"
                />
              </div>
            </div>

          </div>
        </div>

        {/* Live Formula Results & Ledger Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Net Payout Display Card */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1 mb-2">
              <Sparkles className="h-4 w-4" />
              <span>Tổng Tiền Người Hốt Hụi Thực Nhận (R)</span>
            </span>

            <div className="flex items-baseline space-x-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">
                {formatVND(result.netPayoutR)}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-2">
              Sau khi trừ <strong className="text-emerald-400">{formatVND(result.calculatedFee)}</strong> phí thảo chủ hụi và <strong className="text-amber-300">{formatVND(result.winnerCurrentRoundDuty)}</strong> tiền đóng phần hụi sống kỳ này của mình.
            </p>
          </div>

          {/* Mathematical Step-by-Step Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Bảng Phân Tích Chi Tiết Dòng Tiền Kỳ Hụi
            </h4>

            <div className="space-y-2 text-xs">
              
              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">1. Tiền thu từ {result.totalDeadShares} phần Hụi Chết ({result.totalDeadShares} × V):</span>
                <span className="font-extrabold text-rose-400 font-mono">{formatVND(result.deadTotalPay)}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400">2. Tiền thu từ {result.totalLiveShares} phần Hụi Sống ({result.totalLiveShares} × (V - T)):</span>
                <span className="font-extrabold text-emerald-400 font-mono">{formatVND(result.liveTotalPay)}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 font-bold">
                <span className="text-slate-200">3. Tổng tiền gom từ tất cả các phần (Gross Collected):</span>
                <span className="font-extrabold text-white font-mono text-sm">{formatVND(result.grossCollected)}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-rose-300">
                <span>4. Trừ Phí Thảo Chủ Hụi (Commission):</span>
                <span className="font-bold font-mono">- {formatVND(result.calculatedFee)}</span>
              </div>

              <div className="flex justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-amber-300">
                <span>5. Trừ phần đóng kỳ này của chính người vừa hốt (V - T):</span>
                <span className="font-bold font-mono">- {formatVND(result.winnerCurrentRoundDuty)}</span>
              </div>

              <div className="flex justify-between p-3.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-xl border border-amber-500/40 text-amber-300 font-bold text-sm">
                <span>6. Thực Nhận Chốt Hạ (R = Gross - Fee - Duty):</span>
                <span className="font-extrabold font-mono text-base text-amber-400">{formatVND(result.netPayoutR)}</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

import { CalculationBreakdown, FeeType, HuiDay, HuiMember } from '../types';

/**
 * Thuật toán tính toán tài chính & Sổ hụi chuẩn xác (Vietnamese Hui Financial Engine)
 */

export function formatVND(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortMoney(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 đ';
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} Tr`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })}k`;
  }
  return `${amount} đ`;
}

export function getCycleTypeLabel(cycleType: string, cycleDays?: number): string {
  switch (cycleType) {
    case 'daily':
      return 'Hụi Ngày (1 ngày)';
    case 'weekly':
      return 'Hụi Tuần (7 ngày)';
    case 'ten_days':
      return 'Hụi 10 Ngày (10 ngày)';
    case 'half_month':
      return 'Hụi Nửa Tháng (15 ngày)';
    case 'monthly':
      return 'Hụi 1 Tháng (30 ngày)';
    case 'custom':
      return `Hụi Tùy Chỉnh (${cycleDays || 1} ngày)`;
    default:
      return 'Hụi Định Kỳ';
  }
}

/**
 * Tính toán số hụi chết & hụi sống dựa trên kỳ hiện tại và danh sách hội viên
 */
export function calculateMemberStates(
  totalShares: number,
  currentRound: number,
  members: HuiMember[]
) {
  // Số phần hụi đã hốt ở các kỳ trước (Kỳ 1 -> currentRound - 1)
  const deadSharesCount = members.reduce((sum, m) => {
    if (m.hasPayout && m.payoutRound !== null && m.payoutRound < currentRound) {
      return sum + m.sharesCount;
    }
    return sum;
  }, 0);

  // Mặc định kỳ 1 thì dead = 0
  const totalDeadShares = currentRound === 1 ? 0 : deadSharesCount;
  // Hụi sống = Tổng số phần - Hụi chết
  const totalLiveShares = Math.max(0, totalShares - totalDeadShares);

  return { totalDeadShares, totalLiveShares };
}

/**
 * Tính Phí Thảo (Hoa hồng Chủ Hụi)
 */
export function calculateHostCommission(
  shareAmount: number,
  totalShares: number,
  grossCollected: number,
  feeType: FeeType,
  feeValue: number
): number {
  if (feeType === 'fixed_amount') {
    return Math.max(0, feeValue);
  }
  if (feeType === 'percent_value') {
    // % trên giá trị 1 phần hụi (V * %fee)
    return Math.round((shareAmount * feeValue) / 100);
  }
  if (feeType === 'percent_payout') {
    // % trên tổng số tiền thực gom kỳ đó
    return Math.round((grossCollected * feeValue) / 100);
  }
  return 0;
}

/**
 * BỘ TÍNH TOÁN TÀI CHÍNH CHÍNH (Core Hui Financial Engine)
 * Công thức: R = (Hụi Chết x V) + (Hụi Sống x (V - T)) - Phí Thảo - Tiền Đóng Kỳ Hiện Tại
 */
export function calculateRoundPayout(
  shareAmount: number, // V
  winningBid: number, // T
  totalShares: number, // N
  currentRound: number,
  members: HuiMember[],
  feeType: FeeType,
  feeValue: number,
  customDeadShares?: number
): CalculationBreakdown {
  // Determine dead & live shares
  let totalDeadShares = 0;
  let totalLiveShares = totalShares;

  if (customDeadShares !== undefined) {
    totalDeadShares = customDeadShares;
    totalLiveShares = Math.max(0, totalShares - totalDeadShares);
  } else if (members.length > 0) {
    const states = calculateMemberStates(totalShares, currentRound, members);
    totalDeadShares = states.totalDeadShares;
    totalLiveShares = states.totalLiveShares;
  } else {
    // If fallback without member list: Round 1 = 0 dead, Round k = k - 1 dead
    totalDeadShares = Math.min(totalShares - 1, currentRound - 1);
    totalLiveShares = totalShares - totalDeadShares;
  }

  // 1. Tiền Hụi Chết đóng = Số Hụi Chết * V
  const deadTotalPay = totalDeadShares * shareAmount;

  // 2. Tiền Hụi Sống đóng = Số Hụi Sống * (V - T)
  const livePerShare = Math.max(0, shareAmount - winningBid);
  const liveTotalPay = totalLiveShares * livePerShare;

  // 3. Tổng tiền thu gom từ tất cả các phần (Gross Collected)
  const grossCollected = deadTotalPay + liveTotalPay;

  // 4. Phí Thảo (Hoa hồng chủ hụi)
  const calculatedFee = calculateHostCommission(
    shareAmount,
    totalShares,
    grossCollected,
    feeType,
    feeValue
  );

  // 5. Tiền đóng của chính phần hụi vừa thắng trong kỳ này (Vì người vừa hốt cũng phải đóng phần hụi sống kỳ này của mình = V - T)
  const winnerCurrentRoundDuty = livePerShare;

  // 6. Số tiền thực nhận R = GrossCollected - Phí Thảo - Tiền Đóng Kỳ Hiện Tại
  const netPayoutR = grossCollected - calculatedFee - winnerCurrentRoundDuty;

  return {
    shareAmount,
    winningBid,
    totalShares,
    totalDeadShares,
    totalLiveShares,
    deadTotalPay,
    liveTotalPay,
    grossCollected,
    feeType,
    feeValue,
    calculatedFee,
    winnerCurrentRoundDuty,
    netPayoutR,
  };
}

/**
 * Kiểm tra mức nộp thăm có hợp lệ theo trần / sàn của Dây Hụi hay không
 */
export function validateBidAmount(
  bidAmount: number,
  huiDay: HuiDay
): { isValid: boolean; message?: string; minBid: number; maxBid: number } {
  let minBid = 0;
  let maxBid = huiDay.shareAmount;

  if (huiDay.minBidType === 'amount') {
    minBid = huiDay.minBidValue;
  } else {
    minBid = Math.round((huiDay.shareAmount * huiDay.minBidValue) / 100);
  }

  if (huiDay.maxBidType === 'amount') {
    maxBid = huiDay.maxBidValue;
  } else {
    maxBid = Math.round((huiDay.shareAmount * huiDay.maxBidValue) / 100);
  }

  if (bidAmount < minBid) {
    return {
      isValid: false,
      message: `Mức nộp thăm ${formatVND(bidAmount)} thấp hơn mức sàn tối thiểu ${formatVND(minBid)}.`,
      minBid,
      maxBid,
    };
  }

  if (bidAmount > maxBid) {
    return {
      isValid: false,
      message: `Mức nộp thăm ${formatVND(bidAmount)} vượt quá mức trần tối đa ${formatVND(maxBid)} (để phòng ngừa rủi ro giật hụi).`,
      minBid,
      maxBid,
    };
  }

  return { isValid: true, minBid, maxBid };
}

/**
 * BẢNG MAPPING NGÂN HÀNG CHUẨN NAPAS247 / VIETQR SHORT NAME
 * VietinBank: 'ICB' (BIN: 970415)
 * Vietcombank: 'VCB' (BIN: 970436)
 * MBBank: 'MB' (BIN: 970422)
 * BIDV: 'BIDV' (BIN: 970418)
 * Techcombank: 'TCB' (BIN: 970407)
 */
export const VIETQR_BANK_MAP: Record<string, string> = {
  // VietinBank (Công Thương Việt Nam)
  'ICB': 'ICB',
  'CTG': 'ICB',
  'VIETINBANK': 'ICB',
  '970415': 'ICB',

  // Vietcombank (Ngoại Thương Việt Nam)
  'VCB': 'VCB',
  'VIETCOMBANK': 'VCB',
  '970436': 'VCB',

  // MBBank (Quân Đội)
  'MB': 'MB',
  'MBBANK': 'MB',
  '970422': 'MB',

  // BIDV (Đầu tư và Phát triển Việt Nam)
  'BIDV': 'BIDV',
  '970418': 'BIDV',

  // Techcombank (Kỹ Thương Việt Nam)
  'TCB': 'TCB',
  'TECHCOMBANK': 'TCB',
  '970407': 'TCB',

  // Agribank
  'VBA': 'VBA',
  'AGRIBANK': 'VBA',
  '970405': 'VBA',

  // VPBank
  'VPB': 'VPB',
  'VPBANK': 'VPB',
  '970432': 'VPB',

  // Sacombank
  'STB': 'STB',
  'SACOMBANK': 'STB',
  '970403': 'STB',

  // ACB
  'ACB': 'ACB',
  '970416': 'ACB',

  // TPBank
  'TPB': 'TPB',
  'TPBANK': 'TPB',
  '970423': 'TPB',

  // MSB
  'MSB': 'MSB',
  '970426': 'MSB',

  // OCB
  'OCB': 'OCB',
  '970448': 'OCB',

  // HDBank
  'HDB': 'HDB',
  'HDBANK': 'HDB',
  '970437': 'HDB',

  // SHB
  'SHB': 'SHB',
  '970443': 'SHB',

  // VIB
  'VIB': 'VIB',
  '970441': 'VIB',
};

export function resolveVietQRBankCode(bankCodeInput: string): string {
  if (!bankCodeInput) return 'MB';
  const clean = bankCodeInput.trim().toUpperCase().replace(/\s+/g, '');
  return VIETQR_BANK_MAP[clean] || clean;
}

/**
 * Tạo URL hình ảnh VietQR chuẩn Napas247 động
 */
export function generateVietQRUrl(
  bankCode: string,
  accountNumber: string,
  accountName: string,
  amount: number,
  addInfo: string,
  template: string = 'compact2'
): string {
  const cleanBank = resolveVietQRBankCode(bankCode);
  const cleanAcc = accountNumber.trim() || '0000000000';
  const cleanName = encodeURIComponent(accountName.trim());
  const cleanInfo = encodeURIComponent(addInfo.trim());

  return `https://img.vietqr.io/image/${cleanBank}-${cleanAcc}-${template}.png?amount=${amount}&addInfo=${cleanInfo}&accountName=${cleanName}`;
}

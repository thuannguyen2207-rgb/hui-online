export type UserRole = 'chu_hui' | 'hui_vien';

export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  role: UserRole;
  avatar: string;
  verified: boolean;
  idCardNumber?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  bankName?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
  bankConfig?: BankConfig;
  pendingBankConfig?: BankConfig;
  bankApprovalStatus?: 'none' | 'pending' | 'approved' | 'rejected';
}

export type CycleType = 'daily' | 'weekly' | 'ten_days' | 'half_month' | 'monthly' | 'custom';
export type FeeType = 'percent_payout' | 'percent_value' | 'fixed_amount';
export type BidLimitType = 'amount' | 'percent';
export type TieBreakRule = 'earliest' | 'random';
export type HuiStatus = 'recruiting' | 'active' | 'completed' | 'cancelled';

export interface BankConfig {
  bankName: string;
  bankCode: string; // e.g., 'MB', 'VCB', 'TCB'
  accountNumber: string;
  accountName: string;
}

export interface HuiDay {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  hostPhone: string;
  totalShares: number; // N: Tổng số phần hụi
  shareAmount: number; // V: Giá trị đóng chuẩn mỗi phần (VND)
  cycleType: CycleType;
  cycleDays: number; // e.g., 7 days or 30 days
  feeType: FeeType;
  feeValue: number; // e.g. 2% or 200,000 VND
  minBidType: BidLimitType;
  minBidValue: number; // Mức nộp thăm tối thiểu
  maxBidType: BidLimitType;
  maxBidValue: number; // Mức trần nộp thăm tối đa
  tieBreakRule: TieBreakRule;
  startDate: string;
  currentRound: number;
  status: HuiStatus;
  inviteCode: string;
  bankConfig: BankConfig;
  description?: string;
  createdAt: string;
  allowP2pLending?: boolean; // Tùy chọn đóng/mở Cho Vay Ngang Hàng do Chủ Hụi quản lý
  allowMaturityVault?: boolean; // Tùy chọn đóng/mở Hũ Tích Lũy Mãn Hạn do Chủ Hụi quản lý
}

export type MemberStatus = 'pending' | 'approved' | 'rejected';

export interface HuiMember {
  id: string;
  huiDayId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAvatar: string;
  sharesCount: number; // Số phần hụi sở hữu
  hasPayout: boolean; // Đã hốt hụi chưa (True = Hụi Chết, False = Hụi Sống)
  payoutRound: number | null; // Kỳ đã hốt hụi
  joinedAt: string;
  status: MemberStatus;
  note?: string;
  idCardNumber?: string;
  idCardFrontUrl?: string;
  idCardBackUrl?: string;
  kycStatus?: 'verified' | 'pending_verification' | 'unverified';
  bankConfig?: BankConfig;
  pendingBankConfig?: BankConfig;
  bankApprovalStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  bankRejectionNote?: string;
}

export type RoundStatus = 'bidding' | 'calculating' | 'payment_pending' | 'completed';

export interface HuiRound {
  id: string;
  huiDayId: string;
  roundNumber: number;
  openDate: string;
  bidCloseTime: string;
  paymentDueDate: string;
  status: RoundStatus;
  winningBidAmount: number | null; // T: Mức tiền đấu giá thắng
  winnerMemberId: string | null;
  winnerUserId: string | null;
  winnerUserName: string | null;
  totalDeadShares: number; // Số hụi chết trong kỳ này (trước kỳ này đã hốt)
  totalLiveShares: number; // Số hụi sống trong kỳ này (kể cả người vừa hốt)
  deadContributionPerShare: number; // Tiền hụi chết đóng/phần = V
  liveContributionPerShare: number; // Tiền hụi sống đóng/phần = V - T
  hostCommission: number; // Phí Thảo chủ hụi nhận được
  winnerGrossPayout: number; // Tổng thu gom từ các phần hụi
  winnerNetPayout: number; // R: Tiền thực nhận của người trúng sau khi trừ Phí Thảo và Tiền Đóng Kỳ Này
  notes?: string;
}

export interface Bid {
  id: string;
  roundId: string;
  huiDayId: string;
  memberId: string;
  userId: string;
  userName: string;
  bidAmount: number; // T
  submittedAt: string;
  status: 'active' | 'won' | 'lost' | 'tied_lost';
}

export type TransactionStatus = 'unpaid' | 'pending_approval' | 'confirmed';

export interface Transaction {
  id: string;
  roundId: string;
  huiDayId: string;
  memberId: string;
  userId: string;
  userName: string;
  sharesCount: number;
  isDeadHui: boolean; // True: Hụi Chết (đóng V), False: Hụi Sống (đóng V - T)
  amountDue: number; // Số tiền phải đóng
  status: TransactionStatus;
  paymentProofUrl?: string;
  vietqrCode: string;
  paymentRef: string; // Cú pháp gạch nợ (ví dụ: HUI T3 K1 NGUYENVANA)
  paidAt?: string;
  confirmedAt?: string;
}

export interface ChatMessage {
  id: string;
  huiDayId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole | 'system';
  senderAvatar?: string;
  message: string;
  timestamp: string;
  type: 'text' | 'bid_notice' | 'payout_notice' | 'payment_proof' | 'system_alert';
  extraData?: Record<string, any>;
}

export interface CalculationBreakdown {
  shareAmount: number; // V
  winningBid: number; // T
  totalShares: number; // N
  totalDeadShares: number; // Hụi chết
  totalLiveShares: number; // Hụi sống (kể cả người thắng kỳ này)
  deadTotalPay: number; // Hụi Chết x V
  liveTotalPay: number; // Hụi Sống x (V - T)
  grossCollected: number; // Total = deadTotalPay + liveTotalPay
  feeType: FeeType;
  feeValue: number;
  calculatedFee: number; // Phí Thảo
  winnerCurrentRoundDuty: number; // Tiền người thắng phải đóng kỳ này (Thường là 1 phần Hụi Sống V - T hoặc V)
  netPayoutR: number; // R = (Dead x V) + (Live x (V - T)) - Phí Thảo - Tiền Đóng Kỳ Hiện Tại
}

export type P2PLoanStatus = 'open' | 'funded' | 'repaid' | 'cancelled';

export interface P2PLoan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  borrowerAvatar?: string;
  lenderId?: string;
  lenderName?: string;
  amount: number;
  interestRateYearly: number; // %/năm (e.g. 12 = 12%/năm)
  termMonths: number; // Thời hạn vay (tháng)
  purpose: string; // Mục đích vay (góp hụi, kinh doanh xoay vốn...)
  collateralNote: string; // Thế chấp suất hụi / Thỏa thuận tín nhiệm
  status: P2PLoanStatus;
  createdAt: string;
  fundedAt?: string;
  dueDate?: string;
  repaidAt?: string;
}

export interface VaultDepositRecord {
  id: string;
  cycleNumber: number;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
  paymentProofUrl?: string;
}

export interface MaturityVault {
  id: string;
  userId: string;
  userName: string;
  huiDayId?: string;
  huiDayName?: string;
  vaultName: string; // Tên hũ tiết kiệm (e.g. "Hũ Tích Lũy Mãn Hạn Dây Hụi T3")
  targetCycles: number; // Tổng số kỳ phải tích lũy (e.g. 12 kỳ)
  completedCycles: number; // Số kỳ đã nộp đúng hạn
  amountPerCycle: number; // Số tiền tích lũy mỗi kỳ (e.g. 1,000,000 đ)
  bonusInterestRate: number; // Lãi suất thưởng khi rút đúng mãn hạn (%/năm, e.g. 8.5%/năm)
  status: 'active' | 'matured' | 'withdrawn';
  startDate: string;
  maturityDate: string; // Ngày mãn hạn rút tiền
  deposits: VaultDepositRecord[];
}


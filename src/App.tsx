import React, { useRef, useState, useEffect } from 'react';
import { Bid, BankConfig, ChatMessage, HuiDay, HuiMember, HuiRound, Transaction, User, UserRole, P2PLoan, MaturityVault } from './types';
import { MOCK_BIDS, MOCK_CHAT_MESSAGES, MOCK_HUI_DAYS, MOCK_MEMBERS, MOCK_ROUNDS, MOCK_TRANSACTIONS, MOCK_USERS, MOCK_P2P_LOANS, MOCK_MATURITY_VAULTS } from './data/mockData';
import { calculateMemberStates, calculateRoundPayout, formatVND, generateVietQRUrl, getCycleTypeLabel } from './utils/huiFinancialEngine';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { LoginScreen } from './components/LoginScreen';
import { PhoneAuthModal } from './components/PhoneAuthModal';
import { CreateHuiModal } from './components/CreateHuiModal';
import { BankConfigModal } from './components/BankConfigModal';
import { MemberRegisterBankModal } from './components/MemberRegisterBankModal';
import { UserSettingsModal } from './components/UserSettingsModal';
import { LiveBiddingRoom } from './components/LiveBiddingRoom';
import { ExtendedFinancialServicesModal } from './components/ExtendedFinancialServicesModal';
import { VietQRModal } from './components/VietQRModal';
import { ExploreHuiModal } from './components/ExploreHuiModal';
import { HuiDetailView } from './components/HuiDetailView';
import { MemberDashboardView } from './components/MemberDashboardView';
import { FinancialCalculatorView } from './components/FinancialCalculatorView';
import { DatabaseSchemaView } from './components/DatabaseSchemaView';
import { ApiSpecsView } from './components/ApiSpecsView';
import { MobileContainer } from './components/MobileContainer';
import { PlusCircle, ShieldCheck, UserCheck, Coins, Sparkles, ChevronRight, ChevronLeft, Layers, Sliders } from 'lucide-react';

export function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<'app' | 'calc' | 'db' | 'api'>('app');
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // User Auth State - Initially starts at null to force login first
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Supabase Auth Session listener
  useEffect(() => {
    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        const email = session.user.email;
        const matchedUser: User = MOCK_USERS.find(
          u => u.email?.toLowerCase() === email.toLowerCase()
        ) || {
          id: session.user.id,
          phone: session.user.phone || '0908123456',
          email: email,
          name: email.split('@')[0] || 'Hội Viên Supabase',
          role: email.includes('chuhui') ? 'chu_hui' : 'hui_vien',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified: true,
          bankName: 'MB Bank',
          accountNumber: '0908123456888',
          accountName: email.split('@')[0].toUpperCase()
        };
        setCurrentUser(matchedUser);
      }
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        const email = session.user.email;
        const matchedUser: User = MOCK_USERS.find(
          u => u.email?.toLowerCase() === email.toLowerCase()
        ) || {
          id: session.user.id,
          phone: session.user.phone || '0908123456',
          email: email,
          name: email.split('@')[0] || 'Hội Viên Supabase',
          role: email.includes('chuhui') ? 'chu_hui' : 'hui_vien',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          verified: true,
        };
        setCurrentUser(matchedUser);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Hui System Data State
  const [huiDays, setHuiDays] = useState<HuiDay[]>(MOCK_HUI_DAYS);
  const [selectedHuiDayId, setSelectedHuiDayId] = useState<string>(MOCK_HUI_DAYS[0].id);
  const [members, setMembers] = useState<HuiMember[]>(MOCK_MEMBERS);
  const [rounds, setRounds] = useState<HuiRound[]>(MOCK_ROUNDS);
  const [bids, setBids] = useState<Bid[]>(MOCK_BIDS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT_MESSAGES);

  // Extended Financial Services State
  const [p2pLoans, setP2pLoans] = useState<P2PLoan[]>(MOCK_P2P_LOANS);
  const [maturityVaults, setMaturityVaults] = useState<MaturityVault[]>(MOCK_MATURITY_VAULTS);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExploreModalOpen, setIsExploreModalOpen] = useState(false);
  const [isBankConfigModalOpen, setIsBankConfigModalOpen] = useState(false);
  const [isRegisterBankModalOpen, setIsRegisterBankModalOpen] = useState(false);
  const [isUserSettingsModalOpen, setIsUserSettingsModalOpen] = useState(false);
  const [isLiveBiddingModalOpen, setIsLiveBiddingModalOpen] = useState(false);
  const [isExtendedServicesModalOpen, setIsExtendedServicesModalOpen] = useState(false);
  const [targetBankMember, setTargetBankMember] = useState<HuiMember | undefined>(undefined);
  const [activeVietQRTx, setActiveVietQRTx] = useState<Transaction | null>(null);

  // Handlers for P2P Loans
  const handleCreateP2PLoan = (loan: Omit<P2PLoan, 'id' | 'createdAt' | 'status'>) => {
    const newLoan: P2PLoan = {
      ...loan,
      id: `p2p_${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    setP2pLoans(prev => [newLoan, ...prev]);
  };

  const handleFundP2PLoan = (loanId: string) => {
    if (!currentUser) return;
    setP2pLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const fundedAt = new Date().toISOString();
        const due = new Date();
        due.setMonth(due.getMonth() + l.termMonths);
        return {
          ...l,
          lenderId: currentUser.id,
          lenderName: currentUser.name,
          status: 'funded',
          fundedAt,
          dueDate: due.toISOString(),
        };
      }
      return l;
    }));
  };

  const handleRepayP2PLoan = (loanId: string) => {
    setP2pLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        return {
          ...l,
          status: 'repaid',
          repaidAt: new Date().toISOString(),
        };
      }
      return l;
    }));
  };

  // Handlers for Maturity Savings Vaults
  const handleCreateMaturityVault = (vault: Omit<MaturityVault, 'id' | 'completedCycles' | 'status' | 'startDate' | 'deposits'>) => {
    const newVault: MaturityVault = {
      ...vault,
      id: `vault_${Date.now()}`,
      completedCycles: 0,
      status: 'active',
      startDate: new Date().toISOString(),
      deposits: [],
    };
    setMaturityVaults(prev => [newVault, ...prev]);
  };

  const handleDepositVaultCycle = (vaultId: string, amount: number) => {
    setMaturityVaults(prev => prev.map(v => {
      if (v.id === vaultId) {
        const nextCycle = v.completedCycles + 1;
        const newRecord = {
          id: `dep_${Date.now()}`,
          cycleNumber: nextCycle,
          amount: amount,
          date: new Date().toISOString().split('T')[0],
          status: 'paid' as const,
        };
        const updatedCompleted = nextCycle;
        const isMaturedNow = updatedCompleted >= v.targetCycles;

        return {
          ...v,
          completedCycles: updatedCompleted,
          status: isMaturedNow ? ('matured' as const) : v.status,
          deposits: [...v.deposits, newRecord],
        };
      }
      return v;
    }));
  };

  const handleWithdrawMaturityVault = (vaultId: string) => {
    setMaturityVaults(prev => prev.map(v => {
      if (v.id === vaultId) {
        return {
          ...v,
          status: 'withdrawn' as const,
        };
      }
      return v;
    }));
  };

  // Update current user profile settings
  const handleUpdateUser = (updatedFields: Partial<User>) => {
    setCurrentUser(prev => prev ? {
      ...prev,
      ...updatedFields,
    } : null);

    // Sync member profile records if user updated name, phone, avatar or bank
    if (currentUser) {
      setMembers(prev => prev.map(m => {
        if (m.userId === currentUser.id) {
          return {
            ...m,
            userName: updatedFields.name || m.userName,
            userPhone: updatedFields.phone || m.userPhone,
            userAvatar: updatedFields.avatar || m.userAvatar,
            bankConfig: updatedFields.bankConfig || m.bankConfig,
          };
        }
        return m;
      }));
    }
  };

  const handleOpenRegisterBankModal = (member?: HuiMember) => {
    setTargetBankMember(member);
    setIsRegisterBankModalOpen(true);
  };

  // Save/Register Member Bank Account
  const handleRegisterMemberBank = (
    targetId: string,
    newConfig: BankConfig,
    isHostAction: boolean = false
  ) => {
    setMembers(prev => prev.map(m => {
      if (m.id === targetId || m.userId === targetId) {
        if (isHostAction) {
          return {
            ...m,
            bankConfig: newConfig,
            pendingBankConfig: undefined,
            bankApprovalStatus: 'approved' as const,
          };
        } else {
          return {
            ...m,
            pendingBankConfig: newConfig,
            bankApprovalStatus: 'pending' as const,
          };
        }
      }
      return m;
    }));

    // Update currentUser state if user registered their own
    if (currentUser && (currentUser.id === targetId || !isHostAction)) {
      setCurrentUser(prev => prev ? {
        ...prev,
        bankCode: newConfig.bankCode,
        bankName: newConfig.bankName,
        accountNumber: newConfig.accountNumber,
        accountName: newConfig.accountName,
        bankConfig: isHostAction ? newConfig : prev.bankConfig,
        pendingBankConfig: isHostAction ? undefined : newConfig,
        bankApprovalStatus: isHostAction ? 'approved' : 'pending',
      } : null);
    }

    // Add automated system notice to group chat
    const targetMember = members.find(m => m.id === targetId || m.userId === targetId);
    const memberName = targetMember?.userName || currentUser?.name || 'Hội viên';
    const noticeMsg = isHostAction
      ? `Chủ Hụi đã cập nhật/phê duyệt tài khoản ngân hàng nhận tiền cho hội viên ${memberName} (${newConfig.bankCode} - ${newConfig.accountNumber}).`
      : `Hội viên ${memberName} đã gửi đăng ký/thay đổi tài khoản ngân hàng nhận tiền (${newConfig.bankCode}). Đang chờ Chủ Hụi phê duyệt.`;

    const chatMsg: ChatMessage = {
      id: `msg_bank_${Date.now()}`,
      huiDayId: selectedHuiDayId,
      senderId: 'sys',
      senderName: 'Hệ Thống Sổ Hụi',
      senderRole: 'system',
      message: noticeMsg,
      timestamp: new Date().toISOString(),
      type: 'system_alert',
    };
    setChatMessages(prev => [...prev, chatMsg]);
  };

  // Host approves member bank account
  const handleApproveMemberBank = (memberId: string) => {
    let approvedMemberName = '';
    setMembers(prev => prev.map(m => {
      if (m.id === memberId && m.pendingBankConfig) {
        approvedMemberName = m.userName;
        return {
          ...m,
          bankConfig: m.pendingBankConfig,
          pendingBankConfig: undefined,
          bankApprovalStatus: 'approved',
        };
      }
      return m;
    }));

    const chatMsg: ChatMessage = {
      id: `msg_approve_bank_${Date.now()}`,
      huiDayId: selectedHuiDayId,
      senderId: 'sys',
      senderName: 'Hệ Thống Sổ Hụi',
      senderRole: 'system',
      message: `Chủ Hụi đã phê duyệt thành công tài khoản ngân hàng nhận tiền hốt hụi cho hội viên ${approvedMemberName || 'hội viên'}.`,
      timestamp: new Date().toISOString(),
      type: 'system_alert',
    };
    setChatMessages(prev => [...prev, chatMsg]);
  };

  // Host rejects member bank account
  const handleRejectMemberBank = (memberId: string) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        return {
          ...m,
          pendingBankConfig: undefined,
          bankApprovalStatus: 'rejected',
        };
      }
      return m;
    }));
  };

  // Save Bank Account Config for Host
  const handleSaveBankConfig = (newBankConfig: BankConfig) => {
    // Update currentUser profile
    setCurrentUser(prev => prev ? {
      ...prev,
      bankName: newBankConfig.bankName,
      accountNumber: newBankConfig.accountNumber,
      accountName: newBankConfig.accountName,
    } : null);

    // Update bankConfig in huiDays state for active day or days hosted by this user
    setHuiDays(prev => prev.map(day => {
      if (day.id === selectedHuiDayId || day.hostId === currentUser?.id) {
        return {
          ...day,
          bankConfig: newBankConfig,
        };
      }
      return day;
    }));
  };

  // Feature toggle handler for Host (Chủ Hụi)
  const handleToggleHuiFeature = (huiDayId: string, feature: 'p2p' | 'vault', enabled: boolean) => {
    setHuiDays(prev => prev.map(day => {
      if (day.id === huiDayId) {
        return {
          ...day,
          allowP2pLending: feature === 'p2p' ? enabled : (day.allowP2pLending !== false),
          allowMaturityVault: feature === 'vault' ? enabled : (day.allowMaturityVault !== false),
        };
      }
      return day;
    }));

    const featureName = feature === 'p2p' ? 'Cho Vay Ngang Hàng (P2P)' : 'Góp Hũ Tích Lũy Mãn Hạn';
    const statusText = enabled ? 'MỞ MẠNG HOẠT ĐỘNG' : 'TẠM ĐÓNG';

    const chatMsg: ChatMessage = {
      id: `msg_toggle_${Date.now()}`,
      huiDayId: huiDayId,
      senderId: 'sys',
      senderName: 'Hệ Thống Sổ Hụi',
      senderRole: 'system',
      message: `📢 THÔNG BÁO CHỦ HỤI: Chức năng [${featureName}] đã được Chủ Hụi chuyển sang trạng thái: ${statusText}.`,
      timestamp: new Date().toISOString(),
      type: 'system_alert',
    };
    setChatMessages(prev => [...prev, chatMsg]);
  };

  // Ref for Carousel Scroll
  const huiCarouselRef = useRef<HTMLDivElement>(null);

  const scrollHuiCarousel = (direction: 'left' | 'right') => {
    if (huiCarouselRef.current) {
      const scrollAmount = 260;
      huiCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // IF NOT LOGGED IN -> SHOW LOGIN SCREEN FIRST
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Active Selected Hui Day
  const activeHuiDay = huiDays.find(d => d.id === selectedHuiDayId) || huiDays[0] || MOCK_HUI_DAYS[0];

  // Filtered relations for active Hui Day
  const activeMembers = activeHuiDay ? members.filter(m => m.huiDayId === activeHuiDay.id) : [];
  const activeRounds = activeHuiDay ? rounds.filter(r => r.huiDayId === activeHuiDay.id) : [];
  const activeBids = activeHuiDay ? bids.filter(b => b.huiDayId === activeHuiDay.id && b.roundId === `round_bt_${activeHuiDay.currentRound}`) : [];
  const activeTransactions = activeHuiDay ? transactions.filter(t => t.huiDayId === activeHuiDay.id && t.roundId === `round_bt_${activeHuiDay.currentRound - 1 || 1}`) : [];
  const activeChatMessages = activeHuiDay ? chatMessages.filter(c => c.huiDayId === activeHuiDay.id) : [];

  // Switch Role
  const handleSwitchRole = (role: UserRole) => {
    if (role === 'chu_hui') {
      setCurrentUser(MOCK_USERS[0]);
    } else {
      setCurrentUser(MOCK_USERS[1]);
    }
  };

  // Create New Hui Day
  const handleCreateHuiDay = (newDay: HuiDay) => {
    setHuiDays([newDay, ...huiDays]);
    setSelectedHuiDayId(newDay.id);

    // Initial Host Member
    const hostMember: HuiMember = {
      id: `m_${Date.now()}`,
      huiDayId: newDay.id,
      userId: newDay.hostId,
      userName: newDay.hostName,
      userPhone: newDay.hostPhone,
      userAvatar: currentUser.avatar,
      sharesCount: 1,
      hasPayout: false,
      payoutRound: null,
      joinedAt: new Date().toISOString(),
      status: 'approved',
    };
    setMembers([hostMember, ...members]);

    // Initial Round 1
    const initialRound: HuiRound = {
      id: `round_${newDay.id}_1`,
      huiDayId: newDay.id,
      roundNumber: 1,
      openDate: new Date().toISOString(),
      bidCloseTime: new Date(Date.now() + 86400000).toISOString(),
      paymentDueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
      status: 'bidding',
      winningBidAmount: null,
      winnerMemberId: null,
      winnerUserId: null,
      winnerUserName: null,
      totalDeadShares: 0,
      totalLiveShares: newDay.totalShares,
      deadContributionPerShare: newDay.shareAmount,
      liveContributionPerShare: 0,
      hostCommission: 0,
      winnerGrossPayout: 0,
      winnerNetPayout: 0,
    };
    setRounds([initialRound, ...rounds]);

    // Initial System Message
    const welcomeMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      huiDayId: newDay.id,
      senderId: 'system',
      senderName: 'Hệ Thống Sổ Hụi',
      senderRole: 'system',
      message: `Dây hụi "${newDay.name}" đã được khởi tạo thành công bởi Chủ Hụi ${newDay.hostName}. Mã mời: ${newDay.inviteCode}.`,
      timestamp: new Date().toISOString(),
      type: 'system_alert',
    };
    setChatMessages([welcomeMsg, ...chatMessages]);
  };

  // Submit Bid
  const handleSubmitBid = (bidAmount: number) => {
    const currentMember = activeMembers.find(m => m.userId === currentUser.id) || activeMembers[0];
    const newBid: Bid = {
      id: `bid_${Date.now()}`,
      roundId: `round_bt_${activeHuiDay.currentRound}`,
      huiDayId: activeHuiDay.id,
      memberId: currentMember.id,
      userId: currentUser.id,
      userName: currentUser.name,
      bidAmount,
      submittedAt: new Date().toISOString(),
      status: 'active',
    };

    setBids([newBid, ...bids]);

    // Chat notification
    const bidChat: ChatMessage = {
      id: `chat_${Date.now()}`,
      huiDayId: activeHuiDay.id,
      senderId: 'system',
      senderName: 'Hệ Thống Sổ Hụi',
      senderRole: 'system',
      message: `Hội viên ${currentUser.name} vừa nộp thăm bí mật cho Kỳ ${activeHuiDay.currentRound}.`,
      timestamp: new Date().toISOString(),
      type: 'bid_notice',
    };
    setChatMessages([...chatMessages, bidChat]);
  };

  // Finalize Round & Run Financial Calculation Algorithm
  const handleFinalizeRound = (winningBidAmount: number, winnerMemberId: string) => {
    const winnerMember = activeMembers.find(m => m.id === winnerMemberId) || activeMembers[0];

    // Calculate R payout
    const calc = calculateRoundPayout(
      activeHuiDay.shareAmount,
      winningBidAmount,
      activeHuiDay.totalShares,
      activeHuiDay.currentRound,
      activeMembers,
      activeHuiDay.feeType,
      activeHuiDay.feeValue
    );

    // Update Winner Member status to Dead Hui
    const updatedMembers = members.map(m => {
      if (m.id === winnerMember.id) {
        return {
          ...m,
          hasPayout: true,
          payoutRound: activeHuiDay.currentRound,
        };
      }
      return m;
    });
    setMembers(updatedMembers);

    // Generate Transactions for all shares for this round
    const newTxList: Transaction[] = activeMembers.map((m) => {
      const isDead = m.hasPayout && m.payoutRound !== null && m.payoutRound < activeHuiDay.currentRound;
      const amountDue = isDead ? activeHuiDay.shareAmount : (activeHuiDay.shareAmount - winningBidAmount);
      const refCode = `HUI ${activeHuiDay.inviteCode} K${activeHuiDay.currentRound} ${m.userName.toUpperCase().replace(/\s+/g, '')}`;
      const vietqrCodeUrl = generateVietQRUrl(
        activeHuiDay.bankConfig.bankCode,
        activeHuiDay.bankConfig.accountNumber,
        activeHuiDay.bankConfig.accountName,
        amountDue,
        refCode
      );

      return {
        id: `tx_${Date.now()}_${m.id}`,
        roundId: `round_bt_${activeHuiDay.currentRound}`,
        huiDayId: activeHuiDay.id,
        memberId: m.id,
        userId: m.userId,
        userName: m.userName,
        sharesCount: m.sharesCount,
        isDeadHui: isDead,
        amountDue,
        status: 'unpaid',
        vietqrCode: vietqrCodeUrl,
        paymentRef: refCode,
        createdAt: new Date().toISOString(),
      };
    });

    setTransactions([...newTxList, ...transactions]);

    // Update Round Result
    const updatedRounds = rounds.map(r => {
      if (r.huiDayId === activeHuiDay.id && r.roundNumber === activeHuiDay.currentRound) {
        return {
          ...r,
          status: 'completed' as const,
          winningBidAmount,
          winnerMemberId: winnerMember.id,
          winnerUserId: winnerMember.userId,
          winnerUserName: winnerMember.userName,
          totalDeadShares: calc.totalDeadShares,
          totalLiveShares: calc.totalLiveShares,
          deadContributionPerShare: activeHuiDay.shareAmount,
          liveContributionPerShare: activeHuiDay.shareAmount - winningBidAmount,
          hostCommission: calc.calculatedFee,
          winnerGrossPayout: calc.grossCollected,
          winnerNetPayout: calc.netPayoutR,
        };
      }
      return r;
    });
    setRounds(updatedRounds);

    // Increment current round
    const updatedDays = huiDays.map(d => {
      if (d.id === activeHuiDay.id) {
        return { ...d, currentRound: d.currentRound + 1 };
      }
      return d;
    });
    setHuiDays(updatedDays);

    // Broadcast Chat Payout Notice
    const payoutMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      huiDayId: activeHuiDay.id,
      senderId: 'system',
      senderName: 'Hệ Thống Sổ Hụi',
      senderRole: 'system',
      message: `Kỳ ${activeHuiDay.currentRound} đã chốt: ${winnerMember.userName} hốt nộp thăm ${formatVND(winningBidAmount)}. Thực nhận R = ${formatVND(calc.netPayoutR)}. Sổ gạch nợ VietQR đã được tạo!`,
      timestamp: new Date().toISOString(),
      type: 'payout_notice',
    };
    setChatMessages([...chatMessages, payoutMsg]);
  };

  // Confirm Paid
  const handleConfirmPaid = (txId: string) => {
    setTransactions(transactions.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'pending_approval' as const, paidAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  // Approve Transaction
  const handleApproveTransaction = (txId: string) => {
    setTransactions(transactions.map(t => {
      if (t.id === txId) {
        return { ...t, status: 'confirmed' as const, confirmedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  // Send Chat
  const handleSendMessage = (msgText: string) => {
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      huiDayId: activeHuiDay.id,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      message: msgText,
      timestamp: new Date().toISOString(),
      type: 'text',
    };
    setChatMessages([...chatMessages, newMsg]);
  };

  // Member Join Requests & Approval Handlers
  const handleRequestJoinHui = (
    huiDayId: string, 
    sharesCount: number, 
    note?: string,
    idCardNumber?: string,
    idCardFrontUrl?: string,
    idCardBackUrl?: string,
    kycStatus?: 'verified' | 'pending_verification' | 'unverified'
  ) => {
    if (!currentUser) return;
    const existing = members.find(m => m.huiDayId === huiDayId && m.userId === currentUser.id);
    if (existing) {
      if (existing.status === 'approved') {
        alert('Bạn đã là hội viên chính thức của dây hụi này rồi!');
        return;
      }
      setMembers(members.map(m => m.id === existing.id ? { 
        ...m, 
        sharesCount, 
        note, 
        status: 'pending', 
        joinedAt: new Date().toISOString(),
        idCardNumber: idCardNumber || m.idCardNumber,
        idCardFrontUrl: idCardFrontUrl || m.idCardFrontUrl,
        idCardBackUrl: idCardBackUrl || m.idCardBackUrl,
        kycStatus: kycStatus || m.kycStatus || 'verified'
      } : m));
      return;
    }

    const newMember: HuiMember = {
      id: `m_${Date.now()}_${currentUser.id}`,
      huiDayId,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      userAvatar: currentUser.avatar,
      sharesCount,
      hasPayout: false,
      payoutRound: null,
      joinedAt: new Date().toISOString(),
      status: 'pending',
      note,
      idCardNumber: idCardNumber || '079203001888',
      idCardFrontUrl: idCardFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      idCardBackUrl: idCardBackUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80',
      kycStatus: kycStatus || 'verified'
    };

    setMembers([newMember, ...members]);
  };

  const handleCancelJoinRequest = (memberId: string) => {
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleApproveMember = (memberId: string) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, status: 'approved' } : m));
  };

  const handleRejectMember = (memberId: string) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, status: 'rejected' } : m));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        activeView={activeView}
        onChangeView={setActiveView}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenExploreModal={() => setIsExploreModalOpen(true)}
        onOpenBankConfigModal={() => setIsBankConfigModalOpen(true)}
        onOpenUserSettingsModal={() => setIsUserSettingsModalOpen(true)}
        onOpenLiveBiddingModal={() => setIsLiveBiddingModalOpen(true)}
        onOpenExtendedServicesModal={() => setIsExtendedServicesModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={async () => {
          await supabase.auth.signOut();
          setCurrentUser(null);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'app' ? (
          <MobileContainer isMobileFrame={isMobileFrame}>
            
            {/* Hui Day Selector Toolbar Container with Left / Right Scroll Controls */}
            <div className="mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                  <Coins className="h-4 w-4 text-amber-400" />
                  <span>Thanh Dây Hụi Đang Tham Gia ({huiDays.length} Dây)</span>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 hidden sm:inline-block">
                    Nhấn nút hoặc kéo ngang để xem
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => scrollHuiCarousel('left')}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-all shadow"
                    title="Kéo sang trái"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollHuiCarousel('right')}
                    className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-all shadow"
                    title="Kéo sang phải"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Carousel Track */}
              <div 
                ref={huiCarouselRef}
                className="flex items-center space-x-3 overflow-x-auto pb-1.5 pt-1 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-slate-950 snap-x snap-mandatory"
              >
                {huiDays.map((day) => {
                  const isSelected = day.id === selectedHuiDayId;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedHuiDayId(day.id)}
                      className={`p-3 rounded-xl border text-left transition-all shrink-0 min-w-[240px] sm:min-w-[270px] flex items-center space-x-3 snap-start ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                        <Coins className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs block text-slate-100 truncate max-w-[150px]">{day.name}</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            {getCycleTypeLabel(day.cycleType, day.cycleDays)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] mt-0.5">
                          <span className="text-amber-400 font-mono font-bold">{formatVND(day.shareAmount)}/phần</span>
                          <span className="text-slate-500 font-mono">Kỳ {day.currentRound}/{day.totalShares}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Role Perspective Workspace Header & Switcher */}
            <div className={`mb-6 rounded-2xl p-4 sm:p-5 border transition-all shadow-xl ${
              currentUser.role === 'chu_hui'
                ? 'bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/40 shadow-emerald-950/20'
                : 'bg-gradient-to-r from-slate-900 via-blue-950/40 to-slate-900 border-blue-500/40 shadow-blue-950/20'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Mode Indicator & Title */}
                <div className="flex items-start space-x-3">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    currentUser.role === 'chu_hui'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {currentUser.role === 'chu_hui' ? <ShieldCheck className="h-6 w-6" /> : <UserCheck className="h-6 w-6" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        currentUser.role === 'chu_hui'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      }`}>
                        ● {currentUser.role === 'chu_hui' ? 'GIAO DIỆN CHỦ HỤI (HOST ADMIN)' : 'GIAO DIỆN HỘI VIÊN (MEMBER PORTAL)'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                        • {currentUser.name} ({currentUser.phone})
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-white">
                      {currentUser.role === 'chu_hui' 
                        ? 'Trung Tâm Quản Trị Chủ Hụi & Sổ Sách Tài Chính Total' 
                        : 'Cổng Thông Tin Hội Viên Cá Nhân & Ví Hụi Trực Tuyến'}
                    </h3>

                    <p className="text-xs text-slate-300">
                      {currentUser.role === 'chu_hui'
                        ? 'Chuyên biệt cho Chủ Hụi: Duyệt gạch nợ VietQR, chốt thăm hụi, kiểm tra eKYC hội viên & quản lý danh sách dây hụi.'
                        : 'Chuyên biệt cho Hội Viên: Đấu thăm bí mật, nhận mã VietQR đóng tiền, tính toán lợi nhuận thực nhận & xem sổ công khai.'}
                    </p>
                  </div>
                </div>

                {/* Role Switcher Controls */}
                <div className="flex items-center space-x-2 shrink-0 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-end md:self-center">
                  <button
                    onClick={() => handleSwitchRole('chu_hui')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentUser.role === 'chu_hui'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Giao Diện Chủ Hụi</span>
                  </button>

                  <button
                    onClick={() => handleSwitchRole('hui_vien')}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      currentUser.role === 'hui_vien'
                        ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Giao Diện Hội Viên</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Active View based on User Role */}
            {currentUser.role === 'hui_vien' ? (
              <MemberDashboardView
                huiDay={activeHuiDay}
                currentUser={currentUser}
                members={activeMembers}
                rounds={activeRounds}
                bids={activeBids}
                transactions={activeTransactions}
                chatMessages={activeChatMessages}
                onOpenVietQR={(tx) => setActiveVietQRTx(tx)}
                onSubmitBid={handleSubmitBid}
                onSendMessage={handleSendMessage}
                onOpenExploreModal={() => setIsExploreModalOpen(true)}
                onOpenBankConfigModal={() => setIsBankConfigModalOpen(true)}
                onOpenRegisterBankModal={handleOpenRegisterBankModal}
                onOpenLiveBiddingModal={() => setIsLiveBiddingModalOpen(true)}
                onOpenExtendedServicesModal={() => setIsExtendedServicesModalOpen(true)}
              />
            ) : (
              <HuiDetailView
                huiDay={activeHuiDay}
                currentUser={currentUser}
                members={activeMembers}
                rounds={activeRounds}
                bids={activeBids}
                transactions={activeTransactions}
                chatMessages={activeChatMessages}
                onOpenVietQR={(tx) => setActiveVietQRTx(tx)}
                onSubmitBid={handleSubmitBid}
                onFinalizeRound={handleFinalizeRound}
                onApproveTransaction={handleApproveTransaction}
                onSendMessage={handleSendMessage}
                onApproveMember={handleApproveMember}
                onRejectMember={handleRejectMember}
                onOpenBankConfigModal={() => setIsBankConfigModalOpen(true)}
                onOpenRegisterBankModal={handleOpenRegisterBankModal}
                onOpenLiveBiddingModal={() => setIsLiveBiddingModalOpen(true)}
                onOpenExtendedServicesModal={() => setIsExtendedServicesModalOpen(true)}
                onApproveMemberBank={handleApproveMemberBank}
                onRejectMemberBank={handleRejectMemberBank}
                onToggleHuiFeature={handleToggleHuiFeature}
              />
            )}

          </MobileContainer>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <FinancialCalculatorView />
          </div>
        )}
      </main>

      {/* Modals */}
      <ExploreHuiModal
        isOpen={isExploreModalOpen}
        onClose={() => setIsExploreModalOpen(false)}
        huiDays={huiDays}
        members={members}
        currentUser={currentUser}
        onRequestJoin={handleRequestJoinHui}
        onCancelRequest={handleCancelJoinRequest}
        onSelectHuiDay={(id) => setSelectedHuiDayId(id)}
      />

      <PhoneAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      <CreateHuiModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        currentUser={currentUser}
        onCreateHuiDay={handleCreateHuiDay}
      />

      <BankConfigModal
        isOpen={isBankConfigModalOpen}
        onClose={() => setIsBankConfigModalOpen(false)}
        currentUser={currentUser}
        currentBankConfig={activeHuiDay?.bankConfig}
        onSaveBankConfig={handleSaveBankConfig}
      />

      {currentUser && (
        <>
          <MemberRegisterBankModal
            isOpen={isRegisterBankModalOpen}
            onClose={() => setIsRegisterBankModalOpen(false)}
            currentUser={currentUser}
            targetMember={targetBankMember}
            onRegisterBank={handleRegisterMemberBank}
          />

          <UserSettingsModal
            isOpen={isUserSettingsModalOpen}
            onClose={() => setIsUserSettingsModalOpen(false)}
            currentUser={currentUser}
            onUpdateUser={handleUpdateUser}
          />

          {activeHuiDay && (
            <LiveBiddingRoom
              isOpen={isLiveBiddingModalOpen}
              onClose={() => setIsLiveBiddingModalOpen(false)}
              huiDay={activeHuiDay}
              currentRound={activeRounds.find(r => r.roundNumber === activeHuiDay.currentRound) || activeRounds[activeRounds.length - 1]}
              members={activeMembers}
              bids={activeBids}
              currentUser={currentUser}
              onSubmitBid={handleSubmitBid}
              onFinalizeRound={(roundId, amount, winnerId) => {
                handleFinalizeRound(amount, winnerId);
              }}
            />
          )}

          <ExtendedFinancialServicesModal
            isOpen={isExtendedServicesModalOpen}
            onClose={() => setIsExtendedServicesModalOpen(false)}
            currentUser={currentUser}
            huiDays={huiDays}
            p2pLoans={p2pLoans}
            maturityVaults={maturityVaults}
            activeHuiDay={activeHuiDay}
            onToggleHuiFeature={handleToggleHuiFeature}
            onCreateP2PLoan={handleCreateP2PLoan}
            onFundP2PLoan={handleFundP2PLoan}
            onRepayP2PLoan={handleRepayP2PLoan}
            onCreateMaturityVault={handleCreateMaturityVault}
            onDepositVaultCycle={handleDepositVaultCycle}
            onWithdrawMaturityVault={handleWithdrawMaturityVault}
          />
        </>
      )}

      <VietQRModal
        isOpen={!!activeVietQRTx}
        onClose={() => setActiveVietQRTx(null)}
        transaction={activeVietQRTx}
        bankName={activeHuiDay.bankConfig.bankName}
        bankCode={activeHuiDay.bankConfig.bankCode}
        accountNumber={activeHuiDay.bankConfig.accountNumber}
        accountName={activeHuiDay.bankConfig.accountName}
        onConfirmPaid={handleConfirmPaid}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 Quản Lý & Chơi Hụi Trực Tuyến - Thuật toán tài chính chuẩn xác & VietQR Napas247 Realtime.</p>
        </div>
      </footer>

    </div>
  );
}

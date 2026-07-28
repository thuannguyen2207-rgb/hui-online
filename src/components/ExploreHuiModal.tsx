import React, { useState } from 'react';
import { HuiDay, HuiMember, User, CycleType } from '../types';
import { formatVND, getCycleTypeLabel } from '../utils/huiFinancialEngine';
import { ElectronicContractModal, ContractActionContext } from './ElectronicContractModal';
import { 
  Search, 
  Coins, 
  Users, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  UserPlus, 
  X, 
  Calendar, 
  Percent, 
  ChevronRight,
  Send,
  Sparkles,
  Info,
  FileCheck,
  Camera,
  Upload,
  Lock,
  BadgeCheck,
  FileText
} from 'lucide-react';

interface ExploreHuiModalProps {
  isOpen: boolean;
  onClose: () => void;
  huiDays: HuiDay[];
  members: HuiMember[];
  currentUser: User;
  onRequestJoin: (
    huiDayId: string, 
    sharesCount: number, 
    note?: string,
    idCardNumber?: string,
    idCardFrontUrl?: string,
    idCardBackUrl?: string,
    kycStatus?: 'verified' | 'pending_verification' | 'unverified'
  ) => void;
  onCancelRequest: (memberId: string) => void;
  onSelectHuiDay: (huiDayId: string) => void;
}

export const ExploreHuiModal: React.FC<ExploreHuiModalProps> = ({
  isOpen,
  onClose,
  huiDays,
  members,
  currentUser,
  onRequestJoin,
  onCancelRequest,
  onSelectHuiDay,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'recruiting' | 'joined'>('all');
  const [cycleFilter, setCycleFilter] = useState<'all' | 'daily' | 'weekly' | 'ten_days' | 'half_month' | 'monthly'>('all');

  // Modal state for sending join request
  const [requestingHui, setRequestingHui] = useState<HuiDay | null>(null);
  const [requestStep, setRequestStep] = useState<1 | 2>(1); // Step 1: Shares & Note -> Step 2: Identity Verification (eKYC)
  const [sharesCount, setSharesCount] = useState<number>(1);
  const [joinNote, setJoinNote] = useState<string>('');

  // Step 2 eKYC Form State
  const [idCardNumber, setIdCardNumber] = useState<string>(currentUser.idCardNumber || '079203001888');
  const [frontImage, setFrontImage] = useState<string>(
    currentUser.idCardFrontUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
  );
  const [backImage, setBackImage] = useState<string>(
    currentUser.idCardBackUrl || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80'
  );
  const [isCapturingFace, setIsCapturingFace] = useState(false);
  const [faceVerified, setFaceVerified] = useState(true);

  const [successMsg, setSuccessMsg] = useState<string>('');
  const [pendingContract, setPendingContract] = useState<{
    context: ContractActionContext;
    onConfirm: () => void;
  } | null>(null);

  if (!isOpen) return null;

  // Filter Hụi Days
  const filteredHuiDays = huiDays.filter(day => {
    // Search filter
    const matchesSearch = 
      day.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      day.inviteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      day.hostName.toLowerCase().includes(searchTerm.toLowerCase());

    // Cycle filter
    if (cycleFilter !== 'all' && day.cycleType !== cycleFilter) {
      return false;
    }

    // Tab filter
    if (activeTab === 'recruiting') {
      return matchesSearch && day.status === 'recruiting';
    }
    if (activeTab === 'joined') {
      const isMember = members.some(m => m.huiDayId === day.id && m.userId === currentUser.id && m.status === 'approved');
      const isHost = day.hostId === currentUser.id;
      return matchesSearch && (isMember || isHost);
    }
    return matchesSearch;
  });

  // Handle Step 1 -> Go to Step 2 Identity Verification
  const handleGoToIdentityStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingHui) return;
    setRequestStep(2);
  };

  // Handle Final Submit with eKYC Data
  const handleFinalSubmitWithKyc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestingHui) return;

    if (!idCardNumber.trim() || idCardNumber.length < 9) {
      alert('Vui lòng nhập đúng số Căn Cước Công Dân (12 số) hoặc CMND.');
      return;
    }

    setPendingContract({
      context: {
        title: 'HỢP ĐỒNG ĐIỆN TỬ ĐĂNG KÝ THAM GIA DÂY HỤI',
        actionType: 'hui_join',
        partnerName: 'Công Ty Quản Lý Tín Dụng & Ngân Hàng Liên Kết (Bên Thứ Ba)',
        summaryText: `Đăng ký ${sharesCount} phần dây hụi '${requestingHui.name}' (Mã dây: ${requestingHui.inviteCode}). Số tiền/kỳ: ${(requestingHui.shareAmount * sharesCount).toLocaleString('vi-VN')} đ`,
        amount: requestingHui.shareAmount * sharesCount,
      },
      onConfirm: () => {
        onRequestJoin(
          requestingHui.id, 
          sharesCount, 
          joinNote,
          idCardNumber.trim(),
          frontImage,
          backImage,
          'verified'
        );
        
        setSuccessMsg(`Đã ký hợp đồng & gửi hồ sơ xác minh eKYC đăng ký ${sharesCount} phần dây "${requestingHui.name}". Vui lòng chờ Chủ Hụi duyệt!`);
        
        setTimeout(() => {
          setSuccessMsg('');
          setRequestingHui(null);
          setRequestStep(1);
          setSharesCount(1);
          setJoinNote('');
        }, 2000);
      }
    });
  };

  // Direct Join By Invite Code
  const handleSearchInviteCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;

    const matchedDay = huiDays.find(d => d.inviteCode.toLowerCase() === inviteCodeInput.trim().toLowerCase());
    if (matchedDay) {
      setRequestingHui(matchedDay);
      setInviteCodeInput('');
    } else {
      alert(`Không tìm thấy dây hụi nào khớp với mã "${inviteCodeInput.trim()}"`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-amber-500/30 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-6 relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Coins className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
                <span>Khám Phá & Xin Tham Gia Dây Hụi</span>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Hệ Thống Duyệt
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tìm kiếm dây hụi mở, nhập mã giới thiệu và gửi yêu cầu đăng ký cho Chủ Hụi duyệt
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Invite Code Input Bar */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-b border-slate-800 space-y-3 shrink-0">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="md:col-span-7 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên dây hụi, tên chủ hụi..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white text-xs sm:text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Direct Invite Code Input */}
            <form onSubmit={handleSearchInviteCode} className="md:col-span-5 flex items-center space-x-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                <input
                  type="text"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  placeholder="Nhập Mã Giới Thiệu (VD: BENTHANH10M)"
                  className="w-full bg-slate-950 border border-amber-500/40 rounded-xl pl-10 pr-3 py-2 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shrink-0"
              >
                Nhập Mã
              </button>
            </form>

          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex flex-col space-y-2 pt-1">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Tất Cả ({huiDays.length})
              </button>

              <button
                onClick={() => setActiveTab('recruiting')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'recruiting'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Đang Chiêu Mộ ({huiDays.filter(d => d.status === 'recruiting').length})
              </button>

              <button
                onClick={() => setActiveTab('joined')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'joined'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                Dây Hụi Của Tôi
              </button>
            </div>

            {/* Cycle Type Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0 mr-1">Chu kỳ:</span>
              
              <button
                type="button"
                onClick={() => setCycleFilter('all')}
                className={`px-2.5 py-1 rounded-md font-bold shrink-0 transition-all ${
                  cycleFilter === 'all'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Tất Cả Loại
              </button>

              <button
                type="button"
                onClick={() => setCycleFilter('daily')}
                className={`px-2.5 py-1 rounded-md font-bold shrink-0 transition-all ${
                  cycleFilter === 'daily'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Hụi Ngày
              </button>

              <button
                type="button"
                onClick={() => setCycleFilter('weekly')}
                className={`px-2.5 py-1 rounded-md font-bold shrink-0 transition-all ${
                  cycleFilter === 'weekly'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Hụi Tuần
              </button>

              <button
                type="button"
                onClick={() => setCycleFilter('ten_days')}
                className={`px-2.5 py-1 rounded-md font-bold shrink-0 transition-all ${
                  cycleFilter === 'ten_days'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Hụi 10 Ngày
              </button>

              <button
                type="button"
                onClick={() => setCycleFilter('half_month')}
                className={`px-2.5 py-1 rounded-md font-bold shrink-0 transition-all ${
                  cycleFilter === 'half_month'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Hụi Nửa Tháng
              </button>

              <button
                type="button"
                onClick={() => setCycleFilter('monthly')}
                className={`px-2.5 py-1 rounded-md font-bold shrink-0 transition-all ${
                  cycleFilter === 'monthly'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                Hụi 1 Tháng
              </button>
            </div>
          </div>

        </div>

        {/* Hụi Days List Cards Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {filteredHuiDays.length === 0 ? (
            <div className="text-center py-12 space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800">
              <Coins className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-sm text-slate-400 font-medium">Không tìm thấy dây hụi nào phù hợp</p>
              <p className="text-xs text-slate-500">Thử chọn chu kỳ khác hoặc nhập từ khóa tìm kiếm</p>
            </div>
          ) : (
            filteredHuiDays.map((day) => {
              // Find member status for currentUser in this HuiDay
              const memberRecord = members.find(m => m.huiDayId === day.id && m.userId === currentUser.id);
              const isHost = day.hostId === currentUser.id;
              
              // Count approved members & shares
              const approvedMembers = members.filter(m => m.huiDayId === day.id && m.status === 'approved');
              const totalOccupiedShares = approvedMembers.reduce((sum, m) => sum + m.sharesCount, 0);

              return (
                <div 
                  key={day.id}
                  className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 sm:p-5 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  
                  {/* Left Info */}
                  <div className="space-y-2 max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-extrabold text-white">{day.name}</span>
                      
                      {day.status === 'recruiting' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Chiêu Mộ
                        </span>
                      )}

                      {day.status === 'active' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Đang Hoạt Động (Kỳ {day.currentRound}/{day.totalShares})
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 bg-slate-900 border border-slate-800">
                        Mã: {day.inviteCode}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2">{day.description}</p>

                    {/* Financial Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 block text-[10px]">Mức Đóng (V):</span>
                        <strong className="text-amber-400 font-mono">{formatVND(day.shareAmount)}</strong>
                      </div>

                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 block text-[10px]">Chu Kỳ:</span>
                        <strong className="text-white">
                          {getCycleTypeLabel(day.cycleType, day.cycleDays)}
                        </strong>
                      </div>

                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 block text-[10px]">Tổng Số Phần (N):</span>
                        <strong className="text-white">{day.totalShares} phần</strong>
                      </div>

                      <div className="p-2 bg-slate-900 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 block text-[10px]">Chủ Hụi:</span>
                        <strong className="text-emerald-400 truncate block">{day.hostName}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Status Badges */}
                  <div className="flex flex-col items-start md:items-end justify-between space-y-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-900">
                    
                    {/* User Membership Status Indicator */}
                    {isHost ? (
                      <div className="text-right space-y-1">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/40">
                          <ShieldCheck className="h-4 w-4" />
                          <span>Bạn Là Chủ Hụi</span>
                        </span>
                        <button
                          onClick={() => {
                            onSelectHuiDay(day.id);
                            onClose();
                          }}
                          className="block text-xs text-amber-400 hover:underline font-semibold pt-1"
                        >
                          Vào Quản Lý Sổ Hụi →
                        </button>
                      </div>
                    ) : memberRecord?.status === 'approved' ? (
                      <div className="text-right space-y-1">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/40">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Đã Là Hội Viên ({memberRecord.sharesCount} phần)</span>
                        </span>
                        <button
                          onClick={() => {
                            onSelectHuiDay(day.id);
                            onClose();
                          }}
                          className="block text-xs text-emerald-400 hover:underline font-semibold pt-1"
                        >
                          Vào Đấu Hụi & Đóng Tiền →
                        </button>
                      </div>
                    ) : memberRecord?.status === 'pending' ? (
                      <div className="text-right space-y-2">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/30">
                          <Clock className="h-4 w-4 animate-spin text-amber-400" />
                          <span>Đang Chờ Chủ Hụi Duyệt ({memberRecord.sharesCount} phần)</span>
                        </span>
                        <button
                          onClick={() => onCancelRequest(memberRecord.id)}
                          className="block text-xs text-rose-400 hover:underline font-medium text-right"
                        >
                          Hủy Yêu Cầu Xin Tham Gia
                        </button>
                      </div>
                    ) : memberRecord?.status === 'rejected' ? (
                      <div className="text-right space-y-2">
                        <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/30">
                          <XCircle className="h-4 w-4" />
                          <span>Chủ Hụi Đã Từ Chối</span>
                        </span>
                        <button
                          onClick={() => setRequestingHui(day)}
                          className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all block"
                        >
                          Gửi Lại Yêu Cầu
                        </button>
                      </div>
                    ) : (
                      /* Not joined yet -> Show Xin Gia Nhập Button */
                      <button
                        onClick={() => setRequestingHui(day)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all active:scale-95"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Xin Gia Nhập Dây Hụi</span>
                      </button>
                    )}

                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* SUB-MODAL FORM: SUBMIT JOIN REQUEST & EKYC */}
        {requestingHui && (
          <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-amber-500/50 w-full max-w-lg rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
              
              {/* Header */}
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Xin Gia Nhập Dây Hụi</h3>
                    <p className="text-[11px] text-slate-400">
                      {requestStep === 1 ? 'Bước 1/2: Chọn số phần đăng ký' : 'Bước 2/2: Xác minh danh tính eKYC (Bắt buộc)'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setRequestingHui(null);
                    setRequestStep(1);
                  }}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-950 border border-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {successMsg ? (
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-extrabold text-emerald-300">Gửi Hồ Sơ Thành Công!</h4>
                  <p className="text-xs text-emerald-200/80">{successMsg}</p>
                </div>
              ) : requestStep === 1 ? (
                /* STEP 1 FORM: Shares & Note */
                <form onSubmit={handleGoToIdentityStep} className="space-y-4">
                  
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Dây Hụi Lựa Chọn:</span>
                    <h4 className="font-extrabold text-amber-400 text-sm">{requestingHui.name}</h4>
                    <div className="flex justify-between text-xs text-slate-300 pt-1">
                      <span>Chủ Hụi: <strong className="text-white">{requestingHui.hostName}</strong></span>
                      <span>Mức Đóng: <strong className="text-amber-300 font-mono">{formatVND(requestingHui.shareAmount)}</strong></span>
                    </div>
                  </div>

                  {/* Shares Count Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Số Phần Hụi Muốn Tham Gia
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setSharesCount(num)}
                          className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                            sharesCount === num
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {num} Phần
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Optional Note */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Lời Nhắn Gửi Chủ Hụi (Không bắt buộc)
                    </label>
                    <textarea
                      rows={2}
                      value={joinNote}
                      onChange={(e) => setJoinNote(e.target.value)}
                      placeholder="Ví dụ: Em được chị Bình giới thiệu, xin tham gia hụi uy tín ạ..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start space-x-2 text-[11px] text-slate-400">
                    <Info className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      Để đảm bảo an toàn tài chính cho toàn bộ hội viên, bước tiếp theo bạn cần cung cấp thông tin xác minh Căn Cước Công Dân (eKYC).
                    </span>
                  </div>

                  {/* Next Step Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>Tiếp Tục: Xác Minh Danh Tánh eKYC</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>

                </form>
              ) : (
                /* STEP 2 FORM: EKYC IDENTITY VERIFICATION */
                <form onSubmit={handleFinalSubmitWithKyc} className="space-y-4">
                  
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="h-5 w-5 text-amber-400" />
                      <div>
                        <span className="text-xs font-bold text-amber-300 block">Xác Minh Căn Cước Công Dân (eKYC)</span>
                        <span className="text-[10px] text-amber-200/80">Quy định an toàn chống quỵt hụi</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold rounded-full flex items-center space-x-1">
                      <BadgeCheck className="h-3 w-3" />
                      <span>Bảo Mật AI</span>
                    </span>
                  </div>

                  {/* ID Card Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Số Căn Cước Công Dân (CCCD 12 Số / CMND) <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        value={idCardNumber}
                        onChange={(e) => setIdCardNumber(e.target.value)}
                        placeholder="Nhập 12 số CCCD (Ví dụ: 079203001888)"
                        required
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* ID Card Photos (Front & Back) */}
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Front Image */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-400">Mặt Trước CCCD</label>
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-24 flex items-center justify-center">
                        <img src={frontImage} alt="Mặt trước CCCD" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              const newUrl = prompt('Nhập URL ảnh mặt trước CCCD mới:', frontImage);
                              if (newUrl) setFrontImage(newUrl);
                            }}
                            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg flex items-center space-x-1"
                          >
                            <Camera className="h-3 w-3" />
                            <span>Tải Lại Ảnh</span>
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/90 text-emerald-400 text-[9px] font-bold rounded border border-slate-800">
                          ✓ Đã Tải
                        </span>
                      </div>
                    </div>

                    {/* Back Image */}
                    <div className="space-y-1">
                      <label className="block text-[11px] font-medium text-slate-400">Mặt Sau CCCD</label>
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-24 flex items-center justify-center">
                        <img src={backImage} alt="Mặt sau CCCD" className="w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            type="button"
                            onClick={() => {
                              const newUrl = prompt('Nhập URL ảnh mặt sau CCCD mới:', backImage);
                              if (newUrl) setBackImage(newUrl);
                            }}
                            className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-lg flex items-center space-x-1"
                          >
                            <Camera className="h-3 w-3" />
                            <span>Tải Lại Ảnh</span>
                          </button>
                        </div>
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/90 text-emerald-400 text-[9px] font-bold rounded border border-slate-800">
                          ✓ Đã Tải
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Biometric Face Verification Check */}
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                        <Camera className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Xác Thực Sinh Trắc FaceID</span>
                        <span className="text-[10px] text-slate-400">Khớp khuôn mặt với CCCD</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsCapturingFace(true);
                        setTimeout(() => {
                          setIsCapturingFace(false);
                          setFaceVerified(true);
                        }, 1200);
                      }}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 rounded-lg text-xs font-bold transition-all"
                    >
                      {isCapturingFace ? (
                        <span className="animate-pulse flex items-center space-x-1">
                          <Clock className="h-3 w-3 animate-spin" />
                          <span>Đang Quét...</span>
                        </span>
                      ) : faceVerified ? (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Khớp 99.8%</span>
                        </span>
                      ) : (
                        <span>Quét Khuôn Mặt</span>
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRequestStep(1)}
                      className="py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all shrink-0"
                    >
                      ← Quay Lại
                    </button>

                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                      <span>Gửi Hồ Sơ eKYC & Xin Gia Nhập</span>
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ELECTRONIC CONTRACT MODAL */}
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

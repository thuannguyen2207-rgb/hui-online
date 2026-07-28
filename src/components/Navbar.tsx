import React from 'react';
import { User, UserRole } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  PlusCircle, 
  Calculator, 
  Database, 
  Code2, 
  Smartphone, 
  Monitor, 
  LogOut, 
  HelpCircle,
  Coins,
  QrCode,
  Settings,
  Flame,
  Landmark
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
  activeView: 'app' | 'calc' | 'db' | 'api';
  onChangeView: (view: 'app' | 'calc' | 'db' | 'api') => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenCreateModal: () => void;
  onOpenExploreModal?: () => void;
  onOpenBankConfigModal?: () => void;
  onOpenUserSettingsModal?: () => void;
  onOpenLiveBiddingModal?: () => void;
  onOpenExtendedServicesModal?: () => void;
  onOpenPendingUsersModal?: () => void;
  pendingUsersCount?: number;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchRole,
  activeView,
  onChangeView,
  isMobileFrame,
  onToggleMobileFrame,
  onOpenCreateModal,
  onOpenExploreModal,
  onOpenBankConfigModal,
  onOpenUserSettingsModal,
  onOpenLiveBiddingModal,
  onOpenExtendedServicesModal,
  onOpenPendingUsersModal,
  pendingUsersCount = 0,
  onOpenAuthModal,
  onLogout,
}) => {
  if (!currentUser) {
    return (
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
                <Coins className="h-6 w-6 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-white tracking-tight">HỤI TRỰC TUYẾN</span>
                  <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium border border-amber-500/30">
                    Chuẩn 4.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block">Quản Lý & Đấu Hụi Chuẩn Xác - Sổ Sách VietQR Realtime</p>
              </div>
            </div>

            <button
              onClick={onOpenAuthModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all active:scale-95"
            >
              <UserCheck className="h-4 w-4" />
              <span>Đăng Nhập / Đăng Ký</span>
            </button>
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ROW 1: Main Brand, View Tabs & User Profile / Auth */}
        <div className="flex items-center justify-between py-2.5 border-b border-slate-800/80">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30">
              <Coins className="h-5 w-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">HỤI TRỰC TUYẾN</span>
                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
                  Chuẩn 4.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Quản Lý & Đấu Hụi Realtime - Sổ Sách VietQR</p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeView('app')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeView === 'app'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
              <span>Sổ Hụi Trực Tuyến</span>
            </button>

            <button
              onClick={() => onChangeView('calc')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
                activeView === 'calc'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              <span>Công Cụ Tính Lãi Hụi</span>
            </button>
          </nav>

          {/* Right: User Profile & Account Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onOpenUserSettingsModal || onOpenAuthModal}
              className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition-all text-left group"
              title="Cài đặt thông tin tài khoản"
            >
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-8 w-8 rounded-xl object-cover ring-2 ring-amber-500/40 group-hover:ring-amber-400 transition-all"
                />
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slate-950 ${
                  currentUser.role === 'chu_hui' ? 'bg-emerald-400' : 'bg-blue-400'
                }`} />
              </div>

              <div className="leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xs text-white truncate max-w-[100px]">{currentUser.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-black uppercase ${
                    currentUser.role === 'chu_hui' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {currentUser.role === 'chu_hui' ? 'Chủ Hụi' : 'Hội Viên'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">{currentUser.phone}</span>
              </div>
            </button>

            {/* User Settings Gear */}
            {onOpenUserSettingsModal && (
              <button
                onClick={onOpenUserSettingsModal}
                className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                title="Cài đặt hồ sơ & VietQR"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            {/* Mobile Frame Toggle */}
            <button
              onClick={onToggleMobileFrame}
              className="p-2 text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all hidden sm:flex items-center justify-center"
              title={isMobileFrame ? "Khung Đầy Đủ" : "Khung Giả Lập App Mobile"}
            >
              {isMobileFrame ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4 text-amber-400" />}
            </button>

            {/* Logout */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
                title="Đăng xuất"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

        </div>

        {/* ROW 2: Role Toggle & Feature Action Toolbar */}
        <div className="py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Left: Role Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Chế độ xem:</span>
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => onSwitchRole('chu_hui')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
                  currentUser.role === 'chu_hui'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Đổi sang giao diện & quyền hạn Chủ Hụi"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Chủ Hụi</span>
              </button>
              <button
                onClick={() => onSwitchRole('hui_vien')}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold flex items-center space-x-1 transition-all ${
                  currentUser.role === 'hui_vien'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Đổi sang giao diện Hội Viên"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Hội Viên</span>
              </button>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            
            {/* Explore / Join Hui Days */}
            {onOpenExploreModal && (
              <button
                onClick={onOpenExploreModal}
                className="bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all active:scale-95"
                title="Khám phá các dây hụi mở"
              >
                <Coins className="h-3.5 w-3.5 text-amber-400" />
                <span>Khám Phá Dây</span>
              </button>
            )}

            {/* P2P Lending & Vault Services */}
            {onOpenExtendedServicesModal && (
              <button
                onClick={onOpenExtendedServicesModal}
                className="bg-emerald-950/90 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 font-extrabold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all active:scale-95"
                title="Dịch vụ Hũ Tích Lũy Tài Chính"
              >
                <Landmark className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Hũ Tích Lũy</span>
                <span className="sm:hidden">Hũ Tích Lũy</span>
              </button>
            )}

            {/* LIVE Bidding Room */}
            {onOpenLiveBiddingModal && (
              <button
                onClick={onOpenLiveBiddingModal}
                className="relative bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
                title="Mở Sàn Đấu Hụi Trực Tuyến Live"
              >
                <Flame className="h-3.5 w-3.5 text-slate-950 animate-bounce" />
                <span>ĐẤU HỤI LIVE</span>
              </button>
            )}

            {/* Exclusive Chủ Hụi Actions */}
            {currentUser.role === 'chu_hui' && (
              <>
                {onOpenPendingUsersModal && (
                  <button
                    onClick={onOpenPendingUsersModal}
                    className={`relative px-3 py-1.5 rounded-xl font-bold flex items-center space-x-1.5 transition-all active:scale-95 border ${
                      pendingUsersCount > 0
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800'
                    }`}
                    title="Duyệt tài khoản đăng ký mới"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Duyệt TK Mới</span>
                    {pendingUsersCount > 0 && (
                      <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse border border-rose-400">
                        {pendingUsersCount}
                      </span>
                    )}
                  </button>
                )}

                {onOpenBankConfigModal && (
                  <button
                    onClick={onOpenBankConfigModal}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold px-3 py-1.5 rounded-xl flex items-center space-x-1.5 transition-all active:scale-95"
                    title="Cấu hình tài khoản nhận VietQR"
                  >
                    <QrCode className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden lg:inline">TK VietQR</span>
                  </button>
                )}

                {currentUser?.role === 'chu_hui' && (
                  <button
                    onClick={onOpenCreateModal}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold px-3.5 py-1.5 rounded-xl shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
                    title="Tạo dây hụi mới (Dành cho Chủ Hụi)"
                  >
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>+ Tạo Dây Hụi</span>
                  </button>
                )}
              </>
            )}

          </div>

        </div>

      </div>
    </header>
  );
};

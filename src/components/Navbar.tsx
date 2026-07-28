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
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
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

          {/* Center Navigation Tabs - Clean User Scope */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeView('app')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeView === 'app'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Sổ Hụi Trực Tuyến</span>
            </button>

            <button
              onClick={() => onChangeView('calc')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                activeView === 'calc'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>Công Cụ Tính Lãi Hụi</span>
            </button>
          </nav>

          {/* Right Actions & User Profile Control */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            
            {/* Quick Actions Group */}
            <div className="flex items-center space-x-1.5">
              {/* Explore / Join Hui Days Button */}
              {onOpenExploreModal && (
                <button
                  onClick={onOpenExploreModal}
                  className="bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/30 font-bold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all active:scale-95"
                  title="Khám phá các dây hụi mở"
                >
                  <Coins className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="hidden xl:inline">Khám Phá Dây</span>
                </button>
              )}

              {/* EXTENDED FINANCIAL SERVICES SHORTCUT */}
              {onOpenExtendedServicesModal && (
                <button
                  onClick={onOpenExtendedServicesModal}
                  className="bg-emerald-950/90 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/40 font-extrabold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl flex items-center space-x-1 transition-all active:scale-95"
                  title="Cho Vay P2P & Hũ Mãn Hạn"
                >
                  <Landmark className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="hidden xl:inline">P2P & Hũ Hụi</span>
                </button>
              )}

              {/* LIVE BIDDING ROOM SHORTCUT */}
              {onOpenLiveBiddingModal && (
                <button
                  onClick={onOpenLiveBiddingModal}
                  className="relative bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-slate-950 font-black text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1 transition-all active:scale-95"
                  title="Mở Sàn Đấu Hụi Live"
                >
                  <Flame className="h-3.5 w-3.5 text-slate-950 animate-bounce shrink-0" />
                  <span className="hidden sm:inline">ĐẤU HỤI LIVE</span>
                  <span className="sm:hidden">LIVE</span>
                </button>
              )}

              {/* Create New Hui Day & Bank Config Buttons - EXCLUSIVE TO CHỦ HỤI */}
              {currentUser.role === 'chu_hui' && (
                <>
                  {onOpenBankConfigModal && (
                    <button
                      onClick={onOpenBankConfigModal}
                      className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center space-x-1 transition-all active:scale-95"
                      title="Cấu hình VietQR Chủ Hụi"
                    >
                      <QrCode className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span className="hidden 2xl:inline">VietQR</span>
                    </button>
                  )}

                  <button
                    onClick={onOpenCreateModal}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs px-2.5 sm:px-3 py-1.5 rounded-xl shadow-md flex items-center space-x-1 transition-all active:scale-95"
                    title="Tạo dây hụi mới"
                  >
                    <PlusCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="hidden md:inline">+ Tạo Dây</span>
                  </button>
                </>
              )}
            </div>

            {/* Compact Unified User Profile Card */}
            <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center space-x-1.5 shadow-inner">
              
              {/* Avatar + Info */}
              <button
                onClick={onOpenUserSettingsModal || onOpenAuthModal}
                className="flex items-center space-x-2 px-2 py-1 rounded-xl hover:bg-slate-900 transition-colors group text-left"
                title="Cài đặt hồ sơ cá nhân"
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

                <div className="hidden lg:block leading-tight">
                  <div className="flex items-center space-x-1">
                    <span className="font-extrabold text-xs text-white truncate max-w-[90px]">{currentUser.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                      currentUser.role === 'chu_hui' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {currentUser.role === 'chu_hui' ? 'Chủ Hụi' : 'Hội Viên'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block">{currentUser.phone}</span>
                </div>
              </button>

              {/* Role Switcher Toggle Pills */}
              <div className="bg-slate-900 p-0.5 rounded-xl border border-slate-800/80 flex items-center">
                <button
                  onClick={() => onSwitchRole('chu_hui')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    currentUser.role === 'chu_hui'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Đổi sang vai trò Chủ Hụi"
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">Chủ Hụi</span>
                </button>

                <button
                  onClick={() => onSwitchRole('hui_vien')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                    currentUser.role === 'hui_vien'
                      ? 'bg-blue-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Đổi sang vai trò Hội Viên"
                >
                  <UserCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">Hội Viên</span>
                </button>
              </div>

              {/* Settings Icon Button */}
              {onOpenUserSettingsModal && (
                <button
                  onClick={onOpenUserSettingsModal}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl transition-colors"
                  title="Cài đặt tài khoản"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}

              {/* Mobile Frame Toggle */}
              <button
                onClick={onToggleMobileFrame}
                className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-900 rounded-xl transition-colors hidden xl:flex items-center justify-center"
                title={isMobileFrame ? "Xem Giao diện Đầy Đủ" : "Xem Giả Lập Mobile App"}
              >
                {isMobileFrame ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4 text-amber-400" />}
              </button>

              {/* Logout Button */}
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}

            </div>

          </div>

        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="flex md:hidden items-center justify-center space-x-4 py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => onChangeView('app')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeView === 'app' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-slate-400'
            }`}
          >
            Sổ Hụi Trực Tuyến
          </button>
          <button
            onClick={() => onChangeView('calc')}
            className={`px-3 py-1 rounded-md font-medium ${
              activeView === 'calc' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-slate-400'
            }`}
          >
            Tính Lãi Hụi
          </button>
        </div>

      </div>
    </header>
  );
};

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
  Coins
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  activeView: 'app' | 'calc' | 'db' | 'api';
  onChangeView: (view: 'app' | 'calc' | 'db' | 'api') => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onOpenCreateModal: () => void;
  onOpenExploreModal?: () => void;
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
  onOpenAuthModal,
  onLogout,
}) => {
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

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            
            {/* Explore / Join Hui Days Button */}
            {onOpenExploreModal && (
              <button
                onClick={onOpenExploreModal}
                className="bg-slate-950 hover:bg-slate-800 text-amber-400 border border-amber-500/30 hover:border-amber-400 font-bold text-xs sm:text-sm px-3 sm:px-3.5 py-2 rounded-xl shadow-md flex items-center space-x-1.5 transition-all active:scale-95"
                title="Khám phá và gửi yêu cầu xin gia nhập các dây hụi mở"
              >
                <Coins className="h-4 w-4 text-amber-400" />
                <span className="hidden md:inline">Khám Phá Dây Hụi</span>
                <span className="md:hidden">Tìm Dây</span>
              </button>
            )}

            {/* Create New Hui Day Button - EXCLUSIVE TO CHỦ HỤI / HOST ADMIN */}
            {currentUser.role === 'chu_hui' && (
              <button
                onClick={onOpenCreateModal}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 transition-all active:scale-95"
                title="Quyền dành riêng cho Chủ Hụi: Khởi tạo dây hụi mới"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Tạo Dây Hụi Mới</span>
                <span className="sm:hidden">+ Tạo Dây</span>
              </button>
            )}

            {/* Role Switcher Toggle */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => onSwitchRole('chu_hui')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                  currentUser.role === 'chu_hui'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chế độ Chủ Hụi: Có quyền chốt kỳ, duyệt gạch nợ, tạo dây hụi"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Chủ Hụi</span>
              </button>
              <button
                onClick={() => onSwitchRole('hui_vien')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                  currentUser.role === 'hui_vien'
                    ? 'bg-blue-500 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Chế độ Hụi Viên: Nộp thăm, xem sổ sách, đóng tiền VietQR"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hụi Viên</span>
              </button>
            </div>

            {/* Mobile View / Desktop Toggle */}
            <button
              onClick={onToggleMobileFrame}
              className="p-2 text-slate-400 hover:text-amber-400 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 hidden lg:flex items-center justify-center"
              title={isMobileFrame ? "Chuyển sang Giao diện Desktop Rộng" : "Khung Giả Lập App Mobile (iOS/Android)"}
            >
              {isMobileFrame ? <Monitor className="h-4 w-4" /> : <Smartphone className="h-4 w-4 text-amber-400" />}
            </button>

            {/* User Profile / Auth Button */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center space-x-2 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all text-left"
              title="Đổi tài khoản hoặc sửa thông tin"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-7 w-7 rounded-lg object-cover ring-2 ring-amber-500/50"
              />
              <div className="hidden lg:block text-xs">
                <div className="font-semibold text-white truncate max-w-[100px]">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                  {currentUser.phone}
                </div>
              </div>
            </button>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all border border-slate-700/50 flex items-center justify-center"
                title="Đăng xuất khỏi hệ thống"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}

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

import React, { useState } from 'react';
import { User } from '../types';
import { Clock, ShieldAlert, CheckCircle2, PhoneCall, RefreshCw, LogOut, MessageCircle, UserX, Coins, ShieldCheck } from 'lucide-react';

interface PendingApprovalScreenProps {
  currentUser: User;
  onRefreshStatus: () => void;
  onLogout: () => void;
  onSwitchToDemoHost?: () => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = ({
  currentUser,
  onRefreshStatus,
  onLogout,
  onSwitchToDemoHost
}) => {
  const [checking, setChecking] = useState(false);
  const isRejected = currentUser.accountApprovalStatus === 'rejected';

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      onRefreshStatus();
      setChecking(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
        
        {/* Header Icon */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 relative">
            <div className={`p-3 rounded-xl ${isRejected ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
              {isRejected ? <UserX className="h-10 w-10 animate-bounce" /> : <Clock className="h-10 w-10 animate-pulse" />}
            </div>
            <span className={`absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
              isRejected ? 'bg-rose-500 text-slate-950 border-rose-400' : 'bg-amber-500 text-slate-950 border-amber-400'
            }`}>
              {isRejected ? 'Từ Chối Access' : 'Chờ Phê Duyệt'}
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {isRejected ? 'Tài Khoản Chưa Được Phê Duyệt' : 'Tài Khoản Đang Chờ Chủ Hụi Phê Duyệt'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Hệ Thống Quản Lý & Sổ Hụi Trực Tuyến 4.0 - Bảo Mật Nội Bộ
            </p>
          </div>
        </div>

        {/* User Card info */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 pb-3 border-b border-slate-800/80">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-12 w-12 rounded-xl object-cover ring-2 ring-amber-500/40"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-sm text-white truncate">{currentUser.name}</h4>
              <p className="text-xs text-slate-400 font-mono">{currentUser.phone} • {currentUser.email || 'Chưa cập nhật email'}</p>
              <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                Đăng ký lúc: {currentUser.registeredAt ? new Date(currentUser.registeredAt).toLocaleString('vi-VN') : 'Vừa xong'}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
            {isRejected ? (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 space-y-1">
                <span className="font-bold flex items-center space-x-1">
                  <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>Chủ hụi đã từ chối quyền truy cập của tài khoản này!</span>
                </span>
                <p className="text-[11px] text-slate-400">
                  Vui lòng liên hệ trực tiếp Chủ Hụi qua số điện thoại bên dưới để làm rõ thông tin hoặc đăng ký lại.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 space-y-1">
                <span className="font-bold flex items-center space-x-1.5 text-amber-300">
                  <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Quy trình bảo mật tài chính hụi:</span>
                </span>
                <p className="text-[11px] text-slate-300">
                  Để đảm bảo an toàn tiền bạc cho tất cả hội viên, thành viên đăng ký mới cần được <strong>Chủ Hụi (Host Admin) duyệt xác minh danh tính</strong> trước khi vào xem sổ hụi, đấu hụi và thực hiện giao dịch VietQR.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Instructions & Contact Host */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-300">
            📲 Bạn có thể làm gì lúc này?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Call Host */}
            <a
              href="tel:0908123456"
              className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl flex items-center space-x-2 text-amber-400 transition-all group"
            >
              <div className="p-2 bg-amber-500/10 rounded-lg group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold block text-white text-[11px]">Gọi Chủ Hụi Duyệt Fast</span>
                <span className="text-[10px] text-slate-400 font-mono">0908.123.456</span>
              </div>
            </a>

            {/* Zalo Host */}
            <a
              href="https://zalo.me/0908123456"
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl flex items-center space-x-2 text-emerald-400 transition-all group"
            >
              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold block text-white text-[11px]">Nhắn Zalo Chủ Hụi</span>
                <span className="text-[10px] text-slate-400 font-mono">Zalo Admin</span>
              </div>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          {/* Re-check Status button */}
          <button
            onClick={handleCheck}
            disabled={checking}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98"
          >
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Đang Kiểm Tra Trạng Thái Duyệt...' : 'Kiểm Tra Trạng Thái Phê Duyệt Ngay'}</span>
          </button>

          {/* Switch to Demo Host mode if requested */}
          {onSwitchToDemoHost && (
            <button
              onClick={onSwitchToDemoHost}
              className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Chuyển Sang Quyền Chủ Hụi Để Duyệt Ngay (Demo Mode)</span>
            </button>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            className="w-full bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng Xuất / Đổi Tài Khoản Khác</span>
          </button>
        </div>

      </div>
    </div>
  );
};

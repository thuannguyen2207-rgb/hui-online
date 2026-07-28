import React from 'react';
import { User } from '../types';
import { PlusCircle, Layers, Coins, Sparkles, ShieldCheck, HelpCircle } from 'lucide-react';

interface EmptyHuiStateProps {
  currentUser: User;
  onCreateHuiClick: () => void;
  onExploreHuiClick?: () => void;
}

export const EmptyHuiState: React.FC<EmptyHuiStateProps> = ({
  currentUser,
  onCreateHuiClick,
  onExploreHuiClick,
}) => {
  const isHost = currentUser.role === 'chu_hui';

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      
      {/* Background Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6 backdrop-blur-sm">
        
        {/* Icon Badge */}
        <div className="mx-auto w-20 h-20 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center relative shadow-inner">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/30 text-amber-400">
            <Coins className="h-10 w-10 animate-bounce" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Chưa Có Dây Hụi Nào Trong Hệ Thống
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed font-medium">
            {isHost 
              ? 'Chưa có dây hụi nào. Bấm nút bên dưới để khởi tạo dây hụi đầu tiên.'
              : 'Bạn đang truy cập ở quyền Hội Viên. Chỉ Chủ Hụi (Host Admin) mới có quyền khởi tạo dây hụi mới.'}
          </p>
          <p className="text-xs text-slate-500">
            Dữ liệu kết nối trực tiếp với Supabase Database • Minh bạch & An toàn
          </p>
        </div>

        {/* Info Badges */}
        <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-slate-800/80 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300 font-semibold text-[11px]">Bảo mật RLS 100%</span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 font-semibold text-[11px]">Tự động tính toán</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {isHost ? (
            <button
              onClick={onCreateHuiClick}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all active:scale-98 text-sm"
            >
              <PlusCircle className="h-5 w-5" />
              <span>+ Tạo Dây Hụi Đầu Tiên Ngay</span>
            </button>
          ) : (
            onExploreHuiClick && (
              <button
                onClick={onExploreHuiClick}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-98 text-sm"
              >
                <Layers className="h-5 w-5" />
                <span>Tìm Kiếm & Tham Gia Dây Hụi Qua Mã Code</span>
              </button>
            )
          )}
        </div>

      </div>
    </div>
  );
};

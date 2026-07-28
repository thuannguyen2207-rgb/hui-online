import React, { useState } from 'react';
import { User } from '../types';
import { X, ShieldCheck, UserCheck, UserX, Clock, Search, Filter, CheckCircle2, AlertCircle, Phone, Mail, MapPin } from 'lucide-react';

interface PendingUsersApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onApproveUser: (userId: string) => void;
  onRejectUser: (userId: string) => void;
}

export const PendingUsersApprovalModal: React.FC<PendingUsersApprovalModalProps> = ({
  isOpen,
  onClose,
  users,
  onApproveUser,
  onRejectUser
}) => {
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  if (!isOpen) return null;

  // Filter users
  const filtered = users.filter(u => {
    if (u.role === 'chu_hui') return false; // Host doesn't need to approve themselves

    const matchStatus = 
      filterTab === 'all' ? true :
      filterTab === 'pending' ? u.accountApprovalStatus === 'pending_approval' :
      filterTab === 'approved' ? (u.accountApprovalStatus === 'approved' || !u.accountApprovalStatus) :
      u.accountApprovalStatus === 'rejected';

    const text = `${u.name} ${u.phone} ${u.email || ''} ${u.address || ''}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  const pendingCount = users.filter(u => u.accountApprovalStatus === 'pending_approval').length;
  const approvedCount = users.filter(u => u.accountApprovalStatus === 'approved' || (!u.accountApprovalStatus && u.role !== 'chu_hui')).length;
  const rejectedCount = users.filter(u => u.accountApprovalStatus === 'rejected').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative overflow-hidden text-slate-100 my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-extrabold text-white">Duyệt Tài Khoản Đăng Ký Mới</h3>
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 text-xs font-black px-2 py-0.5 rounded-full animate-bounce">
                    {pendingCount} Chờ Duyệt
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Chủ hụi xem danh sách & kích hoạt quyền truy cập ứng dụng cho hội viên</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filters & Search */}
        <div className="my-4 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold overflow-x-auto">
              <button
                onClick={() => setFilterTab('pending')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
                  filterTab === 'pending'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Chờ Duyệt ({pendingCount})</span>
              </button>

              <button
                onClick={() => setFilterTab('approved')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
                  filterTab === 'approved'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Đã Duyệt ({approvedCount})</span>
              </button>

              <button
                onClick={() => setFilterTab('rejected')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shrink-0 ${
                  filterTab === 'rejected'
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserX className="h-3.5 w-3.5" />
                <span>Từ Chối ({rejectedCount})</span>
              </button>

              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                  filterTab === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất Cả ({users.filter(u => u.role !== 'chu_hui').length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-xs">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo Tên, SĐT, Email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

          </div>
        </div>

        {/* List of Registered Users */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2">
              <UserCheck className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="text-xs font-bold text-slate-400">Không tìm thấy tài khoản nào phù hợp!</p>
              <p className="text-[11px] text-slate-500">Tất cả hội viên đăng ký mới đã được xử lý hoặc danh sách rỗng.</p>
            </div>
          ) : (
            filtered.map((user) => {
              const isPending = user.accountApprovalStatus === 'pending_approval';
              const isApproved = user.accountApprovalStatus === 'approved' || !user.accountApprovalStatus;
              const isRejected = user.accountApprovalStatus === 'rejected';

              return (
                <div
                  key={user.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isPending
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                      : isRejected
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  {/* User Profile */}
                  <div className="flex items-start space-x-3.5">
                    <div className="relative shrink-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="h-11 w-11 rounded-xl object-cover ring-2 ring-amber-500/30"
                      />
                      <span className={`absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-slate-950 ${
                        isPending ? 'bg-amber-400' : isApproved ? 'bg-emerald-400' : 'bg-rose-400'
                      }`} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-white">{user.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${
                          isPending
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                            : isApproved
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {isPending ? 'Chờ Duyệt' : isApproved ? 'Đã Kích Hoạt' : 'Bị Từ Chối'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center space-x-1 font-mono text-amber-300">
                          <Phone className="h-3 w-3 text-amber-400" />
                          <span>{user.phone}</span>
                        </span>

                        {user.email && (
                          <span className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-slate-500" />
                            <span>{user.email}</span>
                          </span>
                        )}

                        {user.address && (
                          <span className="flex items-center space-x-1 text-[11px] text-slate-400 max-w-xs truncate">
                            <MapPin className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>{user.address}</span>
                          </span>
                        )}
                      </div>

                      {user.registeredAt && (
                        <p className="text-[10px] text-slate-500">
                          Đăng ký lúc: {new Date(user.registeredAt).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => onRejectUser(user.id)}
                          className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                          title="Từ chối cấp quyền"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Từ Chối</span>
                        </button>

                        <button
                          onClick={() => onApproveUser(user.id)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-1.5"
                          title="Duyệt kích hoạt tài khoản"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Duyệt Kích Hoạt</span>
                        </button>
                      </>
                    ) : isApproved ? (
                      <button
                        onClick={() => onRejectUser(user.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-bold transition-all"
                        title="Khóa / Thu hồi quyền"
                      >
                        Khóa Quyền
                      </button>
                    ) : (
                      <button
                        onClick={() => onApproveUser(user.id)}
                        className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 border border-emerald-500/40 rounded-xl text-xs font-bold transition-all"
                        title="Mở khóa duyệt lại"
                      >
                        Duyệt Lại
                      </button>
                    )}
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4 mt-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Chủ hụi duyệt kích hoạt sẽ cấp quyền cho hội viên đăng nhập & tham gia các dây hụi ngay lập tức.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors"
          >
            Đóng Lại
          </button>
        </div>

      </div>
    </div>
  );
};

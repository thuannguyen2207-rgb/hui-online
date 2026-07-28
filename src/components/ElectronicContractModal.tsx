import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckSquare, Square, Building2, Lock, X, Award, AlertTriangle, KeyRound } from 'lucide-react';
import { User } from '../types';

export interface ContractActionContext {
  title: string;
  actionType: 'p2p_borrow' | 'p2p_fund' | 'p2p_repay' | 'vault_create' | 'vault_deposit' | 'vault_withdraw' | 'hui_join' | 'live_bid';
  partnerName?: string;
  summaryText: string;
  amount?: number;
}

interface ElectronicContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  currentUser: User;
  context: ContractActionContext;
}

export const ElectronicContractModal: React.FC<ElectronicContractModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  currentUser,
  context,
}) => {
  if (!isOpen) return null;

  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [signatureName, setSignatureName] = useState(currentUser?.name || '');

  const partnerName = context.partnerName || 'Đối Tác Tài Chính & Tín Dụng Bên Thứ Ba (FinTech & Banking Partner Alliance)';
  const contractCode = `HDDT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

  const isFormValid = check1 && check2 && check3 && signatureName.trim().length >= 2;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      onAccept();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl p-5 sm:p-7 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto text-slate-100 space-y-5 border-amber-500/30">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors z-20"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="flex items-start space-x-3.5 border-b border-slate-800 pb-4">
          <div className="p-3 bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 rounded-2xl font-black shadow-lg shadow-amber-500/20 shrink-0">
            <FileText className="h-7 w-7 text-slate-950" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
                HỢP ĐỒNG ĐIỆN TỬ SỐ #{contractCode}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                XÁC THỰC PHÁP LÝ BÊN THỨ 3
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {context.title || 'HỢP ĐỒNG ĐIỆN TỬ & ĐIỀU KHOẢN SỬ DỤNG DỊCH VỤ'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Ngày khởi tạo: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>

        {/* IMPORTANT THIRD-PARTY PROVIDER ALERT BOX */}
        <div className="p-4 bg-amber-950/70 border border-amber-500/50 rounded-2xl flex items-start space-x-3 shadow-md">
          <Building2 className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-slate-200">
            <div className="font-extrabold text-amber-400 text-sm uppercase flex items-center space-x-2">
              <span>ĐƠN VỊ CUNG CẤP DỊCH VỤ: BÊN THỨ BA (THIRD-PARTY PROVIDER)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Tất cả các dịch vụ tài chính hũ tích lũy xoay vòng, tài trợ vốn, hũ tiết kiệm tích lũy và quản lý dòng tiền mãn hạn đều được <strong>trực tiếp cung cấp, vận hành và quản lý số dư bởi: <span className="text-amber-300 font-bold">{partnerName}</span></strong>. Hệ thống Hụi Online giữ vai trò cổng kết nối hạ tầng công nghệ và giao diện hiển thị.
            </p>
          </div>
        </div>

        {/* SUMMARY OF ACTION */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-start text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Bên Yêu Cầu Ký Kết (Bên A):</span>
            <div className="text-right">
              <strong className="text-white text-sm block">{currentUser.name} (ID: {currentUser.id})</strong>
              <span className="text-[11px] text-slate-400 block font-sans">SĐT: {currentUser.phone} {currentUser.address ? `• ĐC: ${currentUser.address}` : ''}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-slate-400 border-b border-slate-800/80 pb-2">
            <span>Bên Cung Cấp Dịch Vụ (Bên B):</span>
            <strong className="text-amber-400 text-xs">{partnerName}</strong>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Nội dung giao dịch thỏa thuận:</span>
            <strong className="text-emerald-400 text-xs font-sans font-bold">{context.summaryText}</strong>
          </div>
          {context.amount && (
            <div className="flex justify-between items-center text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Giá trị cam kết thực hiện:</span>
              <strong className="text-amber-400 text-base">{context.amount.toLocaleString('vi-VN')} VNĐ</strong>
            </div>
          )}
        </div>

        {/* CONTRACT LEGAL CLAUSES (SCROLLABLE TEXT) */}
        <div className="space-y-2">
          <label className="text-xs font-extrabold text-slate-300 uppercase tracking-wider block">
            NỘI DUNG ĐIỀU KHOẢN HỢP ĐỒNG ĐIỆN TỬ:
          </label>
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-3 max-h-48 overflow-y-auto leading-relaxed font-sans scrollbar-thin">
            <p>
              <strong>ĐIỀU 1: PHẠM VI DỊCH VỤ VÀ BÊN THỨ BA CUNG CẤP</strong><br />
              1.1. Người dùng công nhận rằng mọi hoạt động cho vay, tích lũy tiết kiệm, giải ngân và chuyển nộp tiền đều do Đơn vị Bên Thứ Ba (<span className="text-amber-300">{partnerName}</span>) quản lý và chịu trách nhiệm pháp lý.<br />
              1.2. Nền tảng Hụi Online đóng vai trò đại lý công nghệ, cung cấp giao diện quản lý và truyền nhận dữ liệu mã hóa qua cổng Open Banking API.
            </p>

            <p>
              <strong>ĐIỀU 2: ĐIỀU KHOẢN KHÓA VỐN TÍCH LŨY VÀ TÍNH NĂNG MÃN HẠN</strong><br />
              2.1. Đối với Hũ Tích Lũy Mãn Hạn: Người tham gia cam kết nộp đúng số tiền định kỳ theo từng kỳ quy định. Khoản tiền đã tích lũy và tiền lãi thưởng <strong>chỉ được quyền rút ra khi hoàn thành đủ số kỳ mục tiêu hoặc đến ngày mãn hạn chính thức</strong>.<br />
              2.2. Trường hợp rút trước hạn không hợp lệ, khoản lãi thưởng sẽ bị hủy bỏ và bên thứ ba có quyền giữ tài sản theo quy tắc thỏa thuận bảo an.
            </p>

            <p>
              <strong>ĐIỀU 3: NGHĨA VỤ HOÀN TRẢ VÀ THẾ CHẤP KHOẢN HŨ TÍCH LŨY</strong><br />
              3.1. Người vay có nghĩa vụ hoàn trả đầy đủ gốc và lãi cho bên cấp vốn / bên thứ 3 đúng hạn thỏa thuận.<br />
              3.2. Quyền tài sản đối với Suất Hụi được thế chấp sẽ tự động chuyển nhượng cho bên cấp vốn hoặc đối tác thứ ba để cấn trừ rủi ro nếu người vay quá hạn thanh toán trên 05 ngày.
            </p>

            <p>
              <strong>ĐIỀU 4: GIÁ TRỊ PHÁP LÝ CỦA CHỮ KÝ SỐ ĐIỆN TỬ</strong><br />
              4.1. Chữ ký điện tử dưới dạng xác thực tài khoản và tên đại diện trên hệ thống có giá trị pháp lý tương đương chữ ký tay theo Luật Giao dịch điện tử hiện hành.
            </p>

            <p>
              <strong>ĐIỀU 5: HẠN MỨC TRẦN CHI PHÍ VÀ LÃI SUẤT (TỐI ĐA ≤ 20%/NĂM)</strong><br />
              5.1. Cam kết toàn bộ chi phí giao dịch, phí quản lý nền tảng, phí tháo chủ hụi và lãi suất khoản hũ tích lũy đều nằm ở mức <strong>từ 20%/năm trở xuống (≤ 20%/năm)</strong> theo Bộ luật Dân sự và chính sách bảo vệ khách hàng của Đơn vị cung cấp dịch vụ Bên Thứ Ba.
            </p>
          </div>
        </div>

        {/* CHECKBOXES ACKNOWLEDGEMENT */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2 text-xs">
            
            {/* Check 1 */}
            <div 
              onClick={() => setCheck1(!check1)}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-start space-x-3 transition-colors"
            >
              <div className="mt-0.5 shrink-0 text-amber-400">
                {check1 ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-600" />}
              </div>
              <span className="text-slate-200">
                Tôi xác nhận đã đọc toàn bộ văn bản, hiểu rõ các quyền, nghĩa vụ và hoàn toàn đồng ý với các điều khoản trong Hợp Đồng Điện Tử này.
              </span>
            </div>

            {/* Check 2 */}
            <div 
              onClick={() => setCheck2(!check2)}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-start space-x-3 transition-colors"
            >
              <div className="mt-0.5 shrink-0 text-amber-400">
                {check2 ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-600" />}
              </div>
              <span className="text-slate-200">
                Tôi hiểu rõ và đồng ý rằng <strong>tất cả dịch vụ hũ tích lũy xoay vòng và tiết kiệm/tích lũy hụi mãn hạn đều do Bên Thứ Ba (Đối Tác Tín Dụng & Ngân Hàng)</strong> cung cấp.
              </span>
            </div>

            {/* Check 3 */}
            <div 
              onClick={() => setCheck3(!check3)}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-start space-x-3 transition-colors"
            >
              <div className="mt-0.5 shrink-0 text-amber-400">
                {check3 ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 text-slate-600" />}
              </div>
              <span className="text-slate-200">
                Tôi cam kết thực hiện đúng trách nhiệm đóng góp đúng kỳ hạn hoặc thanh toán hoàn nợ theo đúng nghĩa vụ điện tử đã ký.
              </span>
            </div>

          </div>

          {/* DIGITAL SIGNATURE FIELD */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-extrabold text-slate-300 flex items-center space-x-1.5">
                <KeyRound className="h-4 w-4 text-amber-400" />
                <span>CHỮ KÝ SỐ ĐIỆN TỬ HỌ TÊN NGƯỜI KÝ:</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">Mã Hóa SHA-256 Verified</span>
            </div>

            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Nhập Họ và Tên đầy đủ để ký số..."
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-amber-400 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center space-x-2 transition-all ${
              isFormValid
                ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-500 text-slate-950 hover:opacity-95 shadow-amber-500/20 active:scale-98'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
            <span>KÝ HỢP ĐỒNG ĐIỆN TỬ & ĐỒNG Ý TIẾP TỤC GIAO DỊCH</span>
          </button>
        </form>

      </div>
    </div>
  );
};

import React from 'react';
import { X, ShieldCheck, FileText, Lock, Scale, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PolicyTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAgree?: () => void;
}

export const PolicyTermsModal: React.FC<PolicyTermsModalProps> = ({
  isOpen,
  onClose,
  onAgree
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative overflow-hidden text-slate-100 my-auto max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Scale className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Quy Định & Điều Khoản Chơi Hụi 4.0</h3>
              <p className="text-xs text-slate-400">Căn cứ Nghị định 19/2019/NĐ-CP về Họ, Hụi, Biêu, Phường & Quy định Giao dịch Tài chính</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Terms Content */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1 text-xs text-slate-300 leading-relaxed">
          
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
            <span className="font-bold text-amber-400 flex items-center space-x-1.5 text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Khung Pháp Lý An Toàn & Minh Bạch</span>
            </span>
            <p className="text-slate-300 text-[11px]">
              Tất cả các dây hụi, giao dịch gạch nợ VietQR, đăng ký thăm hụi và thỏa thuận giữa Chủ Hụi & Hội viên trên nền tảng Sổ Hụi Trực Tuyến đều được pháp luật Việt Nam công nhận và điều chỉnh trực tiếp bởi <strong>Nghị định 19/2019/NĐ-CP của Chính phủ</strong>.
            </p>
          </div>

          {/* Section 1 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300 text-sm flex items-center space-x-2">
              <FileText className="h-4 w-4 text-amber-400" />
              <span>1. Nghĩa Vụ & Trách Nhiệm Của Hội Viên</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li><strong>Nghĩa vụ đóng hụi đúng hạn:</strong> Hội viên có trách nhiệm đóng đủ tiền hụi (hụi sống/hụi chết) đúng ngày chốt kỳ quy định thông qua phương thức chuyển khoản VietQR hoặc tiền mặt trực tiếp cho Chủ Hụi.</li>
              <li><strong>Trách nhiệm khi hốt hụi (Hụi Chết):</strong> Sau khi hốt hụi, Hội viên cam kết duy trì đóng hụi chết đầy đủ cho tất cả các kỳ còn lại cho đến khi kết thúc dây hụi. Hành vi cố tình bỏ hụi hoặc xù hụi sẽ bị xử lý theo Bộ Luật Dân Sự và Hình Sự Việt Nam.</li>
              <li><strong>Chính xác thông tin tài khoản:</strong> Hội viên chịu trách nhiệm về tính chính xác của số tài khoản ngân hàng nhận tiền hốt hụi do mình cung cấp.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-300 text-sm flex items-center space-x-2">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>2. Trách Nhiệm Của Chủ Hụi (Trưởng Họ)</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li><strong>Lập và minh bạch sổ hụi:</strong> Chủ hụi có nghĩa vụ cập nhật sổ hụi công khai, chính xác danh sách hội viên, số tiền từng kỳ, người hốt hụi và lãi bỏ thăm cho tất cả thành viên trong dây hụi.</li>
              <li><strong>Giao tiền hốt hụi đúng hạn:</strong> Trong vòng 24h - 48h sau khi chốt kỳ hốt hụi, Chủ Hụi có trách nhiệm gom đủ tiền và chuyển khoản thanh toán cho người hốt hụi kỳ đó.</li>
              <li><strong>Chịu trách nhiệm bảo đảm nghĩa vụ:</strong> Trường hợp có hội viên trễ hụi, Chủ Hụi có nghĩa vụ ứng trước theo thỏa thuận dây hụi để đảm bảo dòng tiền giao hụi cho người hốt hụi.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-blue-300 text-sm flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-blue-400" />
              <span>3. Quy Định Giao Dịch VietQR & Bằng Chứng Thanh Toán</span>
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li>Nội dung chuyển khoản VietQR được tạo tự động bởi hệ thống làm bằng chứng pháp lý gạch nợ giữa hai bên.</li>
              <li>Hệ thống lưu trữ lịch sử giao dịch trực tuyến bao gồm thời gian, mã tham chiếu và hình ảnh ủy nhiệm chi / bill ngân hàng làm căn cứ đối soát khi xảy ra tranh chấp.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-rose-300 text-sm flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              <span>4. Xử Lý Vi Phạm & Tranh Chấp Dân Sự</span>
            </h4>
            <p className="text-slate-300">
              Mọi vi phạm hợp đồng hụi, trễ hạn đóng hụi vượt quá số ngày quy định hoặc phát sinh tranh chấp sẽ được giải quyết dựa trên bằng chứng sổ hụi điện tử và quy định pháp luật dân sự tại Tòa án Nhân dân có thẩm quyền.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 pt-4 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Bấm đồng ý để xác nhận bạn đã đọc & cam kết thực hiện đúng quy định.
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
            >
              Đóng
            </button>
            {onAgree && (
              <button
                onClick={() => {
                  onAgree();
                  onClose();
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-amber-500/20 transition-colors"
              >
                Tôi Đồng Ý Quy Định
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

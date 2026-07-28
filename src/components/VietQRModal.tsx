import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatVND, generateVietQRUrl } from '../utils/huiFinancialEngine';
import { PolicyTermsModal } from './PolicyTermsModal';
import { X, Copy, CheckCircle2, QrCode, Building2, UploadCloud, ArrowDown, ShieldCheck, Scale, ExternalLink } from 'lucide-react';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  onConfirmPaid: (txId: string, proofUrl?: string) => void;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({
  isOpen,
  onClose,
  transaction,
  bankName,
  bankCode,
  accountNumber,
  accountName,
  onConfirmPaid,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  if (!isOpen || !transaction) return null;

  const safeBankCode = bankCode || 'MB';
  const safeAccountNumber = accountNumber || '';
  const safeAccountName = accountName || '';

  const qrImageUrl = generateVietQRUrl(
    safeBankCode,
    safeAccountNumber,
    safeAccountName,
    transaction.amountDue,
    transaction.paymentRef
  );

  const copyToClipboard = (text: string, type: 'account' | 'amount' | 'ref') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 1500);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 1500);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 1500);
    }
  };

  const handleConfirmPayment = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirmPaid(transaction.id, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden text-slate-100 my-auto max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <QrCode className="h-4 w-4" />
            <span>Thanh Toán VietQR Napas247 Động</span>
          </div>
          <h3 className="text-xl font-bold text-white">Quét Mã Đóng Tiền Hụi</h3>
          <p className="text-xs text-slate-400">Tự động điền số tiền và cú pháp gạch nợ chính xác</p>
        </div>

        {/* Dynamic QR Code Image Frame */}
        <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 flex flex-col items-center justify-center my-4">
          <img
            src={qrImageUrl}
            alt="VietQR Payment Code"
            className="w-64 h-64 object-contain rounded-lg"
          />
          <div className="mt-2 text-center">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block">Napas 247 • Chuyển Tiền Nhanh</span>
          </div>
        </div>

        {/* Banking Details Box */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs">
          
          {/* Bank & Account Number */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-slate-400 text-[11px] block">Ngân Hàng & Số Tài Khoản</span>
              <span className="font-bold text-white text-sm font-mono">{safeBankCode} - {safeAccountNumber}</span>
              <span className="text-slate-400 text-[11px] block uppercase font-mono">{safeAccountName}</span>
            </div>
            <button
              onClick={() => copyToClipboard(accountNumber, 'account')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
            >
              {copiedAccount ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span className="text-[10px] font-semibold">{copiedAccount ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

          {/* Amount Due */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-slate-400 text-[11px] block">Số Tiền Cần Đóng ({transaction.isDeadHui ? 'Hụi Chết' : 'Hụi Sống'})</span>
              <span className="font-extrabold text-amber-400 text-base font-mono">{formatVND(transaction.amountDue)}</span>
            </div>
            <button
              onClick={() => copyToClipboard(transaction.amountDue.toString(), 'amount')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
            >
              {copiedAmount ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span className="text-[10px] font-semibold">{copiedAmount ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

          {/* Payment Ref Code */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[11px] block">Nội Dung Chuyển Khoản (Bắt Buộc)</span>
              <span className="font-bold text-emerald-400 font-mono text-xs tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                {transaction.paymentRef}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(transaction.paymentRef, 'ref')}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors flex items-center space-x-1"
            >
              {copiedRef ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span className="text-[10px] font-semibold">{copiedRef ? 'Đã chép' : 'Sao chép'}</span>
            </button>
          </div>

        </div>

        {/* Policy Checkbox Before Transaction Confirmation */}
        {transaction.status === 'unpaid' && (
          <div className="mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <label className="flex items-start space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900"
              />
              <span className="text-[11px] text-slate-300 leading-tight">
                Tôi cam kết đã chuyển đúng số tiền & đúng nội dung giao dịch gạch nợ hụi theo{' '}
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(true)}
                  className="text-amber-400 underline hover:text-amber-300 font-bold inline-flex items-center space-x-0.5"
                >
                  <span>Quy định NĐ 19/2019/NĐ-CP</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </span>
            </label>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-4 space-y-2">
          {transaction.status === 'confirmed' ? (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center text-emerald-400 font-bold text-xs flex items-center justify-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>Giao Dịch Đã Được Chủ Hụi Xác Nhận Gạch Nợ!</span>
            </div>
          ) : transaction.status === 'pending_approval' ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-amber-300 font-bold text-xs flex items-center justify-center space-x-2">
              <UploadCloud className="h-5 w-5 text-amber-400 animate-pulse" />
              <span>Đã Gửi Xác Nhận! Đang Chờ Chủ Hụi Duyệt Tiền...</span>
            </div>
          ) : (
            <button
              onClick={handleConfirmPayment}
              disabled={loading || !agreedTerms}
              className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all ${
                agreedTerms && !loading
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span>Đang gửi xác nhận...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Tôi Đã Chuyển Khoản Xong (Bấm Để Báo Chủ Hụi)</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Policy Terms Modal */}
        <PolicyTermsModal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
          onAgree={() => setAgreedTerms(true)}
        />

      </div>
    </div>
  );
};

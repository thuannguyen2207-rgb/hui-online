import React, { useState } from 'react';
import { POSTGRES_SCHEMA_SQL } from '../data/databaseSchema';
import { Database, Copy, CheckCircle2, ShieldCheck, Key, Table, FileCode } from 'lucide-react';

export const DatabaseSchemaView: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRES_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Database className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white">PostgreSQL / Supabase Database Schema</h2>
            <p className="text-xs text-slate-400">DDL SQL chuẩn hóa 100% với RLS Security, FK Constraints, Enums & Indexes</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-2 transition-all self-start md:self-auto shrink-0"
        >
          {copied ? <CheckCircle2 className="h-5 w-5 text-slate-950" /> : <Copy className="h-5 w-5" />}
          <span>{copied ? 'Đã Sao Chép SQL' : 'Sao Chép File DDL SQL'}</span>
        </button>
      </div>

      {/* Tables Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { name: 'users', desc: 'Số điện thoại & Auth', icon: '👤' },
          { name: 'hui_days', desc: 'Dây hụi & Cấu hình', icon: '📜' },
          { name: 'hui_members', desc: 'Phần hụi & Trạng thái', icon: '👥' },
          { name: 'hui_rounds', desc: 'Sổ hụi từng kỳ', icon: '🗓️' },
          { name: 'bids', desc: 'Nộp thăm đấu giá', icon: '⚖️' },
          { name: 'transactions', desc: 'Gạch nợ VietQR', icon: '💳' },
          { name: 'chat_messages', desc: 'Chat Realtime', icon: '💬' },
        ].map((t) => (
          <div key={t.name} className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <span className="text-base">{t.icon}</span>
            <span className="font-bold text-amber-400 text-xs block font-mono">{t.name}</span>
            <span className="text-[10px] text-slate-400 block">{t.desc}</span>
          </div>
        ))}
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <FileCode className="h-4 w-4 text-amber-400" />
            <span>schema.sql (PostgreSQL 15+ / Supabase DDL)</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            RLS Active
          </span>
        </div>

        <pre className="p-5 text-xs font-mono text-amber-200/90 overflow-x-auto leading-relaxed max-h-[600px] select-all bg-slate-950">
          <code>{POSTGRES_SCHEMA_SQL}</code>
        </pre>
      </div>

    </div>
  );
};

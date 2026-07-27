import React, { useState } from 'react';
import { API_ENDPOINTS_LIST, ApiEndpointSpec } from '../data/apiSpecs';
import { Code2, ChevronDown, ChevronRight, Copy, CheckCircle2, Send, Server } from 'lucide-react';

export const ApiSpecsView: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string>(API_ENDPOINTS_LIST[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyJson = (obj: object, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-3">
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
          <Code2 className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white">RESTful APIs & Supabase Edge Functions Specs</h2>
          <p className="text-xs text-slate-400">{"Đầy đủ payload request & response JSON cho toàn bộ luồng [Tạo Dây] ➔ [Bỏ Thăm] ➔ [Chốt Kỳ] ➔ [Tạo VietQR]"}</p>
        </div>
      </div>

      {/* Endpoints List */}
      <div className="space-y-4">
        {API_ENDPOINTS_LIST.map((spec) => {
          const isExpanded = expandedId === spec.id;
          return (
            <div
              key={spec.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
            >
              {/* Header Bar */}
              <button
                onClick={() => setExpandedId(isExpanded ? '' : spec.id)}
                className="w-full p-4 text-left flex items-center justify-between bg-slate-900 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold uppercase ${
                    spec.method === 'POST' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {spec.method}
                  </span>
                  <span className="font-bold text-white text-sm sm:text-base font-mono">{spec.path}</span>
                  <span className="text-xs text-slate-400 hidden sm:inline">— {spec.name}</span>
                </div>

                {isExpanded ? <ChevronDown className="h-5 w-5 text-amber-400" /> : <ChevronRight className="h-5 w-5 text-slate-500" />}
              </button>

              {/* Expanded Payload Section */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-4">
                  <p className="text-xs text-slate-300">{spec.description}</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Request Body */}
                    {spec.requestBody && (
                      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-400 font-mono">REQUEST JSON BODY</span>
                          <button
                            onClick={() => handleCopyJson(spec.requestBody!, `req_${spec.id}`)}
                            className="p-1 text-slate-400 hover:text-amber-400 text-[11px] flex items-center space-x-1"
                          >
                            {copiedId === `req_${spec.id}` ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>Sao chép</span>
                          </button>
                        </div>
                        <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                          {JSON.stringify(spec.requestBody, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Response Success */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 font-mono">RESPONSE 200 OK JSON</span>
                        <button
                          onClick={() => handleCopyJson(spec.responseSuccess, `res_${spec.id}`)}
                          className="p-1 text-slate-400 hover:text-amber-400 text-[11px] flex items-center space-x-1"
                        >
                          {copiedId === `res_${spec.id}` ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                          <span>Sao chép</span>
                        </button>
                      </div>
                      <pre className="text-[11px] font-mono text-emerald-200/90 bg-slate-950 p-3 rounded-lg overflow-x-auto leading-relaxed border border-slate-800">
                        {JSON.stringify(spec.responseSuccess, null, 2)}
                      </pre>
                    </div>

                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};

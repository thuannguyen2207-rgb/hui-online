import React from 'react';
import { Smartphone } from 'lucide-react';

interface MobileContainerProps {
  isMobileFrame: boolean;
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ isMobileFrame, children }) => {
  if (!isMobileFrame) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>;
  }

  return (
    <div className="py-8 flex justify-center items-center min-h-[calc(100vh-4rem)]">
      {/* Smartphone Outer Frame */}
      <div className="w-full max-w-[420px] bg-slate-950 border-[10px] border-slate-800 rounded-[48px] shadow-2xl relative overflow-hidden ring-1 ring-slate-700/50">
        
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800 mr-2"></div>
          <div className="w-2 h-2 rounded-full bg-slate-950 border border-slate-800"></div>
        </div>

        {/* Top Status Bar */}
        <div className="pt-6 pb-2 px-6 flex justify-between items-center text-[11px] font-semibold text-slate-400 bg-slate-900/90 border-b border-slate-800/80">
          <span>09:41</span>
          <div className="flex items-center space-x-1.5 text-[10px]">
            <span>5G</span>
            <span>100%</span>
          </div>
        </div>

        {/* App Content Area */}
        <div className="p-4 max-h-[720px] overflow-y-auto custom-scrollbar bg-slate-900">
          {children}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="py-2 bg-slate-950 flex justify-center">
          <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
        </div>

      </div>
    </div>
  );
};

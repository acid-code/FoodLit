import React from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, ShoppingBag, UtensilsCrossed, Scale, Share2, HelpCircle, Calendar } from 'lucide-react';

interface MobileFrameSimulatorProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onExitFrame: () => void;
}

export const MobileFrameSimulator: React.FC<MobileFrameSimulatorProps> = ({
  children,
  activeTab,
  setActiveTab,
  cartCount,
  onExitFrame,
}) => {
  return (
    <div className="py-6 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-900/10">
      {/* Frame Control Strip */}
      <div className="mb-4 flex items-center justify-between w-full max-w-[420px] px-2 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">סימולציית נייד אנדרואיד / PWA</span>
        </div>
        <button
          onClick={onExitFrame}
          className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>מעבר לדסקטופ</span>
        </button>
      </div>

      {/* Android Device Mockup */}
      <div className="w-full max-w-[410px] h-[820px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden">
        {/* Device Notch / Camera */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
        </div>

        {/* Status Bar */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between text-white text-[11px] font-mono z-30 select-none">
          <span>09:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="w-3 h-3" />
            <Wifi className="w-3 h-3" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Screen Content Scroll Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 rounded-[32px] p-4 pb-20 scrollbar-none relative">
          {children}
        </div>

        {/* Bottom Navigation Tab Bar (Mobile Ergonomics - 4 key actions) */}
        <div className="absolute bottom-3 left-3 right-3 h-16 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-lg grid grid-cols-4 items-center px-1 z-40">
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'questionnaire' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">שאלון</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'grid' || activeTab === 'pantry' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">תפריט</span>
          </button>

          <button
            onClick={() => setActiveTab('pantry')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'pantry' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className="text-base">🥫</span>
            <span className="text-[10px] tracking-tight mt-0.5">מזווה</span>
          </button>

          <button
            onClick={() => setActiveTab('handoff')}
            className={`flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
              activeTab === 'handoff' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span className="text-[10px] tracking-tight mt-0.5">העברה לסופר</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-3 w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

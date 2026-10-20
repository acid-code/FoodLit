import React from 'react';
import { ShoppingBag, Smartphone, Monitor } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  isMobileFrame,
  setIsMobileFrame,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('welcome')}
            className="flex items-center gap-2 text-right group cursor-pointer focus-visible:outline-emerald-600"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-emerald-700 transition-colors">
              סל
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
              SalKal · סל קל
            </span>
          </button>
        </div>

        {/* Zone 2: Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs lg:text-sm font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('welcome')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'welcome'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            התחלה
          </button>
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'questionnaire'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            שאלון והתאמה
          </button>
          <button
            onClick={() => setActiveTab('grid')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'grid'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            תפריט שבועי
          </button>
          <button
            onClick={() => setActiveTab('pantry')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'pantry'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            בדיקת מזווה (מה יש בבית)
          </button>
          <button
            onClick={() => setActiveTab('handoff')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'handoff'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            העברה לרשתות
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
              activeTab === 'research'
                ? 'text-emerald-700 font-semibold border-b-2 border-emerald-600'
                : 'hover:text-slate-900'
            }`}
          >
            מעבדת מחקר
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Device Frame Viewport Toggle */}
          <button
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? 'מעבר לתצוגת דסקטופ מלאה' : 'סימולציית נייד אנדרואיד / PWA'}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span>תצוגת דסקטופ</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>תצוגת נייד (PWA)</span>
              </>
            )}
          </button>

          <PWAInstallButton />

          {/* Cart Counter Trigger */}
          <button
            onClick={() => setActiveTab('handoff')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>העבר סל לרשת ({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};

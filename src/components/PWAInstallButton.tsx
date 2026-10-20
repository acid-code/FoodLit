import React, { useState } from 'react';
import { Download, Check, HelpCircle, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  if (isInstalled || justInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg whitespace-nowrap">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        אפליקציה מותקנת
      </span>
    );
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setJustInstalled(true);
    }
  };

  return (
    <>
      {isInstallable ? (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>התקנת PWA</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>התקנה ב-iOS</span>
        </button>
      ) : (
        <button
          onClick={() => setShowIOSGuide(true)}
          title="מידע על אפליקציית Web PWA"
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>התקן למסך הבית</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                התקנת SalKal על מסך הבית
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                באפשרותך להתקין את האפליקציה ישירות כאפליקציית PWA עצמאית ללא צורך בחנות:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                <p>1. בספארי או כרום, לחצו על כפתור <strong>שיתוף</strong> (Share).</p>
                <p>2. גללו מטה ובחרו <strong>הוסף למסך הבית</strong> (Add to Home Screen).</p>
                <p>3. האפליקציה תפעל מהר ובמסך מלא, עם גישה ישירה לסלי הסופרמרקט!</p>
              </div>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              הבנתי, תודה
            </button>
          </div>
        </div>
      )}
    </>
  );
};

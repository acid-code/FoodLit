import React from 'react';
import { ArrowLeft, Split, ShoppingCart, Sparkles, ShieldCheck } from 'lucide-react';

interface HeroBannerProps {
  setActiveTab: (tab: string) => void;
  itemsCount: number;
  totalBasketNis: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  setActiveTab,
  itemsCount,
  totalBasketNis,
}) => {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Hero Copy */}
          <div className="lg:col-span-7 space-y-4 text-right">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="uppercase tracking-wider">טכנולוגיית סל חכם ישראלי</span>
              <span aria-hidden="true">·</span>
              <span>השוואת מחירי אמת ושקיפות מזון</span>
              <span aria-hidden="true">·</span>
              <span>1-Click Handoff</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight text-balance">
              בונים רשימה או מתכון, משווים, ומעבירים סל מוכן ישירות לאתר הסופר.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              במקום להקליד מחדש מוצר-מוצר בכל אתר קניות: SalKal בונה עבורכם סל על בסיס ברקודים ישראליים אמיתיים, מחשבת את הסל הזול ביותר (כולל אופציית <strong>סל מפוצל</strong> חוסך כסף), ומעבירה אותו בלחיצה אחת ישירות לקרפור, ויקטורי, מחסני השוק, רמי לוי ועוד.
            </p>

            {/* Quick Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setActiveTab('builder')}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>התחל להרכיב סל קניות</span>
              </button>

              <button
                onClick={() => setActiveTab('grid')}
                className="px-5 py-2.5 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>תפריט שבועי חכם</span>
              </button>

              <button
                onClick={() => setActiveTab('research')}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>סטטוס בדיקות רשתות וחיבורים</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics & Highlights Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Split className="w-4 h-4 text-emerald-600" />
                  <span>סל הקניות הפעיל שלך</span>
                </div>
                <div className="text-xs text-slate-500">
                  <span>{itemsCount} פריטים</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₪{totalBasketNis.toFixed(2)}</span>
                </div>
              </div>

              {/* 3 Key Architectural Pillars */}
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">5 רשתות בהעברה ישירה (Self-Point)</h4>
                    <p className="text-slate-600 mt-0.5">
                      קרפור, ויקטורי, מחסני השוק, קשת טעמים וטיב טעם — פתיחת סל אורח מיידי ללא צורך בהרשמה מראש.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                    ⚡
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">רמי לוי - קנייה מהירה (Quick Buy)</h4>
                    <p className="text-slate-600 mt-0.5">
                      ייצוא אוטומטי של הרשימה לפורמט הקנייה המהירה של רמי לוי, העתקה בלחיצה ומעבר ישיר לעגלה.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                    ₪
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">אלגוריתם סל מפוצל חכם</h4>
                    <p className="text-slate-600 mt-0.5">
                      קונים ירקות ומוצרי חלב ברשת אחת ושימורים/בשר ברשת שנייה — וחוסכים בממוצע 12-18% על כל קנייה שבועית.
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust & Legal Note */}
              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 border-t border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>מבוסס על קבצי שקיפות המחירים הממשלתיים (חוק המזון תשע״ד-2014)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import {
  Calendar,
  Home,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Store as StoreIcon,
} from 'lucide-react';
import { UserPreferences, Store } from '../types';
import { STORES } from '../data/mockData';

interface StartingWindowProps {
  hasSavedCookie: boolean;
  savedPreferences: UserPreferences | null;
  onStartQuestionnaire: (useSavedPreferences: boolean) => void;
  onResetAndStartFresh: () => void;
}

export const StartingWindow: React.FC<StartingWindowProps> = ({
  hasSavedCookie,
  savedPreferences,
  onStartQuestionnaire,
  onResetAndStartFresh,
}) => {
  const store = savedPreferences
    ? STORES.find((s) => s.id === savedPreferences.preferredStoreId) || STORES[0]
    : STORES[0];

  const totalSavedMeals = savedPreferences
    ? Object.values(savedPreferences.selectedMealsByDay).reduce(
        (sum, arr) => sum + arr.length,
        0
      )
    : 0;

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-16 px-4 text-right">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-12 space-y-8">
        {/* Brand & Introduction */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl mx-auto flex items-center justify-center text-white text-2xl font-black shadow-md shadow-emerald-600/20">
            סל
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            SalKal · סל קל
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
            מתכננים ארוחות לשבוע (א׳ עד שבת), בודקים מה כבר יש לכם בבית — ומעבירים סל מוכן בלחיצה אחת לסופרמרקט!
          </p>
        </div>

        {/* 3 Simple Stages Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-right space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <div className="font-bold text-sm text-slate-900">תכנון ארוחות</div>
            <div className="text-xs text-slate-500 leading-normal">
              עמודות מא׳ עד שבת עם אפשרויות בוקר, צהריים, ערב וקינוח לפי סגנון הבישול שלכם.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-right space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <div className="font-bold text-sm text-slate-900">בדיקת מה יש בבית</div>
            <div className="text-xs text-slate-500 leading-normal">
              סימון מצרכים שקיימים במזווה או במקרר בקפיצות של 0.5 — כדי לקנות רק מה שחסר.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-right space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <div className="font-bold text-sm text-slate-900">1-Click לסופר</div>
            <div className="text-xs text-slate-500 leading-normal">
              העברה ישירה של כל המצרכים לסל אורח בקרפור, ויקטורי, מחסני השוק או רמי לוי.
            </div>
          </div>
        </div>

        {/* Cookie Detection / Returning User Banner */}
        {hasSavedCookie && savedPreferences ? (
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>שמחים לראות אותך שוב! העדפותיך הקודמות נשמרו.</span>
            </div>

            <div className="text-xs text-emerald-800 space-y-1">
              <div>
                רשת מועדפת: <strong>{store.nameHe}</strong> · סועדים: <strong>{savedPreferences.householdSize}</strong>
              </div>
              <div>
                ארוחות קודמות: <strong>{totalSavedMeals} ארוחות</strong> · תקציב: ₪{savedPreferences.budgetMin}–₪{savedPreferences.budgetMax}
              </div>
              <div className="text-emerald-700/80 pt-1">
                בלחיצה על התחלה תעברו בין כל שלבי השאלון, כשהאפשרויות שלכם <strong>מסומנות מראש</strong>.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-slate-400 shrink-0" />
            <span>הימים והארוחות יתחילו ריקים ואפורים, מוכנים לבחירה האישית שלכם.</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {hasSavedCookie ? (
            <>
              <button
                type="button"
                onClick={() => onStartQuestionnaire(true)}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>התחלת תכנון שבועי (האפשרויות שלך מסומנות מראש)</span>
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={onResetAndStartFresh}
                  className="text-xs text-slate-400 hover:text-slate-700 underline font-medium cursor-pointer inline-flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>איפוס הבחירות השמורות והתחלה מחדש עם ימים ריקים</span>
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onStartQuestionnaire(false)}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>התחלת תכנון שבועי חדש</span>
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

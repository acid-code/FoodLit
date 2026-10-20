import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { KitchenAppliance } from '../types';

interface ApplianceItem {
  id: KitchenAppliance;
  nameHe: string;
  subHe: string;
  iconEmoji: string;
  tagHe: string;
}

export const APPLIANCES_LIST: ApplianceItem[] = [
  {
    id: 'stovetop',
    nameHe: 'כיריים (גז / אינדוקציה)',
    subHe: 'בישול בסירים, מחבתות, רטבים והקפצות',
    iconEmoji: '🍳',
    tagHe: 'בסיס',
  },
  {
    id: 'oven',
    nameHe: 'תנור אפייה ביתי',
    subHe: 'אפיית פשטידות, צלי, אנטיפסטי ומאפים',
    iconEmoji: '♨️',
    tagHe: 'קלאסי',
  },
  {
    id: 'airfryer',
    nameHe: 'אייר-פרייר / נינג׳ה (Air Fryer)',
    subHe: 'קראנץ׳ זהוב ללא טיגון, עוף פריך וירקות',
    iconEmoji: '⚡',
    tagHe: 'טרנדי',
  },
  {
    id: 'blender',
    nameHe: 'בלנדר / שייקר אישי',
    subHe: 'שייקים עתירי חלבון, מרקים קטיפתיים ורטבים',
    iconEmoji: '🥤',
    tagHe: 'בריאות',
  },
  {
    id: 'toaster-oven',
    nameHe: 'טוסטר אובן',
    subHe: 'חימום והקרמה מהירה במנות אישיות',
    iconEmoji: '🍞',
    tagHe: 'מהיר',
  },
  {
    id: 'microwave',
    nameHe: 'מיקרוגל',
    subHe: 'אידוי ירקות, חימום מהיר והפשרה',
    iconEmoji: '📡',
    tagHe: 'מהיר',
  },
  {
    id: 'instant-pot',
    nameHe: 'סיר לחץ חשמלי / בישול איטי',
    subHe: 'תבשילי קדירה רכים במיוחד וקטניות',
    iconEmoji: '🍲',
    tagHe: 'סיר אחד',
  },
  {
    id: 'grill-pan',
    nameHe: 'מחבת פסים / גריל',
    subHe: 'צריבה מושלמת של חזה עוף, דגים וטופו',
    iconEmoji: '🥩',
    tagHe: 'צריבה',
  },
  {
    id: 'panini-press',
    nameHe: 'טוסטר לחיצה',
    subHe: 'טורטיות קריספיות, טוסטים וכריכים חמים',
    iconEmoji: '🥪',
    tagHe: 'קראנץ׳',
  },
  {
    id: 'sous-vide',
    nameHe: 'סו-וויד (בישול מים בוואקום)',
    subHe: 'דיוק בטמפרטורה, בשרים עסיסיים ורכים בטירוף',
    iconEmoji: '🥩',
    tagHe: 'שף',
  },
  {
    id: 'food-processor',
    nameHe: 'מעבד מזון / קוצץ חשמלי',
    subHe: 'קיצוץ מהיר של ירקות, מחיות ובצקים',
    iconEmoji: '🔪',
    tagHe: 'קיצוץ',
  },
];

interface KitchenAppliancesSelectorProps {
  selectedAppliances: KitchenAppliance[];
  onChange: (updated: KitchenAppliance[]) => void;
}

export const KitchenAppliancesSelector: React.FC<KitchenAppliancesSelectorProps> = ({
  selectedAppliances = ['stovetop', 'oven'],
  onChange,
}) => {
  const toggleAppliance = (applianceId: KitchenAppliance) => {
    if (selectedAppliances.includes(applianceId)) {
      onChange(selectedAppliances.filter((id) => id !== applianceId));
    } else {
      onChange([...selectedAppliances, applianceId]);
    }
  };

  const handleSelectAll = () => {
    onChange(APPLIANCES_LIST.map((a) => a.id));
  };

  const handleClearAll = () => {
    onChange(['stovetop']); // keep stovetop as minimal default
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-l from-emerald-50 via-teal-50 to-white p-4 rounded-2xl border border-emerald-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🧑‍🍳</span>
            <h4 className="text-sm font-black text-slate-900">
              איזה כלי הכנה ובישול יש לכם במטבח?
            </h4>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            האפליקציה תשקלל את הכלים הזמינים ותתאים מתכונים שלא דורשים מכשיר שאין ברשותכם (למשל אייר-פרייר או בלנדר).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-xs">
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-2.5 py-1 text-emerald-800 font-bold bg-emerald-100/70 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
          >
            יש לי הכל ✓
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            איפוס לכיריים
          </button>
        </div>
      </div>

      {/* Neat Eat Style Grid with Bouncy Card Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {APPLIANCES_LIST.map((appliance) => {
          const isSelected = selectedAppliances.includes(appliance.id);

          return (
            <button
              key={appliance.id}
              type="button"
              onClick={() => toggleAppliance(appliance.id)}
              className={`p-3.5 rounded-2xl border text-right transition-all duration-200 cursor-pointer select-none relative overflow-hidden group flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white border-emerald-500 shadow-sm ring-2 ring-emerald-500/20 translate-y-[-2px]'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              {/* Header inside Card */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 ${
                      isSelected ? 'scale-110 bg-emerald-100 shadow-2xs' : 'bg-slate-100 group-hover:scale-105'
                    }`}
                  >
                    {appliance.iconEmoji}
                  </span>
                  <div>
                    <span className="font-black text-xs text-slate-900 block leading-tight">
                      {appliance.nameHe}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 inline-block mt-0.5">
                      {appliance.tagHe}
                    </span>
                  </div>
                </div>

                {/* Checkbox indicator with spring feedback */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs scale-100'
                      : 'border-2 border-slate-300 text-transparent scale-90'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Subtitle description */}
              <p className="text-[11px] text-slate-500 leading-relaxed pr-1">
                {appliance.subHe}
              </p>
            </button>
          );
        })}
      </div>

      <div className="text-left text-[11px] text-slate-500 font-medium">
        נבחרו <strong className="text-emerald-700">{selectedAppliances.length}</strong> מכשירי בישול והכנה
      </div>
    </div>
  );
};

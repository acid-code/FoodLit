import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  Clock,
  Check,
  ChevronDown,
  X,
  Plus,
  Flame,
  Zap,
  Heart,
  Layers,
  ChefHat,
  Dumbbell,
  ShieldCheck,
} from 'lucide-react';
import { MealRecipe, KitchenAppliance, MealType } from '../types';
import { MEAL_RECIPES } from '../data/mockData';
import { APPLIANCES_LIST } from './KitchenAppliancesSelector';

interface RecipeBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipe?: (recipe: MealRecipe) => void;
  userAppliances?: KitchenAppliance[];
}

export const RecipeBankModal: React.FC<RecipeBankModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipe,
  userAppliances = ['stovetop', 'oven'],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all');
  const [effortFilter, setEffortFilter] = useState<string>('all');
  const [applianceFilter, setApplianceFilter] = useState<string>('all');
  const [proteinFilter, setProteinFilter] = useState<boolean>(false);
  const [flavorFilter, setFlavorFilter] = useState<string>('all');
  const [kosherFilter, setKosherFilter] = useState<string>('all');
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<MealRecipe | null>(null);

  const filteredRecipes = useMemo(() => {
    return MEAL_RECIPES.filter((r) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchTitle = r.titleHe.toLowerCase().includes(q) || r.titleEn.toLowerCase().includes(q);
        const matchSub = r.subtitleHe.toLowerCase().includes(q) || r.descriptionHe.toLowerCase().includes(q);
        if (!matchTitle && !matchSub) return false;
      }

      // Meal Type
      if (mealTypeFilter !== 'all' && r.mealType !== mealTypeFilter) return false;

      // Effort Tag
      if (effortFilter !== 'all' && r.effortTagHe !== effortFilter) return false;

      // Appliance Filter
      if (applianceFilter !== 'all') {
        const required = r.appliancesRequired || ['stovetop'];
        if (!required.includes(applianceFilter as KitchenAppliance)) return false;
      }

      // Protein Filter
      if (proteinFilter && (!r.isHighProtein || (r.proteinGrams || 0) < 25)) return false;

      // Flavor Filter
      if (flavorFilter !== 'all' && r.flavorProfile && r.flavorProfile !== flavorFilter) return false;

      // Kosher Filter
      if (kosherFilter === 'kosher-only' && r.isKosher === false) return false;
      if (kosherFilter === 'non-kosher-only' && r.isKosher !== false) return false;

      return true;
    });
  }, [
    searchTerm,
    mealTypeFilter,
    effortFilter,
    applianceFilter,
    proteinFilter,
    flavorFilter,
    kosherFilter,
  ]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto" dir="rtl">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl text-emerald-300 text-xl">
              📖
            </span>
            <div>
              <h3 className="text-xl font-black">בנק המתכונים המלא של SalKal</h3>
              <p className="text-xs text-slate-300">
                סינון לפי סוגי בישול, מכשירי מטבח (אייר-פרייר/בלנדר), רמת חלבון, כשרות ומנות מהעולם
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* Search row */}
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="חפשו מתכון, רכיב, או סגנון (למשל: סלמון, חלבון, אייר פרייר, שקשוקה)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* High Protein Toggle Button */}
            <button
              type="button"
              onClick={() => setProteinFilter(!proteinFilter)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                proteinFilter
                  ? 'bg-purple-600 text-white shadow-2xs scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5 text-purple-300" />
              <span>עתיר חלבון (25g+)</span>
              {proteinFilter && <Check className="w-3 h-3 text-white" />}
            </button>
          </div>

          {/* Quick Filter Pill Strips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {/* Meal Type */}
            <select
              value={mealTypeFilter}
              onChange={(e) => setMealTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">כל הארוחות</option>
              <option value="breakfast">ארוחת בוקר ☕</option>
              <option value="lunch">ארוחת צהריים ☀️</option>
              <option value="dinner">ארוחת ערב 🌙</option>
              <option value="dessert">קינוח / מתוק 🍰</option>
            </select>

            {/* Appliance Filter */}
            <select
              value={applianceFilter}
              onChange={(e) => setApplianceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">כל המכשירים 🧑‍🍳</option>
              <option value="airfryer">אייר-פרייר / נינג׳ה ⚡</option>
              <option value="blender">בלנדר / שייקר 🥤</option>
              <option value="oven">תנור אפייה ♨️</option>
              <option value="stovetop">כיריים ומחבת 🍳</option>
            </select>

            {/* Effort Tag */}
            <select
              value={effortFilter}
              onChange={(e) => setEffortFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">סגנון בישול</option>
              <option value="פחות מ-20 דקות">פחות מ-20 דקות ⚡</option>
              <option value="סיר אחד">סיר אחד 🍲</option>
              <option value="ארוחת שבת">ארוחת שבת 🕯️</option>
              <option value="ידידותי לילדים">ידידותי לילדים 🧒</option>
              <option value="מתוק וקל">מתוק וקל 🍯</option>
            </select>

            {/* Flavor: Sweet vs Savory */}
            <select
              value={flavorFilter}
              onChange={(e) => setFlavorFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">מתוק / מלוח</option>
              <option value="sweet">מתוק 🍯</option>
              <option value="savory">מלוח / פיקנטי 🧂</option>
            </select>

            {/* Kosher */}
            <select
              value={kosherFilter}
              onChange={(e) => setKosherFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 text-xs focus:outline-none"
            >
              <option value="all">כל הכשרויות</option>
              <option value="kosher-only">כשר בלבד ✡️</option>
              <option value="non-kosher-only">מיוחדים (טיב טעם) 🥓</option>
            </select>

            {(searchTerm || mealTypeFilter !== 'all' || effortFilter !== 'all' || applianceFilter !== 'all' || proteinFilter || flavorFilter !== 'all' || kosherFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setMealTypeFilter('all');
                  setEffortFilter('all');
                  setApplianceFilter('all');
                  setProteinFilter(false);
                  setFlavorFilter('all');
                  setKosherFilter('all');
                }}
                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-[11px] underline cursor-pointer"
              >
                איפוס מסננים
              </button>
            )}
          </div>
        </div>

        {/* Recipes Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
            <span>נמצאו {filteredRecipes.length} מתכונים מתאימים</span>
            <span>מציג מנות בריאות ומקוריות מכל העולם</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRecipes.map((recipe) => {
              const appliances = recipe.appliancesRequired || ['stovetop'];

              return (
                <div
                  key={recipe.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 bg-white shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-slate-100 text-[11px]">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                          {recipe.mealType === 'breakfast' && 'בוקר ☕'}
                          {recipe.mealType === 'lunch' && 'צהריים ☀️'}
                          {recipe.mealType === 'dinner' && 'ערב 🌙'}
                          {recipe.mealType === 'dessert' && 'קינוח 🍰'}
                        </span>

                        {recipe.isHighProtein && (
                          <span className="px-2 py-0.5 rounded-md font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                            <Dumbbell className="w-3 h-3" />
                            <span>{recipe.proteinGrams || 30}g חלבון</span>
                          </span>
                        )}

                        {appliances.includes('airfryer') && (
                          <span className="px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            אייר-פרייר ⚡
                          </span>
                        )}

                        {appliances.includes('blender') && (
                          <span className="px-2 py-0.5 rounded-md font-bold bg-sky-100 text-sky-800 border border-sky-200">
                            בלנדר 🥤
                          </span>
                        )}

                        {recipe.isKosher === false && (
                          <span className="px-2 py-0.5 rounded-md font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            טיב טעם 🥓
                          </span>
                        )}
                      </div>

                      <span className="font-extrabold text-slate-800 tabular-nums">
                        ~₪{recipe.estimatedCostNis}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="pt-2">
                      <h4 className="font-black text-sm text-slate-900 leading-snug">
                        {recipe.titleHe}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {recipe.subtitleHe}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      ⏱️ {recipe.prepTimeMinutes} דקות · {recipe.effortTagHe}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {onSelectRecipe && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectRecipe(recipe);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>בחר לתפריט</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

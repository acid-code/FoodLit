import React, { useState, useEffect } from 'react';
import { Users, Wallet, ShieldCheck, UtensilsCrossed, ArrowLeft, ArrowRight, Check, Sparkles, RotateCcw, Globe, ChevronDown } from 'lucide-react';
import { UserPreferences, StoreId, MealType, CuisineType, KitchenAppliance } from '../types';
import { KitchenAppliancesSelector } from './KitchenAppliancesSelector';

interface OnboardingQuestionnaireProps {
  onComplete: (preferences: UserPreferences) => void;
  onSkip: () => void;
  initialPreferences?: UserPreferences;
}

export const OnboardingQuestionnaire: React.FC<OnboardingQuestionnaireProps> = ({
  onComplete,
  onSkip,
  initialPreferences,
}) => {
  const [step, setStep] = useState<number>(1);

  // Recipient / household diner count
  const [householdSize, setHouseholdSize] = useState<number>(
    initialPreferences?.householdSize || 4
  );

  // 7 days columns from Sunday to Saturday - only first letter: א, ב, ג, ד, ה, ו, ש
  const DAYS_COLUMNS = [
    { id: 'sun', letter: 'א' },
    { id: 'mon', letter: 'ב' },
    { id: 'tue', letter: 'ג' },
    { id: 'wed', letter: 'ד' },
    { id: 'thu', letter: 'ה' },
    { id: 'fri', letter: 'ו' },
    { id: 'sat', letter: 'ש' },
  ];

  const MEAL_OPTIONS: { id: MealType; label: string }[] = [
    { id: 'breakfast', label: 'בוקר' },
    { id: 'lunch', label: 'צהריים' },
    { id: 'dinner', label: 'ערב' },
    { id: 'dessert', label: 'קינוח' },
  ];

  // Each day starts with selected meals.
  // "All columns start grey, each options gets green and make the day name green too when selected"
  const [selectedMealsByDay, setSelectedMealsByDay] = useState<Record<string, MealType[]>>(() => {
    if (
      initialPreferences?.selectedMealsByDay &&
      Object.values(initialPreferences.selectedMealsByDay).some((list) => list.length > 0)
    ) {
      return initialPreferences.selectedMealsByDay;
    }
    // Start with all columns grey (empty selections)
    const initial: Record<string, MealType[]> = {};
    DAYS_COLUMNS.forEach((day) => {
      initial[day.id] = [];
    });
    return initial;
  });

  // Price range feature: min and max range, with static presets adjusting the end of the range
  const [budgetMin, setBudgetMin] = useState<number>(
    initialPreferences?.budgetMin || 250
  );
  const [budgetMax, setBudgetMax] = useState<number>(
    initialPreferences?.budgetMax || initialPreferences?.weeklyBudget || 750
  );

  // Cuisine types preferences - including Indian, Asian, Mexican, Italian, Israeli, etc.
  const [cuisinePreferences, setCuisinePreferences] = useState<CuisineType[]>(
    initialPreferences?.cuisinePreferences || ['israeli', 'indian', 'asian', 'italian', 'mediterranean']
  );

  // Meal types / culinary style preferences
  const [culinaryPreferences, setCulinaryPreferences] = useState<string[]>(
    initialPreferences?.culinaryPreferences || ['quick-20', 'one-pot', 'batch-cooking']
  );

  // Smart multi-meal batch cooking preference (recipes yield more than 1 meal and can split across days)
  const [enableBatchCooking, setEnableBatchCooking] = useState<boolean>(
    initialPreferences?.enableBatchCooking ?? true
  );

  const [dietary, setDietary] = useState<UserPreferences['dietary']>(
    initialPreferences?.dietary || 'standard'
  );

  const [kitchenAppliances, setKitchenAppliances] = useState<KitchenAppliance[]>(
    initialPreferences?.kitchenAppliances || ['stovetop', 'oven', 'airfryer', 'blender']
  );

  const [highProteinFocus, setHighProteinFocus] = useState<boolean>(
    initialPreferences?.highProteinFocus || false
  );

  const [targetProteinPerMeal, setTargetProteinPerMeal] = useState<{ breakfast?: number; lunch?: number; dinner?: number }>(
    initialPreferences?.targetProteinPerMeal || { breakfast: 30, lunch: 45, dinner: 35 }
  );
  const [hasProteinPowder, setHasProteinPowder] = useState<boolean>(
    initialPreferences?.hasProteinPowder ?? true
  );
  const [proteinSweetPreference, setProteinSweetPreference] = useState<'both' | 'savory-only'>(
    initialPreferences?.proteinSweetPreference || 'both'
  );

  // Total steps: 4 (Choosing supermarket is moved to the end when the list is done!)
  const totalSteps = 4;

  // Sync state whenever initialPreferences changes (e.g. from Starting Window toggle)
  useEffect(() => {
    if (initialPreferences) {
      if (
        initialPreferences.selectedMealsByDay &&
        Object.values(initialPreferences.selectedMealsByDay).some((arr) => arr.length > 0)
      ) {
        setSelectedMealsByDay(initialPreferences.selectedMealsByDay);
      } else {
        const empty: Record<string, MealType[]> = {};
        DAYS_COLUMNS.forEach((day) => {
          empty[day.id] = [];
        });
        setSelectedMealsByDay(empty);
      }

      if (initialPreferences.householdSize) {
        setHouseholdSize(initialPreferences.householdSize);
      }
      if (initialPreferences.budgetMin) {
        setBudgetMin(initialPreferences.budgetMin);
      }
      if (initialPreferences.budgetMax) {
        setBudgetMax(initialPreferences.budgetMax);
      }
      if (initialPreferences.cuisinePreferences) {
        setCuisinePreferences(initialPreferences.cuisinePreferences);
      }
      if (initialPreferences.culinaryPreferences) {
        setCulinaryPreferences(initialPreferences.culinaryPreferences);
      }
      if (initialPreferences.enableBatchCooking !== undefined) {
        setEnableBatchCooking(initialPreferences.enableBatchCooking);
      }
      if (initialPreferences.dietary) {
        setDietary(initialPreferences.dietary);
      }
    }
  }, [initialPreferences]);

  const toggleCuisinePref = (c: CuisineType) => {
    setCuisinePreferences((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const toggleCulinaryPref = (prefId: string) => {
    setCulinaryPreferences((prev) =>
      prev.includes(prefId)
        ? prev.filter((p) => p !== prefId)
        : [...prev, prefId]
    );
  };

  // Toggle meal option inside a specific day column
  const toggleMealOption = (dayId: string, mealType: MealType) => {
    setSelectedMealsByDay((prev) => {
      const currentList = prev[dayId] || [];
      const isAlreadySelected = currentList.includes(mealType);

      const nextList = isAlreadySelected
        ? currentList.filter((m) => m !== mealType)
        : [...currentList, mealType];

      return {
        ...prev,
        [dayId]: nextList,
      };
    });
  };

  // Toggle all meals for a specific day
  const toggleAllForDay = (dayId: string) => {
    setSelectedMealsByDay((prev) => {
      const currentList = prev[dayId] || [];
      const allSelected = currentList.length === MEAL_OPTIONS.length;
      return {
        ...prev,
        [dayId]: allSelected ? [] : MEAL_OPTIONS.map((m) => m.id),
      };
    });
  };

  // Batch actions
  const selectAllDinners = () => {
    setSelectedMealsByDay((prev) => {
      const updated = { ...prev };
      DAYS_COLUMNS.forEach((day) => {
        const cur = updated[day.id] || [];
        if (!cur.includes('dinner')) {
          updated[day.id] = [...cur, 'dinner'];
        }
      });
      return updated;
    });
  };

  const clearAllMeals = () => {
    const empty: Record<string, MealType[]> = {};
    DAYS_COLUMNS.forEach((day) => {
      empty[day.id] = [];
    });
    setSelectedMealsByDay(empty);
  };

  const handleStaticBudgetPreset = (targetMax: number) => {
    setBudgetMax(targetMax);
    if (budgetMin >= targetMax) {
      setBudgetMin(Math.max(150, targetMax - 300));
    }
  };

  const totalMealsSelected = Object.values(selectedMealsByDay).reduce(
    (sum, list) => sum + list.length,
    0
  );

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Collect unique meal types selected across all days
      const uniqueTypes = new Set<MealType>();
      Object.values(selectedMealsByDay).forEach((list) => {
        list.forEach((t) => uniqueTypes.add(t));
      });

      onComplete({
        householdSize,
        budgetMin,
        budgetMax,
        weeklyBudget: budgetMax,
        dietary,
        culinaryPreferences: culinaryPreferences.length > 0 ? culinaryPreferences : ['israeli-home', 'batch-cooking'],
        cuisinePreferences: cuisinePreferences.length > 0 ? cuisinePreferences : ['israeli', 'indian', 'asian', 'italian'],
        kitchenAppliances,
        highProteinFocus: culinaryPreferences.includes('high-protein') || highProteinFocus,
        targetProteinPerMeal,
        hasProteinPowder,
        proteinSweetPreference,
        enableBatchCooking,
        selectedMealsByDay,
        selectedMealTypes: Array.from(uniqueTypes),
        preferredStoreId:
          dietary === 'non-kosher'
            ? 'tivtaam'
            : initialPreferences?.preferredStoreId || 'carrefour',
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6">
      {/* Questionnaire Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-8 space-y-6">
        {/* Progress Bar & Step Tracker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>שלב {step} מתוך {totalSteps}</span>
            <button
              onClick={onSkip}
              className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              דלג ישירות לתפריט
            </button>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Sunday to Saturday Columns with Breakfast, Lunch, Dinner, Dessert in each column */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
              <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-1">
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>תכנון שבועי</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  בחרו אפשרויות ארוחה לכל יום בשבוע
                </h2>
              </div>

              {/* Recipient / Diner Count Selector Inline (1 to 4 buttons, 5 to 10 dropdown) */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs font-bold text-slate-700 px-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>סועדים:</span>
                </span>

                {/* 1 to 4 Direct Option Buttons */}
                {[1, 2, 3, 4].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setHouseholdSize(count)}
                    className={`w-8 h-8 rounded-xl text-xs font-black tabular-nums transition-all cursor-pointer flex items-center justify-center ${
                      householdSize === count
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                        : 'text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                    }`}
                  >
                    {count}
                  </button>
                ))}

                {/* Nice Looking Drop Down Going from 5 to 10 */}
                <div className="relative">
                  <select
                    value={householdSize >= 5 ? householdSize : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        setHouseholdSize(Number(e.target.value));
                      }
                    }}
                    className={`h-8 text-xs font-extrabold pl-6 pr-3 rounded-xl border transition-all cursor-pointer appearance-none ${
                      householdSize >= 5
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-700 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <option value="" disabled hidden>
                      5–10 סועדים
                    </option>
                    {[5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num} className="bg-white text-slate-900 font-bold py-1">
                        {num} סועדים
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                      householdSize >= 5 ? 'text-white' : 'text-slate-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Sunday to Saturday Columns Container - Widened */}
            <div className="bg-slate-50/70 p-4 sm:p-6 lg:p-7 rounded-3xl border border-slate-200/90 space-y-4 overflow-x-auto">
              {/* Quick Batch Select Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500 font-medium">
                  נבחרו: <strong className="text-slate-900">{totalMealsSelected} ארוחות</strong> בסך הכל
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllDinners}
                    className="px-3 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-medium text-xs cursor-pointer transition-colors shadow-2xs"
                  >
                    סמן את כל ארוחות הערב
                  </button>
                  <button
                    type="button"
                    onClick={clearAllMeals}
                    className="px-2.5 py-1 text-slate-500 hover:text-slate-800 rounded-lg text-xs cursor-pointer flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>איפוס</span>
                  </button>
                </div>
              </div>

              {/* 7 Columns: Sunday to Saturday - Widened with ONLY the Day First Letter */}
              <div className="grid grid-cols-7 gap-3 sm:gap-4 lg:gap-5 min-w-[780px] sm:min-w-[880px] lg:min-w-0 w-full">
                {DAYS_COLUMNS.map((day) => {
                  const dayMeals = selectedMealsByDay[day.id] || [];
                  const isDaySelected = dayMeals.length > 0;

                  return (
                    <div
                      key={day.id}
                      className={`rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all border ${
                        isDaySelected
                          ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200/70 shadow-xs'
                          : 'bg-slate-100/80 border-slate-200'
                      }`}
                    >
                      {/* Column Header: ONLY the day's first letter (Turns GREEN when at least one option is selected) */}
                      <button
                        type="button"
                        onClick={() => toggleAllForDay(day.id)}
                        title={`בחירה או ביטול כל יום ${day.letter}`}
                        className={`w-full h-12 sm:h-14 lg:h-16 rounded-2xl text-center mb-3 transition-all cursor-pointer select-none flex items-center justify-center text-xl sm:text-3xl font-black ${
                          isDaySelected
                            ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                            : 'bg-slate-200/90 text-slate-500 hover:bg-slate-300 hover:text-slate-700'
                        }`}
                      >
                        {day.letter}
                      </button>

                      {/* 4 Options Stacked in Each Column: Breakfast, Lunch, Dinner, Dessert */}
                      <div className="space-y-2 sm:space-y-2.5">
                        {MEAL_OPTIONS.map((opt) => {
                          const isOptionSelected = dayMeals.includes(opt.id);

                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => toggleMealOption(day.id, opt.id)}
                              className={`w-full py-3 sm:py-3.5 lg:py-4 px-2 rounded-xl text-xs sm:text-sm text-center transition-all cursor-pointer font-bold select-none flex items-center justify-center gap-1.5 border ${
                                isOptionSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs ring-1 ring-emerald-500/20'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt.label}</span>
                              {isOptionSelected && (
                                <Check className="w-3.5 h-3.5 text-white shrink-0 hidden sm:inline-block" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Preferred Cuisines & Smart Multi-Meal Planning */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>סוגי מטבחים ובישול חכם לכמה ימים</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                אילו סוגי מטבחים אתם מעדיפים בתפריט?
              </h2>
              <p className="text-xs text-slate-500">
                סמנו את המטבחים והסגנונות האהובים עליכם — התפריט השבועי יתאים מתכונים בהתאם:
              </p>
            </div>

            {/* Smart Multi-Meal Batch Cooking Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-amber-900 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>בישול חכם: תבשיל סיר גדול שמספיק ל-2 ארוחות נפרדות</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
                  מתכונים כמו <strong>קארי הודי</strong>, <strong>בולונז בסיר אחד</strong>, <strong>מוקפץ אסייתי</strong> או <strong>שניצלים</strong> מניבים כמות גדולה שנשמרת מעולה ומשמשת לצהריים ביום למחרת — <strong>ללא קניית מצרכים כפולה בסופר!</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEnableBatchCooking(!enableBatchCooking)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5 border ${
                  enableBatchCooking
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                }`}
              >
                {enableBatchCooking && <Check className="w-3.5 h-3.5" />}
                <span>{enableBatchCooking ? 'חלוקה ליומיים מופעלת' : 'הפעל חלוקה ליומיים'}</span>
              </button>
            </div>

            {/* Section 1: All Requested Cuisines */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700 text-right">
                סוגי מטבחים מועדפים:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'indian', title: '🇮🇳 הודי (Indian)', desc: 'קארי עוף מנחם בקרם קוקוס, תבשיל דאל עדשים, אורז בסמטי' },
                  { id: 'asian', title: '🥢 אסייתי (Asian)', desc: 'מוקפץ עוף בסויה, ירקות פריכים, נודלס ואורז' },
                  { id: 'italian', title: '🇮🇹 איטלקי (Italian)', desc: 'פסטה בולונז עשירה, פומודורו בסיר אחד, שמן זית' },
                  { id: 'mexican', title: '🇲🇽 מקסיקני (Mexican)', desc: 'פחיטס עוף בטורטיות חמות, סלסה רעננה, בוריטו בול' },
                  { id: 'israeli', title: '🇮🇱 ישראלי (Israeli)', desc: 'שקשוקה במחבת, ארוחת בוקר כפרית, סלטים וחלה' },
                  { id: 'mediterranean', title: '🫒 ים תיכוני', desc: 'ירקות טריים, גבינות, שמן זית מובחר ודגנים' },
                  { id: 'traditional', title: '🕯️ מסורתי לשבת', desc: 'עוף זהוב עסיסי, אורז מבושם, חלות שבת וסלטים' },
                  { id: 'american', title: '🍔 אמריקאי וילדים', desc: 'שניצלים פריכים לילדים, המבורגר ביתי עסיסי' },
                ].map((c) => {
                  const isSelected = cuisinePreferences.includes(c.id as CuisineType);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCuisinePref(c.id as CuisineType)}
                      className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/60 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs sm:text-sm font-extrabold">{c.title}</span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal leading-snug">
                        {c.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Cooking Effort Styles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 text-right">
                סגנון הכנה וזמן:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {[
                  { id: 'batch-cooking', title: 'בישול כפול (שאריות)', desc: 'סיר שמספיק ל-2 ארוחות' },
                  { id: 'quick-20', title: 'פחות מ-20 דקות', desc: 'מהיר במיוחד לערב עמוס' },
                  { id: 'one-pot', title: 'סיר אחד (One-Pot)', desc: 'מינימום כלים לשטיפה' },
                  { id: 'kids-friendly', title: 'ידידותי לילדים', desc: 'מנות שילדים אוהבים תמיד' },
                  { id: 'high-protein', title: '💪 דגש חלבון וערכים', desc: 'שמירה על כמות חלבון גבוהה' },
                ].map((style) => {
                  const isSelected = culinaryPreferences.includes(style.id);
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => toggleCulinaryPref(style.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{style.title}</div>
                        <div className="text-[10px] text-slate-500 font-normal">{style.desc}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Conditional High-Protein & Nutrition Targets (Only shown if selected!) */}
              {culinaryPreferences.includes('high-protein') && (
                <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-4 animate-fadeIn text-right mt-3">
                  <div className="flex items-center justify-between pb-2 border-b border-purple-200/60">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💪</span>
                      <strong className="text-xs sm:text-sm font-black text-purple-950">
                        התאמת יעדי חלבון וערכים תזונתיים
                      </strong>
                    </div>
                    <span className="text-[11px] text-purple-700 font-semibold bg-purple-100 px-2 py-0.5 rounded-full">
                      מותאם אישית
                    </span>
                  </div>

                  {/* Targets per meal */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-purple-900 block">
                      יעד גרם חלבון מומלץ לארוחה:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white p-2.5 rounded-xl border border-purple-200 space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block">ארוחת בוקר</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={15}
                            max={60}
                            value={targetProteinPerMeal.breakfast || 30}
                            onChange={(e) =>
                              setTargetProteinPerMeal((prev) => ({
                                ...prev,
                                breakfast: Number(e.target.value),
                              }))
                            }
                            className="w-14 p-1 text-center font-bold text-purple-900 bg-purple-50 border border-purple-200 rounded-lg text-xs"
                          />
                          <span className="text-[10px] text-slate-500 font-semibold">גרם</span>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-purple-200 space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block">ארוחת צהריים</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={20}
                            max={80}
                            value={targetProteinPerMeal.lunch || 45}
                            onChange={(e) =>
                              setTargetProteinPerMeal((prev) => ({
                                ...prev,
                                lunch: Number(e.target.value),
                              }))
                            }
                            className="w-14 p-1 text-center font-bold text-purple-900 bg-purple-50 border border-purple-200 rounded-lg text-xs"
                          />
                          <span className="text-[10px] text-slate-500 font-semibold">גרם</span>
                        </div>
                      </div>

                      <div className="bg-white p-2.5 rounded-xl border border-purple-200 space-y-1">
                        <span className="text-[11px] font-bold text-slate-700 block">ארוחת ערב</span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={20}
                            max={70}
                            value={targetProteinPerMeal.dinner || 35}
                            onChange={(e) =>
                              setTargetProteinPerMeal((prev) => ({
                                ...prev,
                                dinner: Number(e.target.value),
                              }))
                            }
                            className="w-14 p-1 text-center font-bold text-purple-900 bg-purple-50 border border-purple-200 rounded-lg text-xs"
                          />
                          <span className="text-[10px] text-slate-500 font-semibold">גרם</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Protein powder at home toggle */}
                  <div className="space-y-1.5 pt-1 border-t border-purple-200/60">
                    <span className="text-xs font-bold text-purple-900 block">
                      האם יש לכם אבקת חלבון בבית?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setHasProteinPowder(true)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                          hasProteinPowder
                            ? 'bg-purple-600 text-white font-bold border-purple-600 shadow-2xs'
                            : 'bg-white text-purple-950 border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold">יש לי אבקת חלבון (וניל/ניטרלית)</div>
                          <div className="text-[10px] opacity-80">מאפשר קינוחים עתירי חלבון (קרם ברולה, פנקייק קוטג׳)</div>
                        </div>
                        {hasProteinPowder && <Check className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setHasProteinPowder(false)}
                        className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                          !hasProteinPowder
                            ? 'bg-purple-600 text-white font-bold border-purple-600 shadow-2xs'
                            : 'bg-white text-purple-950 border-purple-200 hover:bg-purple-50'
                        }`}
                      >
                        <div>
                          <div className="font-bold">ללא אבקה (רק ממזון שלם)</div>
                          <div className="text-[10px] opacity-80">חלבון רק מביצים, עוף, סלמון, גבינות וקוטג׳</div>
                        </div>
                        {!hasProteinPowder && <Check className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Sweet vs Savory for protein snacks */}
                  <div className="space-y-1.5 pt-1 border-t border-purple-200/60">
                    <span className="text-xs font-bold text-purple-900 block">
                      העדפת קינוחים ומנות חלבון:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setProteinSweetPreference('both')}
                        className={`px-3 py-1.5 rounded-lg border cursor-pointer font-bold transition-all ${
                          proteinSweetPreference === 'both'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-purple-900 border-purple-200'
                        }`}
                      >
                        גם מתוק (שייקים, קרם ברולה) וגם מלוח
                      </button>
                      <button
                        type="button"
                        onClick={() => setProteinSweetPreference('savory-only')}
                        className={`px-3 py-1.5 rounded-lg border cursor-pointer font-bold transition-all ${
                          proteinSweetPreference === 'savory-only'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-purple-900 border-purple-200'
                        }`}
                      >
                        מנות מלוחות בלבד
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Weekly Food Budget (Range feature with static presets, non-judgemental) */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <Wallet className="w-4 h-4" />
                <span>טווח תקציב שבועי</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                בחרו את טווח התקציב השבועי שלכם
              </h2>
            </div>

            {/* Price Range Display */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/90 text-center space-y-4">
              <div className="text-xs font-medium text-slate-500">
                טווח שנבחר לשבוע:
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
                ₪{budgetMin} – ₪{budgetMax}
              </div>

              {/* Range Slider */}
              <div className="space-y-3 pt-2 max-w-md mx-auto">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>מינימום: ₪{budgetMin}</span>
                    <span>מקסימום: ₪{budgetMax}</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="2000"
                    step="50"
                    value={budgetMax}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBudgetMax(val);
                      if (val <= budgetMin) {
                        setBudgetMin(Math.max(100, val - 100));
                      }
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Static Preset Buttons that automatically adjust the end of range */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-600 text-right">
                בחירה מהירה לפי תקרה (מכוון אוטומטית את סוף הטווח):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[450, 750, 1100, 1600].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleStaticBudgetPreset(preset)}
                    className={`py-3 px-4 rounded-xl border text-center transition-all cursor-pointer font-bold text-sm tabular-nums ${
                      budgetMax === preset
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    עד ₪{preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Dietary & Kosher */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2 text-right">
              <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>כשרות והעדפות</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                האם יש לכם העדפות כשרות או תזונה?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'standard',
                  title: 'כשרות רגילה (סופרמרקטים כלליים)',
                  desc: 'מוצרים כשרים בכל הרשתות (קרפור, ויקטורי, רמי לוי ועוד)',
                  badge: '🇮🇱 כשר',
                },
                {
                  id: 'non-kosher',
                  title: 'לא כשר / טיב טעם (Tiv Taam)',
                  desc: 'כולל בייקון מעושן, שרימפס ופירות ים, גבינות ונקניקים מיוחדים',
                  badge: '🥓 לא כשר / שבת',
                },
                {
                  id: 'kosher-mehadrin',
                  title: 'כשרות מהדרין / בד״ץ',
                  desc: 'השגחה מחמירה והקפדה על כל המוצרים',
                  badge: '✨ מהדרין',
                },
                {
                  id: 'vegetarian',
                  title: 'צמחוני / ללא בשר',
                  desc: 'מתכונים צמחוניים עשירים ומזינים ללא בשר',
                  badge: '🥗 צמחוני',
                },
                {
                  id: 'healthy-budget',
                  title: 'תזונה בריאה ודלת שומן',
                  desc: 'דגש על ירקות טריים, דגנים מלאים וקטניות',
                  badge: '🥑 בריא',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDietary(opt.id as UserPreferences['dietary'])}
                  className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                    dietary === opt.id
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold">{opt.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700">
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-normal">
                      {opt.desc}
                    </div>
                  </div>
                  {dietary === opt.id && (
                    <Check className="w-5 h-5 text-emerald-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Section 2: Neat Eat Kitchen Appliances Selector */}
            <div className="pt-4 border-t border-slate-100">
              <KitchenAppliancesSelector
                selectedAppliances={kitchenAppliances}
                onChange={setKitchenAppliances}
              />
            </div>
          </div>
        )}

        {/* Questionnaire Bottom Navigation Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>שלב קודם</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>{step === totalSteps ? 'בנה לי תפריט שבועי וסל חכם' : 'המשך לשלב הבא'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

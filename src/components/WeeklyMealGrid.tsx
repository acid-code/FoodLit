import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  ArrowLeft,
  Check,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  Coffee,
  Sun,
  Moon,
  Cake,
  RotateCcw,
  BookOpen,
  X,
  Home,
  UtensilsCrossed,
  ArrowLeftRight,
  LayoutGrid,
  List,
  Layers,
  ChefHat,
  Share2,
} from 'lucide-react';
import { MealRecipe, UserPreferences, Product, MealType, Store, CuisineType } from '../types';
import { MEAL_RECIPES, PRODUCTS } from '../data/mockData';
import { NeededIngredientItem } from './PantrySummaryView';
import { RecipeBankModal } from './RecipeBankModal';

interface WeeklyMealGridProps {
  preferences: UserPreferences;
  selectedStore: Store;
  onOpenQuestionnaire: () => void;
  onProceedToPantryCheck: (neededItems: NeededIngredientItem[]) => void;
}

export const WeeklyMealGrid: React.FC<WeeklyMealGridProps> = ({
  preferences,
  selectedStore,
  onOpenQuestionnaire,
  onProceedToPantryCheck,
}) => {
  // View mode: 'list' (Full-screen scroll down by days) or 'grid' (7 columns table)
  // Default to 'list' as requested: "In the final summary of recepies, I love it better in a full screen view that you scroll down the days, not in one table"
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Active day in view tracker for sticky navigation
  const [activeDayIdInView, setActiveDayIdInView] = useState<string>('sun');

  const scrollToDay = (dayId: string) => {
    setActiveDayIdInView(dayId);
    const element = document.getElementById(`day-section-${dayId}`);
    if (element) {
      const yOffset = -90; // offset for sticky navigation bar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Auto-highlight active day in navigation as user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 160;
      for (const day of [
        { id: 'sun' },
        { id: 'mon' },
        { id: 'tue' },
        { id: 'wed' },
        { id: 'thu' },
        { id: 'fri' },
        { id: 'sat' },
      ]) {
        const el = document.getElementById(`day-section-${day.id}`);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveDayIdInView(day.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 7 Days: Sunday to Saturday with ONLY first letters and full Hebrew day names
  const DAYS_LIST = [
    { id: 'sun', letter: 'א', nameHe: 'יום ראשון' },
    { id: 'mon', letter: 'ב', nameHe: 'יום שני' },
    { id: 'tue', letter: 'ג', nameHe: 'יום שלישי' },
    { id: 'wed', letter: 'ד', nameHe: 'יום רביעי' },
    { id: 'thu', letter: 'ה', nameHe: 'יום חמישי' },
    { id: 'fri', letter: 'ו', nameHe: 'יום שישי' },
    { id: 'sat', letter: 'ש', nameHe: 'יום שבת' },
  ];

  const MEAL_TYPE_META: Record<MealType, { labelHe: string; icon: React.ReactNode }> = {
    breakfast: { labelHe: 'בוקר', icon: <Coffee className="w-3.5 h-3.5" /> },
    lunch: { labelHe: 'צהריים', icon: <Sun className="w-3.5 h-3.5" /> },
    dinner: { labelHe: 'ערב', icon: <Moon className="w-3.5 h-3.5" /> },
    dessert: { labelHe: 'קינוח', icon: <Cake className="w-3.5 h-3.5" /> },
  };

  const CUISINE_LABELS: Record<CuisineType, { labelHe: string; flag: string }> = {
    indian: { labelHe: 'הודי', flag: '🇮🇳' },
    asian: { labelHe: 'אסייתי', flag: '🥢' },
    italian: { labelHe: 'איטלקי', flag: '🇮🇹' },
    mexican: { labelHe: 'מקסיקני', flag: '🇲🇽' },
    israeli: { labelHe: 'ישראלי', flag: '🇮🇱' },
    mediterranean: { labelHe: 'ים תיכוני', flag: '🫒' },
    traditional: { labelHe: 'מסורתי', flag: '🕯️' },
    american: { labelHe: 'אמריקאי', flag: '🍔' },
  };

  // State: which meals are active for each day (e.g. { sun: ['lunch', 'dinner'], ... })
  const [activeMealsByDay, setActiveMealsByDay] = useState<Record<string, MealType[]>>(() => {
    if (
      preferences.selectedMealsByDay &&
      Object.values(preferences.selectedMealsByDay).some((arr) => arr.length > 0)
    ) {
      return preferences.selectedMealsByDay;
    }
    // Default: weekdays lunch & dinner
    const def: Record<string, MealType[]> = {};
    DAYS_LIST.forEach((d) => {
      def[d.id] = ['lunch', 'dinner'];
    });
    return def;
  });

  // Sync state if preferences change
  useEffect(() => {
    if (
      preferences.selectedMealsByDay &&
      Object.values(preferences.selectedMealsByDay).some((arr) => arr.length > 0)
    ) {
      setActiveMealsByDay(preferences.selectedMealsByDay);
    }
  }, [preferences.selectedMealsByDay]);

  // Culinary & Cuisine Preferences filtering helper
  const prioritizeRecipes = (recipes: MealRecipe[]) => {
    const userStyles = preferences.culinaryPreferences || ['israeli-home'];
    const userCuisines = preferences.cuisinePreferences || ['israeli', 'indian', 'asian', 'italian'];
    const isNonKosherUser = preferences.dietary === 'non-kosher';
    const isKosherStrict = preferences.dietary === 'kosher-mehadrin' || preferences.dietary === 'standard';

    // If strictly kosher user, filter out any non-kosher dishes
    const filtered = isKosherStrict
      ? recipes.filter((r) => r.isKosher !== false)
      : recipes;

    const userAppliances = preferences.kitchenAppliances || ['stovetop', 'oven', 'airfryer', 'blender'];
    const isHighProteinUser = preferences.highProteinFocus;

    return [...filtered].sort((a, b) => {
      const matchScore = (r: MealRecipe) => {
        let score = 0;
        // Priority boost for authentic non-kosher delicacies if user selected non-kosher / Tiv Taam
        if (isNonKosherUser && r.isKosher === false) score += 10;
        // High boost for user selected cuisine types (Indian, Asian, Mexican, etc.)
        if (userCuisines.includes(r.cuisineType)) score += 5;
        // Boost for high protein if user requested fitness/protein focus
        if (isHighProteinUser && (r.isHighProtein || (r.proteinGrams || 0) >= 30)) score += 8;
        // Kitchen appliance match
        if (r.appliancesRequired && r.appliancesRequired.length > 0) {
          const hasMissingAppliance = r.appliancesRequired.some((app) => !userAppliances.includes(app));
          if (hasMissingAppliance) score -= 25; // penalize recipes that require appliances user doesn't have!
          else if (r.appliancesRequired.includes('airfryer') && userAppliances.includes('airfryer')) score += 4;
        }
        // Boost for batch cooking recipes if enabled
        if ((r.yieldsMealsCount || 1) >= 2) score += 3;
        if (userStyles.includes('quick-20') && r.prepTimeMinutes <= 20) score += 3;
        if (userStyles.includes('one-pot') && r.effortTagHe === 'סיר אחד') score += 3;
        if (userStyles.includes('kids-friendly') && (r.effortTagHe === 'ידידותי לילדים' || r.categoryHe === 'ילדים')) score += 3;
        if (userStyles.includes('healthy-med') && r.categoryHe === 'צמחוני / בריא') score += 3;
        if (userStyles.includes('shabbat-festive') && r.categoryHe === 'שבת וחגים') score += 3;
        return score;
      };
      return matchScore(b) - matchScore(a);
    });
  };

  // Recipes per meal type sorted by cuisine & culinary preferences
  const sortedRecipesForType: Record<MealType, MealRecipe[]> = useMemo(() => {
    return {
      breakfast: prioritizeRecipes(MEAL_RECIPES.filter((r) => r.mealType === 'breakfast')),
      lunch: prioritizeRecipes(MEAL_RECIPES.filter((r) => r.mealType === 'lunch')),
      dinner: prioritizeRecipes(MEAL_RECIPES.filter((r) => r.mealType === 'dinner')),
      dessert: prioritizeRecipes(MEAL_RECIPES.filter((r) => r.mealType === 'dessert')),
    };
  }, [preferences.culinaryPreferences, preferences.cuisinePreferences]);

  // State mapping: dayId -> { [mealType]: MealRecipe }
  const [dayAssignments, setDayAssignments] = useState<Record<string, Record<MealType, MealRecipe>>>(() => {
    const initialMap: Record<string, Record<MealType, MealRecipe>> = {};

    DAYS_LIST.forEach((day, index) => {
      initialMap[day.id] = {
        breakfast:
          sortedRecipesForType.breakfast[index % sortedRecipesForType.breakfast.length] ||
          MEAL_RECIPES[0],
        lunch:
          sortedRecipesForType.lunch[index % sortedRecipesForType.lunch.length] ||
          MEAL_RECIPES[2],
        dinner:
          day.id === 'fri'
            ? MEAL_RECIPES.find((r) => r.id === 'meal-shabbat-dinner') || MEAL_RECIPES[1]
            : sortedRecipesForType.dinner[index % sortedRecipesForType.dinner.length] ||
              MEAL_RECIPES[1],
        dessert:
          sortedRecipesForType.dessert[index % sortedRecipesForType.dessert.length] ||
          MEAL_RECIPES[4],
      };
    });

    return initialMap;
  });

  // Multi-Meal Leftover / Continued Batch links:
  // Key: `${targetDayId}-${targetMealType}` -> { sourceDayId, sourceMealType, sourceRecipeId }
  const [leftoverLinks, setLeftoverLinks] = useState<
    Record<string, { sourceDayId: string; sourceMealType: MealType; sourceRecipeId: string }>
  >(() => {
    // Leftover links start completely empty! No unmade Sunday meal is ever attributed as Monday leftover.
    return {};
  });

  // State for Swap Between Two Specific Meals in the week
  const [isTwoMealSwapOpen, setIsTwoMealSwapOpen] = useState(false);
  const [swapSlot1, setSwapSlot1] = useState<{ dayId: string; mealType: MealType } | null>({
    dayId: 'sun',
    mealType: 'dinner',
  });
  const [swapSlot2, setSwapSlot2] = useState<{ dayId: string; mealType: MealType } | null>({
    dayId: 'tue',
    mealType: 'dinner',
  });

  // Inline recipe alternative picker state
  const [swappingKey, setSwappingKey] = useState<string | null>(null); // e.g. "sun-dinner"
  const [recipeModal, setRecipeModal] = useState<MealRecipe | null>(null);
  const [isRecipeBankOpen, setIsRecipeBankOpen] = useState(false);
  const [pendingBankRecipe, setPendingBankRecipe] = useState<MealRecipe | null>(null);

  // Toggle meal option on a specific day
  const toggleMealOnDay = (dayId: string, mealType: MealType) => {
    setActiveMealsByDay((prev) => {
      const cur = prev[dayId] || [];
      const updated = cur.includes(mealType)
        ? cur.filter((t) => t !== mealType)
        : [...cur, mealType];
      return {
        ...prev,
        [dayId]: updated,
      };
    });
  };

  const handleSwapRecipe = (dayId: string, mealType: MealType, newRecipe: MealRecipe) => {
    setDayAssignments((prev) => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [mealType]: newRecipe,
      },
    }));
    // Remove leftover link if recipe changed
    setLeftoverLinks((prev) => {
      const key = `${dayId}-${mealType}`;
      if (prev[key]) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return prev;
    });
    setSwappingKey(null);
  };

  // Perform swap between two specific meals in the week
  const handleExecuteTwoMealSwap = () => {
    if (!swapSlot1 || !swapSlot2) return;
    if (swapSlot1.dayId === swapSlot2.dayId && swapSlot1.mealType === swapSlot2.mealType) {
      setIsTwoMealSwapOpen(false);
      return;
    }

    const recipe1 = dayAssignments[swapSlot1.dayId]?.[swapSlot1.mealType];
    const recipe2 = dayAssignments[swapSlot2.dayId]?.[swapSlot2.mealType];

    if (recipe1 && recipe2) {
      setDayAssignments((prev) => ({
        ...prev,
        [swapSlot1.dayId]: {
          ...prev[swapSlot1.dayId],
          [swapSlot1.mealType]: recipe2,
        },
        [swapSlot2.dayId]: {
          ...prev[swapSlot2.dayId],
          [swapSlot2.mealType]: recipe1,
        },
      }));
    }

    setIsTwoMealSwapOpen(false);
  };

  // Split / Link a recipe to another day as leftovers (continued batch)
  const handleLinkAsLeftover = (sourceDayId: string, sourceMealType: MealType, targetDayId: string, targetMealType: MealType) => {
    const sourceRecipe = dayAssignments[sourceDayId]?.[sourceMealType];
    if (!sourceRecipe) return;

    // Activate the target slot if not already
    setActiveMealsByDay((prev) => {
      const cur = prev[targetDayId] || [];
      if (!cur.includes(targetMealType)) {
        return { ...prev, [targetDayId]: [...cur, targetMealType] };
      }
      return prev;
    });

    // Assign the recipe to target slot
    setDayAssignments((prev) => ({
      ...prev,
      [targetDayId]: {
        ...prev[targetDayId],
        [targetMealType]: sourceRecipe,
      },
    }));

    // Register leftover link
    const targetKey = `${targetDayId}-${targetMealType}`;
    setLeftoverLinks((prev) => ({
      ...prev,
      [targetKey]: {
        sourceDayId,
        sourceMealType,
        sourceRecipeId: sourceRecipe.id,
      },
    }));
  };

  const handleUnlinkLeftover = (dayId: string, mealType: MealType) => {
    const key = `${dayId}-${mealType}`;
    setLeftoverLinks((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const [isBatchModeActive, setIsBatchModeActive] = useState<boolean>(() => preferences.enableBatchCooking ?? true);

  // Smart multi-meal batch distribution according to exact household size and meal requirements:
  const handleApplySmartBatchDistribution = (enable: boolean) => {
    setIsBatchModeActive(enable);
    if (!enable) {
      setLeftoverLinks({});
      return;
    }

    const newLeftovers: Record<string, { sourceDayId: string; sourceMealType: MealType; sourceRecipeId: string }> = {};
    const newAssignments = { ...dayAssignments };

    // The separation is mainly for lunch options:
    const activeLunchDays = DAYS_LIST.map((d) => d.id).filter((dayId) =>
      (activeMealsByDay[dayId] || []).includes('lunch')
    );

    if (activeLunchDays.length >= 2) {
      const size = preferences.householdSize || 4;
      if (size === 1) {
        // 1 person: 1 batch cooks 4 lunches (up to 4 days across week)
        const sourceDayId = activeLunchDays[0];
        const sourceRecipe = newAssignments[sourceDayId]?.lunch;
        if (sourceRecipe) {
          for (let i = 1; i < Math.min(4, activeLunchDays.length); i++) {
            const targetDayId = activeLunchDays[i];
            newLeftovers[`${targetDayId}-lunch`] = {
              sourceDayId,
              sourceMealType: 'lunch',
              sourceRecipeId: sourceRecipe.id,
            };
            newAssignments[targetDayId] = {
              ...newAssignments[targetDayId],
              lunch: sourceRecipe,
            };
          }
        }
      } else if (size === 2) {
        // 2 people: 1 batch cooks 2 days of lunch (pairs, non-consecutive allowed)
        for (let i = 0; i < activeLunchDays.length; i += 2) {
          if (i + 1 < activeLunchDays.length) {
            const sourceDayId = activeLunchDays[i];
            const targetDayId = activeLunchDays[i + 1];
            const sourceRecipe = newAssignments[sourceDayId]?.lunch;
            if (sourceRecipe) {
              newLeftovers[`${targetDayId}-lunch`] = {
                sourceDayId,
                sourceMealType: 'lunch',
                sourceRecipeId: sourceRecipe.id,
              };
              newAssignments[targetDayId] = {
                ...newAssignments[targetDayId],
                lunch: sourceRecipe,
              };
            }
          }
        }
      } else {
        // 3-4 people: 1 batch makes 1 meal for the household.
        // If they explicitly choose separation, split a double batch across 2 days:
        for (let i = 0; i < activeLunchDays.length; i += 3) {
          if (i + 1 < activeLunchDays.length) {
            const sourceDayId = activeLunchDays[i];
            const targetDayId = activeLunchDays[i + 1];
            const sourceRecipe = newAssignments[sourceDayId]?.lunch;
            if (sourceRecipe && (sourceRecipe.yieldsMealsCount || 1) >= 2) {
              newLeftovers[`${targetDayId}-lunch`] = {
                sourceDayId,
                sourceMealType: 'lunch',
                sourceRecipeId: sourceRecipe.id,
              };
              newAssignments[targetDayId] = {
                ...newAssignments[targetDayId],
                lunch: sourceRecipe,
              };
            }
          }
        }
      }
    }

    setDayAssignments(newAssignments);
    setLeftoverLinks(newLeftovers);
  };


  // Next day helper for 1-click continuation
  const getNextDayId = (dayId: string): string => {
    const idx = DAYS_LIST.findIndex((d) => d.id === dayId);
    if (idx >= 0 && idx < DAYS_LIST.length - 1) {
      return DAYS_LIST[idx + 1].id;
    }
    return 'sun';
  };

  // Calculate total weekly cost:
  // IMPORTANT: Multi-meal leftover slots DO NOT add cost because the ingredients were bought in the batch!
  const totalWeeklyCost = useMemo(() => {
    let sum = 0;
    DAYS_LIST.forEach((day) => {
      const dayMeals = activeMealsByDay[day.id] || [];
      dayMeals.forEach((type) => {
        const slotKey = `${day.id}-${type}`;
        const isLeftover = !!leftoverLinks[slotKey];
        if (!isLeftover) {
          const recipe = dayAssignments[day.id]?.[type];
          if (recipe) {
            sum += recipe.estimatedCostNis;
          }
        }
      });
    });
    return sum;
  }, [dayAssignments, activeMealsByDay, leftoverLinks]);

  const totalMealsCount = useMemo(() => {
    return Object.values(activeMealsByDay).reduce((acc, list) => acc + list.length, 0);
  }, [activeMealsByDay]);

  const totalLeftoverMealsCount = useMemo(() => {
    let count = 0;
    DAYS_LIST.forEach((day) => {
      const dayMeals = activeMealsByDay[day.id] || [];
      dayMeals.forEach((type) => {
        if (leftoverLinks[`${day.id}-${type}`]) count++;
      });
    });
    return count;
  }, [activeMealsByDay, leftoverLinks]);

  const budgetMax = preferences.budgetMax || preferences.weeklyBudget || 750;
  const budgetMin = preferences.budgetMin || 250;
  const remainingBudget = budgetMax - totalWeeklyCost;
  const isOverBudget = remainingBudget < 0;
  const budgetUsagePercent = Math.min(
    100,
    Math.round((totalWeeklyCost / budgetMax) * 100)
  );

  // Collect and aggregate needed ingredients for all active meals:
  // Smarter grocery list: leftover meals do NOT duplicate ingredients!
  const handleProceedToPantry = () => {
    const ingredientMap: Record<string, number> = {};

    DAYS_LIST.forEach((day) => {
      const dayMeals = activeMealsByDay[day.id] || [];
      dayMeals.forEach((type) => {
        const slotKey = `${day.id}-${type}`;
        const isLeftover = !!leftoverLinks[slotKey];

        // Only add ingredients if this is the original cooking session, NOT a leftover!
        if (!isLeftover) {
          const recipe = dayAssignments[day.id]?.[type];
          if (recipe) {
            const ratio = preferences.householdSize / recipe.servings;
            recipe.ingredients.forEach((ing) => {
              const scaled = Math.max(1, Math.round(ing.quantity * ratio));
              ingredientMap[ing.productId] = (ingredientMap[ing.productId] || 0) + scaled;
            });
          }
        }
      });
    });

    const neededItems: NeededIngredientItem[] = Object.entries(ingredientMap).map(([productId, quantityNeeded]) => ({
      product: PRODUCTS.find((p) => p.id === productId)!,
      quantityNeeded,
    }));

    onProceedToPantryCheck(neededItems);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>תפריט שבועי חכם</span>
              <span aria-hidden="true">·</span>
              <span>{preferences.householdSize} סועדים</span>
              <span aria-hidden="true">·</span>
              <span>{totalMealsCount} ארוחות מתוכננות</span>
              {totalLeftoverMealsCount > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    {totalLeftoverMealsCount} ארוחות המשך (חיסכון כפול בסל!)
                  </span>
                </>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              תפריט שבועי ומתכונים (א׳ עד שבת)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              מתכונים מותאמים ממגוון מטבחים (הודי, אסייתי, איטלקי, ישראלי, מקסיקני). כולל חלוקת תבשילים לימים נוספים והחלפה בין ארוחות.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* View Mode Switcher: "רשימה מפורטת עם כותרות מפרידות" vs "7 עמודות רחבות" */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>רשימה מפורטת עם כותרות מפרידות</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>7 עמודות רחבות (א׳–ש׳)</span>
              </button>
            </div>

            {/* Recipe Bank Button */}
            <button
              type="button"
              onClick={() => setIsRecipeBankOpen(true)}
              className="px-3 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>בנק מתכונים וסינון (Recipe Bank) 📖</span>
            </button>

            {/* "החלפה בין שתי ארוחות ספציפיות בשבוע" */}
            <button
              type="button"
              onClick={() => setIsTwoMealSwapOpen(true)}
              className="px-3 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
              <span>החלפה בין 2 ארוחות</span>
            </button>

            <button
              type="button"
              onClick={onOpenQuestionnaire}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>שאלון ותקציב</span>
            </button>
          </div>
        </div>

        {/* Selected Cuisines & Smart Cooking Banner */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-800 flex items-center gap-1">
            <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
            <span>מטבחים משובצים בתפריט:</span>
          </span>
          {(preferences.cuisinePreferences || ['israeli', 'indian', 'asian', 'italian']).map((cuisine) => {
            const meta = CUISINE_LABELS[cuisine] || { labelHe: cuisine, flag: '🍽️' };
            return (
              <span
                key={cuisine}
                className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-slate-800 font-bold flex items-center gap-1"
              >
                <span>{meta.flag}</span>
                <span>{meta.labelHe}</span>
              </span>
            );
          })}
        </div>

        {/* Budget Tracker Gauge */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span>טווח תקציב מתוכנן:</span>
              <span className="text-emerald-700 tabular-nums">₪{budgetMin} – ₪{budgetMax}</span>
            </div>
            <div className="text-slate-600 font-medium">
              עלות שבועית מצטברת למצרכים: <strong className="tabular-nums font-bold text-slate-900">₪{totalWeeklyCost}</strong>
              <span className="mx-1">/</span>
              {isOverBudget ? (
                <span className="text-rose-600 font-bold">חריגה של ₪{Math.abs(remainingBudget)}</span>
              ) : (
                <span className="text-emerald-700 font-bold">נותרו ₪{remainingBudget} בטווח</span>
              )}
            </div>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                isOverBudget ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            />
          </div>
        </div>

        {/* Smart Batch Distribution Control Banner */}
        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-amber-950 font-extrabold">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>בישול מרוכז וחלוקת מנות לפי {preferences.householdSize} סועדים</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              {preferences.householdSize === 1
                ? 'לסועד יחיד: בישול מרוכז מחולק לעד 4 ימי צהריים בשבוע (חוסך זמן וקניות כפולות).'
                : preferences.householdSize === 2
                ? 'לזוג: בישול מרוכז מחולק ל-2 ימי צהריים (גם בימים לא עוקבים).'
                : 'למשפחה: כל סיר מיועד לארוחה שלמה של 4 סועדים, או סיר כפול המחולק ליומיים.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => handleApplySmartBatchDistribution(!isBatchModeActive)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isBatchModeActive
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isBatchModeActive ? '✓ חלוקת מנות פעילה' : 'הפעל חלוקת מנות חכמה'}</span>
            </button>
          </div>
        </div>

        {/* Primary Action Button: Proceed to Pantry Check */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            onClick={handleProceedToPantry}
            disabled={totalMealsCount === 0}
            className="px-6 py-3.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Home className="w-4 h-4" />
            <span>המשך לבדיקת מזווה (מה שיש בבית)</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <span className="text-xs text-slate-500">
            בחירת רשת הסופרמרקט (קרפור, ויקטורי, מחסני השוק, רמי לוי) תתבצע <strong>בסיום</strong> לאחר בדיקת המצרכים.
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Sticky Day-by-Day Quick Scroll Bar */}
      {/* "I love it better in a full screen view that you scroll down the days" */}
      {/* ============================================================== */}
      <div className="sticky top-16 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <span className="text-xs font-black text-slate-500 px-2 shrink-0 hidden sm:inline">
            גלילה לפי ימים:
          </span>
          <div className="flex items-center gap-1.5 w-full justify-between sm:justify-start">
            {DAYS_LIST.map((day) => {
              const dayMeals = activeMealsByDay[day.id] || [];
              const isActiveInView = activeDayIdInView === day.id;

              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => scrollToDay(day.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isActiveInView
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100/80 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-black text-[11px]">
                    {day.letter}
                  </span>
                  <span>{day.nameHe.replace('יום ', '')}</span>
                  {dayMeals.length > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActiveInView ? 'bg-white text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {dayMeals.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: Full-Screen Scroll Down View by Days (ראשון עד שבת) */}
      {/* ============================================================== */}
      {viewMode === 'list' && (
        <div className="space-y-8">
          {DAYS_LIST.map((day) => {
            const dayMeals = activeMealsByDay[day.id] || [];
            const dayCost = dayMeals.reduce((sum, type) => {
              const isLeftover = !!leftoverLinks[`${day.id}-${type}`];
              if (isLeftover) return sum;
              const r = dayAssignments[day.id]?.[type];
              return sum + (r ? r.estimatedCostNis : 0);
            }, 0);

            return (
              <div
                key={day.id}
                id={`day-section-${day.id}`}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden scroll-mt-28"
              >
                {/* Day Separation Title Header */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {day.letter}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">
                        {day.nameHe}
                      </h2>
                      <div className="text-xs text-slate-500 font-medium">
                        {dayMeals.length > 0 ? (
                          <span>{dayMeals.length} ארוחות מתוכננות ליום זה</span>
                        ) : (
                          <span className="text-slate-400">לא נבחרו ארוחות ליום זה (יום חופשי)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {dayMeals.length > 0 && (
                      <div className="text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200">
                        עלות מצרכים ליום: <span className="text-emerald-700 tabular-nums">₪{dayCost}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meals Inside Day */}
                <div className="p-4 sm:p-6 space-y-4">
                  {dayMeals.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 space-y-2">
                      <p>היום ריק מארוחות. לחצו על הכפתורים מטה להוספת מנה:</p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {(['breakfast', 'lunch', 'dinner', 'dessert'] as MealType[]).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => toggleMealOnDay(day.id, t)}
                            className="px-2.5 py-1 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          >
                            + {MEAL_TYPE_META[t].labelHe}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dayMeals.map((type) => {
                        const meta = MEAL_TYPE_META[type];
                        const recipe = dayAssignments[day.id]?.[type];
                        const slotKey = `${day.id}-${type}`;
                        const leftoverInfo = leftoverLinks[slotKey];
                        const isLeftover = !!(
                          leftoverInfo &&
                          recipe &&
                          dayAssignments[leftoverInfo.sourceDayId]?.[leftoverInfo.sourceMealType]?.id === recipe.id &&
                          (activeMealsByDay[leftoverInfo.sourceDayId] || []).includes(leftoverInfo.sourceMealType)
                        );
                        const cuisineMeta = recipe ? CUISINE_LABELS[recipe.cuisineType] : null;

                        if (!recipe) return null;

                        return (
                          <div
                            key={type}
                            className={`rounded-2xl p-4 border transition-all text-right space-y-3 relative ${
                              isLeftover
                                ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-200'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {/* Card Header: Meal Type + Cuisine Badge + Cost */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 flex items-center gap-1">
                                  {meta.icon}
                                  <span>{meta.labelHe}</span>
                                </span>

                                {cuisineMeta && (
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <span>{cuisineMeta.flag}</span>
                                    <span>{cuisineMeta.labelHe}</span>
                                  </span>
                                )}

                                {recipe.isKosher === false && (
                                  <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1">
                                    <span>🥓</span>
                                    <span>לא כשר (טיב טעם)</span>
                                  </span>
                                )}
                              </div>

                              <div className="text-xs font-bold tabular-nums">
                                {isLeftover ? (
                                  <span className="text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded-md">
                                    ללא עלות נוספת בסל
                                  </span>
                                ) : (
                                  <span className="text-slate-800">~₪{recipe.estimatedCostNis}</span>
                                )}
                              </div>
                            </div>

                            {/* Multi-Meal Leftover Continuation Badge */}
                            {isLeftover && (
                              <div className="p-2 bg-amber-100/70 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                                <div className="flex items-center gap-1.5 font-bold">
                                  <Layers className="w-3.5 h-3.5 text-amber-700" />
                                  <span>שאריות מתוכננות (בישול מראש מיום {DAYS_LIST.find((d) => d.id === leftoverInfo.sourceDayId)?.nameHe})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkLeftover(day.id, type)}
                                  className="text-[11px] underline text-amber-800 hover:text-amber-950 cursor-pointer font-semibold"
                                >
                                  בטל שארית
                                </button>
                              </div>
                            )}

                            {/* Recipe Title & Details */}
                            <div className="space-y-1">
                              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                                {recipe.titleHe}
                              </h3>
                              <p className="text-xs text-slate-500 leading-normal">
                                {recipe.subtitleHe}
                              </p>
                            </div>

                            {/* Tags: Time, Difficulty, Effort */}
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{recipe.prepTimeMinutes} דק׳ הכנה</span>
                              </span>
                              <span>·</span>
                              <span>{recipe.effortTagHe}</span>
                              <span>·</span>
                              <span>{recipe.difficultyHe}</span>

                              {(recipe.yieldsMealsCount || 1) >= 2 && !isLeftover && (
                                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                  סיר כפול (מספיק ל-2 ארוחות)
                                </span>
                              )}
                            </div>

                            {/* Action Buttons: View Recipe, Batch Continuation, Swap */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => setRecipeModal(recipe)}
                                className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>הצג מתכון והוראות</span>
                              </button>

                              <div className="flex items-center gap-1.5">
                                {/* 1-Click Split to Next Day if eligible and not already linked */}
                                {recipe.canSplitToNextDay && !isLeftover && (
                                  <button
                                    type="button"
                                    onClick={() => handleLinkAsLeftover(day.id, type, getNextDayId(day.id), 'lunch')}
                                    title="חלק את התבשיל לצהריים למחרת ללא קניית מצרכים כפולה"
                                    className="px-2.5 py-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Layers className="w-3 h-3 text-amber-600" />
                                    <span>חלק לצהריים למחרת</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setSwappingKey(swappingKey === slotKey ? null : slotKey)}
                                  title="החלפת מתכון זה"
                                  className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline Swap Picker if opened */}
                            {swappingKey === slotKey && (
                              <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
                                <div className="flex items-center justify-between font-bold text-slate-700 pb-1">
                                  <span>בחר מתכון חלופי לקטגוריה זו:</span>
                                  <button onClick={() => setSwappingKey(null)} className="text-slate-400">
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="space-y-1 max-h-36 overflow-y-auto">
                                  {sortedRecipesForType[type].map((cand) => (
                                    <button
                                      key={cand.id}
                                      type="button"
                                      onClick={() => handleSwapRecipe(day.id, type, cand)}
                                      className={`w-full p-1.5 text-right rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                        cand.id === recipe.id
                                          ? 'bg-emerald-600 text-white font-bold'
                                          : 'hover:bg-white text-slate-800'
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span>{CUISINE_LABELS[cand.cuisineType]?.flag}</span>
                                        <span className="truncate">{cand.titleHe}</span>
                                      </div>
                                      <span className="tabular-nums font-bold">₪{cand.estimatedCostNis}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: "7 עמודות רחבות" (Widened 7 columns from Sunday to Saturday) */}
      {/* ============================================================== */}
      {viewMode === 'grid' && (
        <div className="bg-slate-50/70 p-4 sm:p-6 lg:p-7 rounded-3xl border border-slate-200/90 space-y-4 overflow-x-auto">
          <div className="grid grid-cols-7 gap-3 sm:gap-4 lg:gap-5 min-w-[900px] w-full">
            {DAYS_LIST.map((day) => {
              const dayMeals = activeMealsByDay[day.id] || [];
              const isDayActive = dayMeals.length > 0;

              return (
                <div
                  key={day.id}
                  className={`rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all border ${
                    isDayActive
                      ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-200/70 shadow-xs'
                      : 'bg-slate-100/80 border-slate-200'
                  }`}
                >
                  {/* Column Header: ONLY Day First Letter */}
                  <div
                    className={`w-full h-12 sm:h-14 lg:h-16 rounded-2xl text-center mb-3 transition-all select-none flex items-center justify-center text-xl sm:text-3xl font-black ${
                      isDayActive
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-500/20'
                        : 'bg-slate-200/90 text-slate-500'
                    }`}
                  >
                    {day.letter}
                  </div>

                  {/* 4 Meal Options Stacked in Column */}
                  <div className="space-y-3">
                    {(['breakfast', 'lunch', 'dinner', 'dessert'] as MealType[]).map((type) => {
                      const isSelected = dayMeals.includes(type);
                      const meta = MEAL_TYPE_META[type];
                      const recipe = dayAssignments[day.id]?.[type];
                      const key = `${day.id}-${type}`;
                      const isSwapping = swappingKey === key;
                      const isLeftover = !!leftoverLinks[key];
                      const cuisineMeta = recipe ? CUISINE_LABELS[recipe.cuisineType] : null;

                      return (
                        <div
                          key={type}
                          className={`rounded-xl p-2.5 border transition-all text-right space-y-1.5 ${
                            isSelected
                              ? isLeftover
                                ? 'bg-amber-50/50 border-amber-300 shadow-2xs'
                                : 'bg-white border-emerald-300 shadow-2xs'
                              : 'bg-white/60 border-slate-200/80 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleMealOnDay(day.id, type)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {meta.icon}
                              <span>{meta.labelHe}</span>
                            </button>

                            {isSelected && recipe && (
                              <span className="text-[10px] font-bold text-slate-700 tabular-nums">
                                {isLeftover ? 'שאריות (₪0)' : `~₪${recipe.estimatedCostNis}`}
                              </span>
                            )}
                          </div>

                          {isSelected && recipe && (
                            <>
                              <div className="space-y-0.5">
                                <div className="text-xs font-extrabold text-slate-900 leading-tight">
                                  {recipe.titleHe}
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-500">
                                  <span>{cuisineMeta?.flag} {cuisineMeta?.labelHe}</span>
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{recipe.prepTimeMinutes} דק׳</span>
                                  </span>
                                </div>
                              </div>

                              <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setRecipeModal(recipe)}
                                  className="flex-1 py-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <BookOpen className="w-2.5 h-2.5" />
                                  <span>מתכון</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSwappingKey(isSwapping ? null : key)}
                                  title="החלפת מתכון"
                                  className="p-1 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </button>
                              </div>

                              {isSwapping && (
                                <div className="space-y-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 text-[10px]">
                                  <div className="flex items-center justify-between font-bold text-slate-600 pb-1">
                                    <span>בחר מתכון:</span>
                                    <button onClick={() => setSwappingKey(null)} className="text-slate-400">
                                      <X className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                  <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {sortedRecipesForType[type].map((cand) => (
                                      <button
                                        key={cand.id}
                                        type="button"
                                        onClick={() => handleSwapRecipe(day.id, type, cand)}
                                        className={`w-full p-1 text-right rounded transition-colors flex items-center justify-between cursor-pointer ${
                                          cand.id === recipe.id
                                            ? 'bg-emerald-600 text-white font-bold'
                                            : 'hover:bg-white text-slate-700'
                                        }`}
                                      >
                                        <span className="truncate max-w-[90px]">{cand.titleHe}</span>
                                        <span className="tabular-nums">₪{cand.estimatedCostNis}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Floating Bottom Navigation Bar while Scrolling Down Days */}
      {/* ============================================================== */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-slate-300 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900">
              {totalMealsCount} ארוחות מתוכננות לשבוע
              {totalLeftoverMealsCount > 0 && (
                <span className="text-xs text-amber-800 font-bold mr-2 bg-amber-100 px-2 py-0.5 rounded-full">
                  +{totalLeftoverMealsCount} שאריות מחושבות
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              עלות מצרכים משוערת: <strong className="text-emerald-700 tabular-nums">~₪{totalWeeklyCost}</strong>
              <span className="mx-1">·</span>
              {remainingBudget >= 0 ? (
                <span className="text-emerald-700">בטווח התקציב (₪{remainingBudget} נותרו)</span>
              ) : (
                <span className="text-rose-600 font-bold">חריגה של ₪{Math.abs(remainingBudget)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsTwoMealSwapOpen(true)}
            className="px-3.5 py-2.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-amber-600" />
            <span>החלפת 2 ארוחות</span>
          </button>

          <button
            type="button"
            onClick={handleProceedToPantry}
            disabled={totalMealsCount === 0}
            className="flex-1 sm:flex-initial px-6 py-3 text-xs sm:text-sm font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40"
          >
            <Home className="w-4 h-4" />
            <span>המשך לבדיקת מזווה</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: "החלפה בין שתי ארוחות ספציפיות בשבוע" (Swap 2 Specific Meals) */}
      {/* ============================================================== */}
      {isTwoMealSwapOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 text-right border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>החלפה בין שתי ארוחות ספציפיות</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  החלף בין שתי ארוחות בשבוע
                </h3>
                <p className="text-xs text-slate-500">
                  בחרו שתי ארוחות מתוך השבוע כדי להחליף ביניהן את המיקום והימים:
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsTwoMealSwapOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Select Slot 1 */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block">
                ארוחה ראשונה להחלפה:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={swapSlot1?.dayId}
                  onChange={(e) => setSwapSlot1((prev) => prev ? { ...prev, dayId: e.target.value } : null)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                >
                  {DAYS_LIST.map((d) => (
                    <option key={d.id} value={d.id}>{d.nameHe} ({d.letter})</option>
                  ))}
                </select>

                <select
                  value={swapSlot1?.mealType}
                  onChange={(e) => setSwapSlot1((prev) => prev ? { ...prev, mealType: e.target.value as MealType } : null)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                >
                  <option value="lunch">ארוחת צהריים</option>
                  <option value="dinner">ארוחת ערב</option>
                  <option value="breakfast">ארוחת בוקר</option>
                  <option value="dessert">קינוח</option>
                </select>
              </div>

              {swapSlot1 && (
                <div className="text-xs text-emerald-800 font-bold bg-white p-2 rounded-lg border border-slate-200">
                  מנה נוכחית: {dayAssignments[swapSlot1.dayId]?.[swapSlot1.mealType]?.titleHe}
                </div>
              )}
            </div>

            <div className="flex justify-center text-amber-600">
              <ArrowLeftRight className="w-5 h-5 rotate-90" />
            </div>

            {/* Select Slot 2 */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="text-xs font-bold text-slate-700 block">
                ארוחה שנייה להחלפה:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={swapSlot2?.dayId}
                  onChange={(e) => setSwapSlot2((prev) => prev ? { ...prev, dayId: e.target.value } : null)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                >
                  {DAYS_LIST.map((d) => (
                    <option key={d.id} value={d.id}>{d.nameHe} ({d.letter})</option>
                  ))}
                </select>

                <select
                  value={swapSlot2?.mealType}
                  onChange={(e) => setSwapSlot2((prev) => prev ? { ...prev, mealType: e.target.value as MealType } : null)}
                  className="bg-white border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                >
                  <option value="lunch">ארוחת צהריים</option>
                  <option value="dinner">ארוחת ערב</option>
                  <option value="breakfast">ארוחת בוקר</option>
                  <option value="dessert">קינוח</option>
                </select>
              </div>

              {swapSlot2 && (
                <div className="text-xs text-emerald-800 font-bold bg-white p-2 rounded-lg border border-slate-200">
                  מנה נוכחית: {dayAssignments[swapSlot2.dayId]?.[swapSlot2.mealType]?.titleHe}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleExecuteTwoMealSwap}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>בצע החלפה הדדית בין הארוחות</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTwoMealSwapOpen(false)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: Full Recipe Modal with Ingredients & Instructions */}
      {/* ============================================================== */}
      {recipeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 text-right max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>מתכון שבועי מלא</span>
                  <span aria-hidden="true">·</span>
                  <span>{CUISINE_LABELS[recipeModal.cuisineType]?.flag} מטבח {CUISINE_LABELS[recipeModal.cuisineType]?.labelHe}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {recipeModal.titleHe}
                </h3>
                <p className="text-xs text-slate-500">{recipeModal.subtitleHe}</p>
              </div>

              <button
                type="button"
                onClick={() => setRecipeModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Recipe Meta Info */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px]">זמן הכנה</span>
                <span className="font-extrabold text-slate-900">{recipeModal.prepTimeMinutes} דקות</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px]">מנות בסיר</span>
                <span className="font-extrabold text-slate-900">{recipeModal.servings} מנות</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block text-[10px]">עלות משוערת</span>
                <span className="font-extrabold text-emerald-700">~₪{recipeModal.estimatedCostNis}</span>
              </div>
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-slate-900">מצרכים נדרשים למתכון:</h4>
              <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 border border-slate-200/70">
                {recipeModal.ingredients.map((ing, i) => {
                  const product = PRODUCTS.find((p) => p.id === ing.productId);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded-lg border border-slate-200/60"
                    >
                      <span className="font-semibold text-slate-800">
                        {ing.customNoteHe || product?.nameHe || ing.productId}
                      </span>
                      <span className="text-slate-500 font-bold tabular-nums">
                        {ing.quantity} יח׳
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <h4 className="text-sm font-extrabold text-slate-900">הוראות הכנה שלב-אחר-שלב:</h4>
              <div className="space-y-2">
                {recipeModal.instructionsHe.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setRecipeModal(null)}
                className="w-full py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                סגור מתכון
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Bank Modal */}
      <RecipeBankModal
        isOpen={isRecipeBankOpen}
        onClose={() => setIsRecipeBankOpen(false)}
        userAppliances={preferences.kitchenAppliances || ['stovetop', 'oven']}
        onSelectRecipe={(recipe) => {
          setPendingBankRecipe(recipe);
        }}
      />

      {/* Modal to choose day & meal slot for recipe chosen from Recipe Bank */}
      {pendingBankRecipe && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 text-right border border-slate-200 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-700">שיבוץ מנה מהבנק בתפריט</span>
                <h4 className="text-base font-extrabold text-slate-900 mt-0.5">{pendingBankRecipe.titleHe}</h4>
              </div>
              <button
                onClick={() => setPendingBankRecipe(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              בחרו לאיזה יום ולאיזו ארוחה לשבץ מנה זו בשבוע שלכם:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">יום בשבוע:</label>
                <div className="grid grid-cols-7 gap-1">
                  {DAYS_LIST.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => {
                        handleSwapRecipe(d.id, pendingBankRecipe.mealType, pendingBankRecipe);
                        // Also ensure that meal type is active on that day!
                        if (!(activeMealsByDay[d.id] || []).includes(pendingBankRecipe.mealType)) {
                          toggleMealOnDay(d.id, pendingBankRecipe.mealType);
                        }
                        setPendingBankRecipe(null);
                      }}
                      className="py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 font-bold text-xs transition-colors cursor-pointer text-center"
                    >
                      <div className="text-[10px] opacity-75">{d.letter}</div>
                      <div className="text-xs font-black">{d.id === 'fri' ? 'שישי' : d.id === 'sat' ? 'שבת' : d.letter}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPendingBankRecipe(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  Check,
  Plus,
  Minus,
  Sparkles,
  Home,
  ShoppingCart,
  ArrowLeft,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  RotateCcw,
  Store as StoreIcon,
  Wallet,
  TrendingDown,
  AlertTriangle,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Store } from '../types';
import { STORES } from '../data/mockData';

export interface NeededIngredientItem {
  product: Product;
  quantityNeeded: number;
}

interface PantrySummaryViewProps {
  neededIngredients: NeededIngredientItem[];
  selectedStore: Store;
  householdSize: number;
  userWeeklyBudget?: number;
  onUpdateWeeklyBudget?: (newBudget: number) => void;
  onConfirmCreateCart: (
    finalItems: { product: Product; quantity: number }[],
    chosenStore: Store
  ) => void;
  onBackToPlan: () => void;
}

export const PantrySummaryView: React.FC<PantrySummaryViewProps> = ({
  neededIngredients,
  selectedStore: initialStore,
  householdSize,
  userWeeklyBudget = 750,
  onUpdateWeeklyBudget,
  onConfirmCreateCart,
  onBackToPlan,
}) => {
  // "choosing the supermarket is in the end when the list is done."
  const [currentStore, setCurrentStore] = useState<Store>(initialStore);

  // User-defined weekly budget tracking state
  const [weeklyBudget, setWeeklyBudget] = useState<number>(userWeeklyBudget);
  const [isEditingBudget, setIsEditingBudget] = useState<boolean>(false);

  // Map of productId -> alreadyHave amount (in 0.5 increments, e.g. 0, 0.5, 1.0, 1.5...)
  const [alreadyHaveMap, setAlreadyHaveMap] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    neededIngredients.forEach((item) => {
      initial[item.product.id] = 0;
    });
    return initial;
  });

  // Adjust amount in halfs (0.5)
  const adjustHalf = (productId: string, delta: number, maxNeeded: number) => {
    setAlreadyHaveMap((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, Math.min(maxNeeded * 2, +(current + delta).toFixed(1)));
      return {
        ...prev,
        [productId]: next,
      };
    });
  };

  const toggleHaveAll = (productId: string, maxNeeded: number) => {
    setAlreadyHaveMap((prev) => {
      const current = prev[productId] || 0;
      return {
        ...prev,
        [productId]: current > 0 ? 0 : maxNeeded,
      };
    });
  };

  // Quick batch: common pantry staples (oil, coffee, etc.)
  const handleMarkCommonStaples = () => {
    setAlreadyHaveMap((prev) => {
      const updated = { ...prev };
      neededIngredients.forEach((item) => {
        if (
          item.product.id === 'p-olive-oil' ||
          item.product.id === 'p-turkish-coffee' ||
          item.product.category === 'pantry'
        ) {
          updated[item.product.id] = item.quantityNeeded;
        }
      });
      return updated;
    });
  };

  const handleResetAll = () => {
    const empty: Record<string, number> = {};
    neededIngredients.forEach((item) => {
      empty[item.product.id] = 0;
    });
    setAlreadyHaveMap(empty);
  };

  // Calculate net items to buy in store
  const computedBasket = useMemo(() => {
    const itemsToBuy: { product: Product; quantity: number; originalNeeded: number; saved: number }[] = [];
    let totalSavingsNis = 0;
    let totalEstimatedCost = 0;
    let pantryCoveredCount = 0;

    neededIngredients.forEach((item) => {
      const owned = alreadyHaveMap[item.product.id] || 0;
      const netNeeded = Math.max(0, item.quantityNeeded - owned);
      // Round up to whole packaging unit
      const purchaseQty = Math.ceil(netNeeded);

      const price = item.product.prices[currentStore.id] || item.product.basePrice;

      if (owned > 0) {
        pantryCoveredCount++;
        const savedMoney = Math.min(item.quantityNeeded, owned) * price;
        totalSavingsNis += savedMoney;
      }

      if (purchaseQty > 0) {
        itemsToBuy.push({
          product: item.product,
          quantity: purchaseQty,
          originalNeeded: item.quantityNeeded,
          saved: owned,
        });
        totalEstimatedCost += purchaseQty * price;
      }
    });

    return {
      itemsToBuy,
      pantryCoveredCount,
      totalSavingsNis: Math.round(totalSavingsNis),
      totalEstimatedCost: Math.round(totalEstimatedCost),
    };
  }, [neededIngredients, alreadyHaveMap, currentStore]);

  const handleCreateCart = () => {
    const finalCartItems = computedBasket.itemsToBuy.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
    onConfirmCreateCart(finalCartItems, currentStore);
  };

  const calculateCostForStore = (storeId: Store['id']) => {
    return computedBasket.itemsToBuy.reduce((sum, item) => {
      const price = item.product.prices[storeId] ?? item.product.basePrice;
      return sum + price * item.quantity;
    }, 0);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-right">
      {/* Header and Step Context */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Home className="w-4 h-4" />
              <span>שלב סיכום מצרכים ובדיקת מזווה</span>
              <span aria-hidden="true">·</span>
              <span>{householdSize} סועדים</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              מה כבר יש לכם בבית?
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              עברו על המצרכים שנבחרו למתכונים השבועיים. סמנו מה יש במקרר או במזווה (בקפיצות של <strong>0.5</strong> יחידה).
              סל הקניות יכיל <strong>אך ורק את מה שחסר</strong>! בחירת רשת הסופר תתבצע בסיום.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToPlan}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 self-start cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>חזרה לתפריט השבועי</span>
          </button>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[11px] text-slate-500 block">סך מצרכים במתכונים</span>
            <span className="text-lg font-black text-slate-900 tabular-nums">
              {neededIngredients.length} פריטים
            </span>
          </div>

          <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-semibold block">קיימים במזווה</span>
            <span className="text-lg font-black text-emerald-800 tabular-nums">
              {computedBasket.pantryCoveredCount} פריטים
            </span>
          </div>

          <div className="bg-blue-50 p-3 rounded-2xl border border-blue-200">
            <span className="text-[11px] text-blue-700 font-semibold block">לרכישה בסל</span>
            <span className="text-lg font-black text-blue-900 tabular-nums">
              {computedBasket.itemsToBuy.length} מוצרים
            </span>
          </div>

          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200">
            <span className="text-[11px] text-amber-700 font-semibold block">חיסכון ישיר</span>
            <span className="text-lg font-black text-amber-900 tabular-nums">
              ₪{computedBasket.totalSavingsNis}
            </span>
          </div>
        </div>

        {/* Quick Batch Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">פעולות מהירות:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkCommonStaples}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
            >
              סמן מוצרי יסוד כקיימים (שמן זית, קפה, תבלינים)
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 font-medium transition-colors cursor-pointer"
            >
              איפוס סימונים
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BUDGET TRACKING FEATURE AGAINST USER-DEFINED WEEKLY BUDGET */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-5 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <Wallet className="w-4 h-4" />
              <span>מעקב תקציב שבועי מול עלות מצרכים</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">
              בקרת תקציב וחיסכון בסל
            </h2>
            <p className="text-xs text-slate-500">
              הערכת עלות המצרכים שנבחרו לרכישה מול התקציב השבועי שהגדרתם, לפי מחירי {currentStore.nameHe}.
            </p>
          </div>

          {/* Quick budget adjustment trigger */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-left bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block">תקציב מוגדר</span>
              <span className="text-sm font-extrabold text-slate-900 tabular-nums">₪{weeklyBudget}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingBudget(!isEditingBudget)}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isEditingBudget ? 'סגור עריכה' : 'שינוי תקציב'}</span>
            </button>
          </div>
        </div>

        {/* User Budget Customizer (when opened) */}
        {isEditingBudget && (
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">הגדירו תקציב שבועי מותאם אישית:</span>
              <span className="font-black text-emerald-800 text-sm tabular-nums">₪{weeklyBudget} לשבוע</span>
            </div>

            <div className="space-y-1">
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={weeklyBudget}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWeeklyBudget(val);
                  onUpdateWeeklyBudget?.(val);
                }}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>₪200</span>
                <span>₪600</span>
                <span>₪1,000</span>
                <span>₪1,500</span>
                <span>₪2,000</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-slate-500 font-medium ml-1">בחירה מהירה:</span>
              {[350, 500, 750, 1000, 1400].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setWeeklyBudget(preset);
                    onUpdateWeeklyBudget?.(preset);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    weeklyBudget === preset
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  ₪{preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Visual Budget Progress Gauge Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="text-slate-700">ניצול תקציב נוכחי:</span>
              <span
                className={`px-2 py-0.5 rounded-md font-extrabold text-[11px] ${
                  computedBasket.totalEstimatedCost > weeklyBudget
                    ? 'bg-rose-100 text-rose-800'
                    : computedBasket.totalEstimatedCost / weeklyBudget >= 0.85
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {Math.round((computedBasket.totalEstimatedCost / weeklyBudget) * 100)}%
              </span>
            </div>

            <div className="tabular-nums">
              <strong className="text-slate-900">₪{computedBasket.totalEstimatedCost}</strong>
              <span className="text-slate-400 mx-1">מתוך</span>
              <span className="text-slate-600">₪{weeklyBudget}</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                computedBasket.totalEstimatedCost > weeklyBudget
                  ? 'bg-rose-500'
                  : computedBasket.totalEstimatedCost / weeklyBudget >= 0.85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{
                width: `${Math.min(100, (computedBasket.totalEstimatedCost / weeklyBudget) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 text-right">
            <span className="text-xs text-slate-500 block font-medium">עלות הסל ב-{currentStore.nameHe}</span>
            <div className="text-xl font-black text-slate-900 tabular-nums pt-0.5">
              ₪{computedBasket.totalEstimatedCost}
            </div>
            <span className="text-[10px] text-slate-400 block pt-0.5">{computedBasket.itemsToBuy.length} מוצרים לרכישה</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 text-right">
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-800 font-bold block">חיסכון מהמזווה</span>
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-700 tabular-nums pt-0.5">
              ₪{computedBasket.totalSavingsNis}
            </div>
            <span className="text-[10px] text-emerald-700 block pt-0.5">נחסך ממוצרים שיש בבית</span>
          </div>

          <div
            className={`p-3.5 rounded-2xl border text-right ${
              computedBasket.totalEstimatedCost <= weeklyBudget
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-rose-50/60 border-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold block ${
                  computedBasket.totalEstimatedCost <= weeklyBudget
                    ? 'text-emerald-800'
                    : 'text-rose-800'
                }`}
              >
                {computedBasket.totalEstimatedCost <= weeklyBudget
                  ? 'יתרת תקציב פנויה'
                  : 'חריגה מהתקציב'}
              </span>
              {computedBasket.totalEstimatedCost > weeklyBudget && (
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              )}
            </div>
            <div
              className={`text-xl font-black tabular-nums pt-0.5 ${
                computedBasket.totalEstimatedCost <= weeklyBudget
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}
            >
              ₪{Math.abs(weeklyBudget - computedBasket.totalEstimatedCost)}
            </div>
            <span className="text-[10px] text-slate-500 block pt-0.5">
              {computedBasket.totalEstimatedCost <= weeklyBudget
                ? 'נותר להוצאות שבועיות'
                : 'מעל היעד השבועי המוגדר'}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 text-right">
            <span className="text-xs text-slate-500 block font-medium">עלות מלאה ללא מזווה</span>
            <div className="text-xl font-black text-slate-700 tabular-nums pt-0.5">
              ₪{computedBasket.totalEstimatedCost + computedBasket.totalSavingsNis}
            </div>
            <span className="text-[10px] text-slate-400 block pt-0.5">אם הייתם קונים הכל מחדש</span>
          </div>
        </div>

        {/* Budget Status Message */}
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
            computedBasket.totalEstimatedCost <= weeklyBudget
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          {computedBasket.totalEstimatedCost <= weeklyBudget ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <strong>מצוין!</strong> אתם עומדים ביעד התקציב השבועי עם יתרה של{' '}
                <strong>₪{weeklyBudget - computedBasket.totalEstimatedCost}</strong>.{' '}
                סימון המצרכים שכבר יש לכם בבית חסך לכם <strong>₪{computedBasket.totalSavingsNis}</strong>!
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong>שים לב לחריגה:</strong> סל הקניות חורג ב-
                <strong>₪{computedBasket.totalEstimatedCost - weeklyBudget}</strong> מהתקציב השבועי.{' '}
                טיפ: בדקו שוב מצרכים שיש לכם במזווה, או בחרו רשת זולה יותר למטה (קרפור / רמי לוי / מחסני השוק).
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ingredient Items List */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
          <PackageCheck className="w-4 h-4 text-emerald-600" />
          <span>רשימת המצרכים לכל השבוע — סמנו מה יש בבית (בקפיצות של 0.5):</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {neededIngredients.map((item) => {
            const owned = alreadyHaveMap[item.product.id] || 0;
            const netNeeded = Math.max(0, item.quantityNeeded - owned);
            const purchaseQty = Math.ceil(netNeeded);
            const isFullyCovered = owned >= item.quantityNeeded;
            const price = item.product.prices[currentStore.id] || item.product.basePrice;

            return (
              <div
                key={item.product.id}
                className={`p-4 rounded-2xl border transition-all text-right ${
                  isFullyCovered
                    ? 'bg-emerald-50/50 border-emerald-300 opacity-80'
                    : owned > 0
                    ? 'bg-amber-50/30 border-amber-200'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {item.product.nameHe}
                      </span>
                      {item.product.isRegulated && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-1.5 py-0.5 rounded border border-slate-200">
                          מפוקח
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">
                      מותג: {item.product.brandHe} ·{' '}
                      {item.product.isWeighedOrButcher ? (
                        <span className="text-emerald-700 font-semibold">פריט שקילה / קצביה (חיפוש ישיר)</span>
                      ) : (
                        <span>ברקוד מאומת: {item.product.carrefourBarcode || item.product.barcode}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="text-xs font-bold text-slate-800 tabular-nums">
                      ₪{price.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-400">ליחידה</div>
                  </div>
                </div>

                {/* Recipe Need & Pantry Stepper Strip */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-600">
                    נדרש למתכונים: <strong className="font-bold text-slate-900">{item.quantityNeeded} {item.product.unit}</strong>
                  </div>

                  {/* Increment in halfs (0.5) */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => adjustHalf(item.product.id, -0.5, item.quantityNeeded)}
                      disabled={owned <= 0}
                      title="הפחת 0.5"
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-700 font-bold transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="min-w-[68px] text-center px-1">
                      <span className="text-xs font-black tabular-nums text-slate-900">
                        {owned.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-500 block">יש בבית</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => adjustHalf(item.product.id, 0.5, item.quantityNeeded)}
                      title="הוסף 0.5"
                      className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 flex items-center justify-center font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  {isFullyCovered ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>יש בבית במלואו (לא יתווסף לסל)</span>
                    </span>
                  ) : owned > 0 ? (
                    <span className="text-amber-800 font-semibold text-[11px]">
                      חלק קיים בבית · נותר לרכוש: <strong>{purchaseQty} {item.product.unit}</strong>
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">
                      יירכש במלואו: <strong>{purchaseQty} {item.product.unit}</strong>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleHaveAll(item.product.id, item.quantityNeeded)}
                    className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer"
                  >
                    {isFullyCovered ? 'בטל סימון' : 'יש לי הכל'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* "choosing the supermarket is in the end when the list is done." */}
      {/* ============================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="space-y-1 text-right">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
            <StoreIcon className="w-4 h-4" />
            <span>שלב סיום: בחירת רשת סופרמרקט</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
            לאיזה סופרמרקט להעביר את הסל הסופי?
          </h3>
          <p className="text-xs text-slate-500">
            רשימת הקניות מוכנה! בחרו את הרשת הרצויה להעברת הסל בלחיצה אחת:
          </p>
        </div>

        {/* Working Store Option Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STORES.filter((s) => s.platform !== 'in-store' && s.platform !== 'wolt-only').map((storeOpt) => {
            const isSelected = currentStore.id === storeOpt.id;
            const estimatedStoreCost = calculateCostForStore(storeOpt.id);

            return (
              <button
                key={storeOpt.id}
                type="button"
                onClick={() => setCurrentStore(storeOpt)}
                className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-extrabold text-slate-900">{storeOpt.nameHe}</div>
                    <div className="text-[11px] text-slate-500">{storeOpt.handoffMethodHe}</div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">עלות משוערת:</span>
                  <span className="font-extrabold text-slate-900 tabular-nums">₪{estimatedStoreCost.toFixed(2)}</span>
                </div>

                {storeOpt.id === 'carrefour' && (
                  <div className="mt-1 text-[10px] text-blue-900 font-bold bg-blue-100/80 px-2 py-0.5 rounded border border-blue-200">
                    🛡️ העברה בטוחה: מכולת נכנסת אוטומטית לסל + חיפוש ישיר לשקילה (מונע איפוס סל)
                  </div>
                )}

                {storeOpt.id === 'tivtaam' && (
                  <div className="mt-1 text-[10px] text-rose-800 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    🥓 רשת מומלצת למוצרים לא-כשרים, מעדנייה ופירות ים · פתוח בשבת
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {computedBasket.itemsToBuy.some((item) => item.product.isKosher === false) && (
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 flex items-center gap-2.5">
            <span className="text-xl">🥓</span>
            <div>
              <span className="font-extrabold text-amber-950 block">שימו לב: בסל הקניות שלכם נכללים מוצרים שאינם כשרים (בייקון / פירות ים / שרימפס).</span>
              <span className="text-amber-800 text-[11px]">מוצרים אלו זמינים ומסופקים בהעברה ישירה בלחיצה אחת ברשת <strong>טיב טעם</strong> (וברשת קשת טעמים).</span>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar: "And only then create the cart" */}
      <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-slate-300 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">רשת שיווק נבחרת:</span>
            <span
              className="text-xs font-extrabold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: currentStore.accentColor }}
            >
              {currentStore.nameHe}
            </span>
          </div>
          <div className="text-sm font-bold text-slate-900">
            בסל הסופי: <span className="text-emerald-700">{computedBasket.itemsToBuy.length} מוצרים</span> (עלות משוערת: ~₪{computedBasket.totalEstimatedCost})
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreateCart}
          className="px-6 py-3.5 text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>יצירת סל קניות והעברה אל {currentStore.nameHe} ({computedBasket.itemsToBuy.length} מוצרים)</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

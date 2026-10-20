import React, { useMemo } from 'react';
import { Split, ShoppingCart, ArrowLeft, Check, Sparkles, AlertCircle, ExternalLink } from 'lucide-react';
import { CartItem, Store, StoreId } from '../types';
import { STORES } from '../data/mockData';
import { computeStoreBasketCost, findOptimalSplitBasket } from '../utils/cartHandoff';

interface PriceComparisonViewProps {
  cartItems: CartItem[];
  onSelectStoreForHandoff: (store: Store) => void;
  onApplyAlternative: (originalProductId: string, alternativeProductId: string) => void;
  onNavigateToBuilder: () => void;
}

export const PriceComparisonView: React.FC<PriceComparisonViewProps> = ({
  cartItems,
  onSelectStoreForHandoff,
  onNavigateToBuilder,
}) => {
  // Compute prices for each store
  const storeComparison = useMemo(() => {
    return STORES.map((store) => {
      const { total, availableItemsCount, missingItems } = computeStoreBasketCost(
        store.id,
        cartItems
      );
      return {
        store,
        total,
        availableItemsCount,
        missingItems,
        isComplete: availableItemsCount === cartItems.length,
      };
    }).sort((a, b) => a.total - b.total);
  }, [cartItems]);

  const cheapestStore = storeComparison.find((s) => s.isComplete && s.total > 0);

  // Compute 2-store split basket optimization
  const splitBasket = useMemo(() => {
    return findOptimalSplitBasket(cartItems);
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-4">
        <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">סל הקניות שלך ריק</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          כדי להשוות מחירים בין רשתות השיווק השונות ולבדוק חיסכון של סל מפוצל, הוסיפו מוצרים או מתכון לסל.
        </p>
        <button
          onClick={onNavigateToBuilder}
          className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors cursor-pointer"
        >
          לבניית סל מוצרים
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Value Banner: Split Basket Highlight */}
      {splitBasket && splitBasket.savingsNis > 2 && (
        <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold">
                <Split className="w-3.5 h-3.5 text-emerald-400" />
                <span>המלצת חיסכון ייחודית: סל מפוצל חכם</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                חיסכון של ₪{splitBasket.savingsNis.toFixed(2)} ({splitBasket.savingsPercentage}%) בפיצול הקנייה ל-2 רשתות!
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                במקום לקנות הכל ברשת אחת בלבד ({splitBasket.singleBestStore.nameHe} ב-₪{splitBasket.singleBestTotal.toFixed(2)}), פיצול של מוצרי החלב/ירקות ל-{splitBasket.store1.nameHe} ושאר המוצרים ל-{splitBasket.store2.nameHe} יוריד את סך הקנייה ל-<strong>₪{splitBasket.combinedTotal.toFixed(2)}</strong>.
              </p>
            </div>

            {/* Split Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-3 shrink-0 lg:w-72">
              <div className="text-xs text-slate-200 font-medium">
                פירוט החלוקה המומלצת:
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{splitBasket.store1.nameHe}</span>
                  <span className="tabular-nums font-bold text-emerald-300">
                    ₪{splitBasket.subtotal1.toFixed(2)} ({splitBasket.items1.length} פריטים)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{splitBasket.store2.nameHe}</span>
                  <span className="tabular-nums font-bold text-emerald-300">
                    ₪{splitBasket.subtotal2.toFixed(2)} ({splitBasket.items2.length} פריטים)
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10 flex gap-2">
                <button
                  onClick={() => onSelectStoreForHandoff(splitBasket.store1)}
                  className="flex-1 py-1.5 px-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs text-center transition-colors cursor-pointer"
                >
                  העבר סל א׳
                </button>
                <button
                  onClick={() => onSelectStoreForHandoff(splitBasket.store2)}
                  className="flex-1 py-1.5 px-2 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs text-center transition-colors cursor-pointer"
                >
                  העבר סל ב׳
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single-Store Pricing Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              השוואת עלות סל שלם לפי רשת (9 רשתות מובילות)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              חישוב מבוסס מחירי אמת של {cartItems.length} מוצרים שנבחרו
            </p>
          </div>
          {cheapestStore && (
            <div className="text-left">
              <span className="text-xs text-slate-500">הרשת הזולה ביותר לסל מלא:</span>
              <div className="text-sm font-bold text-emerald-700">
                {cheapestStore.store.nameHe} (₪{cheapestStore.total.toFixed(2)})
              </div>
            </div>
          )}
        </div>

        {/* Supermarket Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {storeComparison.map(({ store, total, availableItemsCount, isComplete }) => {
            const isCheapest = cheapestStore?.store.id === store.id;
            const diffFromCheapest = cheapestStore
              ? total - cheapestStore.total
              : 0;

            return (
              <div
                key={store.id}
                className={`rounded-2xl p-4 border transition-all ${
                  isCheapest
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                } flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  {/* Top Bar of Store Card */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-base font-bold text-slate-900">
                          {store.nameHe}
                        </span>
                        {isCheapest && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-600 text-white rounded">
                            הזול ביותר
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {store.domain}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        store.platform === 'self-point'
                          ? 'bg-blue-50 text-blue-700'
                          : store.platform === 'nuxt-quickbuy'
                          ? 'bg-amber-50 text-amber-700'
                          : store.platform === 'in-store'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-orange-50 text-orange-700'
                      }`}
                    >
                      {store.platform === 'self-point'
                        ? '1-Click Direct'
                        : store.platform === 'nuxt-quickbuy'
                        ? 'Quick Buy'
                        : store.platform === 'in-store'
                        ? 'קנייה בסניף'
                        : 'Wolt / קישור'}
                    </span>
                  </div>

                  {/* Price display */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                        ₪{total.toFixed(2)}
                      </div>
                      {diffFromCheapest > 0 && isComplete && (
                        <span className="text-xs text-rose-600 font-medium tabular-nums">
                          +₪{diffFromCheapest.toFixed(2)} מעל הזול
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      זמינות פריטים בסל: {availableItemsCount} / {cartItems.length}
                    </div>
                  </div>

                  {/* Notes snippet */}
                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                    {store.notesHe}
                  </p>
                </div>

                {/* Card CTA */}
                <div className="pt-4 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => onSelectStoreForHandoff(store)}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCheapest
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>העבר סל ל{store.nameHe}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StartingWindow } from './components/StartingWindow';
import { OnboardingQuestionnaire } from './components/OnboardingQuestionnaire';
import { WeeklyMealGrid } from './components/WeeklyMealGrid';
import { PantrySummaryView, NeededIngredientItem } from './components/PantrySummaryView';
import { CartBuilder } from './components/CartBuilder';
import { CartHandoffModal } from './components/CartHandoffModal';
import { StoreResearchLab } from './components/StoreResearchLab';
import { MobileFrameSimulator } from './components/MobileFrameSimulator';
import { CartItem, Product, Store, UserPreferences } from './types';
import { PRODUCTS, STORES } from './data/mockData';
import {
  getSavedUserPreferences,
  saveUserPreferences,
  hasUserPreferencesCookie,
  clearUserPreferencesCookie,
  createEmptyPreferences,
} from './utils/cookieStorage';

export default function App() {
  // Start on the Starting Window as requested:
  // "When starting the app, make a starting windows. The days are empty when starting.
  // Only if the use have a cookie then remember his choices but go through all the pages but with option pre highlighted"
  const [activeTab, setActiveTab] = useState<string>('welcome');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Cookie persistence state
  const [savedPrefs, setSavedPrefs] = useState<UserPreferences | null>(() => getSavedUserPreferences());
  const [hasCookie, setHasCookie] = useState<boolean>(() => hasUserPreferencesCookie());

  // User preferences: if no cookie, starts completely empty with empty days
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const saved = getSavedUserPreferences();
    if (saved) return saved;
    return createEmptyPreferences();
  });

  const [selectedStore, setSelectedStore] = useState<Store>(() => {
    const saved = getSavedUserPreferences();
    if (saved && saved.preferredStoreId) {
      const match = STORES.find((s) => s.id === saved.preferredStoreId);
      if (match) return match;
    }
    return STORES[0]; // Carrefour / Yeinot Bitan (verified 1-click handoff)
  });

  // Needed ingredients gathered from weekly meal plan for the pantry check step
  const [neededIngredientsForPantry, setNeededIngredientsForPantry] = useState<NeededIngredientItem[]>([]);

  // Current active cart items
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: PRODUCTS.find((p) => p.id === 'p-milk-tnuva')!, quantity: 2 },
    { product: PRODUCTS.find((p) => p.id === 'p-cottage-tnuva')!, quantity: 2 },
    { product: PRODUCTS.find((p) => p.id === 'p-eggs-l')!, quantity: 1 },
    { product: PRODUCTS.find((p) => p.id === 'p-spaghetti-osem')!, quantity: 2 },
    { product: PRODUCTS.find((p) => p.id === 'p-tomatoes')!, quantity: 2 },
    { product: PRODUCTS.find((p) => p.id === 'p-cucumbers')!, quantity: 1 },
    { product: PRODUCTS.find((p) => p.id === 'p-chicken-breast')!, quantity: 1 },
  ]);

  // Register service worker on mount if in browser
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  // When starting from the Starting Window:
  // If useSaved = true (cookie exists), use saved preferences so options are pre-highlighted across all pages.
  // If useSaved = false (no cookie or fresh start), days are empty!
  const handleStartFromWelcome = (useSaved: boolean) => {
    if (useSaved && savedPrefs) {
      setUserPreferences(savedPrefs);
      const matchedStore = STORES.find((s) => s.id === savedPrefs.preferredStoreId);
      if (matchedStore) setSelectedStore(matchedStore);
    } else {
      const fresh = createEmptyPreferences();
      setUserPreferences(fresh);
    }
    // Proceed to questionnaire, walking through all pages with options pre-highlighted or empty
    setActiveTab('questionnaire');
  };

  const handleResetCookieAndStartFresh = () => {
    clearUserPreferencesCookie();
    setHasCookie(false);
    setSavedPrefs(null);
    const fresh = createEmptyPreferences();
    setUserPreferences(fresh);
    setActiveTab('questionnaire');
  };

  const handleCompleteQuestionnaire = (prefs: UserPreferences) => {
    // Remember choices in cookie and state
    saveUserPreferences(prefs);
    setUserPreferences(prefs);
    setSavedPrefs(prefs);
    setHasCookie(true);

    if (prefs.preferredStoreId) {
      const matchedStore = STORES.find((s) => s.id === prefs.preferredStoreId);
      if (matchedStore) setSelectedStore(matchedStore);
    }

    // Move to the Weekly Meal Manuscript
    setActiveTab('grid');
  };

  // From Weekly Meal Manuscript: proceed to Pantry Check
  const handleProceedToPantryCheck = (neededItems: NeededIngredientItem[]) => {
    setNeededIngredientsForPantry(neededItems);
    setActiveTab('pantry');
  };

  // "And only then create the cart" from Pantry Check (with chosen supermarket)
  const handleConfirmCreateCartFromPantry = (
    finalItems: { product: Product; quantity: number }[],
    chosenStore?: Store
  ) => {
    if (chosenStore) {
      setSelectedStore(chosenStore);
    }
    const formatted: CartItem[] = finalItems.map((item) => ({
      product: item.product,
      quantity: item.quantity,
    }));
    setCartItems(formatted);
    // Proceed directly to the 1-Click Handoff screen for the target store!
    setActiveTab('handoff');
  };

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const mainContent = (
    <div className="space-y-8">
      {/* 1. Starting Window */}
      {activeTab === 'welcome' && (
        <StartingWindow
          hasSavedCookie={hasCookie}
          savedPreferences={savedPrefs}
          onStartQuestionnaire={handleStartFromWelcome}
          onResetAndStartFresh={handleResetCookieAndStartFresh}
        />
      )}

      {/* 2. Onboarding Questionnaire */}
      {activeTab === 'questionnaire' && (
        <OnboardingQuestionnaire
          initialPreferences={userPreferences}
          onComplete={handleCompleteQuestionnaire}
          onSkip={() => setActiveTab('grid')}
        />
      )}

      {/* 3. Weekly Meal Manuscript (7 widened columns, day first letters, recipe modal, and pantry check button) */}
      {activeTab === 'grid' && (
        <WeeklyMealGrid
          preferences={userPreferences}
          selectedStore={selectedStore}
          onOpenQuestionnaire={() => setActiveTab('questionnaire')}
          onProceedToPantryCheck={handleProceedToPantryCheck}
        />
      )}

      {/* 4. Pantry Check & Ingredients Summary (increment in 0.5s before creating cart) */}
      {activeTab === 'pantry' && (
        <PantrySummaryView
          neededIngredients={neededIngredientsForPantry}
          selectedStore={selectedStore}
          householdSize={userPreferences.householdSize}
          userWeeklyBudget={userPreferences.weeklyBudget || userPreferences.budgetMax || 750}
          onUpdateWeeklyBudget={(newBudget) => {
            setUserPreferences((prev) => ({
              ...prev,
              weeklyBudget: newBudget,
              budgetMax: newBudget,
            }));
          }}
          onConfirmCreateCart={handleConfirmCreateCartFromPantry}
          onBackToPlan={() => setActiveTab('grid')}
        />
      )}

      {/* 5. Grocery Cart Builder */}
      {activeTab === 'builder' && (
        <CartBuilder
          cartItems={cartItems}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
          onProceedToCompare={() => setActiveTab('handoff')}
        />
      )}

      {/* 6. 1-Click Cart Handoff Engine (Direct to Verified Working Store APIs) */}
      {activeTab === 'handoff' && (
        <CartHandoffModal
          cartItems={cartItems}
          selectedStore={selectedStore}
          onSelectStore={setSelectedStore}
        />
      )}

      {/* 7. Store Research Lab */}
      {activeTab === 'research' && <StoreResearchLab />}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white" dir="rtl">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.length}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
      />

      <main className="flex-1">
        {isMobileFrame ? (
          <MobileFrameSimulator
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            cartCount={cartItems.length}
            onExitFrame={() => setIsMobileFrame(false)}
          >
            {mainContent}
          </MobileFrameSimulator>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {mainContent}
          </div>
        )}
      </main>

      {!isMobileFrame && (
        <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500 mb-16 sm:mb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">SalKal · סל קל</span>
              <span>—</span>
              <span>תכנון ארוחות שבועי חכם, בדיקת מה שיש בבית והעברת סל ישירה לרשתות השיווק</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>קרפור · ויקטורי · מחסני השוק · רמי לוי</span>
              <span>·</span>
              <span>PWA Mobile Ready</span>
              <span>·</span>
              <span>ללא תלות או חסות מסחרית מרשתות השיווק</span>
            </div>
          </div>
        </footer>
      )}

      {/* Real Phone Mobile Bottom Navigation Bar (Thumb friendly, strictly 4 core actions, pantry before cart) */}
      {!isMobileFrame && (
        <nav
          className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-xl grid grid-cols-4 items-center px-2 py-1.5 safe-bottom"
          aria-label="ניווט ראשי בנייד"
        >
          <button
            onClick={() => setActiveTab('questionnaire')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'questionnaire' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-lg">⚙️</span>
            <span className="text-[11px] font-bold mt-0.5">שאלון</span>
          </button>

          <button
            onClick={() => setActiveTab('grid')}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'grid' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-lg">📅</span>
            <span className="text-[11px] font-bold mt-0.5">תפריט</span>
          </button>

          <button
            onClick={() => {
              if (neededIngredientsForPantry.length === 0 && cartItems.length > 0) {
                // Populate needed ingredients from current cart if not already populated
                setNeededIngredientsForPantry(
                  cartItems.map((ci) => ({ product: ci.product, quantityNeeded: ci.quantity }))
                );
              }
              setActiveTab('pantry');
            }}
            className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
              activeTab === 'pantry' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-lg">🥫</span>
            <span className="text-[11px] font-bold mt-0.5">מזווה</span>
          </button>

          <button
            onClick={() => setActiveTab('handoff')}
            className={`flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
              activeTab === 'handoff' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span className="text-lg">🚀</span>
            <span className="text-[11px] font-bold mt-0.5">העברה</span>
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-3.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
        </nav>
      )}
    </div>
  );
}

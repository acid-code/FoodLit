import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Store as StoreIcon,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  Search,
  AlertTriangle,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { Store, CartItem } from '../types';
import { STORES } from '../data/mockData';
import {
  buildRamiLevyQuickBuyText,
  buildShufersalShareText,
  computeStoreBasketCost,
  buildStoreSearchUrl,
  buildStoreFormattedList,
  planSelfPointHandoff,
} from '../utils/cartHandoff';
import { InStoreWalkList } from './InStoreWalkList';
import { StoreMappingDbView } from './StoreMappingDbView';

interface CartHandoffModalProps {
  cartItems: CartItem[];
  selectedStore: Store;
  onSelectStore: (store: Store) => void;
  onClose?: () => void;
}

export const CartHandoffModal: React.FC<CartHandoffModalProps> = ({
  cartItems,
  selectedStore,
  onSelectStore,
  onClose,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [showSimulatedDialog, setShowSimulatedDialog] = useState(false);
  const [simulatedCartAdded, setSimulatedCartAdded] = useState(false);
  // Safe mode is enabled by default for ALL Stor.ai stores (Carrefour, Victory, Machsanei HaShuk, Keshet Te'amim, Tiv Taam)
  const [safeMode, setSafeMode] = useState<boolean>(true);
  const [markedAddedItems, setMarkedAddedItems] = useState<Record<string, boolean>>({});
  const [showMappingDb, setShowMappingDb] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const toggleMarkedItem = (productId: string) => {
    setMarkedAddedItems((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const basketQuote = computeStoreBasketCost(selectedStore.id, cartItems);
  const handoffOptions = {
    appName: 'SalKal',
    isNonKosherSpecialist: selectedStore.isNonKosherSpecialist === true,
  };
  const safePlan = planSelfPointHandoff(selectedStore.domain, cartItems, { ...handoffOptions, safeMode: true });
  const fullPlan = planSelfPointHandoff(selectedStore.domain, cartItems, { ...handoffOptions, safeMode: false });
  const activePlan = safeMode ? safePlan : fullPlan;
  const selfPointUrl = activePlan.url;

  const ramiLevyText = buildRamiLevyQuickBuyText(cartItems);
  const shufersalText = buildShufersalShareText(cartItems);
  const generalStoreListText = buildStoreFormattedList(selectedStore, cartItems);

  const handleCopy = async (text: string, type: string) => {
    setCopyFailed(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      setCopyFailed(true);
    }
  };

  const handleOpenStoreUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Top Utility Bar: Store Internal Database & Sync Inspector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-xs border border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-300">
            <Database className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black">מאגר מזהים פנימיים וסנכרון סופרמרקטים</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-200 border border-amber-400/30 rounded-full text-[10px] font-bold">
                ברקודים לדוגמה, בלי מק״ט רשת מאומת
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              שופרסל (Hybris P_), רמי לוי (REST ID), קרפור, ויקטורי וטיב טעם (Stor.ai SKU)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowMappingDb(!showMappingDb)}
          className="text-xs font-bold text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>{showMappingDb ? 'סגור מאגר מזהים' : '🔍 צפה במאגר המזהים והסנכרון'}</span>
        </button>
      </div>

      {/* Embedded Store Mapping DB & Catalog Sync Inspector */}
      {showMappingDb && (
        <div className="animate-fadeIn">
          <StoreMappingDbView />
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>העברת סל ישירה לרשתות השיווק</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              העברת סל הקניות לסופרמרקט
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              העברה מהירה, בטוחה ומדויקת ללא נפילת פריטים או מחיקת עגלה
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(generalStoreListText, 'all-list')}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedType === 'all-list' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>כל הרשימה הועתקה!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>העתק את כל {cartItems.length} המוצרים ללוח</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Supermarket Selection Strip (Horizontal touch-friendly scroll on mobile) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">
            בחרו את רשת הסופרמרקט להעברת הסל:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {STORES.map((store) => {
              const isSelected = selectedStore.id === store.id;
              return (
                <button
                  key={store.id}
                  onClick={() => onSelectStore(store)}
                  className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 min-h-[44px] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: store.accentColor }}
                  />
                  <span>{store.nameHe}</span>
                  {store.isNonKosherSpecialist && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-semibold">
                      לא כשר
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Store Status Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">
                {selectedStore.nameHe}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-600 font-mono" dir="ltr">
                {selectedStore.domain}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {selectedStore.handoffMethodHe}
            </p>
          </div>

          <div className="text-left bg-white px-4 py-2 rounded-xl border border-slate-200 shrink-0 self-start sm:self-auto">
            <div className="text-[11px] text-slate-500">עלות משוערת (מחירי דוגמה):</div>
            <div className="text-lg font-black text-slate-900 tabular-nums">
              ₪{basketQuote.total.toFixed(2)}
            </div>
            {basketQuote.missingItems.length > 0 && (
              <div className="text-[10px] text-amber-700">
                מחיר ל-{basketQuote.availableItemsCount} מתוך {cartItems.length} מוצרים
              </div>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* CASE 1: Self-Point Platforms (Carrefour, Victory, Machsanei HaShuk, Keshet, Tiv Taam) */}
        {/* ============================================================== */}
        {selectedStore.platform === 'self-point' && (
          <div className="space-y-5">
            {/* Safe Handoff Protection Banner */}
            <div className="p-4 bg-blue-50/90 rounded-2xl border border-blue-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-blue-100">
                <div className="flex items-center gap-2 text-blue-950 font-extrabold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>מנגנון העברה בטוחה (Safe Handoff) לרשת {selectedStore.nameHe}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(generalStoreListText, 'store-list')}
                    className="text-xs font-bold text-blue-800 hover:text-blue-950 bg-white px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    {copiedType === 'store-list' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>הרשימה הועתקה!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>העתק רשימה מסודרת</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-xs text-blue-900 leading-relaxed">
                <strong>למה מוצרים לא זוהו קודם או מחקו את הסל?</strong> באתרי Stor.ai (קרפור, ויקטורי, מחסני השוק, קשת טעמים וטיב טעם),
                ירקות ופירות בתפזורת ובשר קצביה טרי נמכרים לפי משקל מקומי בסניף ואינם בעלי ברקוד קבוע אחיד.
                כאשר קישור מכיל מוצר שקילה ללא ברקוד מזוהה, המערכת של הסופר מציגה התראה או מוחקת את שאר הפריטים!
              </p>

              <div className="p-3 bg-white/90 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>הפתרון המאומת: העברה נקייה ובטוחה</span>
                </div>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  הקישור שולח כעת <strong>{activePlan.included.length} מוצרים עם ברקוד מספרי שסומן כמאומת בקטלוג הדוגמה</strong>.
                  {activePlan.manual.length > 0 && (
                    <>
                      {' '}
                      {activePlan.manual.length} פריטים (שקילה, קצביה, או ברקוד שלא סומן כמאומת) נשארים מחוץ לקישור ואפשר לחפש אותם באתר.
                    </>
                  )}
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="font-bold text-slate-700">מצב העברת סל:</span>
                <div className="inline-flex rounded-xl bg-blue-100/70 p-1 border border-blue-200">
                  <button
                    type="button"
                    onClick={() => setSafeMode(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      safeMode
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-blue-900 hover:bg-blue-200/50'
                    }`}
                  >
                    🛡️ העברה בטוחה ({safePlan.included.length} פריטים) - מומלץ
                  </button>
                  <button
                    type="button"
                    onClick={() => setSafeMode(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      !safeMode
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'text-blue-900 hover:bg-blue-200/50'
                    }`}
                  >
                    ⚠️ ניסיון העברה מלאה ({fullPlan.included.length} פריטים)
                  </button>
                </div>
              </div>
            </div>

            {/* Non-Kosher Notice if present */}
            {activePlan.excludedNonKosher.length > 0 && !selectedStore.isNonKosherSpecialist && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">
                    שימו לב: {activePlan.excludedNonKosher.length} מוצרים לא-כשרים בסל סוננו מקישור רשת {selectedStore.nameHe}
                  </strong>
                  <span className="text-[11px] text-amber-800">
                    מוצרים כמו בייקון או שרימפס אינם נמכרים ברשת כשרה זו. אם ברצונכם לרכוש אותם,
                    בחרו למעלה ברשת <strong>טיב טעם</strong> שמתמחה במוצרים אלו.
                  </span>
                </div>
              </div>
            )}

            {/* Weighed Produce & Fresh Butcher Quick Addition Strip */}
            {activePlan.manual.length > 0 && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>פריטים שלא נכנסו לקישור ({activePlan.manual.length} מוצרים):</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-200 font-semibold">
                    קליק אחד לחיפוש
                  </span>
                </div>

                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  לחצו על "חיפוש באתר" לכל פריט טרי כדי להוסיפו ישירות לפי משקל או מארז מקומי:
                </p>

                <div className="divide-y divide-emerald-100 bg-white rounded-xl border border-emerald-200/80 p-2 text-xs">
                  {activePlan.manual.map((item) => {
                    const isMarked = !!markedAddedItems[item.product.id];
                    const searchUrl = buildStoreSearchUrl(selectedStore, item.product.carrefourSearchQuery || item.product.nameHe);

                    return (
                      <div
                        key={item.product.id}
                        className={`py-2 px-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                          isMarked ? 'bg-emerald-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleMarkedItem(item.product.id)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                              isMarked
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-emerald-500 bg-white'
                            }`}
                            title="סמן שהוספת לסל"
                          >
                            {isMarked && <Check className="w-3.5 h-3.5" />}
                          </button>
                          <div>
                            <span className={`font-bold ${isMarked ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {item.product.nameHe}
                            </span>
                            <span className="text-[11px] text-slate-500 mr-1.5">
                              ({item.quantity} {item.product.unit})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                          <a
                            href={searchUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                          >
                            <Search className="w-3 h-3" />
                            <span>חיפוש ב{selectedStore.nameHe.split('/')[0].trim()} ↗</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Generated Live URL Display & Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  הקישור שנוצר עבור {activePlan.included.length} המוצרים שייכנסו לדיאלוג:
                </label>
                {safeMode && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded border border-emerald-200">
                    🛡️ מוגן מפני איפוס סל
                  </span>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  value={selfPointUrl}
                  dir="ltr"
                  className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 select-all"
                />
                <button
                  onClick={() => handleCopy(selfPointUrl, 'url')}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {copiedType === 'url' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>הועתק!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>העתק קישור</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => selfPointUrl && handleOpenStoreUrl(selfPointUrl)}
                disabled={!selfPointUrl}
                className="px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <ExternalLink className="w-4 h-4" />
                <span>
                  {selfPointUrl
                    ? `פתח את הסל באתר ${selectedStore.nameHe} (${activePlan.included.length} מוצרים)`
                    : 'אין מוצרים עם ברקוד שאפשר לשלוח בקישור'}
                </span>
              </button>

              <button
                onClick={() => setShowSimulatedDialog(!showSimulatedDialog)}
                className="px-4 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>סימולציה מקדימה של הדיאלוג באתר</span>
              </button>
            </div>

            {/* Live Interactive Dialog Simulator */}
            {showSimulatedDialog && (
              <div className="p-4 sm:p-5 bg-slate-900 text-white rounded-2xl space-y-4 border border-slate-800">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="text-xs font-bold text-emerald-400">
                    תצוגה מקדימה: כך מופיע הדיאלוג באתר {selectedStore.nameHe}
                  </div>
                  <button
                    onClick={() => setShowSimulatedDialog(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    סגור ✕
                  </button>
                </div>

                <div className="bg-white text-slate-900 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="text-lg">🛒</span>
                    <strong className="text-sm font-black">
                      המוצרים שלכם מאתר SalKal
                    </strong>
                  </div>
                  <p className="text-xs text-slate-600">
                    נמצאו <strong>{activePlan.included.length} מוצרים</strong> להוספה ישירה לסל שלכם.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setSimulatedCartAdded(true)}
                      className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs cursor-pointer hover:bg-emerald-700"
                    >
                      {simulatedCartAdded ? '✓ המוצרים נוספו בהצלחה!' : 'הוסף את כל המוצרים לסל שלי'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 2: Rami Levy (Nuxt Quick Buy Clean Handoff) */}
        {/* ============================================================== */}
        {selectedStore.platform === 'nuxt-quickbuy' && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
              <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>רמי לוי - קנייה מהירה והעתקת סל בקליק אחד</span>
              </div>
              <p className="text-xs text-blue-900 leading-relaxed">
                אתר רמי לוי כולל כלי מובנה של <strong>"קנייה מהירה"</strong>.
                מעתיקים את הרשימה המעוצבת שלנו, פותחים את אתר רמי לוי ומדביקים (Paste) - וכל המוצרים מותאמים לסל באופן מיידי!
              </p>
            </div>

            {/* Quick Buy Text Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  רשימת קנייה מעוצבת להדבקה ברמי לוי ({cartItems.length} מוצרים):
                </label>
                <button
                  onClick={() => handleCopy(ramiLevyText, 'ramilevy')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                >
                  {copiedType === 'ramilevy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>הועתק ללוח!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>העתק רשימה</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={5}
                value={ramiLevyText}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed select-all"
              />
            </div>

            {/* 3 Step Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-emerald-700">שלב 1:</span>
                <p className="text-slate-600">לחצו על כפתור "העתק רשימה" למעלה.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-emerald-700">שלב 2:</span>
                <p className="text-slate-600">פתחו את אתר רמי לוי בכפתור הירוק מטה.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-emerald-700">שלב 3:</span>
                <p className="text-slate-600">לחצו על "קנייה מהירה" והדביקו (Paste).</p>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => handleOpenStoreUrl('https://www.rami-levy.co.il/he/online-shopping')}
                className="px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>פתח את אתר רמי לוי אונליין</span>
              </button>
            </div>

            {/* Direct product search links */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                חיפוש מהיר פריט-אחר-פריט ברמי לוי:
              </span>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 p-2 text-xs max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-1.5 px-1 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {item.product.nameHe} ({item.quantity} {item.product.unit})
                    </span>
                    <a
                      href={buildStoreSearchUrl(selectedStore, item.product.nameHe)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Search className="w-3 h-3" />
                      <span>חפש ברמי לוי ↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 3: Shufersal (Clean, Reliable Handoff - Zero JS Errors) */}
        {/* ============================================================== */}
        {selectedStore.platform === 'sap-hybris' && (
          <div className="space-y-6">
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 space-y-2">
              <div className="flex items-center gap-2 text-orange-950 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span>שופרסל אונליין - העברת סל פשוטה וללא שגיאות</span>
              </div>
              <p className="text-xs text-orange-900 leading-relaxed">
                מערכת שופרסל מבוססת על סשן לקוח מאובטח. הכנו עבורכם רשימת מוצרים מרוכזת עם ברקודים ומק״טים,
                אותה תוכלו להעתיק בלחיצה אחת או לחפש כל מוצר ישירות בשופרסל.
              </p>
            </div>

            {/* Text sharing box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  רשימת קניות מרוכזת לשופרסל ({cartItems.length} מוצרים):
                </label>
                <button
                  onClick={() => handleCopy(shufersalText, 'shufersal')}
                  className="text-xs font-bold text-orange-700 hover:text-orange-900 flex items-center gap-1 cursor-pointer bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200"
                >
                  {copiedType === 'shufersal' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>הועתק ללוח!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>העתק רשימה</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                readOnly
                rows={5}
                value={shufersalText}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono leading-relaxed select-all"
              />
            </div>

            {/* Step Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-orange-700">שלב 1:</span>
                <p className="text-slate-600">לחצו על "העתק רשימה" למעלה.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-orange-700">שלב 2:</span>
                <p className="text-slate-600">פתחו את אתר שופרסל בכפתור הכתום מטה.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="font-black text-orange-700">שלב 3:</span>
                <p className="text-slate-600">הדביקו בחיפוש או הזינו את הפריטים לרשימה שמורה.</p>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => handleOpenStoreUrl('https://www.shufersal.co.il/online/he/')}
                className="px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>פתח את שופרסל אונליין</span>
              </button>
            </div>

            {/* Direct item search in Shufersal */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                חיפוש מהיר פריט-אחר-פריט בשופרסל:
              </span>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 p-2 text-xs max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-1.5 px-1 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800">
                      {item.product.nameHe} ({item.quantity} {item.product.unit})
                    </span>
                    <a
                      href={buildStoreSearchUrl(selectedStore, item.product.nameHe)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-700 hover:text-orange-900 font-bold flex items-center gap-1 text-[11px]"
                    >
                      <Search className="w-3 h-3" />
                      <span>חפש בשופרסל ↗</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 4: Osher Ad (In-Store Shopping Walk List) */}
        {/* ============================================================== */}
        {selectedStore.platform === 'in-store' && (
          <div className="space-y-6">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <StoreIcon className="w-4 h-4 text-amber-600" />
                <span>אושר עד - קנייה פיזית בסניף עם ניווט לפי מעברים</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                לאושר עד אין אתר קניות אונליין. כדי לחסוך זמן יקר בסניף, סידרנו עבורכם את כל המוצרים לפי מעברים ומדפים,
                כך שתוכלו לסמן פריטים שנכנסו לעגלה.
              </p>
            </div>

            <InStoreWalkList cartItems={cartItems} />
          </div>
        )}

        {/* ============================================================== */}
        {/* CASE 5: Wolt Partners (AM:PM) */}
        {/* ============================================================== */}
        {selectedStore.platform === 'wolt-only' && (
          <div className="space-y-6">
            <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 space-y-2">
              <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span>ערוץ Wolt בלבד עבור {selectedStore.nameHe}</span>
              </div>
              <p className="text-xs text-sky-800 leading-relaxed">
                רשת AM:PM פועלת אך ורק דרך Wolt.
                המעבר מתבצע ישירות לדף הסניף בוולט עם אפשרות לחפש ולהוסיף את הפריטים.
              </p>
            </div>

            <button
              onClick={() => handleOpenStoreUrl(`https://${selectedStore.domain}`)}
              className="px-6 py-3.5 text-xs sm:text-sm font-black text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>פתח את חנות {selectedStore.nameHe} ב-Wolt</span>
            </button>
          </div>
        )}

        {/* Assurance Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {copyFailed
                ? 'ההעתקה ללוח נכשלה. סמנו את הטקסט והעתיקו ידנית.'
                : 'ההעברה נעשית בקישור ציבורי או בהדבקה. אין התחברות אוטומטית לאתרי הרשתות.'}
            </span>
          </div>
          <span className="text-slate-400">
            תאריך סנכרון אחרון: אוקטובר 2026
          </span>
        </div>
      </div>
    </div>
  );
};

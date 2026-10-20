import React, { useState, useMemo } from 'react';
import { Search, Plus, Minus, Check, Sparkles, Filter, Trash2, ArrowLeft } from 'lucide-react';
import { Product, CartItem } from '../types';
import { PRODUCTS } from '../data/mockData';

interface CartBuilderProps {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  onProceedToCompare: () => void;
}

export const CartBuilder: React.FC<CartBuilderProps> = ({
  cartItems,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  onProceedToCompare,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'הכל' },
    { id: 'dairy', label: 'חלב וביצים' },
    { id: 'produce', label: 'פירות וירקות' },
    { id: 'pantry', label: 'מזווה ויבשים' },
    { id: 'meat', label: 'בשר ועוף' },
    { id: 'bakery', label: 'מאפייה' },
    { id: 'beverages', label: 'שתייה' },
    { id: 'snacks', label: 'חטיפים' },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        product.nameHe.toLowerCase().includes(query) ||
        product.nameEn.toLowerCase().includes(query) ||
        product.brandHe.toLowerCase().includes(query) ||
        product.barcode.includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const totalCartCost = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.basePrice * item.quantity,
      0
    );
  }, [cartItems]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Search & Categories */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="חיפוש לפי שם מוצר, מותג (תנובה, אסם, שטראוס) או ברקוד..."
              className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-emerald-600 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                נקה
              </button>
            )}
          </div>

          {/* Quick Cart Actions */}
          <div className="flex items-center gap-2 justify-end">
            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>רוקן סל ({cartItems.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => {
          const qty = getItemQuantity(product.id);
          const hasAlternative = !!product.alternativeId;

          return (
            <div
              key={product.id}
              className={`bg-white rounded-2xl p-4 border transition-all ${
                qty > 0
                  ? 'border-emerald-300 ring-1 ring-emerald-200 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300'
              } flex flex-col justify-between`}
            >
              <div className="space-y-2.5">
                {/* Header: Brand & Unboxed Metadata */}
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-800">{product.brandHe}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] text-slate-400">{product.barcode}</span>
                  </div>
                  {product.isRegulated && (
                    <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                      מחיר מפוקח
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-slate-900 leading-snug">
                  {product.nameHe}
                </h3>

                {/* Subtitle / Unit & Price */}
                <div className="flex items-baseline justify-between pt-1">
                  <div className="text-lg font-bold text-slate-900 tabular-nums">
                    ₪{product.basePrice.toFixed(2)}
                    <span className="text-xs font-normal text-slate-500 mr-1.5">
                      / {product.unit}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {product.aisle}
                  </div>
                </div>

                {/* Smart Alternative Tip */}
                {hasAlternative && (
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2 text-xs text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-tight">
                      חלופה חכמה: {product.alternativeReasonHe}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Action: Stepper or Add Button */}
              <div className="pt-4 border-t border-slate-100 mt-3 flex items-center justify-between">
                {qty > 0 ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, qty - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-slate-900 tabular-nums text-sm">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, qty + 1)}
                        className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-semibold text-emerald-700 tabular-nums">
                      ₪{(product.basePrice * qty).toFixed(2)} בסל
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product, 1)}
                    className="w-full py-2 px-3 text-xs font-semibold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>הוסף לסל</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">לא נמצאו מוצרים התואמים את החיפוש.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-3 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 cursor-pointer"
          >
            איפוס סינונים
          </button>
        </div>
      )}

      {/* Floating Bottom Bar when items exist */}
      {cartItems.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-300">
                סה״כ בסל: <strong>{cartItems.length} פריטים</strong> ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} יחידות)
              </div>
              <div className="text-lg font-bold tabular-nums">
                ~₪{totalCartCost.toFixed(2)}
              </div>
            </div>
          </div>

          <button
            onClick={onProceedToCompare}
            className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <span>השווה מחירים והעבר סל לרשת</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

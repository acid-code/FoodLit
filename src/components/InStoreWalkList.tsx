import React, { useState } from 'react';
import { CheckSquare, Square, Printer, ShoppingBag, Check } from 'lucide-react';
import { CartItem } from '../types';
import { buildInStoreAisleMap } from '../utils/cartHandoff';

interface InStoreWalkListProps {
  cartItems: CartItem[];
}

export const InStoreWalkList: React.FC<InStoreWalkListProps> = ({ cartItems }) => {
  const [checkedItemIds, setCheckedItemIds] = useState<Record<string, boolean>>({});

  const aisleMap = buildInStoreAisleMap(cartItems);
  const aisleKeys = Object.keys(aisleMap).sort();

  const toggleCheck = (productId: string) => {
    setCheckedItemIds((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const checkedCount = Object.values(checkedItemIds).filter(Boolean).length;
  const progressPercent =
    cartItems.length > 0 ? Math.round((checkedCount / cartItems.length) * 100) : 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Header & Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            מסלול הליכה לפי מעברים (אושר עד / קנייה פיזית)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            הפריטים ממוינים לפי סדר המעברים בסניף, מהכניסה ועד לקופות
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-600">
            בעגלה: <strong>{checkedCount} מתוך {cartItems.length}</strong> ({progressPercent}%)
          </div>
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer print:hidden"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>הדפס רשימה</span>
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden print:hidden">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Aisle Groups */}
      <div className="space-y-4">
        {aisleKeys.map((aisle) => {
          const items = aisleMap[aisle];
          return (
            <div
              key={aisle}
              className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5"
            >
              <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{aisle}</span>
                <span className="text-slate-400 font-normal">
                  {items.length} מוצרים
                </span>
              </div>

              <div className="divide-y divide-slate-200/60 bg-white rounded-xl border border-slate-100 overflow-hidden">
                {items.map((item) => {
                  const isChecked = !!checkedItemIds[item.product.id];
                  return (
                    <div
                      key={item.product.id}
                      onClick={() => toggleCheck(item.product.id)}
                      className={`p-3 flex items-center justify-between transition-colors cursor-pointer select-none ${
                        isChecked ? 'bg-emerald-50/40 text-slate-400' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="text-slate-500 hover:text-emerald-600"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <div>
                          <div
                            className={`text-sm font-semibold ${
                              isChecked
                                ? 'line-through text-slate-400'
                                : 'text-slate-900'
                            }`}
                          >
                            {item.product.nameHe}
                          </div>
                          <div className="text-xs text-slate-400">
                            {item.product.brandHe} · ברקוד: {item.product.barcode}
                          </div>
                        </div>
                      </div>

                      <div className="text-left font-bold text-xs tabular-nums">
                        <span
                          className={`px-2 py-0.5 rounded ${
                            isChecked
                              ? 'bg-slate-100 text-slate-400'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {item.quantity} {item.product.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

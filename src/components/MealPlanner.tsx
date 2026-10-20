import React, { useState } from 'react';
import { Sparkles, Clock, Users, Plus, Check, ChevronDown, ChevronUp, ShoppingCart, ArrowLeft } from 'lucide-react';
import { MealRecipe, Product } from '../types';
import { MEAL_RECIPES, PRODUCTS } from '../data/mockData';

interface MealPlannerProps {
  onAddMultipleToCart: (items: { product: Product; quantity: number }[]) => void;
  onProceedToCart: () => void;
}

export const MealPlanner: React.FC<MealPlannerProps> = ({
  onAddMultipleToCart,
  onProceedToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('הכל');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>('meal-shabbat-dinner');
  const [servingMultipliers, setServingMultipliers] = useState<Record<string, number>>({
    'meal-shabbat-dinner': 6,
    'meal-shakshuka': 4,
    'meal-kids-schnitzel-pasta': 4,
    'meal-israeli-breakfast': 2,
    'meal-bolognese-comfort': 5,
  });
  const [addedRecipeId, setAddedRecipeId] = useState<string | null>(null);

  const categories = ['הכל', 'שבת וחגים', 'בוקר ובראנץ׳', 'ילדים', 'צמחוני / בריא', 'אמצע שבוע'];

  const filteredRecipes = MEAL_RECIPES.filter(
    (recipe) => selectedCategory === 'הכל' || recipe.categoryHe === selectedCategory
  );

  const handleServingChange = (recipeId: string, delta: number, baseServings: number) => {
    const current = servingMultipliers[recipeId] || baseServings;
    const next = Math.max(2, Math.min(12, current + delta));
    setServingMultipliers((prev) => ({ ...prev, [recipeId]: next }));
  };

  const handleAddMealToCart = (recipe: MealRecipe) => {
    const currentServings = servingMultipliers[recipe.id] || recipe.servings;
    const ratio = currentServings / recipe.servings;

    const itemsToAdd = recipe.ingredients.map((ing) => {
      const product = PRODUCTS.find((p) => p.id === ing.productId)!;
      const scaledQty = Math.max(1, Math.round(ing.quantity * ratio));
      return { product, quantity: scaledQty };
    });

    onAddMultipleToCart(itemsToAdd);
    setAddedRecipeId(recipe.id);
    setTimeout(() => setAddedRecipeId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Banner */}
      <div className="bg-emerald-800 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-700/80 rounded-lg text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>תכנון ארוחות ישראלי חכם וחסכוני</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            תכנון ארוחות ישראליות בלחיצה אחת לסל הקניות
          </h2>
          <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
            בחרו ארוחה לשבת, שקשוקה לבראנץ׳ או שניצל ופסטה לילדים — המערכת מתאימה בדיוק את המצרכים, הברקודים והכמויות ומזינה אותם לסל שלכם להשוואת מחירים מיידית.
          </p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recipes List */}
      <div className="space-y-4">
        {filteredRecipes.map((recipe) => {
          const isExpanded = expandedRecipeId === recipe.id;
          const currentServings = servingMultipliers[recipe.id] || recipe.servings;
          const isJustAdded = addedRecipeId === recipe.id;

          return (
            <div
              key={recipe.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-shadow hover:shadow-sm"
            >
              {/* Recipe Summary Row */}
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-700">{recipe.categoryHe}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {recipe.prepTimeMinutes} דק׳ הכנה
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>רמת קושי: {recipe.difficultyHe}</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {recipe.titleHe}
                  </h3>

                  <p className="text-sm text-slate-600 max-w-2xl">
                    {recipe.subtitleHe}
                  </p>
                </div>

                {/* Servings Adjuster & Add Button */}
                <div className="flex flex-wrap items-center gap-3 justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {/* Servings Counter */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-600">סועדים:</span>
                    <button
                      onClick={() => handleServingChange(recipe.id, -1, recipe.servings)}
                      className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-bold text-slate-900 tabular-nums">
                      {currentServings}
                    </span>
                    <button
                      onClick={() => handleServingChange(recipe.id, 1, recipe.servings)}
                      className="w-5 h-5 rounded bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Add Ingredients CTA */}
                  <button
                    onClick={() => handleAddMealToCart(recipe)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                      isJustAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isJustAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>נוספו לסל בהצלחה!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>הוסף מצרכים לסל</span>
                      </>
                    )}
                  </button>

                  {/* Toggle Details Accordion */}
                  <button
                    onClick={() =>
                      setExpandedRecipeId(isExpanded ? null : recipe.id)
                    }
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    title={isExpanded ? 'סגור פירוט' : 'הצג מצרכים והוראות'}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded Ingredients & Preparation */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-2 bg-slate-50/50 border-t border-slate-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* Ingredients Column */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                        <span>מצרכים שנכנסים לסל (לפי ברקוד רשמי)</span>
                      </h4>

                      <div className="bg-white rounded-xl p-3 border border-slate-200 divide-y divide-slate-100 text-xs">
                        {recipe.ingredients.map((ing) => {
                          const product = PRODUCTS.find((p) => p.id === ing.productId);
                          if (!product) return null;
                          const ratio = currentServings / recipe.servings;
                          const scaledQty = Math.max(1, Math.round(ing.quantity * ratio));

                          return (
                            <div
                              key={ing.productId}
                              className="py-2 flex items-center justify-between first:pt-0 last:pb-0"
                            >
                              <div className="space-y-0.5">
                                <div className="font-semibold text-slate-900">
                                  {product.nameHe}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {product.brandHe} · ברקוד: {product.barcode}
                                </div>
                              </div>
                              <div className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded tabular-nums">
                                {scaledQty} {product.unit}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Instructions Column */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        אופן ההכנה (בפשטות ומהירות)
                      </h4>

                      <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2 text-xs text-slate-700 leading-relaxed">
                        {recipe.instructionsHe.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                              {idx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Quick Action */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={onProceedToCart}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>מעבר לסל הקניות המלא ולהשוואה</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

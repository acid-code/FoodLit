import { MealRecipe, MealType, CuisineType, UserPreferences } from '../types';
import { PRODUCTS, MEAL_RECIPES } from '../data/mockData';

export interface AiRecipeRequest {
  prompt: string;
  mealType: MealType;
  dayId?: string;
  householdSize: number;
  dietary: UserPreferences['dietary'];
  cuisinePreferences?: CuisineType[];
}

/**
 * Local smart culinary heuristic generator.
 * Works completely offline / free / zero-delay when API key is not provided or network is offline.
 * Smart enough to understand Hebrew cravings, cuisines, ingredients, and non-kosher/Tiv Taam requests.
 */
function generateLocalSmartRecipe(req: AiRecipeRequest): MealRecipe {
  const p = req.prompt.toLowerCase().trim();
  const isNonKosherAllowed = req.dietary === 'non-kosher' || p.includes('בייקון') || p.includes('שרימפס') || p.includes('חזיר') || p.includes('טיב טעם');
  const isKids = p.includes('ילד') || p.includes('ילדים') || p.includes('שניצל') || p.includes('פסטה פשוטה');
  const isQuick = p.includes('מהיר') || p.includes('15') || p.includes('20') || p.includes('זריז') || p.includes('קל');
  const isSpicy = p.includes('חריף') || p.includes('פיקנטי') || p.includes('צ׳ילי');

  // 1. Detect requested Cuisine
  let detectedCuisine: CuisineType = 'israeli';
  if (p.includes('הוד') || p.includes('קארי') || p.includes('דאל') || p.includes('טיקה')) {
    detectedCuisine = 'indian';
  } else if (p.includes('אסיית') || p.includes('נודלס') || p.includes('סויה') || p.includes('מוקפץ') || p.includes('חמוץ מתוק') || p.includes('ווק')) {
    detectedCuisine = 'asian';
  } else if (p.includes('איטלק') || p.includes('פסטה') || p.includes('ספגטי') || p.includes('בולונז') || p.includes('פיצה') || p.includes('קרבונרה')) {
    detectedCuisine = 'italian';
  } else if (p.includes('מקסיק') || p.includes('טאקו') || p.includes('בוריטו') || p.includes('פאחיטס') || p.includes('טורטיה')) {
    detectedCuisine = 'mexican';
  } else if (p.includes('המבורגר') || p.includes('בורגר') || p.includes('אמריקא') || p.includes('צ׳יפס')) {
    detectedCuisine = 'american';
  } else if (p.includes('שבת') || p.includes('חלה') || p.includes('עוף בתנור') || p.includes('חגיגי')) {
    detectedCuisine = 'traditional';
  }

  // 2. Select / Synthesize customized recipe based on craving
  const uniqueId = `meal-ai-${Date.now()}`;

  // Check specific cravings:
  if (p.includes('שרימפס') || (isNonKosherAllowed && p.includes('פירות ים'))) {
    return {
      id: uniqueId,
      titleHe: `שרימפס ${isSpicy ? 'פיקנטי' : 'עסיסי'} בחמאת שום, עשבי תיבול ויין`,
      titleEn: 'Garlic Butter Shrimps with Herbs & White Wine',
      subtitleHe: `מתכון שף AI מותאם אישית: שרימפס קפוא טיב טעם מוקפץ במהירות עם שמן זית, שום ופטרוזיליה`,
      prepTimeMinutes: 15,
      servings: req.householdSize,
      yieldsMealsCount: 1,
      canSplitToNextDay: false,
      difficultyHe: 'קל',
      mealType: req.mealType || 'dinner',
      cuisineType: 'mediterranean',
      categoryHe: 'מיוחדים ולא כשר',
      estimatedCostNis: 58,
      effortTagHe: 'פחות מ-20 דקות',
      isKosher: false,
      isAiGenerated: true,
      aiPrompt: req.prompt,
      descriptionHe: `מתכון מותאם אישית שנבנה לפי בקשתכם: "${req.prompt}". מנה מהירה, עשירה בטעמים וזמינה ברשת טיב טעם.`,
      ingredients: [
        { productId: 'p-shrimp-frozen', quantity: Math.max(1, Math.round(req.householdSize / 2)), customNoteHe: 'שרימפס מקולף ונקי 500 גרם' },
        { productId: 'p-olive-oil', quantity: 1, customNoteHe: 'שמן זית איכותי ושום' },
        { productId: 'p-tomatoes', quantity: 1, customNoteHe: 'עגבניות שרי צלויות' },
        { productId: 'p-challah-shabbat', quantity: 1, customNoteHe: 'לחם פריך לרוטב' },
      ],
      instructionsHe: [
        'מפשירים ושוטפים את השרימפס ומייבשים היטב.',
        'מחממים מחבת רחבה עם שמן זית, שום ועשבי תיבול.',
        `צורבים את השרימפס כ-2 דקות מכל צד ${isSpicy ? 'עם תוספת פלפל חריף גרוס' : ''} עד שמקבל צבע ורוד עז.`,
        'מגישים מיד חם ישירות מהמחבת עם לחם טרי לטבילה ברוטב.',
      ],
    };
  }

  if (p.includes('בייקון') || (isNonKosherAllowed && (p.includes('קרבונרה') || p.includes('חזיר')))) {
    return {
      id: uniqueId,
      titleHe: `ספגטי קרבונרה רומאי עם בייקון פריך ופרמז׳ן`,
      titleEn: 'Classic Carbonara with Bacon & Parmesan',
      subtitleHe: `מתכון שף AI מותאם אישית: פסטה חמה בקרם חלמונים ופרמז׳ן איטלקי D.O.P עם רצועות בייקון טיב טעם`,
      prepTimeMinutes: 20,
      servings: req.householdSize,
      yieldsMealsCount: 2,
      canSplitToNextDay: true,
      difficultyHe: 'קל',
      mealType: req.mealType || 'dinner',
      cuisineType: 'italian',
      categoryHe: 'מיוחדים ולא כשר',
      estimatedCostNis: 56,
      effortTagHe: 'פחות מ-20 דקות',
      isKosher: false,
      isAiGenerated: true,
      aiPrompt: req.prompt,
      descriptionHe: `מתכון מותאם אישית שנבנה לפי בקשתכם: "${req.prompt}". קלאסיקה איטלקית מושחתת ללא שמנת.`,
      ingredients: [
        { productId: 'p-spaghetti-osem', quantity: Math.max(1, Math.round(req.householdSize / 3)), customNoteHe: 'ספגטי אסם' },
        { productId: 'p-bacon-tivtaam', quantity: Math.max(1, Math.round(req.householdSize / 2)), customNoteHe: 'בייקון פריך פרוס טיב טעם' },
        { productId: 'p-parmesan-reggiano', quantity: 1, customNoteHe: 'פרמז׳ן רג׳יאנו איטלקי אמיתי' },
        { productId: 'p-eggs-l', quantity: 1, customNoteHe: 'חלמונים וביצה' },
      ],
      instructionsHe: [
        'מבשלים את הספגטי במי מלח רותחים עד לרמת אל-דנטה.',
        'צורבים את הבייקון במחבת עד פריכות זהובה.',
        'מערבבים בקערה חלמונים, פרמז׳ן ופלפל שחור גרוס.',
        'מאחדים את הפסטה החמה עם הבייקון והקרם לקבלת רוטב משי מבריק.',
      ],
    };
  }

  if (p.includes('קארי') || detectedCuisine === 'indian') {
    return {
      id: uniqueId,
      titleHe: `קארי ${p.includes('טופו') || p.includes('צמחוני') ? 'עדשים וירקות' : 'עוף'} הודי ${isSpicy ? 'חריף ומחמם' : 'ארומטי ומנחם'}`,
      titleEn: 'Custom Indian Curry & Fragrant Basmati Rice',
      subtitleHe: `מתכון שף AI מותאם אישית: קרם קוקוס עשיר, תבלין קארי מובחר ואורז בסמטי חם`,
      prepTimeMinutes: isQuick ? 20 : 30,
      servings: req.householdSize,
      yieldsMealsCount: 2,
      canSplitToNextDay: true,
      difficultyHe: 'קל',
      mealType: req.mealType || 'lunch',
      cuisineType: 'indian',
      categoryHe: 'אמצע שבוע',
      estimatedCostNis: 62,
      effortTagHe: 'סיר אחד',
      isKosher: true,
      isAiGenerated: true,
      aiPrompt: req.prompt,
      descriptionHe: `מתכון מותאם אישית שנבנה לפי בקשתכם: "${req.prompt}". סיר אחד עשיר שמשתבח בחימום חוזר ומספיק ל-2 ארוחות!`,
      ingredients: [
        { productId: p.includes('טופו') || p.includes('צמחוני') ? 'p-red-lentils' : 'p-chicken-breast', quantity: Math.max(1, Math.round(req.householdSize / 2)), customNoteHe: p.includes('טופו') || p.includes('צמחוני') ? 'עדשים אדומות' : 'חזה עוף חתוך לקוביות' },
        { productId: 'p-coconut-milk', quantity: 1, customNoteHe: 'קרם קוקוס לבישול קרמי' },
        { productId: 'p-curry-powder', quantity: 1, customNoteHe: 'תבלין קארי הודי איכותי' },
        { productId: 'p-rice-sugat', quantity: Math.max(1, Math.round(req.householdSize / 4)), customNoteHe: 'אורז בסמטי סוגת' },
        { productId: 'p-tomatoes', quantity: 1, customNoteHe: 'עגבניות טריות' },
        { productId: 'p-olive-oil', quantity: 1, customNoteHe: 'שמן לצריבה' },
      ],
      instructionsHe: [
        'מטגנים קוביות עוף או עדשים בסיר עמוק עם תבלין קארי עד שעולה ריח משכר.',
        'מוסיפים עגבניות קצוצות וקרם קוקוס ומביאים לרתיחה עדינה.',
        'מבשלים כ-15 דקות על אש נמוכה עד להסמכה מלאה.',
        'מבשלים אורז בסמטי אחד-אחד ומגישים מעליו את הקארי החם.',
      ],
    };
  }

  if (p.includes('נודלס') || p.includes('מוקפץ') || detectedCuisine === 'asian') {
    return {
      id: uniqueId,
      titleHe: `מוקפץ עוף ונודלס אסייתי ${isQuick ? 'סופר-מהיר' : 'קלאסי'} בווק`,
      titleEn: 'Savory Asian Noodle & Chicken Stir-Fry',
      subtitleHe: `מתכון שף AI מותאם אישית: נתחי חזה עוף, נודלס ביצים, רוטב סויה עשיר וירקות טריים`,
      prepTimeMinutes: isQuick ? 15 : 20,
      servings: req.householdSize,
      yieldsMealsCount: 1,
      canSplitToNextDay: true,
      difficultyHe: 'קל',
      mealType: req.mealType || 'lunch',
      cuisineType: 'asian',
      categoryHe: 'אמצע שבוע',
      estimatedCostNis: 54,
      effortTagHe: 'פחות מ-20 דקות',
      isKosher: true,
      isAiGenerated: true,
      aiPrompt: req.prompt,
      descriptionHe: `מתכון מותאם אישית שנבנה לפי בקשתכם: "${req.prompt}". הכנה מהירה בווק אחת, פריכות מקסימלית ואפס מאמץ.`,
      ingredients: [
        { productId: 'p-chicken-breast', quantity: Math.max(1, Math.round(req.householdSize / 3)), customNoteHe: 'רצועות חזה עוף טרי' },
        { productId: 'p-egg-noodles', quantity: Math.max(1, Math.round(req.householdSize / 3)), customNoteHe: 'נודלס ביצים מובחר' },
        { productId: 'p-soy-sauce', quantity: 1, customNoteHe: 'רוטב סויה מאסטר שף' },
        { productId: 'p-cucumbers', quantity: 1, customNoteHe: 'ירקות טריים להקפצה' },
        { productId: 'p-olive-oil', quantity: 1, customNoteHe: 'שמן להקפצה חמה' },
      ],
      instructionsHe: [
        'מבשלים את הנודלס בסיר מים רותחים כ-4 דקות ומסננים.',
        'מחממים ווק לוהט עם שמן ומקפיצים את נתחי העוף עד הזהבה מהירה.',
        'מוסיפים רוטב סויה ונודלס ומקפיצים יחד עוד 2 דקות לספיגת טעמים מושלמת.',
        'מגישים מיד בקערות עמוקות.',
      ],
    };
  }

  if (isKids || p.includes('שניצל') || p.includes('פסטה לילדים')) {
    return {
      id: uniqueId,
      titleHe: `שניצל ביתי זהוב ופריך עם פסטה עגבניות אהובה`,
      titleEn: 'Crispy Golden Schnitzel & Tomato Pasta',
      subtitleHe: `מתכון שף AI מותאם אישית: המנה האהובה ביותר על ילדים בישראל, פריכה מבחוץ ועסיסית מבפנים`,
      prepTimeMinutes: 25,
      servings: req.householdSize,
      yieldsMealsCount: 1,
      canSplitToNextDay: true,
      difficultyHe: 'קל',
      mealType: req.mealType || 'lunch',
      cuisineType: 'israeli',
      categoryHe: 'ילדים',
      estimatedCostNis: 52,
      effortTagHe: 'ידידותי לילדים',
      isKosher: true,
      isAiGenerated: true,
      aiPrompt: req.prompt,
      descriptionHe: `מתכון מותאם אישית שנבנה לפי בקשתכם: "${req.prompt}". מנה מנצחת שכל הילדים מחסלים בשמחה.`,
      ingredients: [
        { productId: 'p-chicken-breast', quantity: Math.max(1, Math.round(req.householdSize / 3)), customNoteHe: 'חזה עוף פרוס לשניצל' },
        { productId: 'p-eggs-l', quantity: 1, customNoteHe: 'ביצים לציפוי' },
        { productId: 'p-spaghetti-osem', quantity: Math.max(1, Math.round(req.householdSize / 3)), customNoteHe: 'פסטה ספגטי אסם' },
        { productId: 'p-tomato-paste', quantity: 1, customNoteHe: 'רסק עגבניות מתקתק' },
        { productId: 'p-cucumbers', quantity: 1, customNoteHe: 'מקלות מלפפון פריכים בצד' },
      ],
      instructionsHe: [
        'טובלים את השניצלים בביצה טרופה ופירורי לחם ומטגנים עד הזהבה מושלמת.',
        'מבשלים את הפסטה ומערבבים עם רוטב עגבניות קטיפתי ועדין.',
        'מגישים יחד בצלחת עם מקלות מלפפון פריכים.',
      ],
    };
  }

  // Default fallback smart recipe matching Hebrew craving
  return {
    id: uniqueId,
    titleHe: `תבשיל ${p ? `"${req.prompt.slice(0, 30)}"` : 'שף עשיר'} מותאם אישית`,
    titleEn: 'Chef Signature Custom Creation',
    subtitleHe: `מתכון מותאם אישית שנוצר במיוחד לפי העדפותיכם (${req.householdSize} סועדים)`,
    prepTimeMinutes: isQuick ? 18 : 25,
    servings: req.householdSize,
    yieldsMealsCount: 1,
    canSplitToNextDay: true,
    difficultyHe: 'קל',
    mealType: req.mealType || 'dinner',
    cuisineType: detectedCuisine,
    categoryHe: 'אמצע שבוע',
    estimatedCostNis: 48,
    effortTagHe: isQuick ? 'פחות מ-20 דקות' : 'סיר אחד',
    isKosher: !isNonKosherAllowed,
    isAiGenerated: true,
    aiPrompt: req.prompt,
    descriptionHe: `מתכון שנוצר ע״י מודל השף האישי עבור: "${req.prompt}". המרכיבים הותאמו במדויק לקטלוג הסופרמרקטים הישראלי.`,
    ingredients: [
      { productId: 'p-chicken-breast', quantity: Math.max(1, Math.round(req.householdSize / 3)), customNoteHe: 'חלבון עיקרי למנה' },
      { productId: 'p-olive-oil', quantity: 1, customNoteHe: 'שמן זית כתית מעולה' },
      { productId: 'p-tomatoes', quantity: 1, customNoteHe: 'עגבניות טריות' },
      { productId: 'p-rice-sugat', quantity: 1, customNoteHe: 'תוספת פחמימה חמה' },
    ],
    instructionsHe: [
      'מכינים את כל המצרכים וחותכים לקוביות אחידות.',
      'מבשלים על אש בינונית בסיר אחד עד לריכוך ומיזוג טעמים עשיר.',
      'מתבלים במלח, פלפל ותבלינים אהובים ומגישים חם.',
    ],
  };
}

/**
 * Call server-side Gemini endpoint /api/suggest-recipe with graceful fallback to localSmartChef
 */
export async function generateRecipeWithAi(req: AiRecipeRequest): Promise<{
  recipe: MealRecipe;
  source: 'gemini-3.8-flash' | 'local-smart-chef';
}> {
  try {
    const res = await fetch('/api/suggest-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.recipe) {
        return {
          recipe: {
            ...data.recipe,
            isAiGenerated: true,
            aiPrompt: req.prompt,
          },
          source: data.modelUsed || 'gemini-3.8-flash',
        };
      }
    }
  } catch (err) {
    console.warn('API route /api/suggest-recipe unavailable or failed, falling back to local culinary intelligence:', err);
  }

  // Graceful fallback to smart local chef generator
  const localRecipe = generateLocalSmartRecipe(req);
  return {
    recipe: localRecipe,
    source: 'local-smart-chef',
  };
}
